// Импорт необходимых библиотек и компонентов
import React, { useState, useEffect } from 'react';
import Table from '../components/Table';
import SkeletonTable from '../components/SkeletonTable';
import EmptyState from '../components/EmptyState';
import DriverModal from '../components/DriverModal';
import Button from '../components/Button';
import FigmaChip from '../components/FigmaChip';
import * as driversService from '../services/drivers.service';
import { useUI } from '../App';
import './styles/drivers.css';

// Основной компонент страницы водителей
export default function DriversPage() {
  // Global UI context
  const { showSuccess, showError } = useUI();
  
  // Состояние для хранения списка водителей
  const [drivers, setDrivers] = useState([]);
  // Состояние для управления открытием/закрытием модального окна
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Состояние для хранения данных редактируемого водителя (null = создание нового)
  const [editingDriver, setEditingDriver] = useState(null);
  // Состояния для загрузки
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  // Состояние для показа FigmaChip
  const [showChip, setShowChip] = useState(null);

  // Загрузка водителей при монтировании компонента
  useEffect(() => {
    loadDrivers();
  }, []);

  // Функция для загрузки водителей
  const loadDrivers = async () => {
    try {
      setLoading(true);
      const driversData = await driversService.getDrivers();
      setDrivers(driversData);
    } catch (err) {
      showError('Failed to load drivers. Please try again.');
      console.error('Error loading drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для добавления нового водителя или обновления существующего
  const handleAddDriver = async (driverData) => {
    try {
      setActionLoading(true);
      
      if (editingDriver) {
        // Обновляем существующего водителя
        const updatedDriver = await driversService.updateDriver(editingDriver.id, driverData);
        setDrivers(prev => prev.map(driver => 
          driver.id === editingDriver.id ? updatedDriver : driver
        ));
        setEditingDriver(null);
        setShowChip({
          type: 'success',
          subtitle: 'Nice',
          message: 'Driver updated successfully'
        });
      } else {
        // Добавляем нового водителя
        const newDriver = await driversService.createDriver(driverData);
        setDrivers(prev => [...prev, newDriver]);
        setShowChip({
          type: 'success',
          subtitle: 'Great',
          message: 'Driver added successfully'
        });
      }
      setIsModalOpen(false);
      
      // Скрываем чип через 4 секунды
      setTimeout(() => setShowChip(null), 4000);
    } catch (err) {
      setShowChip({
        type: 'error',
        subtitle: 'Error',
        message: 'Driver failed to save'
      });
      setTimeout(() => setShowChip(null), 4000);
      console.error('Error saving driver:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Функция для начала редактирования водителя
  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  // Функция для удаления водителя с подтверждением
  const handleDeleteDriver = async (driverId) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        setActionLoading(true);
        await driversService.deleteDriver(driverId);
        setDrivers(prev => prev.filter(driver => driver.id !== driverId));
        setShowChip({
          type: 'success',
          subtitle: 'Done',
          message: 'Driver deleted successfully'
        });
        setTimeout(() => setShowChip(null), 4000);
      } catch (err) {
        setShowChip({
          type: 'error',
          subtitle: 'Error',
          message: 'Driver failed to delete'
        });
        setTimeout(() => setShowChip(null), 4000);
        console.error('Error deleting driver:', err);
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Функция для закрытия модального окна и сброса состояния редактирования
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
  };

  // Определяем колонки таблицы
  const tableColumns = ["Call sign", "Driver name", "Phone #", "Truck #", "Trailer #", "VIN #", "Actions"];
  
  // Функция для копирования номера телефона в буфер обмена
  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone).then(() => {
      // Можно добавить уведомление о копировании
      console.log('Phone number copied to clipboard');
    });
  };

  // Преобразуем данные водителей в формат для таблицы
  const tableRows = drivers.map(driver => ({
    id: driver.id,
    "call sign": driver.callsign,
    "driver name": driver.name,
    // Номер телефона как кликабельный элемент для копирования
    "phone #": (
      <span 
        onClick={() => handleCopyPhone(driver.phone)}
        style={{ 
          cursor: 'pointer', 
          color: '#3b82f6',
          textDecoration: 'underline',
          userSelect: 'none'
        }}
        title="Click to copy phone number"
      >
        {driver.phone}
      </span>
    ),
    "truck #": driver.truck || "-",
    "trailer #": driver.trailer || "-",
    "vin #": driver.vin || "-",
    // Колонка действий с кнопками редактирования и удаления
    actions: (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button 
          onClick={() => handleEditDriver(driver)}
          className="action-button edit"
        >
          <span className="material-symbols-rounded">edit</span>
        </button>
        <button 
          onClick={() => handleDeleteDriver(driver.id)}
          className="action-button delete"
        >
          <span className="material-symbols-rounded">delete</span>
        </button>
      </div>
    )
  }));

  // Рендер компонента
  return (
    <div className="drivers-page">
      {/* Контейнер для кнопки добавления водителя в правом верхнем углу */}
      <div className="add-driver-btn-container">
        <Button
          variant="primary"
          leftIcon="add"
          onClick={() => setIsModalOpen(true)}
          disabled={actionLoading}
        >
          Create driver
        </Button>
      </div>
      
      {/* Заголовок страницы */}
      <div className="drivers-header">
        <h1>Driver Information</h1>
      </div>

      {/* Основной контент страницы */}
      <div className="drivers-content">
        <div className="drivers-table-section">
          {/* Показываем состояние загрузки, пустое состояние или таблицу */}
          {loading ? (
            <SkeletonTable columns={tableColumns} rowCount={5} />
          ) : drivers.length === 0 ? (
            <EmptyState
              title="Your driver list is empty"
              description="Save driver details once, and reuse them with just one command."
              actionButton={
                <Button
                  variant="primary"
                  leftIcon="add"
                  onClick={() => setIsModalOpen(true)}
                >
                  Create driver
                </Button>
              }
            />
          ) : (
            /* Таблица с данными водителей */
            <Table columns={tableColumns} rows={tableRows} />
          )}
        </div>
      </div>

      {/* Driver Modal */}
      <DriverModal
        isOpen={isModalOpen}
        onClose={!actionLoading ? handleCloseModal : undefined}
        onSave={handleAddDriver}
        initialData={editingDriver}
      />

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
