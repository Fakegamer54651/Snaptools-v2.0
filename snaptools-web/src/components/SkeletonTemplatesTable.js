import React from 'react';

const SkeletonTemplatesTable = ({ rowCount = 3 }) => {
  const skeletonRows = Array.from({ length: rowCount }, (_, index) => (
    <div key={index} className="skeleton-row" style={{ padding: '16px 20px' }}>
      {/* Template name */}
      <div className="skeleton skeleton-cell" style={{ width: '200px', height: '20px' }} />
      
      {/* Sender email */}
      <div className="skeleton skeleton-cell" style={{ width: '180px', height: '16px', marginTop: '8px' }} />
      
      {/* Subject with variable tokens */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
        <div className="skeleton skeleton-text" style={{ width: '80px' }} />
        <div className="skeleton skeleton-pill" style={{ width: '60px' }} />
        <div className="skeleton skeleton-text" style={{ width: '20px' }} />
        <div className="skeleton skeleton-pill" style={{ width: '50px' }} />
        <div className="skeleton skeleton-text" style={{ width: '100px' }} />
        <div className="skeleton skeleton-pill" style={{ width: '45px' }} />
      </div>
      
      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
        <div className="skeleton skeleton-cell" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
        <div className="skeleton skeleton-cell" style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
      </div>
    </div>
  ));

  return (
    <div className="skeleton-templates-table" style={{ 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      {skeletonRows}
    </div>
  );
};

export default SkeletonTemplatesTable;
