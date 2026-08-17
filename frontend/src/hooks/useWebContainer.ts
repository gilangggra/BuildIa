import { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { getWebContainer, mountFiles, teardownWebContainer } from '@/lib/webcontainer';
import '@xterm/xterm/css/xterm.css';

export function useWebContainer(viewMode: 'code' | 'preview' | 'terminal', activeArtefact: any) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isWcReady, setIsWcReady] = useState(false);

  useEffect(() => {
    let fitAddon: FitAddon | null = null;
    
    if (viewMode === 'terminal' && terminalRef.current) {
      if (!xtermRef.current) {
        xtermRef.current = new Terminal({
          theme: { background: '#0A0D14', foreground: '#e2e8f0' },
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 13,
          cursorBlink: true,
        });
        fitAddon = new FitAddon();
        xtermRef.current.loadAddon(fitAddon);
        xtermRef.current.open(terminalRef.current);
        fitAddon.fit();
        xtermRef.current.writeln('Initializing WebContainer...');
      } else if (terminalRef.current.childElementCount === 0) {
        xtermRef.current.open(terminalRef.current);
      }

      const initWc = async () => {
        try {
          const wc = await getWebContainer();
          
          if (!isWcReady) {
            xtermRef.current?.writeln('WebContainer booted! Generating project files...');
            
            // Provide a basic Vite React template
            let files = [
              { name: 'package.json', content: JSON.stringify({
                name: "preview", private: true, version: "0.0.0", type: "module",
                scripts: { dev: "vite", build: "vite build" },
                dependencies: { react: "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.263.1" },
                devDependencies: { vite: "^5.0.0", "@vitejs/plugin-react": "^4.2.0" }
              }, null, 2)},
              { name: 'index.html', content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Preview</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>` },
              { name: 'vite.config.js', content: `import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'; export default defineConfig({ plugins: [react()] });` },
              { name: 'src/main.jsx', content: `import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App.jsx'; import './index.css'; ReactDOM.createRoot(document.getElementById('root')).render(<App />);` },
              { name: 'src/index.css', content: `@tailwind base; @tailwind components; @tailwind utilities;` },
              { name: 'src/App.jsx', content: `export default function App() { return <h1>Generated App</h1> }` }
            ];

            if (activeArtefact?.type === 'code' && activeArtefact.content) {
              try {
                const parsedFiles = JSON.parse(activeArtefact.content);
                // Merge AI generated files over the template
                const aiFiles = Object.entries(parsedFiles).map(([path, content]) => ({ name: path, content: String(content) }));
                
                // Remove template files that the AI generated
                files = files.filter(f => !aiFiles.find(af => af.name === f.name));
                files = [...files, ...aiFiles];
              } catch (e) {
                // Fallback: single file
                files = files.map(f => f.name === 'src/App.jsx' ? { ...f, content: activeArtefact.content } : f);
              }
            }

            await mountFiles(files);
            xtermRef.current?.writeln('Files mounted. Running npm install...');
            
            const installProcess = await wc.spawn('npm', ['install']);
            installProcess.output.pipeTo(new WritableStream({
              write(data) { xtermRef.current?.write(data); }
            }));
            
            if (await installProcess.exit !== 0) {
              xtermRef.current?.writeln('\r\nError installing dependencies.');
              return;
            }

            xtermRef.current?.writeln('\r\nStarting dev server...');
            const devProcess = await wc.spawn('npm', ['run', 'dev']);
            devProcess.output.pipeTo(new WritableStream({
              write(data) { xtermRef.current?.write(data); }
            }));

            wc.on('server-ready', (port, url) => {
              xtermRef.current?.writeln(`\r\nServer ready at ${url}`);
              setPreviewUrl(url);
            });
            
            setIsWcReady(true);
          } else {
             // If WC is already ready, just sync the active artefact if it's code
             if (activeArtefact?.type === 'code') {
                let filesToSync = [];
                try {
                  const parsedFiles = JSON.parse(activeArtefact.content);
                  filesToSync = Object.entries(parsedFiles).map(([path, content]) => ({ name: path, content: String(content) }));
                } catch (e) {
                  filesToSync = [{ name: 'src/App.jsx', content: activeArtefact.content }];
                }
                
                await mountFiles(filesToSync);
                xtermRef.current?.writeln('\r\n[Sync] Updated files from artefact');
             }
          }
        } catch (err: any) {
          xtermRef.current?.writeln(`\r\nError: ${err.message}`);
        }
      };
      
      initWc();
    }
    
    const handleResize = () => { fitAddon?.fit(); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, activeArtefact, isWcReady]);

  const restartEnvironment = () => {
    if (xtermRef.current) {
      xtermRef.current.clear();
      xtermRef.current.writeln('\r\n[System] Restarting WebContainer environment...');
    }
    teardownWebContainer();
    setIsWcReady(false);
    setPreviewUrl('');
  };

  const syncCode = async (content: string) => {
    if (isWcReady && activeArtefact?.type === 'code') {
      try {
        let filesToSync = [];
        try {
          const parsedFiles = JSON.parse(content);
          filesToSync = Object.entries(parsedFiles).map(([path, fileContent]) => ({ name: path, content: String(fileContent) }));
        } catch (e) {
          filesToSync = [{ name: 'src/App.jsx', content }];
        }
        await mountFiles(filesToSync);
        xtermRef.current?.writeln('\r\n[Sync] Updated files from Editor');
      } catch (err: any) {
        xtermRef.current?.writeln(`\r\n[Sync Error]: ${err.message}`);
      }
    }
  };

  return { terminalRef, previewUrl, isWcReady, restartEnvironment, syncCode };
}
