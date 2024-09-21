import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit, faArrowsAlt, faFlag } from '@fortawesome/free-solid-svg-icons'
import { ToDoItem } from './Types'

interface JsonItem {
  [key: string]: any;
}

interface FieldConfig {
  fieldName: string;
  label: string;
  type: 'string' | 'boolean';
}

interface JsonDisplayProps {
  jsonArray: JsonItem[];
  fieldConfig: FieldConfig[];
  onDeleteItem?: (index: number, dialogKey: string) => void | null;
  onEditItem?: (index: number, dialogKey: string) => void | null;
  onMoveItem?: (index: number, dialogKey: string) => void | null;
  onFlagItem?: (index: number, dialogKey: string) => void | null;
  dialogKey?: string;
  parentName: string;
  toDoList?: { [key: string]: ToDoItem } | null;
}

const getColorForPercentage = (percentage: number): string => {
  if (percentage === 0) {
    return 'rgb(255, 0, 0)';
  }

  const red = Math.round(155 - ((percentage * 155) / 100));
  const green = 155;
  const blue = 0;

  return `rgb(${red}, ${green}, ${blue})`;
};

export const JsonDisplay: React.FC<JsonDisplayProps> = ({
  jsonArray,
  fieldConfig,
  onDeleteItem,
  onEditItem,
  onMoveItem,
  onFlagItem,
  parentName,
  toDoList,
}) => {
  const isFlagged = (utterance: string, dialogKey: string): boolean => {
    const toDoItem = toDoList?.[utterance];
    return toDoItem?.flaggedFrom?.includes(dialogKey) || false;
  };

  const getItemStyle = (utterance: string, dialogKey: string) => {
    const toDoItem = toDoList?.[utterance];

    if (toDoItem?.action === 'remove') {
      return { textDecoration: 'line-through', color: '#bbb' };
    } else if (toDoItem?.action === 'edit') {
      return { color: '#3498db' };
    } else if (toDoItem?.action === 'move') {
      return { color: '#2ecc71' };
    } else if (isFlagged(utterance, dialogKey)) {
      // Prioritize flag styling, but ensure other actions take precedence
      return { backgroundColor: '#fff2cc' };
    }

    return {};
  };

  const renderActionText = (utterance: string) => {
    const toDoItem = toDoList?.[utterance];

    if (toDoItem?.action === 'edit' && toDoItem?.editedText) {
      return (
        <span>
          <span style={{ color: '#3498db' }}>
            {' '}
            | edited to --&gt;
          </span>
          <span style={{ fontWeight: 'bold', color: 'black' }}>{' ' + toDoItem.editedText}</span>
        </span>
      );
    } else if (toDoItem?.action === 'move' && toDoItem?.newDialogKey) {
      return (
        <span style={{ color: '#2ecc71' }}>
          {' '}
          | moved to --&gt; <span style={{ fontWeight: 'bold' }}>{toDoItem.newDialogKey}</span>
        </span>
      );
    } else if (toDoItem?.action === 'flag' && toDoItem?.flaggedFrom && toDoItem.flaggedFrom.length > 0) {
      return (
        <span style={{ color: 'orange' }}>
          {' '}
          | flagged from --&gt;{' '}
          <span style={{ fontWeight: 'bold' }}>{toDoItem.flaggedFrom.join(', ')}</span>
        </span>
      );
    }
    return null;
  };

  const isActive = (utterance: string, action: 'remove' | 'edit' | 'move' | 'flag') => {
    if (action === 'flag') {
      return isFlagged(utterance, parentName);
    }
    return toDoList?.[utterance]?.action === action;
  };

  const renderCell = (item: JsonItem, fieldName: string, type: 'string' | 'boolean') => {
    const utteranceKey = item['utterance'];
    const style = getItemStyle(utteranceKey, parentName);

    if (type === 'boolean') {
      return item[fieldName] ? 'Yes' : 'No';
    } else if (fieldName === 'status') {
      if (!item[fieldName]) {
        return <span style={{ color: '#ccc' }}>Pending</span>;
      }

      const toDoItem = toDoList?.[utteranceKey];
      if (toDoItem) {
        if (toDoItem.flaggedFrom?.includes(parentName)) {
          return <span style={{ color: 'orange' }}>Flagged</span>;
        }
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

      const percentage = parseInt(item[fieldName], 10);
      const color = getColorForPercentage(percentage);
      return <span style={{ color }}>{item[fieldName]}</span>;
    } else if (fieldName === 'utterance') {
      return (
        <span style={style}>
          {item[fieldName]}
          {renderActionText(utteranceKey)}
        </span>
      );
    } else {
      return <span style={style}>{item[fieldName]}</span>;
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
            {(onDeleteItem || onEditItem || onMoveItem || onFlagItem) && (
              <th className="actions-column">Actions</th>
            )}
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
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  )}
                  {onMoveItem && (
                    <button
                      className={`action-button move-button ${isActive(utteranceKey, 'move') ? 'active' : ''}`}
                      onClick={() => onMoveItem(originalIndex, parentName)}
                      title="Move"
                    >
                      <FontAwesomeIcon icon={faArrowsAlt} />
                    </button>
                  )}
                  {onDeleteItem && (
                    <button
                      className={`action-button delete-button ${isActive(utteranceKey, 'remove') ? 'active' : ''}`}
                      onClick={() => {
                        // Trigger remove action and clear the flag if necessary
                        if (isFlagged(utteranceKey, parentName)) {
                          // Optionally handle the flag removal logic before calling onDeleteItem
                          onFlagItem?.(originalIndex, parentName); // Unflag the item first if it's flagged
                        }
                        onDeleteItem(originalIndex, parentName);
                      }}
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  )}
                  {onFlagItem && (
                    <button
                      className={`action-button flag-button ${isFlagged(utteranceKey, parentName) ? 'active' : ''}`}
                      onClick={() => {
                        if (isFlagged(utteranceKey, parentName)) {
                          // Unflag if it's currently flagged
                          onFlagItem(originalIndex, parentName);
                        } else if (toDoList?.[utteranceKey]?.action !== 'remove') {
                          // Only allow flagging if it's not marked for removal
                          onFlagItem(originalIndex, parentName);
                        }
                      }}
                      title={isFlagged(utteranceKey, parentName) ? 'Unflag' : 'Flag'}
                    >
                      <FontAwesomeIcon icon={faFlag} />
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
