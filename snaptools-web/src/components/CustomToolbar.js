import React, { useState, useRef, useEffect } from 'react';
import './styles/toolbar.css';

const CustomToolbar = ({ editorRef }) => {
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [showAlignDropdown, setShowAlignDropdown] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentFormat, setCurrentFormat] = useState('Normal');
  const [currentAlign, setCurrentAlign] = useState('left');

  const formatDropdownRef = useRef(null);
  const alignDropdownRef = useRef(null);
  const colorPickerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(event.target)) {
        setShowFormatDropdown(false);
      }
      if (alignDropdownRef.current && !alignDropdownRef.current.contains(event.target)) {
        setShowAlignDropdown(false);
      }
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Execute command helper
  const execCommand = (command, value = null) => {
    if (editorRef?.current) {
      document.execCommand(command, false, value);
      editorRef.current.focus();
    }
  };

  // Format handlers
  const handleFormatChange = (format) => {
    setCurrentFormat(format);
    setShowFormatDropdown(false);
    
    switch (format) {
      case 'Normal':
        execCommand('formatBlock', 'p');
        break;
      case 'Heading 1':
        execCommand('formatBlock', 'h1');
        break;
      case 'Heading 2':
        execCommand('formatBlock', 'h2');
        break;
      default:
        execCommand('formatBlock', 'p');
    }
  };

  // Alignment handlers
  const handleAlignChange = (align) => {
    setCurrentAlign(align);
    setShowAlignDropdown(false);
    
    switch (align) {
      case 'left':
        execCommand('justifyLeft');
        break;
      case 'center':
        execCommand('justifyCenter');
        break;
      case 'right':
        execCommand('justifyRight');
        break;
      default:
        execCommand('justifyLeft');
    }
  };

  // Color picker colors
  const colors = [
    '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
    '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
    '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b266', '#66a3e0', '#c285ff',
    '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
    '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'
  ];

  const getAlignIcon = () => {
    switch (currentAlign) {
      case 'center': return 'format_align_center';
      case 'right': return 'format_align_right';
      default: return 'format_align_left';
    }
  };

  return (
    <div id="custom-toolbar" className="custom-toolbar">
      {/* Left section - Format and Alignment */}
      <div className="toolbar-left">
        {/* Normal Dropdown */}
        <div className="toolbar-dropdown" ref={formatDropdownRef}>
          <button 
            className="dropdown-button"
            onClick={() => setShowFormatDropdown(!showFormatDropdown)}
          >
            <span className="dropdown-text">{currentFormat}</span>
            <span className="material-symbols-rounded chevron">expand_more</span>
          </button>
          {showFormatDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => handleFormatChange('Normal')}>Normal</button>
              <button onClick={() => handleFormatChange('Heading 1')}>Heading 1</button>
              <button onClick={() => handleFormatChange('Heading 2')}>Heading 2</button>
            </div>
          )}
        </div>

        {/* Alignment Dropdown */}
        <div className="toolbar-dropdown" ref={alignDropdownRef}>
          <button 
            className="dropdown-button"
            onClick={() => setShowAlignDropdown(!showAlignDropdown)}
          >
            <span className="material-symbols-rounded">{getAlignIcon()}</span>
            <span className="material-symbols-rounded chevron">expand_more</span>
          </button>
          {showAlignDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => handleAlignChange('left')}>
                <span className="material-symbols-rounded">format_align_left</span>
                Align Left
              </button>
              <button onClick={() => handleAlignChange('center')}>
                <span className="material-symbols-rounded">format_align_center</span>
                Align Center
              </button>
              <button onClick={() => handleAlignChange('right')}>
                <span className="material-symbols-rounded">format_align_right</span>
                Align Right
              </button>
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="toolbar-dropdown" ref={colorPickerRef}>
          <button 
            className="color-picker-button"
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <div className="color-square"></div>
            <span className="material-symbols-rounded chevron">expand_more</span>
          </button>
          {showColorPicker && (
            <div className="color-picker-menu">
              {colors.map(color => (
                <button
                  key={color}
                  className="color-option"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    execCommand('foreColor', color);
                    setShowColorPicker(false);
                  }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right section - Formatting buttons */}
      <div className="toolbar-right">
        {/* Formatting Buttons */}
        <div className="toolbar-group">
          <button 
            className="toolbar-button"
            onClick={() => execCommand('bold')}
            title="Bold"
          >
            <span className="material-symbols-rounded">format_bold</span>
          </button>
          <button 
            className="toolbar-button"
            onClick={() => execCommand('italic')}
            title="Italic"
          >
            <span className="material-symbols-rounded">format_italic</span>
          </button>
          <button 
            className="toolbar-button"
            onClick={() => execCommand('underline')}
            title="Underline"
          >
            <span className="material-symbols-rounded">format_underlined</span>
          </button>
          <button 
            className="toolbar-button"
            onClick={() => execCommand('strikeThrough')}
            title="Strikethrough"
          >
            <span className="material-symbols-rounded">strikethrough_s</span>
          </button>
          <button 
            className="toolbar-button"
            onClick={() => execCommand('removeFormat')}
            title="Clear Formatting"
          >
            <span className="material-symbols-rounded">format_clear</span>
          </button>
        </div>

        {/* List & Quote Buttons */}
        <div className="toolbar-group">
          <button 
            className="toolbar-button"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <span className="material-symbols-rounded">format_list_bulleted</span>
          </button>
          <button 
            className="toolbar-button"
            onClick={() => execCommand('insertOrderedList')}
            title="Number List"
          >
            <span className="material-symbols-rounded">format_list_numbered</span>
          </button>
          <button 
            className="toolbar-button"
            onClick={() => execCommand('formatBlock', 'blockquote')}
            title="Blockquote"
          >
            <span className="material-symbols-rounded">format_quote</span>
          </button>
        </div>

        {/* Link & Image Buttons */}
        <div className="toolbar-group">
          <button 
            className="toolbar-button"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) execCommand('createLink', url);
            }}
            title="Insert Link"
          >
            <span className="material-symbols-rounded">link</span>
          </button>
          <button 
            className="toolbar-button"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    execCommand('insertImage', e.target.result);
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            title="Insert Image"
          >
            <span className="material-symbols-rounded">image</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomToolbar;
