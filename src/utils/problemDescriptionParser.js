/**
 * ProblemDescription Parser & Formatter
 * Converts plain text problem description to beautiful HTML with code highlighting
 */

/**
 * Parse problem description and format it beautifully
 * Supports:
 * - **text** for bold
 * - `code` for inline code
 * - Code blocks with ```python ... ```
 * - Line breaks with \n
 */
export function parseProblemDescription(text) {
  if (!text) return "";

  let html = text;

  // Escape HTML special chars first (except our markers)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Handle code blocks (```language ... ```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || "python";
    const highlightedCode = highlightCode(code.trim(), lang);
    return `<pre class="code-block ${lang}"><code>${highlightedCode}</code></pre>`;
  });

  // Handle inline code (`...`)
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="inline-code">${code}</code>`;
  });

  // Handle bold (**...** or __...__) - but be careful with escape chars
  html = html.replace(/\*\*([^*]+)\*\*/g, (match, text) => {
    return `<strong>${text}</strong>`;
  });

  html = html.replace(/__([^_]+)__/g, (match, text) => {
    return `<strong>${text}</strong>`;
  });

  // Handle line breaks
  html = html.replace(/\n/g, "<br/>");

  // Handle special keywords for emphasis
  html = html.replace(/\b(Input|Output|Example|Note|Important|Constraint)\b/g, (match) => {
    return `<strong class="keyword">${match}</strong>`;
  });

  return html;
}

/**
 * Simple syntax highlighting for Python code
 */
export function highlightCode(code, language = "python") {
  if (language !== "python") {
    return code; // Only support Python for now
  }

  const keywords = /\b(def|class|if|else|elif|for|while|return|import|from|as|True|False|None|and|or|not|in|is|lambda|with|try|except|finally|raise|assert|break|continue|pass|yield)\b/g;
  const strings = /'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g;
  const comments = /#.*/g;
  const numbers = /\b\d+\.?\d*\b/g;
  const builtins = /\b(print|input|len|range|str|int|float|list|dict|set|tuple|open|sum|max|min|abs|round|sorted)\b/g;

  let highlighted = code;

  // Apply syntax highlighting in order
  highlighted = highlighted.replace(comments, (match) => `<span class="comment">${match}</span>`);
  highlighted = highlighted.replace(strings, (match) => `<span class="string">${match}</span>`);
  highlighted = highlighted.replace(keywords, (match) => `<span class="keyword">${match}</span>`);
  highlighted = highlighted.replace(builtins, (match) => `<span class="builtin">${match}</span>`);
  highlighted = highlighted.replace(numbers, (match) => `<span class="number">${match}</span>`);

  return highlighted;
}

/**
 * Format with common patterns
 */
export function formatProblemDescription(description) {
  return parseProblemDescription(description);
}
