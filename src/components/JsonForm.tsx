import React, { useState, useEffect } from 'react'
import { JsonDisplay } from './JsonDisplay'
import ConfirmationModal from '@/components/ConfirmationModal'

// Define a type for the field configuration
interface fieldConfig {
  fieldName: string;
  label: string;
  type: 'string' | 'boolean';
}

// Extend the props to include a field configuration array and the global JSON state and setter
interface JsonFormProps {
  objectType: string;
  fieldConfig: fieldConfig[];
  jsonArray: any[];
  setJsonArray: React.Dispatch<React.SetStateAction<any[]>>;
  handleAddToJson: (newObject: any) => void;
  handleSaveJson: (jsonArray: any[]) => void;
}

export const JsonForm: React.FC<JsonFormProps> = ({
  objectType,
  fieldConfig,
  jsonArray,
  setJsonArray,
  handleAddToJson,
  handleSaveJson
}) => {
  // Initialize formData with all fields from fieldConfig
  const initialFormData = fieldConfig.reduce((acc, field) => ({
    ...acc,
    [field.fieldName]: field.type === 'boolean' ? false : ''
  }), {});

  // Initialize pinnedFields with all fields set to false
  const initialPinnedFields = fieldConfig.reduce((acc, field) => ({
    ...acc,
    [field.fieldName]: false
  }), {});

  const [formData, setFormData] = useState<{ [key: string]: any }>(initialFormData);
  const [pinnedFields, setPinnedFields] = useState<{ [key: string]: boolean }>(initialPinnedFields);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  useEffect(() => {
    // Only run this effect on the initial mount or when fieldConfig changes
    setFormData(initialFormData);
    setPinnedFields(initialPinnedFields);
  }, []);

  useEffect(() => {
    const initialFormData: { [key: string]: any } = {};
    const initialPinnedFields: { [key: string]: boolean } = {};

    // Set an initial value for each field to avoid undefined values
    fieldConfig.forEach(field => {
      initialFormData[field.fieldName] = field.type === 'boolean' ? false : '';
      initialPinnedFields[field.fieldName] = false;
    });
  }, [fieldConfig]);

  const openDeleteConfirmation = (index: number) => {
    setItemToDelete(index);
    setIsModalOpen(true); // Open the modal
  };

  const closeDeleteConfirmation = () => {
    setIsModalOpen(false); // Close the modal
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      deleteItem(itemToDelete);
    }
    closeDeleteConfirmation(); // Close the modal
  };

  const addToJson = () => {
    // Include the objectType in the newObject before adding it to the jsonArray
    const newObject = { ...formData, objectType };
    setJsonArray(prevArray => [...prevArray, newObject]); // Update the global state
    handleAddToJson(newObject);

    // Only reset the fields that are not pinned
    setFormData(prevFormData => {
      const resetFormData = { ...prevFormData };
      Object.keys(resetFormData).forEach(fieldName => {
        if (!pinnedFields[fieldName]) {
          // Reset the field if it's not pinned
          resetFormData[fieldName] = fieldConfig.find(field => field.fieldName === fieldName)?.type === 'boolean' ? false : '';
        }
      });
      return resetFormData;
    });
  };

  const deleteItem = (index: number) => {
    setJsonArray(prevArray => prevArray.filter((_, i) => i !== index)); // Update the global state
  };

  return (
    <div id="Prompts" className="tabcontent">
      <div className='form-header'>
        <h3>{`Details of ${objectType}`}</h3>
        <h3>Pin</h3>
      </div>
      {fieldConfig.map(field => (
        <div key={field.fieldName} className="field-container">
          <div className='object-details'>
            <label htmlFor={`${field.fieldName}Input`}>{field.label}:</label>
            {field.type === 'string' ? (
              <input
                type="text"
                id={`${field.fieldName}Input`}
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={formData[field.fieldName] || ''} // Ensuring the value is never undefined
                onChange={(e) => setFormData((prevFormData) => ({
                  ...prevFormData,
                  [field.fieldName]: e.target.value
                }))}
              />

            ) : (
              <input
                type="checkbox"
                id={`${field.fieldName}Input`}
                checked={formData[field.fieldName] || false}
                onChange={(e) => setFormData((prevFormData) => ({
                  ...prevFormData,
                  [field.fieldName]: e.target.checked
                }))}
              />
            )}
          </div>
          <input
            type="checkbox"
            id={`${field.fieldName}Pin`}
            checked={pinnedFields[field.fieldName]}
            onChange={(e) => setPinnedFields((prevPinnedFields) => ({
              ...prevPinnedFields,
              [field.fieldName]: e.target.checked
            }))}
          />
        </div>
      ))}
      <div className='edit-tools-container'>
        <button id="addToJsonBtn" className='add-button' onClick={addToJson}>Add to List</button>
      </div>
      <JsonDisplay jsonArray={jsonArray} fieldConfig={fieldConfig} onDeleteItem={openDeleteConfirmation} />
      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={confirmDelete}
        onCancel={closeDeleteConfirmation}
      />
    </div>
  );
};
