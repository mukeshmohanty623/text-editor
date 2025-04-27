import React, { useRef, useEffect, useState } from "react";
import Toolbar from "./Toolbar";

const TextEditor: React.FC = () => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const [blockType, setBlockType] = useState("P");
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(true);
  const [isChecklist, setIsChecklist] = useState(false);
  const [isUnorderedList, setIsUnorderedList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isBlockquote, setIsBlockquote] = useState(false);
  const [isCodeBlock, setIsCodeBlock] = useState(false);

  const ensureParagraph = () => {
    const editor = editorContainerRef.current;
    if (!editor) return;
    if (editor.innerHTML.trim() === '') {
      const p = document.createElement('p');
      p.innerHTML = '<br>'; 
      p.className = "text-base font-normal leading-5 mb-2";
      editor.appendChild(p);
      const range = document.createRange();
      const sel = window.getSelection()!;
      range.setStart(p, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  function updateFormatStateAndBlockType() {
    const editor = editorContainerRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    let node = selection.anchorNode as HTMLElement;
    let bold = false, italic = false, underline = false;
    while (node && node !== editor) {
      if (node.nodeType === 1) {
        if (node.nodeName === "B") bold = true;
        if (node.nodeName === "I") italic = true;
        if (node.nodeName === "U") underline = true;
      }
      node = node.parentElement as HTMLElement;
    }
    setFormatState({
      bold,
      italic,
      underline,
    });
    node = selection.anchorNode as HTMLElement;
    while (
      node &&
      node !== editor &&
      !(node.nodeType === 1 && /^(P|H[1-6]|LI|BLOCKQUOTE|PRE)$/i.test(node.nodeName))
    ) {
      node = node.parentElement as HTMLElement;
    }
    if (node && node !== editor) {
      if (
        node.nodeName === "LI" &&
        node.parentElement?.nodeName === "UL" &&
        node.querySelector('input[type="checkbox"]')
      ) {
        setIsChecklist(true);
        setIsUnorderedList(false);
        setIsOrderedList(false);
        setIsBlockquote(false);
        setIsCodeBlock(false);
        setBlockType("LI");
      } else if (
        node.nodeName === "LI" &&
        node.parentElement?.nodeName === "UL"
      ) {
        setIsChecklist(false);
        setIsUnorderedList(true);
        setIsOrderedList(false);
        setIsBlockquote(false);
        setIsCodeBlock(false);
        setBlockType("LI");
      } else if (
        node.nodeName === "LI" &&
        node.parentElement?.nodeName === "OL"
      ) {
        setIsChecklist(false);
        setIsUnorderedList(false);
        setIsOrderedList(true);
        setIsBlockquote(false);
        setIsCodeBlock(false);
        setBlockType("LI");
      } else if (node.nodeName === "BLOCKQUOTE") {
        setIsChecklist(false);
        setIsUnorderedList(false);
        setIsOrderedList(false);
        setIsBlockquote(true);
        setIsCodeBlock(false);
        setBlockType("BLOCKQUOTE");
      } else if (node.nodeName === "PRE") {
        setIsChecklist(false);
        setIsUnorderedList(false);
        setIsOrderedList(false);
        setIsBlockquote(false);
        setIsCodeBlock(true);
        setBlockType("PRE");
      } else {
        setIsChecklist(false);
        setIsUnorderedList(false);
        setIsOrderedList(false);
        setIsBlockquote(false);
        setIsCodeBlock(false);
        setBlockType(node.nodeName);
      }
    }
  }

  function handleBoldUnderlIneItalic(style: "bold" | "italic" | "underline") {
    const editor = editorContainerRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(style);
    setFormatState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }

  function handleTypoGraphy(value: string) {
    const editor = editorContainerRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    let node = range.startContainer as HTMLElement;
    while (
      node &&
      node !== editor &&
      !(node.nodeType === 1 && /^(P|H[1-6])$/i.test(node.nodeName))
    ) {
      node = node.parentElement as HTMLElement;
    }
    if (node && node !== editor) {
      if (node.nodeName !== value) {
        const newBlock = document.createElement(value);
        const headingStyles: Record<string, string> = {
          H1: "text-4xl font-extrabold leading-tight mb-2",
          H2: "text-3xl font-bold leading-snug mb-2",
          H3: "text-2xl font-bold leading-snug mb-2",
          H4: "text-xl font-semibold leading-snug mb-1",
          H5: "text-lg font-semibold leading-normal mb-1",
          H6: "text-base font-medium leading-normal mb-1",
          P: "text-base font-normal leading-5 mb-2"
        };
        newBlock.className = headingStyles[value] || "";
        while (node.firstChild) {
          newBlock.appendChild(node.firstChild);
        }
        node.parentNode?.replaceChild(newBlock, node);
        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        setBlockType(value);
        updateFormatStateAndBlockType();
      }
    }
  }

  function handleChecklistCommand() {
    const editor = editorContainerRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    let node = range.startContainer as HTMLElement;
    while (
      node &&
      node !== editor &&
      !(node.nodeType === 1 && /^(P|H[1-6]|LI)$/i.test(node.nodeName))
    ) {
      node = node.parentElement as HTMLElement;
    }
    if (!node || node === editor) return;
    if (
      node.nodeName === "LI" &&
      node.parentElement?.nodeName === "UL" &&
      node.querySelector('input[type="checkbox"]')
    ) {
      const textContent = node.textContent?.trim() || "";
      if (textContent === "") {
        const ul = node.parentElement;
        const parent = ul?.parentNode;
        const p = document.createElement("p");
        p.className = "text-base font-normal leading-5 mb-2";
        p.innerHTML = "<br>";
        if (parent && ul) {
          parent.insertBefore(p, ul.nextSibling);
          ul.removeChild(node);
          if (ul.querySelectorAll("li").length === 0) {
            parent.removeChild(ul);
          }
        }
        setIsChecklist(false);
        setBlockType("P");
        setFormatState({ bold: false, italic: false, underline: false });
        const range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        attachChecklistListeners();
        return;
      }
      const p = document.createElement("p");
      p.className = "text-base font-normal leading-5 mb-2";
      const checkbox = node.querySelector('input[type="checkbox"]');
      if (checkbox) node.removeChild(checkbox);
      p.innerHTML = node.innerHTML || "<br>";
      node.parentNode?.replaceChild(p, node.parentElement);
      setIsChecklist(false);
      setBlockType("P");
      setFormatState({ bold: false, italic: false, underline: false });
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      attachChecklistListeners();
      return;
    }
    if (isChecklist) return;
    const ul = document.createElement("ul");
    ul.className = "list-none pl-0 mb-2";
    const li = document.createElement("li");
    li.className = "flex items-center gap-2 min-h-[1.5em]";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "mr-2 accent-blue-500";
    li.appendChild(checkbox);
    while (node.firstChild) {
      li.appendChild(node.firstChild);
    }
    ul.appendChild(li);
    node.parentNode?.replaceChild(ul, node);
    const newRange = document.createRange();
    newRange.selectNodeContents(li);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);
    setIsChecklist(true);
    setBlockType("LI");
    attachChecklistListeners();
  }

  function handleUnorderedList() {
    const editor = editorContainerRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    let node = selection.anchorNode as HTMLElement;
    while (
      node &&
      node !== editor &&
      !(node.nodeType === 1 && /^(P|H[1-6]|LI)$/i.test(node.nodeName))
    ) {
      node = node.parentElement as HTMLElement;
    }
    if (!node || node === editor) return;
    if (node.nodeName === "LI" && node.parentElement?.nodeName === "UL" && !node.querySelector('input[type="checkbox"]')) {
      const ul = node.parentElement;
      const parent = ul?.parentNode;
      const p = document.createElement("p");
      p.className = "text-base font-normal leading-5 mb-2";
      p.innerHTML = node.innerHTML || "<br>";
      if (parent && ul) {
        parent.insertBefore(p, ul.nextSibling);
        ul.removeChild(node);
        if (ul.querySelectorAll("li").length === 0) {
          parent.removeChild(ul);
        }
      }
      setIsUnorderedList(false);
      setBlockType("P");
      setFormatState({ bold: false, italic: false, underline: false });
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    if (isUnorderedList) return;
    const ul = document.createElement("ul");
    ul.className = "list-disc pl-6 mb-2";
    const li = document.createElement("li");
    li.className = "min-h-[1.5em]";
    while (node.firstChild) {
      li.appendChild(node.firstChild);
    }
    ul.appendChild(li);
    node.parentNode?.replaceChild(ul, node);
    const newRange = document.createRange();
    newRange.selectNodeContents(li);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);
    setIsUnorderedList(true);
    setIsOrderedList(false);
    setIsChecklist(false);
    setBlockType("LI");
  }

  function handleOrderedList() {
    const editor = editorContainerRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    let node = selection.anchorNode as HTMLElement;
    while (
      node &&
      node !== editor &&
      !(node.nodeType === 1 && /^(P|H[1-6]|LI)$/i.test(node.nodeName))
    ) {
      node = node.parentElement as HTMLElement;
    }
    if (!node || node === editor) return;
    if (node.nodeName === "LI" && node.parentElement?.nodeName === "OL") {
      const ol = node.parentElement;
      const parent = ol?.parentNode;
      const p = document.createElement("p");
      p.className = "text-base font-normal leading-5 mb-2";
      p.innerHTML = node.innerHTML || "<br>";
      if (parent && ol) {
        parent.insertBefore(p, ol.nextSibling);
        ol.removeChild(node);
        if (ol.querySelectorAll("li").length === 0) {
          parent.removeChild(ol);
        }
      }
      setIsOrderedList(false);
      setBlockType("P");
      setFormatState({ bold: false, italic: false, underline: false });
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    if (isOrderedList) return;
    const ol = document.createElement("ol");
    ol.className = "list-decimal pl-6 mb-2";
    const li = document.createElement("li");
    li.className = "min-h-[1.5em]";
    while (node.firstChild) {
      li.appendChild(node.firstChild);
    }
    ol.appendChild(li);
    node.parentNode?.replaceChild(ol, node);
    const newRange = document.createRange();
    newRange.selectNodeContents(li);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);
    setIsOrderedList(true);
    setIsUnorderedList(false);
    setIsChecklist(false);
    setBlockType("LI");
  }

  function handleBlockquote() {
    const editor = editorContainerRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    let node = selection.anchorNode as HTMLElement;
    while (
      node &&
      node !== editor &&
      !(node.nodeType === 1 && /^(P|H[1-6]|BLOCKQUOTE)$/i.test(node.nodeName))
    ) {
      node = node.parentElement as HTMLElement;
    }
    if (!node || node === editor) return;
    if (node.nodeName === "BLOCKQUOTE") {
      const parent = node.parentNode;
      const p = document.createElement("p");
      p.className = "text-base font-normal leading-5 mb-2";
      p.innerHTML = node.innerHTML || "<br>";
      parent?.insertBefore(p, node.nextSibling);
      parent?.removeChild(node);
      setIsBlockquote(false);
      setBlockType("P");
      setFormatState({ bold: false, italic: false, underline: false });
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    if (isBlockquote) return;
    const blockquote = document.createElement("blockquote");
    blockquote.className = "border-l-4 border-gray-400 pl-4 text-gray-700 mb-2";
    while (node.firstChild) {
      blockquote.appendChild(node.firstChild);
    }
    node.parentNode?.replaceChild(blockquote, node);
    const newRange = document.createRange();
    newRange.selectNodeContents(blockquote);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);
    setIsBlockquote(true);
    setIsChecklist(false);
    setIsUnorderedList(false);
    setIsOrderedList(false);
    setBlockType("BLOCKQUOTE");
  }

  function handleCodeBlock() {
    const editor = editorContainerRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    let node = selection.anchorNode as HTMLElement;
    while (
      node &&
      node !== editor &&
      !(node.nodeType === 1 && /^(P|H[1-6]|PRE)$/i.test(node.nodeName))
    ) {
      node = node.parentElement as HTMLElement;
    }
    if (!node || node === editor) return;
    if (node.nodeName === "PRE") {
      const parent = node.parentNode;
      const p = document.createElement("p");
      p.className = "text-base font-normal leading-5 mb-2";
      p.innerHTML = node.textContent || "<br>";
      parent?.insertBefore(p, node.nextSibling);
      parent?.removeChild(node);
      setIsCodeBlock(false);
      setBlockType("P");
      setFormatState({ bold: false, italic: false, underline: false });
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    if (isCodeBlock) return;
    const pre = document.createElement("pre");
    pre.className = "bg-gray-100 rounded p-2 font-mono text-sm mb-2 overflow-x-auto";
    pre.contentEditable = "true";
    pre.spellcheck = false;
    pre.innerText = node.innerText || "";
    node.parentNode?.replaceChild(pre, node);
    const newRange = document.createRange();
    newRange.selectNodeContents(pre);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);
    setIsCodeBlock(true);
    setIsChecklist(false);
    setIsUnorderedList(false);
    setIsOrderedList(false);
    setIsBlockquote(false);
    setBlockType("PRE");
  }

  function updateUndoRedoState() {
    setCanUndo(true);
    setCanRedo(true);
  }

  const handleCommand = (command: string, value?: string) => {
    if (command === "formatBlock") {
      handleTypoGraphy(value!);
    } else if (["bold", "italic", "underline"].includes(command)) {
      handleBoldUnderlIneItalic(command as "bold" | "italic" | "underline");
    } else if (command === "checkedList") {
      handleChecklistCommand();
    } else if (command == "insertUnorderedList") {
      handleUnorderedList();
    } else if (command == "insertOrderedList") {
      handleOrderedList();
    } else if (command == "blockquote") {
      handleBlockquote();
    } else if (command === "pre") {
      handleCodeBlock();
    } else if (command === "undo") {
      document.execCommand("undo");
      updateFormatStateAndBlockType();
      updateUndoRedoState();
    } else if (command === "redo") {
      document.execCommand("redo");
      updateFormatStateAndBlockType();
      updateUndoRedoState();
    }
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      updateFormatStateAndBlockType();
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const handleEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorContainerRef.current;
    if (!editor) return;
    if (e.key === "Enter") {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      let node = selection.anchorNode as HTMLElement;
      while (
        node &&
        node !== editor &&
        !(node.nodeType === 1 && /^(H[1-6]|LI)$/i.test(node.nodeName))
      ) {
        node = node.parentElement as HTMLElement;
      }
      if (
        node &&
        node.nodeName === "LI" &&
        node.parentElement?.nodeName === "UL" &&
        node.querySelector('input[type="checkbox"]')
      ) {
        e.preventDefault();
        const textContent = node.textContent?.trim() || "";
        if (textContent === "") {
          const ul = node.parentElement;
          const parent = ul?.parentNode;
          const p = document.createElement("p");
          p.className = "text-base font-normal leading-5 mb-2";
          p.innerHTML = "<br>";
          if (parent && ul) {
            parent.insertBefore(p, ul.nextSibling);
            ul.removeChild(node);
            if (ul.querySelectorAll("li").length === 0) {
              parent.removeChild(ul);
            }
          }
          setIsChecklist(false);
          setBlockType("P");
          setFormatState({ bold: false, italic: false, underline: false });
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          attachChecklistListeners();
          return;
        }
        const li = document.createElement("li");
        li.className = "flex items-center gap-2 min-h-[1.5em]";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "mr-2 accent-blue-500";
        li.appendChild(checkbox);
        li.innerHTML += "<br>";
        if (node.nextSibling) {
          node.parentNode?.insertBefore(li, node.nextSibling);
        } else {
          node.parentNode?.appendChild(li);
        }
        const range = document.createRange();
        range.setStart(li, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        setIsChecklist(true);
        setBlockType("LI");
        setFormatState({ bold: false, italic: false, underline: false });
        attachChecklistListeners();
        return;
      }
      if (
        node &&
        node.nodeName === "LI" &&
        node.parentElement?.nodeName === "UL" &&
        !node.querySelector('input[type="checkbox"]')
      ) {
        e.preventDefault();
        const textContent = node.textContent?.trim() || "";
        if (textContent === "") {
          const ul = node.parentElement;
          const parent = ul?.parentNode;
          const p = document.createElement("p");
          p.className = "text-base font-normal leading-5 mb-2";
          p.innerHTML = "<br>";
          if (parent && ul) {
            parent.insertBefore(p, ul.nextSibling);
            ul.removeChild(node);
            if (ul.querySelectorAll("li").length === 0) {
              parent.removeChild(ul);
            }
          }
          setIsUnorderedList(false);
          setBlockType("P");
          setFormatState({ bold: false, italic: false, underline: false });
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        const li = document.createElement("li");
        li.className = "min-h-[1.5em]";
        li.innerHTML = "<br>";
        if (node.nextSibling) {
          node.parentNode?.insertBefore(li, node.nextSibling);
        } else {
          node.parentNode?.appendChild(li);
        }
        const range = document.createRange();
        range.setStart(li, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        setIsUnorderedList(true);
        setBlockType("LI");
        setFormatState({ bold: false, italic: false, underline: false });
        return;
      }
      if (
        node &&
        node.nodeName === "LI" &&
        node.parentElement?.nodeName === "OL"
      ) {
        e.preventDefault();
        const textContent = node.textContent?.trim() || "";
        if (textContent === "") {
          const ol = node.parentElement;
          const parent = ol?.parentNode;
          const p = document.createElement("p");
          p.className = "text-base font-normal leading-5 mb-2";
          p.innerHTML = "<br>";
          if (parent && ol) {
            parent.insertBefore(p, ol.nextSibling);
            ol.removeChild(node);
            if (ol.querySelectorAll("li").length === 0) {
              parent.removeChild(ol);
            }
          }
          setIsOrderedList(false);
          setBlockType("P");
          setFormatState({ bold: false, italic: false, underline: false });
          const range = document.createRange();
          range.setStart(p, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          return;
        }
        const li = document.createElement("li");
        li.className = "min-h-[1.5em]";
        li.innerHTML = "<br>";
        if (node.nextSibling) {
          node.parentNode?.insertBefore(li, node.nextSibling);
        } else {
          node.parentNode?.appendChild(li);
        }
        const range = document.createRange();
        range.setStart(li, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        setIsOrderedList(true);
        setBlockType("LI");
        setFormatState({ bold: false, italic: false, underline: false });
        return;
      }
      if (node && /^(H[1-6])$/i.test(node.nodeName)) {
        e.preventDefault();
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        p.className = "text-base font-normal leading-5 mb-2";
        if (node.nextSibling) {
          node.parentNode?.insertBefore(p, node.nextSibling);
        } else {
          node.parentNode?.appendChild(p);
        }
        const range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("removeFormat");
        setFormatState({
          bold: false,
          italic: false,
          underline: false,
        });
        setBlockType("P");
        setIsChecklist(false);
      }
      if (
        node &&
        node.nodeName === "BLOCKQUOTE"
      ) {
        e.preventDefault();
        const parent = node.parentNode;
        const p = document.createElement("p");
        p.className = "text-base font-normal leading-5 mb-2";
        p.innerHTML = "<br>";
        parent?.insertBefore(p, node.nextSibling);
        setIsBlockquote(false);
        setBlockType("P");
        setFormatState({ bold: false, italic: false, underline: false });
        const range = document.createRange();
        range.setStart(p, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      if (
        node &&
        node.nodeName === "PRE"
      ) {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection) return;
        const range = selection.getRangeAt(0);
        const br = document.createTextNode("\n");
        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        setIsCodeBlock(true);
        setBlockType("PRE");
        setFormatState({ bold: false, italic: false, underline: false });
        return;
      }
    }
  };

  useEffect(() => {
    const editor = editorContainerRef.current;
    if (!editor) return;
    ensureParagraph();
    editor.addEventListener('focus', ensureParagraph);
    editor.addEventListener('input', ensureParagraph);
    editor.addEventListener('input', updateUndoRedoState);
    return () => {
      editor.removeEventListener('focus', ensureParagraph);
      editor.removeEventListener('input', ensureParagraph);
      editor.removeEventListener('input', updateUndoRedoState);
    };
  }, []);

  function attachChecklistListeners() {
    const editor = editorContainerRef.current;
    if (!editor) return;
    const checkboxes = editor.querySelectorAll('li input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.removeEventListener("change", handleChecklistCheckboxChange);
      checkbox.addEventListener("change", handleChecklistCheckboxChange);
    });
  }

  function handleChecklistCheckboxChange(this: HTMLInputElement) {
    const li = this.closest("li");
    if (!li) return;
    if (this.checked) {
      li.classList.add("line-through", "text-gray-400");
    } else {
      li.classList.remove("line-through", "text-gray-400");
    }
  }

  return (
    <div className="max-w-[80%] mx-auto bg-white">
      <Toolbar
        onCommand={handleCommand}
        formatState={formatState}
        canUndo={canUndo}
        canRedo={canRedo}
        blockType={blockType}
        isChecklist={isChecklist}
        isUnorderedList={isUnorderedList}
        isOrderedList={isOrderedList}
        isBlockquote={isBlockquote}
        isCodeBlock={isCodeBlock}
      />
      <div
        className="min-h-[300px] py-4 outline-none text-base border-b border-dashed border-b-slate-400"
        contentEditable
        ref={editorContainerRef}
        spellCheck={true}
        onKeyDown={handleEnter}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default TextEditor;
