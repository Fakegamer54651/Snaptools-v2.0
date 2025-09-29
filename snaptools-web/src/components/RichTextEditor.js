import React, { useRef, useEffect, useState, useCallback } from 'react';
import CustomToolbar from './CustomToolbar';
import './styles/richTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Start typing..." }) => {
  const editorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Update content when value prop changes
  useEffect(() => {
    if (editorRef.current && isInitialized && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value, isInitialized]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  // Handle paste events with rich content and images
  const handlePaste = useCallback(async (e) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData || window.clipboardData;
    
    // Handle pasted images
    const items = Array.from(clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      // Handle image paste
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            // Insert image at cursor position
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(img);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }
            
            handleInput();
          };
          reader.readAsDataURL(file);
        }
      }
      return;
    }
    
    // Handle HTML content paste (from emails, web pages, etc.)
    let htmlContent = clipboardData.getData('text/html');
    let textContent = clipboardData.getData('text/plain');
    
    if (htmlContent) {
      // Clean and process HTML content
      const cleanedHtml = cleanPastedHtml(htmlContent);
      
      // Insert HTML content at cursor position
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanedHtml;
        
        // Insert each node
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else if (textContent) {
      // Fallback to plain text
      document.execCommand('insertText', false, textContent);
    }
    
    handleInput();
  }, [handleInput]);

  // Clean pasted HTML to preserve formatting while removing unwanted elements
  const cleanPastedHtml = useCallback((html) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove script tags and other potentially harmful elements
    const unwantedTags = ['script', 'style', 'meta', 'link', 'title', 'head'];
    unwantedTags.forEach(tag => {
      const elements = tempDiv.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
    
    // Clean up attributes but preserve essential styling
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(el => {
      // Keep only safe attributes
      const allowedAttributes = ['style', 'href', 'src', 'alt', 'title', 'width', 'height'];
      const attributes = Array.from(el.attributes);
      
      attributes.forEach(attr => {
        if (!allowedAttributes.includes(attr.name.toLowerCase())) {
          el.removeAttribute(attr.name);
        }
      });
      
      // Clean up style attribute to remove potentially harmful CSS
      if (el.style) {
        const style = el.style;
        const allowedStyles = [
          'color', 'background-color', 'font-size', 'font-weight', 'font-style',
          'text-decoration', 'text-align', 'margin', 'padding', 'border',
          'width', 'height', 'max-width', 'max-height'
        ];
        
        const styleText = style.cssText;
        el.removeAttribute('style');
        
        // Re-apply only allowed styles
        const styleRules = styleText.split(';');
        styleRules.forEach(rule => {
          const [property, value] = rule.split(':').map(s => s.trim());
          if (property && value && allowedStyles.includes(property.toLowerCase())) {
            el.style.setProperty(property, value);
          }
        });
      }
    });
    
    // Convert external images to base64 (for email images)
    const images = tempDiv.querySelectorAll('img');
    images.forEach(async (img) => {
      if (img.src && img.src.startsWith('http')) {
        try {
          // For security reasons, we'll keep external URLs but add a note
          // In a production environment, you might want to proxy these images
          img.title = 'External image: ' + img.src;
        } catch (error) {
          console.warn('Could not process external image:', img.src);
        }
      }
    });
    
    return tempDiv.innerHTML;
  }, []);

  // Execute command
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);


  // Handle copy events to preserve rich formatting
  const handleCopy = useCallback((e) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const clonedSelection = range.cloneContents();
      
      // Create a temporary div to get HTML content
      const tempDiv = document.createElement('div');
      tempDiv.appendChild(clonedSelection);
      
      // Set both HTML and plain text in clipboard
      const htmlContent = tempDiv.innerHTML;
      const textContent = tempDiv.textContent || tempDiv.innerText;
      
      e.clipboardData.setData('text/html', htmlContent);
      e.clipboardData.setData('text/plain', textContent);
      e.preventDefault();
    }
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Ctrl+B for bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      execCommand('bold');
    }
    // Ctrl+I for italic
    else if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      execCommand('italic');
    }
    // Ctrl+U for underline
    else if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      execCommand('underline');
    }
    // Ctrl+K for link
    else if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const url = prompt('Enter URL:');
      if (url) {
        execCommand('createLink', url);
      }
    }
    // Ctrl+Z for undo
    else if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      execCommand('undo');
    }
    // Ctrl+Y or Ctrl+Shift+Z for redo
    else if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      execCommand('redo');
    }
  }, [execCommand]);


  return (
    <div className="rich-text-editor">
      {/* Editor */}
      <div
        ref={editorRef}
        className="rich-text-editor__editor"
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onCopy={handleCopy}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
        spellCheck={true}
      />

      {/* Custom Toolbar */}
      <CustomToolbar editorRef={editorRef} />
    </div>
  );
};

export default RichTextEditor;