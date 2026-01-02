/**
 * Lazy load PrismJS and Mermaid for syntax highlighting and diagrams
 * Only loads when markdown content with code blocks is displayed
 */

let prismLoaded = false;
let mermaidLoaded = false;

export async function loadPrism(): Promise<void> {
  if (prismLoaded) {
    return;
  }

  // Step 1: Load PrismJS core
  await import('prismjs');

  // Step 2: Load base language dependencies (required by other languages)
  await import('prismjs/components/prism-markup'); // HTML/XML - required by CSS, Markdown, etc.
  await import('prismjs/components/prism-clike'); // C-like syntax - required by JavaScript, TypeScript, Java, etc.

  // Step 3: Load all language components in parallel (now that dependencies are loaded)
  await Promise.all([
    import('prismjs/components/prism-javascript'),
    import('prismjs/components/prism-typescript'),
    import('prismjs/components/prism-css'),
    import('prismjs/components/prism-scss'),
    import('prismjs/components/prism-bash'),
    import('prismjs/components/prism-json'),
    import('prismjs/components/prism-markdown'),
    import('prismjs/components/prism-python'),
    import('prismjs/components/prism-java'),
    import('prismjs/components/prism-sql'),
  ]);

  // Step 4: Load plugins last (sequentially to handle dependencies)
  await import('prismjs/plugins/toolbar/prism-toolbar');
  await import('prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard');

  prismLoaded = true;
}

export async function loadMermaid(): Promise<void> {
  // Always try to find and render diagrams, even if already loaded
  // The content might have changed (e.g. navigation between posts)

  if (!mermaidLoaded) {
    // Dynamically import Mermaid
    const mermaid = await import('mermaid');

    // Initialize Mermaid with configuration
    mermaid.default.initialize({
      startOnLoad: false, // We will manually run it
      theme: 'default',
      securityLevel: 'loose',
    });

    mermaidLoaded = true;
  }

  // Re-import to get the instance (it's cached) or use a global reference if we stored it
  // Since we are using dynamic import, we need to access it again or store it. 
  // Simpler to just re-import as it returns the same module instance.
  const mermaid = await import('mermaid');

  // Find all mermaid code blocks
  // ngx-markdown renders them as <code class="language-mermaid"> inside <pre>
  const codeBlocks = document.querySelectorAll('code.language-mermaid');

  if (codeBlocks.length === 0) {
    return;
  }

  const mermaidNodes: HTMLElement[] = [];

  // Transform <pre><code> into <div class="mermaid"> to bypass Prism and provide clean text
  codeBlocks.forEach((codeBlock) => {
    const preElement = codeBlock.parentElement;
    if (preElement && preElement.tagName === 'PRE') {
      const div = document.createElement('div');
      div.classList.add('mermaid');
      // Use textContent to get the raw diagram definition, ignoring any Prism HTML if it ran already
      div.textContent = codeBlock.textContent || '';

      // Replace the <pre> with the new <div>
      preElement.replaceWith(div);
      mermaidNodes.push(div);
    }
  });

  if (mermaidNodes.length > 0) {
    try {
      await mermaid.default.run({
        nodes: mermaidNodes,
      });
    } catch (error) {
      console.error('Mermaid rendering failed:', error);
    }
  }
}
