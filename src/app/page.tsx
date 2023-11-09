"use client"
import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { JsonForm } from '@/components/JsonForm'

interface fieldConfig {
  fieldName: string;
  label: string;
  type: 'string' | 'boolean';
}

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState<string>('utterances');
  const [jsonArray, setJsonArray] = useState<any[]>([]);

  const localStorageKeys: any = {
    utterances: 'utterancesData',
    dialogs: 'dialogsData',
    services: 'servicesData',
  };

  const [utteranceJsonArray, setUtteranceJsonArray] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem(localStorageKeys.utterances) || '[]');
  });
  const [dialogJsonArray, setDialogJsonArray] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem(localStorageKeys.dialogs) || '[]');
  });
  const [serviceJsonArray, setServiceJsonArray] = useState<any[]>(() => {
    return JSON.parse(localStorage.getItem(localStorageKeys.services) || '[]');
  });

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
    { fieldName: 'isInProgress', label: 'Informational only', type: 'boolean' },
    { fieldName: 'isAuthRequired', label: 'Authentication required', type: 'boolean' },
    { fieldName: 'isAPICallNeeded', label: 'Needs BPD API call', type: 'boolean' },
    { fieldName: 'altService', label: 'Alternative Service', type: 'string' }
  ];

  const openTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleAddToJson = (newItem: any) => {
    setJsonArray(prevArray => [...prevArray, newItem]);
  };

  const handleSaveJson = () => {
    // Combine all arrays into one object with separate keys for each category
    const combinedData = {
      utterances: utteranceJsonArray,
      dialogs: dialogJsonArray,
      services: serviceJsonArray,
    };
  
    // Create a blob from the combined data
    const blob = new Blob([JSON.stringify(combinedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    // Create a temporary anchor tag to initiate download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json'; // You can name the download file as per your preference
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
        try {
          const data = content ? JSON.parse(content.toString()) : null;
          if (data && Array.isArray(data)) {
            const utterances = data.filter(item => item.objectType === 'utterance');
            const dialogs = data.filter(item => item.objectType === 'dialog');
            const services = data.filter(item => item.objectType === 'service');
  
            setUtteranceJsonArray(utterances);
            setDialogJsonArray(dialogs);
            setServiceJsonArray(services);
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };
  
      fileReader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
  
      fileReader.readAsText(file);
    }
  };  

  useEffect(() => {
    localStorage.setItem(localStorageKeys.utterances, JSON.stringify(utteranceJsonArray));
  }, [utteranceJsonArray]);

  useEffect(() => {
    localStorage.setItem(localStorageKeys.dialogs, JSON.stringify(dialogJsonArray));
  }, [dialogJsonArray]);

  useEffect(() => {
    localStorage.setItem(localStorageKeys.services, JSON.stringify(serviceJsonArray));
  }, [serviceJsonArray]);

  useEffect(() => {
    // This function updates the jsonArray depending on the active tab
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

    // Call the function to update the jsonArray when the component mounts
    updateJsonArrayFromLocalStorage();

    // Also set up a listener for when the activeTab changes
    // so that the jsonArray gets updated accordingly
    window.addEventListener('storage', updateJsonArrayFromLocalStorage);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', updateJsonArrayFromLocalStorage);
    };
  }, [activeTab, utteranceJsonArray, dialogJsonArray, serviceJsonArray]);

  return (
    <main>
      <div id='navbar'>
        <h2>Chatbot Creator Tool</h2>
        <div className='actions-container'>
          <button id="saveJsonBtn" className='menu-button' onClick={handleSaveJson}>Save JSON File</button>
          <div id="uploadContainer" className='menu-button' >
            <input type="file" onChange={handleUploadJson} />
          </div>
        </div>
      </div>
      <div className="tab">
        <button className={`tablinks ${activeTab === 'utterances' ? 'active' : ''}`} onClick={() => openTab('utterances')}>Utterance Creator</button>
        <button className={`tablinks ${activeTab === 'dialogs' ? 'active' : ''}`} onClick={() => openTab('dialogs')}>Dialog Creator</button>
        <button className={`tablinks ${activeTab === 'services' ? 'active' : ''}`} onClick={() => openTab('services')}>Service Creator</button>
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
    </main>
  );
};

export default Home;
