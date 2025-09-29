// Импорт необходимых библиотек
import React from 'react';
import './styles/templateTable.css';

// Функция для парсинга темы письма и вставки тегов
const parseSubjectWithTags = (subject) => {
  // Заменяем переменные на теги
  const parts = subject.split(/(\{\{[^}]+\}\})/g);
  
  return parts.map((part, index) => {
    if (part.match(/^\{\{[^}]+\}\}$/)) {
      // Это переменная - отображаем как тег
      const tagName = part.replace(/[{}]/g, '');
      return (
        <span key={index} className="template-tag-inline">
          {tagName}
        </span>
      );
    } else {
      // Обычный текст
      return part;
    }
  });
};

// Компонент таблицы шаблонов без заголовков
export default function TemplateTable({ templates, onEdit, onDelete }) {
  return (
    <div className="template-table-container">
      <div className="template-table">
        {templates.map(template => (
          <div key={template.id} className="template-row">
            {/* Основная информация о шаблоне */}
            <div className="template-info">
              <div className="template-main-info">
                <div className="template-header-row">
                  {/* Название шаблона */}
                  <div className="template-name">{template.name}</div>
                  {/* Email отправителя */}
                  <div className="template-sender-email">{template.senderEmail}</div>
                </div>
                {/* Строка темы письма с инлайн тегами */}
                <div className="template-subject">
                  {parseSubjectWithTags(template.subject)}
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="template-actions">
              <button 
                onClick={() => onEdit(template)}
                className="action-button edit"
                title="Edit template"
              >
                <span className="material-symbols-rounded">edit</span>
              </button>
              <button 
                onClick={() => onDelete(template.id)}
                className="action-button delete"
                title="Delete template"
              >
                <span className="material-symbols-rounded">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
