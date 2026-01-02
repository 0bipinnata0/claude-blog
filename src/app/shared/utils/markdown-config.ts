import { marked, Tokens } from 'marked';

// Custom renderer for GitHub-style admonitions
const renderer = new marked.Renderer();

// Store original blockquote renderer
const originalBlockquote = renderer.blockquote.bind(renderer);

// Override blockquote renderer to support admonitions
renderer.blockquote = ({ text }: Tokens.Blockquote): string => {
  // Match GitHub-style admonition syntax: [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION]
  const admonitionRegex = /^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i;
  const match = text.match(admonitionRegex);

  if (match) {
    const type = match[1].toUpperCase();
    const content = text.replace(admonitionRegex, '').trim();

    // Map types to CSS classes and icons
    const typeConfig: Record<string, { class: string; icon: string; label: string }> = {
      NOTE: { class: 'admonition-note', icon: 'ℹ️', label: 'Note' },
      TIP: { class: 'admonition-tip', icon: '💡', label: 'Tip' },
      WARNING: { class: 'admonition-warning', icon: '⚠️', label: 'Warning' },
      IMPORTANT: { class: 'admonition-important', icon: '❗', label: 'Important' },
      CAUTION: { class: 'admonition-caution', icon: '🔥', label: 'Caution' }
    };

    const config = typeConfig[type] || typeConfig['NOTE'];

    return `
      <div class="admonition ${config.class}">
        <div class="admonition-title">
          <span class="admonition-icon">${config.icon}</span>
          <span class="admonition-label">${config.label}</span>
        </div>
        <div class="admonition-content">
          ${content}
        </div>
      </div>
    `;
  }

  // Fall back to original blockquote rendering
  return originalBlockquote({ text } as Tokens.Blockquote);
};

// Configure marked options
marked.setOptions({
  renderer: renderer,
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  pedantic: false
});

// Export configured marked instance
export { marked };
