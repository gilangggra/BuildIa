import { WebContainer } from '@webcontainer/api';

/**
 * Singleton instance to ensure WebContainer is only booted once per session.
 * Booting multiple times will cause memory issues and crash the browser tab.
 */
let webcontainerInstance: WebContainer | null = null;

export async function getWebContainer() {
  if (!webcontainerInstance) {
    console.log("Booting WebContainer...");
    // Call WebContainer.boot()
    webcontainerInstance = await WebContainer.boot();
  }
  return webcontainerInstance;
}

export function teardownWebContainer() {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
  }
}

/**
 * Helper to mount files to the WebContainer Virtual File System (VFS).
 * Files should be passed as an array of { name: string, content: string }
 */
export async function mountFiles(files: { name: string; content: string }[]) {
  const wc = await getWebContainer();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fileSystemTree: Record<string, any> = {};
  
  files.forEach(file => {
    // For simplicity, we just put everything in the root
    // In a real implementation, you'd want to parse paths (e.g. src/index.ts)
    // and build nested directory structures in the fileSystemTree
    
    const parts = file.name.split('/');
    let current = fileSystemTree;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // It's a file
        current[part] = {
          file: {
            contents: file.content
          }
        };
      } else {
        // It's a directory
        if (!current[part]) {
          current[part] = {
            directory: {}
          };
        }
        current = current[part].directory;
      }
    }
  });

  await wc.mount(fileSystemTree);
  return wc;
}
