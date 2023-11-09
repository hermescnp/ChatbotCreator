import React from 'react';

interface JsonItem {
  [key: string]: any; // Changed to a more generic type to accommodate different fields
}

interface fieldConfig {
  fieldName: string;
  label: string;
  type: 'string' | 'boolean';
}

interface JsonDisplayProps {
  jsonArray: JsonItem[];
  fieldConfig: fieldConfig[]; // Pass the fieldConfig to JsonDisplay
  onDeleteItem: (index: number) => void;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ jsonArray, fieldConfig, onDeleteItem }) => {

  const renderCell = (item: JsonItem, fieldName: string, type: 'string' | 'boolean') => {
    return type === 'boolean' ? (item[fieldName] ? 'Yes' : 'No') : item[fieldName];
  };

  return (
    <div id="jsonDisplay">
      <table border={1}>
        <thead>
          <tr>
            {fieldConfig.map(field => (
              <th key={field.fieldName}>{field.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Use slice to copy the array before reversing to avoid mutating the prop */}
          {jsonArray.slice().reverse().map((item, index) => {
            // Calculate the original index based on the reversed position
            const originalIndex = jsonArray.length - 1 - index;
            return (
              <tr key={originalIndex}>
                {fieldConfig.map(field => (
                  <td key={field.fieldName}>{renderCell(item, field.fieldName, field.type)}</td>
                ))}
                <td>
                  {/* Use originalIndex to ensure the correct item is deleted */}
                  <button className='delete-button' onClick={() => onDeleteItem(originalIndex)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};



