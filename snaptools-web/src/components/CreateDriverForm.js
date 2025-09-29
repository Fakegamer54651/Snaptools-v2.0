// Импорт необходимых библиотек
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import './styles/createDriverForm.css';

// Компонент формы для создания/редактирования водителя
export default function CreateDriverForm({ onSubmit, initialData, onCancel }) {
  // Состояние формы с начальными данными (для редактирования) или пустыми значениями (для создания)
  const [formData, setFormData] = useState({
    callsign: initialData?.callsign || '',    // Позывной водителя
    name: initialData?.name || '',            // Имя водителя
    phone: initialData?.phone || '',          // Номер телефона
    truck: initialData?.truck || '',          // Номер грузовика
    trailer: initialData?.trailer || '',      // Номер прицепа
    vin: initialData?.vin || ''               // VIN номер
  });

  // Обработчик изменения полей формы с валидацией
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Обработка форматирования позывного
    if (name === 'callsign') {
      // Удаляем существующие "/" в начале
      let cleanValue = value.replace(/^\/+/, '');
      // Добавляем "/" в начало, если есть содержимое
      processedValue = cleanValue ? `/${cleanValue}` : '';
    }
    
    // Обработка форматирования номера телефона в формат +1 (XXX) XXX-XXXX
    if (name === 'phone') {
      // Удаляем все символы кроме цифр
      const digits = value.replace(/\D/g, '');
      
      // Ограничиваем до 11 цифр (1 + 10 цифр номера)
      const limitedDigits = digits.slice(0, 11);
      
      // Форматируем в зависимости от количества цифр
      if (limitedDigits.length === 0) {
        processedValue = '';
      } else if (limitedDigits.length <= 1) {
        processedValue = '+1';
      } else if (limitedDigits.length <= 4) {
        // +1 (XXX
        const areaCode = limitedDigits.slice(1);
        processedValue = `+1 (${areaCode}`;
      } else if (limitedDigits.length <= 7) {
        // +1 (XXX) XXX
        const areaCode = limitedDigits.slice(1, 4);
        const firstPart = limitedDigits.slice(4);
        processedValue = `+1 (${areaCode}) ${firstPart}`;
      } else {
        // +1 (XXX) XXX-XXXX
        const areaCode = limitedDigits.slice(1, 4);
        const firstPart = limitedDigits.slice(4, 7);
        const secondPart = limitedDigits.slice(7, 11);
        processedValue = `+1 (${areaCode}) ${firstPart}-${secondPart}`;
      }
    }
    
    // Обработка валидации VIN номера
    if (name === 'vin') {
      // Разрешаем только буквенно-цифровые символы, исключая I, O, Q, ограничиваем 17 символами
      processedValue = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17);
    }
    
    // Обновляем состояние формы
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Базовая валидация обязательных полей (только позывной и имя)
    if (!formData.callsign || !formData.name) {
      alert('Please fill in Call sign and Driver name (required fields)');
      return;
    }

    // Создаем объект водителя с ID
    const newDriver = {
      id: Date.now(), // Простая генерация ID на основе времени
      callsign: formData.callsign,
      name: formData.name,
      phone: formData.phone,
      truck: formData.truck,
      trailer: formData.trailer,
      vin: formData.vin
    };

    // Вызываем callback функцию с данными водителя
    onSubmit(newDriver);
    
    // Сбрасываем форму после успешной отправки
    setFormData({
      callsign: '',
      name: '',
      phone: '',
      truck: '',
      trailer: '',
      vin: ''
    });
  };

  // Обработчик отмены - сбрасывает форму и закрывает модальное окно
  const handleCancelClick = () => {
    // Сбрасываем форму к начальным значениям
    setFormData({
      callsign: initialData?.callsign || '',
      name: initialData?.name || '',
      phone: initialData?.phone || '',
      truck: initialData?.truck || '',
      trailer: initialData?.trailer || '',
      vin: initialData?.vin || ''
    });
    // Вызываем callback для закрытия модального окна
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form className="create-driver-form" onSubmit={handleSubmit}>
      {/* Form fields with proper layout */}
      <div className="form-fields">
        {/* Row 1: Call sign, Driver name, Phone # */}
        <div className="form-row form-row-three">
          <div className="form-group">
            <Input
              label="Call sign"
              name="callsign"
              value={formData.callsign}
              onChange={handleChange}
              placeholder="/"
              required
            />
          </div>
          <div className="form-group">
            <Input
              label="Driver name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Dones"
              required
            />
          </div>
          <div className="form-group">
            <Input
              label="Phone #"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1"
            />
          </div>
        </div>

        {/* Row 2: Truck #, Trailer # */}
        <div className="form-row form-row-two">
          <div className="form-group">
            <Input
              label="Truck #"
              name="truck"
              value={formData.truck}
              onChange={handleChange}
              placeholder="###"
            />
          </div>
          <div className="form-group">
            <Input
              label="Trailer #"
              name="trailer"
              value={formData.trailer}
              onChange={handleChange}
              placeholder="###"
            />
          </div>
        </div>

        {/* Row 3: VIN # */}
        <div className="form-row form-row-one">
          <div className="form-group">
            <Input
              label="VIN #"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              placeholder="17 digit number"
              maxLength="17"
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <Button 
          variant="secondary" 
          type="button" 
          onClick={handleCancelClick}
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          type="submit"
        >
          {initialData ? 'Update Driver' : 'Save Driver'}
        </Button>
      </div>
    </form>
  );
}
