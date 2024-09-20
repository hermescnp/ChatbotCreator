import React, { useState, useRef, useEffect } from 'react'
import { JsonDisplay } from './JsonDisplay'
import { getUtteranceStatus, getNonSelectedDialogsStatus } from './AnalyzerUtils'
import AnalysisModal from './AnalysisModal'
import { Utterance, ToDoItem } from './Types'

interface DialogAnalyzerProps {
  utterances: Utterance[];
  dialogs: any[];
  toDoList: { [key: string]: ToDoItem };
  setToDoList: React.Dispatch<React.SetStateAction<{ [key: string]: ToDoItem }>>;
  keywordsByDialog: { [key: string]: { keywords: string[], statuses: { [utterance: string]: string } } };
  setKeywordsByDialog: React.Dispatch<React.SetStateAction<{ [key: string]: { keywords: string[], statuses: { [utterance: string]: string } } }>>;
}


export const UtteranceAnalyzer: React.FC<DialogAnalyzerProps> = ({ utterances, dialogs, toDoList, setToDoList, keywordsByDialog, setKeywordsByDialog }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDialog, setSelectedDialog] = useState<string>('');
  const [newUtteranceText, setNewKeyWordText] = useState<string>('');
  const [modalData, setModalData] = useState<{ dialogName: string; keywords: string[] }>({
    dialogName: '',
    keywords: [],
  });
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  const [currentStatuses, setCurrentStatuses] = useState<{ [utterance: string]: string }>({});
  const [analysisResults, setAnalysisResults] = useState<any>({});
  const [searchInput, setSearchInput] = useState<string>(''); // State for search input
  const [showDropdown, setShowDropdown] = useState<boolean>(false); // State to control dropdown visibility
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for dropdown container

  const [transformedUtterances, setTransformedUtterances] = useState<Utterance[]>([]); // State for utterances with status

  useEffect(() => {
    // Update transformedUtterances when selectedDialog changes
    const filteredUtterances = utterances.filter(
      (utterance) => utterance.dialogKey === selectedDialog
    );
    setTransformedUtterances(
      filteredUtterances.map((utterance) => ({
        ...utterance,
        status: currentStatuses[utterance.utterance] || '', // Load status from currentStatuses
      }))
    );
  }, [selectedDialog, utterances, currentStatuses]);

  const handleDialogSelect = (dialogKey: string) => {
    setSelectedDialog(dialogKey); // Update selected dialog state
    setSearchInput(dialogKey); // Update input field to show the selected option
    setShowDropdown(false); // Hide dropdown after selection

    // Load keywords and statuses for the selected dialog
    const dialogData = keywordsByDialog[dialogKey] || { keywords: [], statuses: {} };
    setCurrentKeywords(dialogData.keywords);
    setCurrentStatuses(dialogData.statuses);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    setShowDropdown(true); // Show dropdown as user types
  };

  const handleInputFocus = () => {
    setShowDropdown(true); // Show dropdown when input is focused
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false); // Hide dropdown if clicking outside
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePreviousClick = () => {
    const currentIndex = dialogs.findIndex(dialog => dialog.dialogKey === selectedDialog);
    if (currentIndex > 0) {
      const previousDialog = dialogs[currentIndex - 1].dialogKey;
      setSelectedDialog(previousDialog);
      setSearchInput(previousDialog); // Update input to reflect previous dialog
      const dialogData = keywordsByDialog[previousDialog] || { keywords: [], statuses: {} };
      setCurrentKeywords(dialogData.keywords);
      setCurrentStatuses(dialogData.statuses);
    }
  };

  const handleNextClick = () => {
    const currentIndex = dialogs.findIndex(dialog => dialog.dialogKey === selectedDialog);
    if (currentIndex < dialogs.length - 1) {
      const nextDialog = dialogs[currentIndex + 1].dialogKey;
      setSelectedDialog(nextDialog);
      setSearchInput(nextDialog); // Update input to reflect next dialog
      const dialogData = keywordsByDialog[nextDialog] || { keywords: [], statuses: {} };
      setCurrentKeywords(dialogData.keywords);
      setCurrentStatuses(dialogData.statuses);
    }
  };

  const handleAddKeyWord = () => {
    if (newUtteranceText.trim() !== '' && !/\s/.test(newUtteranceText)) {
      const updatedKeywords = [...currentKeywords, newUtteranceText.trim()];

      setKeywordsByDialog((prevKeywords) => ({
        ...prevKeywords,
        [selectedDialog]: {
          keywords: updatedKeywords,
          statuses: currentStatuses,
        },
      }));

      setCurrentKeywords(updatedKeywords);
      setNewKeyWordText('');

      getUtteranceStatus(
        utterances,
        updatedKeywords,
        currentStatuses,
        setKeywordsByDialog,
        setCurrentStatuses,
        setTransformedUtterances,
        selectedDialog
      );
    } else {
      alert('Please enter a single word without spaces.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\s/g, '');
    setNewKeyWordText(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddKeyWord();
    }
  };

  const handleAnalyze = () => {
    // Call getNonSelectedDialogsStatus to get percentages for non-selected dialogs
    const results = getNonSelectedDialogsStatus(
      utterances,          // The utterances array
      dialogs,             // The dialogs array
      selectedDialog,      // The current selected dialog key
      currentKeywords      // The current keywords to match against
    );
    // Set modal data to the current selected dialog and keywords
    setModalData({
      dialogName: selectedDialog,
      keywords: currentKeywords,
    });

    setAnalysisResults(results);

    setIsModalOpen(true); // Open the modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal when the "X" button is clicked
  };

  // Function to remove a keyword
  const handleRemoveKeyword = (keywordToRemove: string) => {
    const updatedKeywords = currentKeywords.filter(keyword => keyword !== keywordToRemove);

    setKeywordsByDialog((prevKeywords) => ({
      ...prevKeywords,
      [selectedDialog]: {
        keywords: updatedKeywords,
        statuses: currentStatuses, // Preserve existing statuses
      },
    }));

    setCurrentKeywords(updatedKeywords);

    // Recalculate statuses after removing a keyword
    getUtteranceStatus(
      utterances,
      updatedKeywords,
      currentStatuses,
      setKeywordsByDialog,
      setCurrentStatuses,
      setTransformedUtterances,
      selectedDialog
    );
  };

  // Filter dialogs based on search input or show all if search input is empty
  const filteredDialogs = searchInput === ''
    ? dialogs // Show all dialogs if input is empty
    : dialogs.filter(dialog =>
      dialog.dialogKey.toLowerCase().includes(searchInput.toLowerCase())
    );

  // Define the field configuration for JsonDisplay
  const fieldConfig: { fieldName: string; label: string; type: 'string' | 'boolean' }[] = [
    { fieldName: 'utterance', label: 'Utterance', type: 'string' }, // This field will display the utterance text
    { fieldName: 'status', label: 'Status', type: 'string' }, // Placeholder for the "Status" column
  ];

  const handleAddToDo = (
    index: number,
    action: 'remove' | 'edit' | 'move' | 'flag',
    dialogKey: string,
    newDialogKey?: string,
    editedText?: string,
    flaggedFrom?: string // Added optional parameter
  ) => {
    const utterancesForDialog = utterances.filter(
      (utterance) => utterance.dialogKey === dialogKey
    );
    const utteranceToAdd = utterancesForDialog[index]; // Get the utterance from the selected dialog
  
    if (!utteranceToAdd || !utteranceToAdd.utterance) {
      console.error('Invalid utterance at index', index);
      return;
    }
  
    // Use flaggedFrom if provided, else use dialogKey
    const flagSource = flaggedFrom || dialogKey;
  
    setToDoList((prevToDoList: any) => {
      const existingItem = prevToDoList[utteranceToAdd.utterance];
  
      if (action === 'flag') {
        const flaggedFromArray = existingItem?.flaggedFrom || [];
        const isAlreadyFlagged = flaggedFromArray.includes(flagSource);
  
        let updatedFlaggedFrom;
  
        if (isAlreadyFlagged) {
          // Toggle off the flag (remove the flagSource from flaggedFrom)
          updatedFlaggedFrom = flaggedFromArray.filter(
            (key: any) => key !== flagSource
          );
        } else {
          // Toggle on the flag (add the flagSource to flaggedFrom)
          updatedFlaggedFrom = [...flaggedFromArray, flagSource];
        }
  
        // If no flags remain, remove the item from the toDoList
        if (updatedFlaggedFrom.length === 0) {
          const { [utteranceToAdd.utterance]: _, ...remainingItems } = prevToDoList;
          return remainingItems;
        } else {
          return {
            ...prevToDoList,
            [utteranceToAdd.utterance]: {
              ...existingItem,
              utterance: utteranceToAdd.utterance, // Ensure this is the utterance text
              action: 'flag', // Keep action as 'flag'
              flaggedFrom: updatedFlaggedFrom, // Update the flaggedFrom array
            },
          };
        }
      } else {
        // Handle other actions (remove, edit, move)
        if (existingItem && existingItem.action === action) {
          const { [utteranceToAdd.utterance]: _, ...remainingItems } = prevToDoList;
          return remainingItems; // Remove the item if it exists and has the same action
        }
  
        return {
          ...prevToDoList,
          [utteranceToAdd.utterance]: {
            ...existingItem,
            utterance: utteranceToAdd.utterance, // Ensure this is the utterance text
            action: action,
            newDialogKey: newDialogKey || null,
            editedText: editedText || null,
            flaggedFrom: existingItem?.flaggedFrom || [],
          },
        };
      }
    });
  };  

  const handleDeleteItem = (index: number, dialogKey: string) => {
    handleAddToDo(index, 'remove', dialogKey);
  };

  const handleEditItem = (index: number, dialogKey: string) => {
    const newText = prompt('Enter the new text:');
    if (newText !== null) {
      handleAddToDo(index, 'edit', dialogKey, undefined, newText);
    }
  };

  const handleMoveItem = (index: number, dialogKey: string) => {
    const newDialogKey = prompt('Enter the new dialog key:');
    if (newDialogKey !== null) {
      handleAddToDo(index, 'move', dialogKey, newDialogKey);
    }
  };

  const handleFlagItem = (
    index: number,
    dialogKey: string,
    flaggedFrom?: string // Added optional parameter
  ) => {
    handleAddToDo(index, 'flag', dialogKey, undefined, undefined, flaggedFrom);
  };

  return (
    <>
      <div className="field-container">
        <div className="object-details">
          <button
            className="nav-button"
            onClick={handlePreviousClick}
            disabled={dialogs.findIndex(dialog => dialog.dialogKey === selectedDialog) <= 0}
          >
            &lt;
          </button>

          {/* Container for input and dropdown to control their layout */}
          <div className="dropdown-container" ref={dropdownRef}>
            {/* Input for searching dialogs */}
            <input
              type="text"
              placeholder="Search dialog..."
              value={searchInput} // Controlled input displays selected option
              onChange={handleSearchInputChange}
              onFocus={handleInputFocus}
            />

            {/* Dropdown with filtered options */}
            {showDropdown && (
              <ul className="dropdown">
                {filteredDialogs.map((dialog, index) => (
                  <li
                    key={index}
                    onClick={() => handleDialogSelect(dialog.dialogKey)}
                    className="dropdown-item"
                  >
                    {dialog.dialogKey}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            className="nav-button"
            onClick={handleNextClick}
            disabled={dialogs.findIndex(dialog => dialog.dialogKey === selectedDialog) >= dialogs.length - 1}
          >
            &gt;
          </button>
        </div>

        <div className="keyword-container">
          <input
            type="text"
            value={newUtteranceText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress} // Add key press event to handle Enter key
            placeholder="Keyword to add (no spaces)"
          />
          <button className="light-button" onClick={handleAddKeyWord}>Add Key Word</button>
          <button className="primary-button" onClick={() => handleAnalyze()}>Analyze</button>
        </div>
      </div>

      {/* Render the Modal */}
      <AnalysisModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        dialogName={modalData.dialogName}
        keywords={modalData.keywords}
        analysisResults={analysisResults}
        toDoList={toDoList}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
        onMoveItem={handleMoveItem}
        onFlagItem={handleFlagItem} />

      <div className="tag-bar">
        {currentKeywords.map((keyword, index) => (
          <span key={index} className="tag-pill">
            {keyword}
            <button onClick={() => handleRemoveKeyword(keyword)}></button> {/* X button to remove keyword */}
          </span>
        ))}
      </div>

      {/* Render JsonDisplay to show the filtered utterances with updated "Status" */}
      <JsonDisplay
        parentName={selectedDialog}
        jsonArray={transformedUtterances}
        fieldConfig={fieldConfig}
        toDoList={toDoList}
        onDeleteItem={(index) => handleDeleteItem(index, selectedDialog)}
        onEditItem={(index) => handleEditItem(index, selectedDialog)}
        onMoveItem={(index) => handleMoveItem(index, selectedDialog)}
        onFlagItem={(index) => handleFlagItem(index, selectedDialog)}
        dialogKey={selectedDialog}
      />
    </>
  );
};