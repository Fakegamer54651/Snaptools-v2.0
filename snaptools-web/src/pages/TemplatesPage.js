// Импорт необходимых библиотек и компонентов
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import TemplateTable from '../components/TemplateTable';
import SkeletonTemplatesTable from '../components/SkeletonTemplatesTable';
import EmptyState from '../components/EmptyState';
import FigmaChip from '../components/FigmaChip';
import * as templatesService from '../services/templates.service';
import { useUI } from '../App';
import './styles/templates.css';

// Основной компонент страницы шаблонов
export default function TemplatesPage() {
  const navigate = useNavigate();
  // Global UI context
  const { showSuccess, showError } = useUI();
  
  // Состояние для хранения списка шаблонов
  const [templates, setTemplates] = useState([]);
  // Состояния для загрузки
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  // Состояние для показа FigmaChip
  const [showChip, setShowChip] = useState(null);

  // Загрузка шаблонов при монтировании компонента
  useEffect(() => {
    loadTemplates();
  }, []);

  // Функция для загрузки шаблонов
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await templatesService.getTemplates();
      setTemplates(templatesData);
    } catch (err) {
      showError('Failed to load templates. Please try again.');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для перехода на страницу создания шаблона
  const handleCreateTemplate = () => {
    navigate('/templates/create');
  };

  // Функция для редактирования шаблона
  const handleEditTemplate = (template) => {
    navigate(`/templates/edit/${template.id}`);
  };

  // Функция для удаления шаблона с подтверждением
  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        setActionLoading(true);
        await templatesService.deleteTemplate(templateId);
        setTemplates(prev => prev.filter(template => template.id !== templateId));
        setShowChip({
          type: 'success',
          subtitle: 'Done',
          message: 'Template deleted successfully'
        });
        setTimeout(() => setShowChip(null), 4000);
      } catch (err) {
        setShowChip({
          type: 'error',
          subtitle: 'Error',
          message: 'Template failed to delete'
        });
        setTimeout(() => setShowChip(null), 4000);
        console.error('Error deleting template:', err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <div className="templates-page">
      {/* Контейнер для кнопки создания шаблона в правом верхнем углу */}
      <div className="add-template-btn-container">
        <Button
          variant="primary"
          leftIcon="add"
          onClick={handleCreateTemplate}
          disabled={actionLoading}
        >
          Templates
        </Button>
      </div>
      
      {/* Заголовок страницы */}
      <div className="templates-header">
        <h1>Templates</h1>
      </div>

      {/* Основной контент страницы */}
      <div className="templates-content">
        <div className="templates-table-section">
          {/* Показываем состояние загрузки, пустое состояние или таблицу */}
          {loading ? (
            <SkeletonTemplatesTable rowCount={3} />
          ) : templates.length === 0 ? (
            <EmptyState
              title="Your templates"
              description="Once you create a template it will appear here"
              actionButton={
                <Button
                  variant="primary"
                  leftIcon="add"
                  onClick={handleCreateTemplate}
                >
                  Create First Template
                </Button>
              }
            />
          ) : (
            /* Таблица с данными шаблонов */
            <TemplateTable 
              templates={templates}
              onEdit={handleEditTemplate}
              onDelete={handleDeleteTemplate}
              disabled={actionLoading}
            />
          )}
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