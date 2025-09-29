// Импорт необходимых библиотек и ресурсов
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import TemplatesIcon from '../assets/icons/templates.png';
import DriversIcon from '../assets/icons/drivers.png';
import Logo from '../assets/logo/snaptools-logo.svg';
import { authStore } from '../store/auth.store';
import './styles/Navbar.css';

// Компонент боковой навигационной панели
export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Закрыть dropdown при клике вне его
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Функции для обработки действий меню
  const handleLogout = () => {
    console.log('Logout clicked');
    authStore.logout();
    setIsDropdownOpen(false);
    navigate('/signin');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <nav className="navbar">
      {/* Верхняя секция навбара с логотипом и навигационнnыми ссылками */}
      <div className="navbar-top">
        {/* Контейнер для логотипа */}
        <div className="navbar-logo-container">
          <img 
            src={Logo} 
            alt="SnapTools" 
            className="navbar-logo"
          />
        </div>
        
        {/* Навигационные ссылки */}
        <div className="navbar-links">
          <NavLink 
            to="/templates" 
            className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}
          >
            <img src={TemplatesIcon} alt="" className="nav__icon" />
            Templates
          </NavLink>
          <NavLink 
            to="/drivers" 
            className={({ isActive }) => isActive ? 'nav__link active' : 'nav__link'}
          >
            <img src={DriversIcon} alt="" className="nav__icon" />
            Drivers
          </NavLink>
        </div>
      </div>

      {/* Нижняя секция навбара с баннером, аккаунтом и футером */}
      <div className="navbar-bottom">
        {/* Баннер с градиентным фоном для продвижения приложения */}
        <div className="navbar-banner">
          {/* Градиентный фон из трех размытых кругов */}
          <div className="banner-gradient">
            <div className="gradient-circle gradient-circle-1"></div>
            <div className="gradient-circle gradient-circle-2"></div>
            <div className="gradient-circle gradient-circle-3"></div>
          </div>
          {/* Текстовый контент баннера */}
          <div className="banner-content">
            <div className="navbar-banner-title">Like snaptools?</div>
            <div className="navbar-banner-subtitle">share it with your fellow dispatchers.</div>
          </div>
          {/* Кнопка для действия */}
          <button className="banner-button">Share</button>
        </div>
        
        {/* Секция аккаунта пользователя */}
        <div className="navbar-account" ref={dropdownRef}>
          <div className="profile-trigger" onClick={toggleDropdown}>
            <div className="profile-picture">R</div>
            <span className="profile-name">Rick Astley</span>
            <span className={`material-symbols-rounded nav__chevron ${isDropdownOpen ? 'rotated' : ''}`}>
              expand_more
            </span>
          </div>
          
          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="profile-dropdown">
              <a 
                href="https://t.me/AsilbekKhamidullayev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="dropdown-item dropdown-link"
                onClick={() => setIsDropdownOpen(false)}
              >
                <span className="material-symbols-rounded dropdown-icon">headset_mic</span>
                <span>Support chat</span>
              </a>
              <div className="dropdown-item" onClick={handleLogout}>
                <span className="material-symbols-rounded dropdown-icon">logout</span>
                <span>Log out</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Футер с информацией о версии */}
        <div className="navbar-footer">
          <div className="version">© 2025 SnapTools v2.0.0</div>
        </div>
      </div>
    </nav>
  );
}
