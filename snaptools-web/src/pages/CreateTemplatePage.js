// Импорт необходимых библиотек и компонентов
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import RichEmailEditor from '../components/RichEmailEditor';
import VariableInput from '../components/VariableInput.jsx';
import FigmaChip from '../components/FigmaChip';
import './styles/createTemplate.css';

// Доступные переменные для перетаскивания
const availableVariables = [
  { id: 'origin', name: 'Origin', placeholder: '{{origin}}' },
  { id: 'destination', name: 'Destination', placeholder: '{{dest}}' },
  { id: 'ref', name: 'Ref#', placeholder: '{{ref}}' },
  { id: 'availdate', name: 'Avail date', placeholder: '{{date}}' }
];

// Предустановленные шаблоны
const templatePresets = {
  "1": {
    subject: "Load from {{origin}} to {{dest}}, available on {{date}}",
    body: "Hello, team,\n\nI'm reaching out regarding the load from {{origin}} to {{dest}}, available on {{date}}.\n\nCould you please provide more details, including the rate and any special requirements?\n\nRef #: {{ref}}\nMC: 000000\nDirect: (000)000-0000\nOffice: (000)000-0000\nEmail: Usersemail@gmail.com"
  },
  "2": {
    subject: "Freight Opportunity: {{origin}} → {{dest}}",
    body: "Good morning,\n\nWe have a freight opportunity from {origin} to {dest} on {date}.\n\nLoad Details:\n- Reference: {ref}\n- Equipment: Dry Van\n- Weight: TBD\n\nPlease confirm your interest and provide your best rate.\n\nBest regards,\nDispatch Team\nPhone: (555) 123-4567"
  },
  "3": {
    subject: "Load from {{origin}} to {{dest}} for {{date}}",
    body: "Hey team,\n\nI saw the load from {{origin}} to {{dest}} for {{date}}.\n\nCould you share the rate and requirements when you get a chance?\n\nRef #: {{ref}}\nMC: 000000\nDirect: (000)000-0000\nOffice: (000)000-0000\nEmail: Usersemail@gmail.com"
  }
};

// Компонент страницы создания шаблона
export default function CreateTemplatePage() {
  const navigate = useNavigate();
  
  // Состояние формы создания шаблона
  const [formData, setFormData] = useState({
    templateName: '',        // Название шаблона
    senderEmail: '',         // Email отправителя
    subject: '',             // Тема письма
    yourEmail: ''            // Ваш email (с текстовым редактором)
  });

  // Tutorial state
  const [showTutorial] = useState(() => {
    return localStorage.getItem('hideTutorial') !== 'true';
  });
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Template selector state
  const [selectedTemplate, setSelectedTemplate] = useState('custom');
  
  // Состояние для показа FigmaChip
  const [showChip, setShowChip] = useState(null);
  
  // Flag to prevent auto-switch during template application
  const isApplyingPreset = useRef(false);

  // Robust variable parsing for Quill (supports both {{var}} and {var} forms)
  const extractSegmentsWithVars = (str) => {
    if (!str) return [{ type: 'text', value: '' }];
    
    const segments = [];
    const regex = /(\{\{\s*(origin|dest|date|ref)\s*\}\}|\{\s*(origin|dest|date|ref)\s*\})/gi;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(str)) !== null) {
      // Add text before the variable
      if (match.index > lastIndex) {
        const textSegment = str.slice(lastIndex, match.index);
        if (textSegment) {
          segments.push({ type: 'text', value: textSegment });
        }
      }
      
      // Add the variable (normalize the name to lowercase)
      const variableName = (match[2] || match[3]).toLowerCase().trim();
      segments.push({ type: 'var', value: variableName });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < str.length) {
      const remainingText = str.slice(lastIndex);
      if (remainingText) {
        segments.push({ type: 'text', value: remainingText });
      }
    }
    
    // If no segments were found, return the original string as text
    if (segments.length === 0) {
      segments.push({ type: 'text', value: str });
    }
    
    return segments;
  };

  // Insert variable token at specific position using the same blot as drag & drop
  const insertVariableAt = (quill, index, variableName) => {
    const variableText = `{{${variableName}}}`;
    quill.insertEmbed(index, 'variable', {
      name: variableName,
      text: variableText
    });
    return 1; // Return length of inserted content
  };

  // Apply template to Quill editor with proper variable token insertion
  const applyTemplateToQuill = (templateString) => {
    if (!window.richEmailEditorRef) {
      console.warn('RichEmailEditor reference not available');
      return;
    }
    
    const quill = window.richEmailEditorRef.quillInstance;
    if (!quill) {
      console.warn('Quill instance not available');
      return;
    }
    
    // Clear the editor
    quill.setContents([]);
    
    let cursor = 0;
    const lines = templateString.split('\n');
    
    lines.forEach((line, lineIndex) => {
      const segments = extractSegmentsWithVars(line);
      
      segments.forEach(segment => {
        if (segment.type === 'text') {
          quill.insertText(cursor, segment.value);
          cursor += segment.value.length;
        } else if (segment.type === 'var') {
          // Validate variable name
          const validVars = ['origin', 'dest', 'date', 'ref'];
          if (validVars.includes(segment.value)) {
            const insertedLength = insertVariableAt(quill, cursor, segment.value);
            cursor += insertedLength;
          } else {
            // Unknown variable, insert as plain text
            const plainText = `{{${segment.value}}}`;
            quill.insertText(cursor, plainText);
            cursor += plainText.length;
          }
        }
      });
      
      // Add newline after each line except the last one
      if (lineIndex < lines.length - 1) {
        quill.insertText(cursor, '\n');
        cursor += 1;
      }
    });
    
    // Set cursor at the end
    quill.setSelection(cursor);
  };

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Обработчик изменения содержимого rich text editor
  const handleRichTextChange = (content) => {
    setFormData(prev => ({
      ...prev,
      yourEmail: content
    }));
    
    // Auto-switch to Custom only if not applying a preset
    if (!isApplyingPreset.current && selectedTemplate !== 'custom') {
      setSelectedTemplate('custom');
    }
  };

  // Обработчик начала перетаскивания переменной
  const handleDragStart = (e, variable) => {
    e.dataTransfer.setData('text/plain', variable.placeholder);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Обработчик изменения subject line (с поддержкой переменных)
  const handleSubjectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      subject: value
    }));
    
    // Auto-switch to Custom only if not applying a preset
    if (!isApplyingPreset.current && selectedTemplate !== 'custom') {
      setSelectedTemplate('custom');
    }
  };

  // Обработчики для предотвращения drag & drop на запрещенных полях
  const handleDisallowedDragOver = (e) => {
    // Проверяем, что это перетаскивание переменной
    const dragData = e.dataTransfer.types;
    if (dragData.includes('text/plain')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'none'; // Показываем курсор "запрещено"
    }
  };

  const handleDisallowedDrop = (e) => {
    // Проверяем, что это переменная
    const variable = e.dataTransfer.getData('text/plain');
    if (variable && variable.match(/^\{\{[^}]+\}\}$/)) {
      e.preventDefault(); // Полностью блокируем drop переменных
      return false;
    }
  };

  // Обработчики для разрешенных полей (subject и yourEmail)
  const handleDragOver = (e, fieldName) => {
    if (fieldName === 'subject' || fieldName === 'yourEmail') {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      // Add visual feedback during drag over
      e.currentTarget.classList.add('drag-over');
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = (e, fieldName) => {
    // Remove visual feedback when drag leaves
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    // Remove visual feedback after drop
    e.currentTarget.classList.remove('drag-over');
    
    const variable = e.dataTransfer.getData('text/plain');
    
    if (fieldName === 'yourEmail') {
      // Extract variable name from {{Variable}} format
      const match = variable.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const variableName = match[1];
        
        // Use the Quill variable blot insertion method
        if (window.richEmailEditorRef && window.richEmailEditorRef.insertVariable) {
          window.richEmailEditorRef.insertVariable(variableName, variable);
        } else {
          // Fallback to HTML insertion if blot method is not available
          const currentValue = formData.yourEmail || '';
          const variableHtml = `<span class="ql-variable" data-var="${variableName}" contenteditable="false">${variable}</span>`;
          const newValue = currentValue + variableHtml + ' ';
          setFormData(prev => ({
            ...prev,
            yourEmail: newValue
          }));
        }
      }
    }
    // Subject line drag & drop is now handled entirely by VariableInput component
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Базовая валидация обязательных полей
    if (!formData.templateName || !formData.senderEmail || !formData.subject) {
      setShowChip({
        type: 'error',
        subtitle: 'Error',
        message: 'Template failed to save'
      });
      setTimeout(() => setShowChip(null), 4000);
      return;
    }

    // Создаем объект шаблона
    const newTemplate = {
      id: Date.now(), // Простая генерация ID на основе времени
      name: formData.templateName,
      senderEmail: formData.senderEmail,
      subject: formData.subject,
      yourEmail: formData.yourEmail
    };

    // Handle tutorial preference
    if (dontShowAgain) {
      localStorage.setItem('hideTutorial', 'true');
    }
    
    // Здесь можно добавить логику сохранения шаблона
    console.log('New template:', newTemplate);
    
    // Показываем успешное сообщение
    setShowChip({
      type: 'success',
      subtitle: 'Nice',
      message: 'Template has been saved'
    });
    
    // Возвращаемся на страницу шаблонов через 2 секунды, чтобы показать чип
    setTimeout(() => {
      navigate('/templates');
    }, 2000);
  };

  // Обработчик кнопки "Назад"
  const handleBack = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideTutorial', 'true');
    }
    navigate('/templates');
  };

  // Handle tutorial checkbox
  const handleTutorialCheckbox = (e) => {
    setDontShowAgain(e.target.checked);
  };

  // Handle template selection with proper radio control and preset protection
  const handleTemplateSelection = (templateId) => {
    // First set the selected template to ensure radio is checked
    setSelectedTemplate(templateId);
    
    if (templateId !== 'custom' && templatePresets[templateId]) {
      const template = templatePresets[templateId];
      
      // Set flag to prevent auto-switch during template application
      isApplyingPreset.current = true;
      
      // Update subject using existing subject logic (unchanged)
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        yourEmail: '' // Will be populated by Quill
      }));
      
      // Apply template to Quill body using robust variable parsing
      applyTemplateToQuill(template.body);
      
      // Clear the flag on the next tick to allow future auto-switches
      queueMicrotask(() => {
        isApplyingPreset.current = false;
      });
    }
  };

  return (
    <div className="create-template-page">
      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-button" onClick={handleBack}>
          <div className="back-icon-placeholder"></div>
          <span className="material-symbols-rounded back-arrow">arrow_back</span>
          <span className="back-text">Back</span>
        </button>
      </div>

      {/* Основной контент с новым дизайном */}
      <div className="create-template-content">
        {/* Основная форма в контейнере */}
        <div className="main-form-container">
          <form className="create-template-form" onSubmit={handleSubmit}>
            {/* Поле названия шаблона */}
            <div className="form-field">
              <Input
                label="Template Name"
                placeholder="Ex. (Company name)"
                value={formData.templateName}
                onChange={handleChange}
                onDragOver={handleDisallowedDragOver}
                onDrop={handleDisallowedDrop}
                name="templateName"
                required
              />
            </div>

            {/* Поле email отправителя */}
            <div className="form-field">
              <Input
                label="Senders email"
                type="email"
                placeholder="Johndoe@mail.com"
                value={formData.senderEmail}
                onChange={handleChange}
                onDragOver={handleDisallowedDragOver}
                onDrop={handleDisallowedDrop}
                name="senderEmail"
                required
              />
            </div>

            {/* Поле темы письма с поддержкой drag & drop */}
            <div className="form-field">
              <VariableInput
                label="Subject Line"
                placeholder="Enter subject..."
                value={formData.subject}
                onChange={handleSubjectChange}
                acceptsVariables={true}
              />
            </div>

            {/* Поле вашего email с поддержкой переменных */}
            <div className="form-field email-editor-field">
              <label className="form-label">Your Email</label>
              <div 
                className="rich-email-container drop-zone"
                onDragOver={(e) => handleDragOver(e, 'yourEmail')}
                onDragLeave={(e) => handleDragLeave(e, 'yourEmail')}
                onDrop={(e) => handleDrop(e, 'yourEmail')}
              >
                <RichEmailEditor
                  value={formData.yourEmail}
                  onChange={handleRichTextChange}
                  placeholder="Hello, team! Could you please provide more details about the load from..."
                />
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                className="save-button"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="preview-button"
                onClick={() => console.log('Preview email')}
              >
                  Preview email
                </Button>
              </div>
            </form>

          </div>

        {/* Sidebar with two separate boxes */}
        <div className="sidebar-container">
          {/* Tutorial Box - First */}
          {showTutorial && (
            <div className="sidebar-box tutorial-box">
              <div className="tutorial-header">
                <h3 className="box-title">Short video tutorial</h3>
                <span className="tutorial-duration">(30 seconds)</span>
              </div>
              <div className="tutorial-video">
                <iframe
                  width="290"
                  height="160"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Template Creation Tutorial"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="tutorial-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={handleTutorialCheckbox}
                    className="checkbox-input"
                  />
                  <span className="checkmark"></span>
                  Don't show tutorial next time
                </label>
              </div>
            </div>
          )}

          {/* Variables Box - Second */}
          <div className="sidebar-box variables-box">
            <h3 className="box-title">Variables</h3>
            <div className="variables-list">
              {availableVariables.map(variable => (
                <div
                  key={variable.id}
                  className="variable-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, variable)}
                >
                  <span className="material-symbols-rounded drag-indicator">drag_indicator</span>
                  <span className="variable-name">{variable.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Template Selector Options - Raw */}
          <div className="template-options">
            {[
              { id: '1', label: 'Template 1' },
              { id: '2', label: 'Template 2' },
              { id: '3', label: 'Template 3' },
              { id: 'custom', label: 'Custom' }
            ].map(template => (
              <label key={template.id} className={`template-option ${selectedTemplate === template.id ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="template"
                  value={template.id}
                  checked={selectedTemplate === template.id}
                  onChange={() => handleTemplateSelection(template.id)}
                  className="template-radio"
                />
                <span className="template-label">{template.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* FigmaChip for notifications */}
      {showChip && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000
        }}>
          <FigmaChip 
            type={showChip.type}
            subtitle={showChip.subtitle}
            message={showChip.message}
          />
        </div>
      )}
    </div>
  );
}
