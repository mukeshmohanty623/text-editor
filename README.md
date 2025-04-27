# Text Editor

A customizable, accessible, and extensible rich text editor built with React.  
This editor supports headings, lists (ordered, unordered, checklist), blockquotes, code blocks, and inline formatting (bold, italic, underline), with undo/redo and keyboard accessibility.

---

## Architecture Decisions

- **ContentEditable Approach:**  
  The editor uses a single `<div contentEditable>` as the editing surface, allowing for native browser editing capabilities and flexibility in handling custom block types (lists, code, blockquotes, etc.).

- **Direct DOM Manipulation:**  
  Block-level transformations (e.g., toggling a paragraph to a heading, list, or code block) are handled via direct DOM manipulation. This allows for fine-grained control over the structure and formatting, which is difficult to achieve with only React state.

- **Toolbar as a Stateless Component:**  
  The `Toolbar` component receives all state and handlers as props, making it stateless and reusable. It reflects the current formatting and block type, and provides controls for all supported commands.

- **Command Pattern:**  
  All formatting and block commands are dispatched through a single `handleCommand` function, which routes to the appropriate handler. This centralizes command logic and makes it easy to extend.

---

## State Management Approach

- **React State for Formatting and Block Type:**  
  The editor tracks the current inline formatting (`bold`, `italic`, `underline`) and block type (`P`, `H1`-`H6`, `LI`, `BLOCKQUOTE`, `PRE`) using React state.  
  Additional booleans (`isChecklist`, `isUnorderedList`, `isOrderedList`, `isBlockquote`, `isCodeBlock`) are used to reflect the current block context for toolbar highlighting.

- **Selection-Based State Updates:**  
  The editor listens for `selectionchange` events and updates the formatting and block state based on the current selection. This ensures the toolbar always reflects the user's current context.

- **Undo/Redo:**  
  Undo and redo are handled using the browser's native `document.execCommand("undo")` and `document.execCommand("redo")`. The state of the undo/redo buttons is managed via React state, and updated on every input.

- **Custom History (Optional):**  
  The codebase includes a custom history stack for potential future enhancements, but currently relies on the browser's undo/redo stack for simplicity and performance.

---

## Accessibility Considerations

- **Keyboard Navigation:**  
  - All toolbar buttons are accessible via keyboard (using `onMouseDown` to prevent focus loss).
  - The editor supports keyboard shortcuts for formatting (e.g., `Ctrl+B` for bold, `Enter` for new lines and list items).

- **Semantic HTML:**  
  - The editor uses semantic elements (`<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<pre>`) for content, improving screen reader support and document structure.

- **Focus Management:**  
  - The editor ensures that focus remains in the editing area after formatting or block changes.
  - Caret position is preserved after most operations.

- **ARIA and Roles:**  
  - The toolbar can be extended with ARIA roles and labels for improved screen reader support.
  - The contentEditable area can be given `role="textbox"` and `aria-multiline="true"` for better accessibility.

- **Visual Feedback:**  
  - Active formatting and block type are visually indicated in the toolbar for all users, including those relying on visual cues.

---

## Extending the Editor

- **Adding New Block Types:**  
  Implement a new handler and add a button to the toolbar, then update the state management logic to recognize the new block.

- **Custom Shortcuts:**  
  Add keyboard event handlers to the contentEditable area for custom shortcuts.

- **Accessibility Enhancements:**  
  Add ARIA attributes and roles as needed, and test with screen readers.

---

## Limitations

- The editor relies on browser support for `contentEditable` and `execCommand`, which may have inconsistencies across browsers.
- Advanced collaborative editing and real-time sync are not included in this version.
- Undo and Redo  won't work for ordered, unordered and checklist
---

