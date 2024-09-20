"use client"
import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { JsonForm } from '@/components/JsonForm'
import { RelationshipMap } from '@/components/RelationshipMap'
import { DialogAnalyzer } from '@/components/DialogAnalyzer'
import { UtteranceAnalyzer } from '@/components/UtteranceAnalyzer'
import { Navbar } from '@/components/Navbar'
import * as XLSX from 'xlsx';  // Import the xlsx library
import { Utterance, ToDoItem } from '../components/Types'

interface fieldConfig {
  fieldName: string;
  label: string;
  type: 'string' | 'boolean';
}

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState<string>('utterances');
  const [jsonArray, setJsonArray] = useState<any[]>([]);
  const [utteranceJsonArray, setUtteranceJsonArray] = useState<any[]>([]);
  const [dialogJsonArray, setDialogJsonArray] = useState<any[]>([]);
  const [serviceJsonArray, setServiceJsonArray] = useState<any[]>([]);
  const [toDoList, setToDoList] = useState<{ [key: string]: ToDoItem }>({}); // Store utterances by key
  const [originalXlsxData, setOriginalXlsxData] = useState<any[]>([]);
  const [keywordsByDialog, setKeywordsByDialog] = useState<{
    [key: string]: {
      keywords: string[],
      statuses: { [utterance: string]: string }
    }
  }>({});

  const utteranceConfig: fieldConfig[] = [
    { fieldName: 'utterance', label: 'Utterance', type: 'string' },
    { fieldName: 'dialogKey', label: 'Dialog Key', type: 'string' },
    { fieldName: 'isQuestion', label: 'Is a question', type: 'boolean' },
    { fieldName: 'isImperative', label: 'Is an imperative sentence', type: 'boolean' }
  ];

  const dialogConfig: fieldConfig[] = [
    { fieldName: 'dialogKey', label: 'Dialog Title', type: 'string' },
    { fieldName: 'description', label: 'Description', type: 'string' },
    { fieldName: 'serviceKey', label: 'Service', type: 'string' }
  ];

  const ServiceConfig: fieldConfig[] = [
    { fieldName: 'name', label: 'Title', type: 'string' },
    { fieldName: 'description', label: 'Description', type: 'string' },
    { fieldName: 'isTransactional', label: 'Transactional Service', type: 'boolean' },
    { fieldName: 'isAnalysisNeeded', label: 'Analyzed Result (operation needed)', type: 'boolean' },
    { fieldName: 'isInformational', label: 'Informational only', type: 'boolean' },
    { fieldName: 'isAuthRequired', label: 'Authentication required', type: 'boolean' },
    { fieldName: 'isAPICallNeeded', label: 'Needs BPD API call', type: 'boolean' },
    { fieldName: 'altService', label: 'Alternative Service', type: 'string' }
  ];

  const openTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleAddToJson = (newItem: any) => {
    setJsonArray((prevArray: any) => [...prevArray, newItem]);
  };

  const handleSaveAll = () => {
    // Create the combined data object
    const combinedData = {
      originalXlsxData,
      keywordsByDialog,
      toDoList,
    };

    // Convert the data to a JSON string
    const jsonData = JSON.stringify(combinedData, null, 2);

    // Prompt the user for a filename
    const filename = window.prompt('Enter a filename', 'data.cbot');

    if (filename) {
      // Ensure the filename ends with '.cbot'
      const fileExtension = '.cbot';
      const fullFilename = filename.endsWith(fileExtension)
        ? filename
        : filename + fileExtension;

      // Create a blob with the JSON data
      const blob = new Blob([jsonData], { type: 'application/json' });

      // Create an object URL for the blob
      const url = URL.createObjectURL(blob);

      // Create an anchor element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = fullFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Revoke the object URL
      URL.revokeObjectURL(url);
    }
  };

  const handleSaveJson = () => {
    const combinedData = {
      utterances: utteranceJsonArray,
      dialogs: dialogJsonArray,
      services: serviceJsonArray,
    };

    const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportToDoList = () => {
    const blob = new Blob([JSON.stringify(toDoList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'toDoList.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      const fileReader = new FileReader();

      fileReader.onload = (e) => {
        const content = e.target?.result;

        if (file.name.endsWith('.cbot')) {
          // Handle .cbot file
          try {
            const data = content ? JSON.parse(content.toString()) : null;
            if (data && typeof data === 'object') {
              setOriginalXlsxData(data.originalXlsxData || []);
              setKeywordsByDialog(data.keywordsByDialog || {});
              setToDoList(data.toDoList || {});

              // Process originalXlsxData to update other state variables
              if (data.originalXlsxData && data.originalXlsxData.length > 0) {
                const jsonData = data.originalXlsxData;

                const utterances: any[] = [];
                const dialogs: any[] = [];
                const services: any[] = [];

                jsonData.forEach((row: any) => {
                  // Extract data from columns and fill respective arrays
                  if (row.Utterance) {
                    utterances.push({
                      utterance: row.Utterance,
                      dialogKey: row.MlIntentName || '',
                    });
                  }

                  if (
                    row.MlIntentName &&
                    !dialogs.some((dialog) => dialog.dialogKey === row.MlIntentName)
                  ) {
                    dialogs.push({
                      dialogKey: row.MlIntentName,
                      description: '', // You can add logic to fill this if needed
                      serviceKey: row.MlDomainName || '',
                    });
                  }

                  if (
                    row.MlDomainName &&
                    !services.some((service) => service.name === row.MlDomainName)
                  ) {
                    services.push({
                      name: row.MlDomainName,
                      description: '', // You can add logic to fill this if needed
                      isTransactional: false,
                      isAnalysisNeeded: false,
                      isInformational: false,
                      isAuthRequired: false,
                      isAPICallNeeded: false,
                      altService: '',
                    });
                  }
                });

                setUtteranceJsonArray(utterances);
                setDialogJsonArray(dialogs);
                setServiceJsonArray(services);
              }
            }
          } catch (error) {
            console.error('Error parsing .cbot file:', error);
            alert(
              'Failed to parse the .cbot file. Please ensure it is correctly formatted.'
            );
          }
        }
        else {
          // Unrecognized file type
          alert('Unsupported file type.');
        }
      };

      fileReader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the file.');
      };

      // Decide how to read the file
      if (file.name.endsWith('.cbot') || file.type === 'application/json') {
        fileReader.readAsText(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel'
      ) {
        fileReader.readAsArrayBuffer(file);
      } else {
        alert('Unsupported file type.');
      }
    }
  };

  const handleExportModifiedXlsx = () => {
    // Create a copy of the original data
    let modifiedData = [...originalXlsxData];

    // Apply the toDoList actions
    Object.values(toDoList).forEach((item) => {
      const index = modifiedData.findIndex(u => u.Utterance === item.utterance);
      if (index !== -1) {
        if (item.action === 'remove') {
          // Remove the utterance
          modifiedData.splice(index, 1);
        } else if (item.action === 'edit') {
          // Update the utterance text
          modifiedData[index].Utterance = item.editedText || modifiedData[index].Utterance;
        } else if (item.action === 'move') {
          // Update the dialogKey (MlIntentName)
          modifiedData[index].MlIntentName = item.newDialogKey || modifiedData[index].MlIntentName;
        }
      }
    });

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(modifiedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write the workbook and trigger the download
    const wbout = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_data.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadDefaultData = () => {
    fetch('data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const utterances = data.utterances || [];
        const dialogs = data.dialogs || [];
        const services = data.services || [];

        setUtteranceJsonArray(utterances);
        setDialogJsonArray(dialogs);
        setServiceJsonArray(services);
      })
      .catch(error => {
        console.error('Error loading default data:', error);
      });
  };

  useEffect(() => {
    const updateJsonArrayFromLocalStorage = () => {
      switch (activeTab) {
        case 'utterances':
          setJsonArray(utteranceJsonArray);
          break;
        case 'dialogs':
          setJsonArray(dialogJsonArray);
          break;
        case 'Services':
          setJsonArray(serviceJsonArray);
          break;
        default:
          setJsonArray([]);
      }
    };

    updateJsonArrayFromLocalStorage();
    window.addEventListener('storage', updateJsonArrayFromLocalStorage);

    return () => {
      window.removeEventListener('storage', updateJsonArrayFromLocalStorage);
    };
  }, [activeTab, utteranceJsonArray, dialogJsonArray, serviceJsonArray]);

  return (
    <main>
      <Navbar
        saveJson={handleSaveJson}
        loadExample={handleLoadDefaultData}
        exportToDoList={handleExportToDoList}
        exportModifiedXlsx={handleExportModifiedXlsx}
        saveAll={handleSaveAll}
      />
      <div id="uploadContainer" className='menu-button'>
        <input type="file" accept=".json, .xlsx, .xls, .cbot" onChange={handleUploadJson} />
      </div>

      <div className="tab">
        <button className={`tablinks ${activeTab === 'utterances' ? 'active' : ''}`} onClick={() => openTab('utterances')}>Utterance Creator</button>
        <button className={`tablinks ${activeTab === 'dialogs' ? 'active' : ''}`} onClick={() => openTab('dialogs')}>Dialog Creator</button>
        <button className={`tablinks ${activeTab === 'services' ? 'active' : ''}`} onClick={() => openTab('services')}>Service Creator</button>
        <button className={`tablinks ${activeTab === 'relationshipmap' ? 'active' : ''}`} onClick={() => openTab('relationshipmap')}>Relationship Map</button>
        <button className={`tablinks ${activeTab === 'dialogAnalysis' ? 'active' : ''}`} onClick={() => openTab('dialogAnalysis')}>Dialog Analysis</button>
        <button className={`tablinks ${activeTab === 'utteranceAnalysis' ? 'active' : ''}`} onClick={() => openTab('utteranceAnalysis')}>Utterance Analysis</button>
      </div>

      <div className={activeTab === 'utterances' ? '' : 'hidden'} >
        <JsonForm objectType={'utterance'} fieldConfig={utteranceConfig} jsonArray={utteranceJsonArray} setJsonArray={setUtteranceJsonArray} handleAddToJson={handleAddToJson} handleSaveJson={handleSaveJson} />
      </div>

      <div className={activeTab === 'dialogs' ? '' : 'hidden'} >
        <JsonForm objectType={'dialog'} fieldConfig={dialogConfig} jsonArray={dialogJsonArray} setJsonArray={setDialogJsonArray} handleAddToJson={handleAddToJson} handleSaveJson={handleSaveJson} />
      </div>

      <div className={activeTab === 'services' ? '' : 'hidden'} >
        <JsonForm objectType={'service'} fieldConfig={ServiceConfig} jsonArray={serviceJsonArray} setJsonArray={setServiceJsonArray} handleAddToJson={handleAddToJson} handleSaveJson={handleSaveJson} />
      </div>

      <div className={activeTab === 'relationshipmap' ? 'diagram-container' : 'hidden'} >
        <RelationshipMap utterances={utteranceJsonArray} dialogs={dialogJsonArray} services={serviceJsonArray} />
      </div>

      <div className={activeTab === 'dialogAnalysis' ? '' : 'hidden'} >
        <DialogAnalyzer utterances={utteranceJsonArray} dialogs={dialogJsonArray} services={serviceJsonArray} />
      </div>

      <div className={activeTab === 'utteranceAnalysis' ? '' : 'hidden'}>
        <UtteranceAnalyzer
          utterances={utteranceJsonArray}
          dialogs={dialogJsonArray}
          toDoList={toDoList}
          setToDoList={setToDoList}
          keywordsByDialog={keywordsByDialog}
          setKeywordsByDialog={setKeywordsByDialog}
        />
      </div>

    </main>
  );
};

export default Home;
