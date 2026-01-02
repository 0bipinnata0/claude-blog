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

  // Step 4: Load plugins last
  await Promise.all([
    import('prismjs/plugins/toolbar/prism-toolbar'),
    import('prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard'),
  ]);

  prismLoaded = true;
}

export async function loadMermaid(): Promise<void> {
  if (mermaidLoaded) {
    return;
  }

  // Dynamically import Mermaid
  const mermaid = await import('mermaid');

  // Initialize Mermaid with configuration
  mermaid.default.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
  });

  mermaidLoaded = true;
}
