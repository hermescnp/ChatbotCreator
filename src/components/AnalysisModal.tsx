import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/AnalysisModal.css';
import { ToDoItem } from './Types';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    dialogName: string;  // Pass the dialog name (parent)
    keywords: string[];  // Pass the list of keywords
    analysisResults: { [dialogKey: string]: { utterance: string; percentage: string }[] };  // Object for list of dialogs and their utterances
    onEditItem?: any;  // Handler for edit action
    onMoveItem?: any;  // Handler for move action
    onDeleteItem?: any;  // Handler for delete action
    toDoList: { [key: string]: ToDoItem };
}

const getItemStyle = (utterance: string, toDoList: { [key: string]: ToDoItem }) => {
    const toDoItem = toDoList?.[utterance];
    if (toDoItem?.action === 'remove') {
        return { textDecoration: 'line-through', color: 'gray' };
    } else if (toDoItem?.action === 'edit') {
        return { color: '#3498db' };
    } else if (toDoItem?.action === 'move') {
        return { color: '#2ecc71' };
    }
    return {};
};

// Check if utterance has changes and apply the class
const hasChanges = (utterance: string, toDoList: { [key: string]: ToDoItem }) => {
    return toDoList?.[utterance]?.action === 'remove' ||
        toDoList?.[utterance]?.action === 'edit' ||
        toDoList?.[utterance]?.action === 'move';
};

// Reusing the renderActionText logic
const renderActionText = (utterance: string, toDoList: { [key: string]: ToDoItem }) => {
    const toDoItem = toDoList?.[utterance];
    if (toDoItem?.action === 'edit' && toDoItem?.editedText) {
        return (
            <span>
                {' '}| edited to --&gt; <span style={{ fontWeight: 'bold' }}>{toDoItem.editedText}</span>
            </span>
        );
    } else if (toDoItem?.action === 'move' && toDoItem?.newDialogKey) {
        return (
            <span>
                {' '}| moved to --&gt; <span style={{ fontWeight: 'bold' }}>{toDoItem.newDialogKey}</span>
            </span>
        );
    }
    return null;
};

const AnalysisModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    dialogName,
    keywords,
    analysisResults,
    onEditItem,
    onMoveItem,
    onDeleteItem,
    toDoList
}) => {
    const [selectedDialog, setSelectedDialog] = useState<string | null>(null);

    if (!isOpen) return null;

    const selectedDialogUtterances = selectedDialog ? analysisResults[selectedDialog] || [] : [];

    // Only count utterances without changes and with a positive percentage
    const countPositiveMatchUtterances = (utterances: { utterance: string; percentage: string }[], toDoList: { [key: string]: ToDoItem }) => {
        return utterances.filter((utteranceItem) => {
            const { utterance, percentage } = utteranceItem;
            return parseFloat(percentage) > 0 && !hasChanges(utterance, toDoList);
        }).length;
    };

    const countChangesInUtterances = (utterances: { utterance: string; percentage: string }[], toDoList: { [key: string]: ToDoItem }) => {
        return utterances.filter((utteranceItem) => {
            const { utterance } = utteranceItem;
            return hasChanges(utterance, toDoList);
        }).length;
    };

    const countConflictingDialogs = () => {
        return Object.keys(analysisResults).filter(dialogKey => {
            const utterances = analysisResults[dialogKey];
            return countPositiveMatchUtterances(utterances, toDoList) > 0;
        }).length;
    };

    // Check if the dialog is resolved by comparing conflicts and changes
    const isDialogResolved = (utterances: { utterance: string; percentage: string }[], toDoList: { [key: string]: ToDoItem }) => {
        const conflictCount = countPositiveMatchUtterances(utterances, {});
        const changeCount = countChangesInUtterances(utterances, toDoList);
        return conflictCount > 0 && conflictCount === changeCount;
    };

    // Helper function to check if the action button should be active
    const isActive = (utterance: string, action: 'remove' | 'edit' | 'move') => {
        return toDoList?.[utterance]?.action === action;
    };

    const conflictingDialogCount = countConflictingDialogs();

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}></button>
                <h2>Dialog Analysis</h2>
                <div className="dialog-keyword-bar">
                    <p>Parent Dialog: <strong>{dialogName}</strong></p>
                    <div className="keywords-list">
                        {keywords.map((keyword, index) => (
                            <span key={index} className="keyword-item">{keyword}</span>
                        ))}
                    </div>
                </div>
                <div className='results-log'>
                    <div>
                        <p className='analysis-result-label'>
                            Interfering Dialogs:
                            <strong style={{ color: conflictingDialogCount > 1 ? 'red' : 'black' }}>
                                ({conflictingDialogCount})
                            </strong>
                        </p>
                        <ul className="Interfering-list">
                            {Object.keys(analysisResults).map((dialogKey, index) => {
                                const utterances = analysisResults[dialogKey];
                                const utteranceCount = countPositiveMatchUtterances(utterances, toDoList);
                                const dialogResolved = isDialogResolved(utterances, toDoList);

                                return (
                                    <li
                                        key={index}
                                        className={`list-item ${selectedDialog === dialogKey ? 'selected' : ''} 
                                            ${utteranceCount > 0 ? 'has-conflict' : dialogResolved ? 'is-resolved' : ''}`}
                                        onClick={() => setSelectedDialog(dialogKey)}
                                    >
                                        <span className="dialog-name">{dialogKey}</span>
                                        <span className="utterance-count">{utteranceCount > 0 ? `(${utteranceCount})` : ''}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <p className='analysis-result-label'>
                            Selected Dialog: <strong>{selectedDialog ? selectedDialog : 'None selected'}</strong>
                        </p>
                        <ul className="Interfering-list">
                            {selectedDialogUtterances.length > 0 ? (
                                selectedDialogUtterances.map((utteranceItem, index) => {
                                    const utterance = utteranceItem.utterance;
                                    const utteranceStyle = getItemStyle(utterance, toDoList);
                                    const hasUtteranceChanges = hasChanges(utterance, toDoList);

                                    return (
                                        <li
                                            key={index}
                                            className={`list-item ${parseFloat(utteranceItem.percentage) > 0 ? 'has-conflict' : ''} ${hasUtteranceChanges ? 'has-changes' : ''
                                                }`}
                                        >
                                            <p className="list-utterance-item" style={utteranceStyle}>
                                                {utterance}
                                                {renderActionText(utterance, toDoList)}
                                            </p>
                                            <p className="list-percentage-item">{utteranceItem.percentage}</p>
                                            <div className="action-buttons">
                                                <button
                                                    className={`action-button edit-button ${isActive(utterance, 'edit') ? 'active' : ''}`}
                                                    onClick={() => {
                                                        if (onEditItem && selectedDialog) {
                                                            onEditItem(index, selectedDialog);
                                                        }
                                                    }}
                                                    title="Edit"
                                                >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>

                                                <button
                                                    className={`action-button move-button ${isActive(utterance, 'move') ? 'active' : ''}`}
                                                    onClick={() => {
                                                        if (onMoveItem && selectedDialog) {
                                                            onMoveItem(index, selectedDialog);
                                                        }
                                                    }}
                                                    title="Move"
                                                >
                                                    <FontAwesomeIcon icon={faArrowsAlt} />
                                                </button>

                                                <button
                                                    className={`action-button delete-button ${isActive(utterance, 'remove') ? 'active' : ''}`}
                                                    onClick={() => {
                                                        if (onDeleteItem && selectedDialog) {
                                                            onDeleteItem(index, selectedDialog);
                                                        }
                                                    }}
                                                    title="Delete"
                                                >
                                                    <FontAwesomeIcon icon={faTrashAlt} />
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="no-utterance-item">Select a dialog to view utterances</li>
                            )}
                        </ul>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisModal;
