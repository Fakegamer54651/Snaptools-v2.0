import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';
import './styles/richEmailEditor.css';
import './VariableBlot'; // Import to register the blot

export default function RichEmailEditor({ value, onChange, placeholder = "Start typing..." }) {
  const quillRef = useRef(null);
  
  // Ensure value is always a string
  const safeValue = typeof value === "string" ? value : "";

  const handleChange = (html) => {
    if (onChange) {
      onChange(html || "");
    }
  };

  // Method to insert a variable at the current cursor position
  const insertVariable = (variableName, variableText) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      
      // Insert the variable blot
      quill.insertEmbed(index, 'variable', {
        name: variableName,
        text: variableText
      });
      
      // Move cursor after the variable
      quill.setSelection(index + 1);
    }
  };

  // Method to load template content using Quill's API
  const loadTemplateContent = (htmlContent) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      
      // Clear current content first
      quill.setContents([]);
      
      // Use Quill's clipboard API to paste HTML content
      quill.clipboard.dangerouslyPasteHTML(htmlContent);
      
      // Trigger onChange to update parent component
      if (onChange) {
        onChange(quill.root.innerHTML);
      }
    }
  };

  // Expose methods and Quill instance via ref and global reference
  useEffect(() => {
    const methods = { 
      insertVariable, 
      loadTemplateContent,
      quillInstance: quillRef.current ? quillRef.current.getEditor() : null
    };
    
    if (quillRef.current) {
      window.richEmailEditorRef = methods;
    }
  }, []);

  // Use standard toolbar and add variable format
  const modules = {
    toolbar: [
      [{ 'header': [false, 1, 2] }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['bold', 'italic', 'underline', 'strike', 'clean'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'blockquote']
    ]
  };

  const formats = [
    "header", "align", "color", "background",
    "bold", "italic", "underline", "strike", "clean",
    "list", "bullet",
    "link", "image", "blockquote",
    "variable" // Add variable format
  ];

  return (
    <div className="rich-email-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={safeValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        onChangeSelection={() => {
          // Store reference for external access
          window.richEmailEditorRef = { 
            insertVariable, 
            loadTemplateContent,
            quillInstance: quillRef.current ? quillRef.current.getEditor() : null
          };
        }}
      />
    </div>
  );
}
