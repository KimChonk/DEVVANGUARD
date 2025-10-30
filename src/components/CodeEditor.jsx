import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

// Theme Dracula cho Monaco Editor
const DRACULA_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6272a4' },
    { token: 'string', foreground: 'f1fa8c' },
    { token: 'number', foreground: 'bd93f9' },
    { token: 'builtin', foreground: '8be9fd' },
    { token: 'constant', foreground: 'ff79c6' },
  ],
  colors: {
    'editor.background': '#282a36',
    'editor.foreground': '#f8f8f2',
    'editor.lineHighlightBackground': '#44475a40',
    'editor.selectionBackground': '#44475a80',
    'editorCursor.foreground': '#f8f8f0',
    'editorLineNumber.foreground': '#6272a4',
    'editorLineNumber.activeForeground': '#f8f8f2',
    'editorWhitespace.foreground': '#44475a',
    'editor.findMatchBackground': '#44475a',
    'editor.findMatchHighlightBackground': '#44475a',
  },
};

export default function CodeEditor({ 
  code, 
  onChange, 
  language = 'python',
  disabled = false,
  onSave = null 
}) {
  const editorRef = useRef(null);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Đăng ký theme Dracula
    monaco.editor.defineTheme('dracula-custom', DRACULA_THEME);
    monaco.editor.setTheme('dracula-custom');

    // Thêm lệnh Save (Ctrl+S hoặc Cmd+S)
    if (onSave) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave();
      });
    }
  };

  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorMount}
        theme="dracula-custom"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'Fira Code, Consolas, monospace',
          fontLigatures: true,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 4,
          insertSpaces: true,
          renderWhitespace: 'selection',
          smoothScrolling: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: true,
          rulers: [80, 120],
          renderLineHighlight: 'all',
          bracketPairColorization: {
            enabled: true,
          },
          'bracketPairColorization.independentColorPoolPerBracketType': true,
          padding: { top: 16, bottom: 16 },
          readOnly: disabled,
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          foldingHighlight: true,
          showUnused: true,
          showDeprecated: true,
        }}
      />
    </div>
  );
}
