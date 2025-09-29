import React from 'react';
import Chip from './Chip';

const ChipContainer = ({ chips, onDismiss }) => {
  return (
    <div className="chip-container">
      {chips.map((chip) => (
        <Chip
          key={chip.id}
          type={chip.type}
          message={chip.message}
          onDismiss={() => onDismiss(chip.id)}
          duration={chip.duration || 3000}
        />
      ))}
    </div>
  );
};

export default ChipContainer;
