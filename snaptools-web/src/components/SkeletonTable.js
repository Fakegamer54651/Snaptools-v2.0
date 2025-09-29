import React from 'react';

const SkeletonTable = ({ columns, rowCount = 5 }) => {
  // Define column widths based on typical content
  const getColumnWidth = (column) => {
    switch (column.toLowerCase()) {
      case 'call sign': return '100px';
      case 'driver name': return '150px';
      case 'phone #': return '130px';
      case 'truck #': return '80px';
      case 'trailer #': return '80px';
      case 'vin #': return '180px';
      case 'actions': return '80px';
      default: return '120px';
    }
  };

  const skeletonRows = Array.from({ length: rowCount }, (_, index) => (
    <div key={index} className="skeleton-row">
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="skeleton skeleton-cell"
          style={{ 
            width: getColumnWidth(column),
            minWidth: getColumnWidth(column)
          }}
        />
      ))}
    </div>
  ));

  return (
    <div className="skeleton-table">
      {/* Table header skeleton */}
      <div 
        className="skeleton-row" 
        style={{ 
          borderBottom: '2px solid #e5e7eb', 
          backgroundColor: '#f9fafb',
          fontWeight: '600'
        }}
      >
        {columns.map((column, index) => (
          <div
            key={index}
            className="skeleton skeleton-cell"
            style={{ 
              width: getColumnWidth(column),
              minWidth: getColumnWidth(column),
              height: '18px'
            }}
          />
        ))}
      </div>
      
      {/* Table body skeleton rows */}
      {skeletonRows}
    </div>
  );
};

export default SkeletonTable;
