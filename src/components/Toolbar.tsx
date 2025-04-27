import React from "react";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
} from "lucide-react";

type ToolbarProps = {
  onCommand: (command: string, value?: string) => void;
  formatState: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  canUndo: boolean;
  canRedo: boolean;
  blockType?: string;
  isChecklist?: boolean;
  isUnorderedList?: boolean;
  isOrderedList?: boolean;
  isBlockquote?: boolean;
  isCodeBlock?: boolean;
};

const buttonClass =
  "flex items-center justify-center p-2 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const Toolbar: React.FC<ToolbarProps> = ({
  onCommand,
  formatState,
  canUndo,
  canRedo,
  blockType = "P",
  isChecklist,
  isUnorderedList,
  isOrderedList,
  isBlockquote,
  isCodeBlock,
}) => (
  <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-100 rounded-md overflow-x-auto hide-scrollbar">
    <button
      className={buttonClass}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("undo");
      }}
      title="Undo"
      disabled={!canUndo}
    >
      <Undo2 size={18} />
    </button>
    <button
      className={buttonClass}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("redo");
      }}
      title="Redo"
      disabled={!canRedo}
    >
      <Redo2 size={18} />
    </button>
    <div className="h-6 border-l border-gray-300 mx-2" />
    <button
      className={`${buttonClass} ${formatState.bold ? "bg-gray-300" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("bold");
      }}
      title="Bold"
    >
      <Bold size={18} />
    </button>
    <button
      className={`${buttonClass} ${formatState.italic ? "bg-gray-300" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("italic");
      }}
      title="Italic"
    >
      <Italic size={18} />
    </button>
    <button
      className={`${buttonClass} ${formatState.underline ? "bg-gray-300" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("underline");
      }}
      title="Underline"
    >
      <Underline size={18} />
    </button>
    <div className="h-6 border-l border-gray-300 mx-2" />
    <select
      className="ml-2 px-2 py-1 border border-gray-300 rounded bg-white text-sm focus:outline-none"
      value={blockType}
      title="Block Type"
      onChange={(e) => onCommand("formatBlock", e.target.value)}
    >
      <option value="P">Paragraph</option>
      <option value="H1">Heading 1</option>
      <option value="H2">Heading 2</option>
      <option value="H3">Heading 3</option>
      <option value="H4">Heading 4</option>
      <option value="H5">Heading 5</option>
      <option value="H6">Heading 6</option>
    </select>
    <div className="h-6 border-l border-gray-300 mx-2" />
    <button
      className={`${buttonClass} ${isChecklist ? "bg-gray-300" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("checkedList");
      }}
      title="Checked List"
    >
      <ListChecks size={18} />
    </button>
    <button
      className={`${buttonClass} ${isOrderedList ? "bg-gray-300" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("insertOrderedList");
      }}
      title="Numbered List"
    >
      <ListOrdered size={18} />
    </button>
    <button
      className={`${buttonClass} ${isUnorderedList ? "bg-gray-300" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("insertUnorderedList");
      }}
      title="Bulleted List"
    >
      <List size={18} />
    </button>
    <div className="h-6 border-l border-gray-300 mx-2" />
    <button
      className={`${buttonClass} ${isBlockquote ? "bg-gray-300" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("blockquote");
      }}
      title="Quote"
    >
      <Quote size={18} />
    </button>
    <button
      className={`${buttonClass} ${isCodeBlock ? "bg-gray-300" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        onCommand("pre");
      }}
      title="Code Block"
    >
      <Code2 size={18} />
    </button>
  </div>
);

export default Toolbar;
