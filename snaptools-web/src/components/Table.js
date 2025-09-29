import React from 'react';
import './styles/table.css';

export default function Table({ columns, rows }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="table-header-cell">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body">
          {rows.map((row) => (
            <tr key={row.id} className="table-row">
              {columns.map((column, index) => {
                const cellValue = row[column.toLowerCase()];
                return (
                  <td key={index} className="table-cell">
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
