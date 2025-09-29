import React, { useState } from 'react';
import DriverModal from './DriverModal';
import Button from './Button';

const DriverModalExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveDriver = (driverData) => {
    console.log('Saved driver:', driverData);
    // Here you would typically send the data to your API
    alert(`Driver saved: ${driverData.name} (${driverData.callsign})`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Driver Modal Example</h1>
      <p>Click the button below to test the new DriverModal component:</p>
      
      <Button variant="primary" onClick={handleOpenModal}>
        Open Driver Modal
      </Button>

      <DriverModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveDriver}
      />
    </div>
  );
};

export default DriverModalExample;
