import React, { useRef, useEffect, useState, useCallback } from 'react';
import './styles/variableInput.css';

const VariableInput = ({ 
  label, 
  placeholder = '', 
  value = '', 
  onChange, 
  acceptsVariables = true,
  className = '',
  ...props 
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Convert string with {{Variable}} placeholders to HTML with styled spans
  const stringToHtml = useCallback((str) => {
    if (!acceptsVariables) return str;
    
    return str.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      return `<span class="variable-token" data-var="${variableName}" contenteditable="false">${match}</span>`;
    });
  }, [acceptsVariables]);

  // Convert HTML with styled spans back to string with {{Variable}} placeholders
  const htmlToString = useCallback((html) => {
    if (!acceptsVariables) return html;
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Replace variable spans with placeholder text
    const variableSpans = tempDiv.querySelectorAll('span[data-var]');
    variableSpans.forEach(span => {
      const varName = span.getAttribute('data-var');
      span.replaceWith(`{{${varName}}}`);
    });
    
    return tempDiv.textContent || tempDiv.innerText || '';
  }, [acceptsVariables]);

  // Update the editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      const currentContent = htmlToString(editorRef.current.innerHTML);
      if (currentContent !== value) {
        editorRef.current.innerHTML = stringToHtml(value);
      }
    }
  }, [value, stringToHtml, htmlToString]);

  // Handle input changes
  const handleInput = useCallback((e) => {
    if (onChange) {
      const htmlContent = e.target.innerHTML;
      const stringContent = htmlToString(htmlContent);
      onChange(stringContent);
    }
  }, [onChange, htmlToString]);

  // Handle key events for proper variable deletion
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const { startContainer, startOffset } = range;
        
        // Check if cursor is right after a variable span
        if (startContainer.nodeType === Node.TEXT_NODE && startOffset === 0) {
          const prevSibling = startContainer.previousSibling;
          if (prevSibling && prevSibling.classList && 
              (prevSibling.classList.contains('ql-variable') || prevSibling.classList.contains('variable-token'))) {
            e.preventDefault();
            prevSibling.remove();
            if (onChange) {
              const stringContent = htmlToString(editorRef.current.innerHTML);
              onChange(stringContent);
            }
            return;
          }
        }
        
        // Check if cursor is at the start and previous element is a variable
        if (startContainer === editorRef.current && startOffset > 0) {
          const prevChild = editorRef.current.childNodes[startOffset - 1];
          if (prevChild && prevChild.classList && 
              (prevChild.classList.contains('ql-variable') || prevChild.classList.contains('variable-token'))) {
            e.preventDefault();
            prevChild.remove();
            if (onChange) {
              const stringContent = htmlToString(editorRef.current.innerHTML);
              onChange(stringContent);
            }
            return;
          }
        }
      }
    }
  }, [onChange, htmlToString]);

  // Handle paste events
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    
    // Insert plain text at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
      
      if (onChange) {
        const stringContent = htmlToString(editorRef.current.innerHTML);
        onChange(stringContent);
      }
    }
  }, [onChange, htmlToString]);

  // Method to insert a variable at the current cursor position
  const insertVariable = useCallback((variableName, variableText) => {
    if (!acceptsVariables || !editorRef.current) return;
    
    const selection = window.getSelection();
    let range;
    
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
    } else {
      // If no selection, insert at the end
      range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
    }
    
    // Create variable span
    const variableSpan = document.createElement('span');
    variableSpan.className = 'variable-token';
    variableSpan.setAttribute('data-var', variableName);
    variableSpan.setAttribute('contenteditable', 'false');
    variableSpan.textContent = variableText;
    
    // Insert the variable
    range.deleteContents();
    range.insertNode(variableSpan);
    
    // Add a space after the variable
    const spaceNode = document.createTextNode(' ');
    range.setStartAfter(variableSpan);
    range.insertNode(spaceNode);
    range.setStartAfter(spaceNode);
    range.setEndAfter(spaceNode);
    
    selection.removeAllRanges();
    selection.addRange(range);
    
    if (onChange) {
      const stringContent = htmlToString(editorRef.current.innerHTML);
      onChange(stringContent);
    }
  }, [acceptsVariables, onChange, htmlToString]);

  // Expose insertVariable method globally for drag & drop
  useEffect(() => {
    if (acceptsVariables) {
      window.variableInputRef = { insertVariable };
    }
  }, [acceptsVariables, insertVariable]);

  // Handle drag over for visual feedback
  const handleDragOver = useCallback((e) => {
    if (acceptsVariables) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      if (editorRef.current) {
        editorRef.current.classList.add('drag-over');
      }
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  }, [acceptsVariables]);

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    if (editorRef.current) {
      editorRef.current.classList.remove('drag-over');
    }
  }, []);

  // Handle drop events
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.classList.remove('drag-over');
    }
    
    if (!acceptsVariables) return;
    
    const variable = e.dataTransfer.getData('text/plain');
    const match = variable.match(/\{\{([^}]+)\}\}/);
    
    if (match) {
      const variableName = match[1];
      insertVariable(variableName, variable);
    }
  }, [acceptsVariables, insertVariable]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <div className={`variable-input-container ${className}`}>
      {label && <label className="variable-input-label">{label}</label>}
      <div
        ref={editorRef}
        className={`variable-input-field ${isFocused ? 'focused' : ''} ${acceptsVariables ? 'accepts-variables' : ''}`}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        spellCheck={true}
        role="textbox"
        aria-label={label || placeholder}
        {...props}
      />
    </div>
  );
};

export default VariableInput;
