/**
 * NPC Response Formatter
 * Formats AI responses with code blocks, syntax highlighting, and proper line breaks
 */

/**
 * Parse NPC response and format it beautifully
 * Supports:
 * - Code blocks with ```language ... ```
 * - Inline code with `code`
 * - Bold with **text**
 * - Line breaks with \n
 */
export function parseNPCResponse(text) {
  if (!text) return '';

  let html = text;

  // Escape HTML special chars first (except our markers)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Handle code blocks (```language ... ```)
  html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, language, code) => {
    const lang = language || 'python';
    const trimmedCode = code.trim();
    const highlightedCode = highlightCode(trimmedCode, lang);
    return `<pre class="npc-code-block npc-lang-${lang}"><code>${highlightedCode}</code></pre>`;
  });

  // Handle inline code (`...`)
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    return `<code class="npc-inline-code">${code}</code>`;
  });

  // Handle bold (**...** or __...__) 
  html = html.replace(/\*\*([^*]+)\*\*/g, (match, text) => {
    return `<strong>${text}</strong>`;
  });

  html = html.replace(/__([^_]+)__/g, (match, text) => {
    return `<strong>${text}</strong>`;
  });

  // Handle line breaks with proper formatting
  html = html.replace(/\n/g, '<br/>');

  return html;
}

/**
 * Simple syntax highlighting for code
 * Supports Python, Java, C, C++
 */
export function highlightCode(code, language = 'python') {
  const pythonKeywords = /\b(def|class|if|else|elif|for|while|return|import|from|as|True|False|None|and|or|not|in|is|lambda|with|try|except|finally|raise|assert|break|continue|pass|yield|async|await)\b/g;
  const javaKeywords = /\b(public|private|protected|static|final|class|interface|extends|implements|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|void|int|String|boolean|long|double|float|char|byte|short|super|this)\b/g;
  const cKeywords = /\b(if|else|for|while|do|switch|case|break|continue|return|void|int|float|double|char|long|short|signed|unsigned|const|static|extern|struct|union|typedef|enum|sizeof|goto)\b/g;
  const cppKeywords = /\b(if|else|for|while|do|switch|case|break|continue|return|void|int|float|double|char|long|short|signed|unsigned|const|static|extern|struct|union|typedef|enum|sizeof|goto|class|public|private|protected|virtual|override|namespace|using|template|std|cout|cin|endl)\b/g;

  const strings = /'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g;
  const comments = /#.*/g;
  const numbers = /\b\d+\.?\d*\b/g;

  const builtins = {
    python: /\b(print|input|len|range|str|int|float|list|dict|set|tuple|open|sum|max|min|abs|round|sorted|enumerate|zip|map|filter|lambda)\b/g,
    java: /\b(System|String|ArrayList|HashMap|LinkedList|Stack|Queue|Math|Integer|Double|Boolean|Arrays|Collections|Scanner|PrintWriter)\b/g,
    c: /\b(printf|scanf|malloc|free|strcpy|strlen|strcmp|FILE|fopen|fclose|fread|fwrite|memset|memcpy)\b/g,
    cpp: /\b(std|cout|cin|endl|vector|string|map|set|array|deque|priority_queue|stack|queue|pair|tuple)\b/g,
  };

  let highlighted = code;
  let keywordRegex = pythonKeywords;
  let builtinRegex = builtins.python || /\b(print|input|len|range)\b/g;

  // Select language-specific keywords
  if (language === 'java') {
    keywordRegex = javaKeywords;
    builtinRegex = builtins.java;
  } else if (language === 'c') {
    keywordRegex = cKeywords;
    builtinRegex = builtins.c;
  } else if (language === 'cpp' || language === 'c++') {
    keywordRegex = cppKeywords;
    builtinRegex = builtins.cpp;
  }

  // IMPORTANT: Apply in correct order and escape already-wrapped content
  // 1. First, mark already-escaped content to prevent double-wrapping
  const escaped = {};
  let escapeIndex = 0;

  // 2. Handle comments first (they take precedence)
  highlighted = highlighted.replace(comments, (match) => {
    const key = `__ESCAPED_${escapeIndex}__`;
    escaped[key] = `<span class="npc-comment">${match}</span>`;
    escapeIndex++;
    return key;
  });

  // 3. Handle strings (don't highlight inside strings)
  highlighted = highlighted.replace(strings, (match) => {
    const key = `__ESCAPED_${escapeIndex}__`;
    escaped[key] = `<span class="npc-string">${match}</span>`;
    escapeIndex++;
    return key;
  });

  // 4. Handle numbers (safe, won't conflict)
  highlighted = highlighted.replace(numbers, (match) => {
    const key = `__ESCAPED_${escapeIndex}__`;
    escaped[key] = `<span class="npc-number">${match}</span>`;
    escapeIndex++;
    return key;
  });

  // 5. Handle keywords (safe now, strings are escaped)
  highlighted = highlighted.replace(keywordRegex, (match) => {
    const key = `__ESCAPED_${escapeIndex}__`;
    escaped[key] = `<span class="npc-keyword">${match}</span>`;
    escapeIndex++;
    return key;
  });

  // 6. Handle builtins
  highlighted = highlighted.replace(builtinRegex, (match) => {
    const key = `__ESCAPED_${escapeIndex}__`;
    escaped[key] = `<span class="npc-builtin">${match}</span>`;
    escapeIndex++;
    return key;
  });

  // 7. Restore all escaped content
  Object.entries(escaped).forEach(([key, value]) => {
    highlighted = highlighted.split(key).join(value);
  });

  return highlighted;
}

/**
 * Format NPC response
 */
export function formatNPCResponse(response) {
  return parseNPCResponse(response);
}
