import React, { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };
  
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };
  
  const ToolbarButton: React.FC<{command: string, children: React.ReactNode}> = ({ command, children }) => (
    <button type="button" onMouseDown={(e) => { e.preventDefault(); execCommand(command); }} className="p-2 rounded hover:bg-slate-200 text-slate-800">
        {children}
    </button>
  );

  return (
    <div className="border border-slate-300 rounded-md mt-1 bg-white">
      <div className="flex items-center gap-1 p-1 border-b bg-slate-50 rounded-t-md">
        <ToolbarButton command="bold"><b>B</b></ToolbarButton>
        <ToolbarButton command="italic"><i>I</i></ToolbarButton>
        <ToolbarButton command="underline"><u>U</u></ToolbarButton>
        <ToolbarButton command="insertUnorderedList">●</ToolbarButton>
        <ToolbarButton command="insertOrderedList">1.</ToolbarButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className="p-3 h-64 overflow-y-auto focus:outline-none text-slate-900"
      />
    </div>
  );
};

export default RichTextEditor;