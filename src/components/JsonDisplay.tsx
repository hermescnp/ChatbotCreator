import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';

interface JsonItem {
  [key: string]: any;
}

interface FieldConfig {
  fieldName: string;
  label: string;
  type: 'string' | 'boolean';
}

interface ToDoItem {
  utterance: JsonItem;
  action: 'remove' | 'edit' | 'move' | null;
  newDialogKey?: string;
  editedText?: string;
}

interface JsonDisplayProps {
  jsonArray: JsonItem[];
  fieldConfig: FieldConfig[];
  onDeleteItem?: (index: number, dialogKey: string) => void | null;
  onEditItem?: (index: number, dialogKey: string) => void | null;
  onMoveItem?: (index: number, dialogKey: string) => void | null;
  parentName: string;
  toDoList?: { [key: string]: ToDoItem } | null;
}

const getColorForPercentage = (percentage: number): string => {
  if (percentage === 0) {
    // Red for 0%
    return 'rgb(255, 0, 0)';
  }

  // At 1%, yellow (255, 255, 0)
  // At 100%, green (0, 255, 0)
  const red = Math.round(155 - ((percentage * 155) / 100)); // Red decreases from 255 (yellow) to 0 (green)
  const green = 155; // Green stays constant at 255
  const blue = 0; // No blue component

  return `rgb(${red}, ${green}, ${blue})`;
};

export const JsonDisplay: React.FC<JsonDisplayProps> = ({
  jsonArray,
  fieldConfig,
  onDeleteItem,
  onEditItem,
  onMoveItem,
  parentName,
  toDoList,
}) => {
  // Helper function to apply different styles and handle actions
  const getItemStyle = (utterance: string) => {
    const toDoItem = toDoList?.[utterance];
    if (toDoItem?.action === 'remove') {
      return { textDecoration: 'line-through', color: '#bbb' };
    } else if (toDoItem?.action === 'edit') {
      return { color: '#3498db' };
    } else if (toDoItem?.action === 'move') {
      return { color: '#2ecc71' };
    }
    return {};
  };

  const renderActionText = (utterance: string) => {
    const toDoItem = toDoList?.[utterance];
    if (toDoItem?.action === 'edit' && toDoItem?.editedText) {
      return (
        <span>
          {' '}
          | edited to --&gt; <span style={{ fontWeight: 'bold' }}>{toDoItem.editedText}</span>
        </span>
      );
    } else if (toDoItem?.action === 'move' && toDoItem?.newDialogKey) {
      return (
        <span>
          {' '}
          | moved to --&gt; <span style={{ fontWeight: 'bold' }}>{toDoItem.newDialogKey}</span>
        </span>
      );
    }
    return null;
  };

  // Helper function to check if the action button should be active
  const isActive = (utterance: string, action: 'remove' | 'edit' | 'move') => {
    return toDoList?.[utterance]?.action === action;
  };

  const renderCell = (item: JsonItem, fieldName: string, type: 'string' | 'boolean') => {
    const utteranceKey = item['utterance'];
    const toDoItem = toDoList?.[utteranceKey]; // Get the related to-do item
    const style = getItemStyle(utteranceKey); // Apply styles based on the utterance
  
    if (type === 'boolean') {
      return item[fieldName] ? 'Yes' : 'No';
    } else if (fieldName === 'status') {
      if (!item[fieldName]) {
        return <span style={{ color: '#ccc' }}>Pending</span>; // Return "Pending" when no status
      }
  
      if (toDoItem) {
        // Check if there's a corresponding action in the toDoList for this item
        switch (toDoItem.action) {
          case 'edit':
            return <span style={{ color: '#3498db' }}>Edited</span>;
          case 'move':
            return <span style={{ color: '#2ecc71' }}>Moved</span>;
          case 'remove':
            return <span style={{ color: '#bbb' }}>Deleted</span>;
          default:
            break;
        }
      }
      
      // If no action is applied, render the percentage as usual
      const percentage = parseInt(item[fieldName], 10);
      const color = getColorForPercentage(percentage);
      return <span style={{ color }}>{item[fieldName]}</span>; // Use the percentage color logic
    } else if (fieldName === 'utterance') {
      return (
        <span style={style}>
          {item[fieldName]}
          {renderActionText(utteranceKey)} {/* Only render the edited or moved text for utterance */}
        </span>
      );
    } else {
      return <span style={style}>{item[fieldName]}</span>; // For other fields, just render the field value
    }
  };  

  return (
    <div id="jsonDisplay">
      {parentName && (
        <div>
          <strong>Parent Name:</strong> {parentName}
        </div>
      )}
      <div>
        <strong>Number of items:</strong> {jsonArray.length}
      </div>
      <table border={1}>
        <thead>
          <tr>
            {fieldConfig.map((field) => (
              <th key={field.fieldName}>{field.label}</th>
            ))}
            {(onDeleteItem || onEditItem || onMoveItem) && <th className="actions-column">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {jsonArray.slice().reverse().map((item, index) => {
            const originalIndex = jsonArray.length - 1 - index;
            const utteranceKey = item['utterance'];

            return (
              <tr key={originalIndex}>
                {fieldConfig.map((field) => (
                  <td key={field.fieldName}>{renderCell(item, field.fieldName, field.type)}</td>
                ))}
                <td className="actions-column">
                  {onEditItem && (
                    <button
                      className={`action-button edit-button ${isActive(utteranceKey, 'edit') ? 'active' : ''}`}
                      onClick={() => onEditItem(originalIndex, parentName)}
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} /> {/* Edit icon */}
                    </button>
                  )}
                  {onMoveItem && (
                    <button
                      className={`action-button move-button ${isActive(utteranceKey, 'move') ? 'active' : ''}`}
                      onClick={() => onMoveItem(originalIndex, parentName)}
                      title="Move"
                    >
                      <FontAwesomeIcon icon={faArrowsAlt} /> {/* Move icon */}
                    </button>
                  )}
                  {onDeleteItem && (
                    <button
                      className={`action-button delete-button ${isActive(utteranceKey, 'remove') ? 'active' : ''}`}
                      onClick={() => onDeleteItem(originalIndex, parentName)}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} /> {/* Trash icon */}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
