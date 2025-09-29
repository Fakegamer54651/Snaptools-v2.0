import React from 'react';
import './styles/input.css';

const Input = ({
  label,
  placeholder = '',
  value = '',
  onChange,
  type = 'text',
  withToolbar = false,
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const renderInput = () => {
    if (type === 'textarea') {
      const textareaClassName = `input-field textarea${withToolbar ? ' with-toolbar' : ''}`;
      return (
        <textarea
          className={textareaClassName}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rows={6}
          {...props}
        />
      );
    }

    return (
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  };

  const renderToolbar = () => {
    if (withToolbar && type === 'textarea') {
      return (
        <div className="input-toolbar">
          {/* Toolbar placeholder - will be populated with formatting buttons later */}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="input-container">
      {label && (
        <label className="input-label">
          {label}
        </label>
      )}
      {renderInput()}
      {renderToolbar()}
    </div>
  );
};

export default Input;
