// Импорт необходимых библиотек
import React from 'react';
import './styles/button.css';

// Универсальный компонент кнопки с поддержкой иконок и различных состояний
export default function Button({
  variant = 'primary',      // Вариант кнопки: 'primary' | 'secondary'
  state = 'default',        // Состояние: 'default' | 'hover' | 'pressed' | 'disabled'
  leftIcon,                 // Иконка слева (название Material Symbols)
  rightIcon,                // Иконка справа (название Material Symbols)
  children,                 // Текст кнопки
  onClick,                  // Обработчик клика
  disabled,                 // Отключена ли кнопка
  type = 'button',          // Тип кнопки (button, submit, reset)
  className = '',           // Дополнительные CSS классы
  ...props                  // Остальные пропсы передаются в button элемент
}) {
  // Определяем, отключена ли кнопка
  const isDisabled = disabled || state === 'disabled';
  
  // Формируем список CSS классов для кнопки
  const buttonClasses = [
    'btn',                                    // Базовый класс
    `btn--${variant}`,                        // Класс варианта (primary/secondary)
    `btn--${state}`,                          // Класс состояния
    leftIcon && 'btn--has-left-icon',         // Класс для кнопки с левой иконкой
    rightIcon && 'btn--has-right-icon',       // Класс для кнопки с правой иконкой
    className                                 // Дополнительные классы
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {/* Левая иконка (если указана) */}
      {leftIcon && (
        <span className="btn__icon btn__icon--left material-symbols-rounded">
          {leftIcon}
        </span>
      )}
      
      {/* Текст кнопки */}
      {children && (
        <span className="btn__text">
          {children}
        </span>
      )}
      
      {/* Правая иконка (если указана) */}
      {rightIcon && (
        <span className="btn__icon btn__icon--right material-symbols-rounded">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
