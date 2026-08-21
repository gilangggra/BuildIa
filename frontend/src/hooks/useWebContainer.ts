import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { getWebContainer, mountFiles, teardownWebContainer } from '@/lib/webcontainer';
import '@xterm/xterm/css/xterm.css';
import type { Artefact } from '@/types';

/**
 * useWebContainer — manages WebContainer lifecycle for the IDE preview/terminal.
 *
 * Key fixes vs original:
 * 1. Removed `isWcReady` from the effect dependency array — it was causing
 *    an infinite re-run loop (effect sets isWcReady → triggers effect again).
 * 2. Used a ref (`isWcReadyRef`) to track boot state inside the async callback
 *    without adding it to the dependency array.
 * 3. Proper xterm cleanup — dispose terminal instance on unmount.
 */
export function useWebContainer(
  viewMode: 'code' | 'preview' | 'terminal',
  activeArtefact: Artefact | null,
) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const isWcReadyRef = useRef(false); // ref instead of state to avoid dependency loop
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isWcReady, setIsWcReady] = useState(false);
  const [bootStatus, setBootStatus] = useState<string>('Booting WebContainer...');

  useEffect(() => {
    if (viewMode !== 'terminal' || !terminalRef.current) return;

    // Initialize xterm only once
    if (!xtermRef.current) {
      const term = new Terminal({
        theme: { background: '#0A0D14', foreground: '#e2e8f0' },
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        cursorBlink: true,
      });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();
      term.writeln('Initializing WebContainer...');
      xtermRef.current = term;
      fitAddonRef.current = fitAddon;
    } else if (terminalRef.current.childElementCount === 0) {
      xtermRef.current.open(terminalRef.current);
      fitAddonRef.current?.fit();
    }

    // Only boot if not already ready (use ref to avoid dep-array loop)
    if (isWcReadyRef.current) {
      // WC already running — sync active artefact if it's code
      if (activeArtefact?.type === 'code' && activeArtefact.content) {
        syncFilesToWc(activeArtefact.content);
      }
      return;
    }

    const initWc = async () => {
      try {
        const wc = await getWebContainer();

        xtermRef.current?.writeln('WebContainer booted! Generating project files...');

        // Build file list from Vite React template, merging AI-generated code
        let files = [
          {
            name: 'package.json',
            content: JSON.stringify(
              {
                name: 'preview', private: true, version: '0.0.0', type: 'module',
                scripts: { dev: 'vite', build: 'vite build' },
                dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0', 'lucide-react': '^0.263.1' },
                devDependencies: { vite: '^5.0.0', '@vitejs/plugin-react': '^4.2.0' },
              },
              null, 2,
            ),
          },
          {
            name: 'index.html',
            content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Preview</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>`,
          },
          {
            name: 'vite.config.js',
            content: `import { defineConfig } from 'vite'; import react from '@vitejs/plugin-react'; export default defineConfig({ plugins: [react()] });`,
          },
          {
            name: 'src/main.jsx',
            content: `import React from 'react'; import ReactDOM from 'react-dom/client'; import App from './App.jsx'; ReactDOM.createRoot(document.getElementById('root')).render(<App />);`,
          },
          { name: 'src/App.jsx', content: `export default function App() { return <h1 className="p-8 text-2xl font-bold">Generated App</h1> }` },
        ];

        if (activeArtefact?.type === 'code' && activeArtefact.content) {
          try {
            const parsedFiles = JSON.parse(activeArtefact.content);
            const aiFiles = Object.entries(parsedFiles).map(([path, content]) => ({
              name: path,
              content: String(content),
            }));
            files = files.filter(f => !aiFiles.find(af => af.name === f.name));
            files = [...files, ...aiFiles];
          } catch {
            // Fallback: treat content as a single App.jsx
            files = files.map(f =>
              f.name === 'src/App.jsx' ? { ...f, content: activeArtefact.content } : f,
            );
          }
        }

        await mountFiles(files);
        setBootStatus('Installing dependencies (this may take a moment)...');
        xtermRef.current?.writeln('Files mounted. Running npm install...');

        const installProcess = await wc.spawn('npm', [
          'install', '--no-audit', '--no-fund', '--legacy-peer-deps',
        ]);
        installProcess.output.pipeTo(
          new WritableStream({ write(data) { xtermRef.current?.write(data); } }),
        );

        const exitCode = await installProcess.exit;
        if (exitCode !== 0) {
          xtermRef.current?.writeln('\r\nError installing dependencies.');
          setBootStatus('Error installing dependencies. Check terminal for details.');
          return;
        }

        setBootStatus('Starting dev server...');
        xtermRef.current?.writeln('\r\nStarting dev server...');
        const devProcess = await wc.spawn('npm', ['run', 'dev']);
        devProcess.output.pipeTo(
          new WritableStream({ write(data) { xtermRef.current?.write(data); } }),
        );

        wc.on('server-ready', (_port, url) => {
          xtermRef.current?.writeln(`\r\nServer ready at ${url}`);
          setPreviewUrl(url);
        });

        isWcReadyRef.current = true;
        setIsWcReady(true);
      } catch (err: any) {
        xtermRef.current?.writeln(`\r\nError: ${err.message}`);
        setBootStatus(`Failed to boot: ${err.message}`);
      }
    };

    initWc();

    const handleResize = () => fitAddonRef.current?.fit();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  // Intentionally omit `isWcReady` — using ref to avoid infinite loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeArtefact]);

  /** Sync code files to running WebContainer filesystem */
  const syncFilesToWc = useCallback(async (content: string) => {
    try {
      let filesToSync: { name: string; content: string }[] = [];
      try {
        const parsedFiles = JSON.parse(content);
        filesToSync = Object.entries(parsedFiles).map(([path, fileContent]) => ({
          name: path,
          content: String(fileContent),
        }));
      } catch {
        filesToSync = [{ name: 'src/App.jsx', content }];
      }
      await mountFiles(filesToSync);
      xtermRef.current?.writeln('\r\n[Sync] Updated files from Editor');
    } catch (err: any) {
      xtermRef.current?.writeln(`\r\n[Sync Error]: ${err.message}`);
    }
  }, []);

  const syncCode = useCallback(
    async (content: string) => {
      if (isWcReadyRef.current) {
        await syncFilesToWc(content);
      }
    },
    [syncFilesToWc],
  );

  const restartEnvironment = useCallback(() => {
    xtermRef.current?.clear();
    xtermRef.current?.writeln('\r\n[System] Restarting WebContainer environment...');

    // Dispose terminal so it re-initializes on next effect run
    xtermRef.current?.dispose();
    xtermRef.current = null;
    fitAddonRef.current = null;

    teardownWebContainer();
    isWcReadyRef.current = false;
    setIsWcReady(false);
    setPreviewUrl('');
    setBootStatus('Rebooting environment...');
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      xtermRef.current?.dispose();
    };
  }, []);

  return { terminalRef, previewUrl, isWcReady, restartEnvironment, syncCode, bootStatus };
}
