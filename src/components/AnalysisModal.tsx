import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faArrowsAlt, faFlag } from '@fortawesome/free-solid-svg-icons';
import '../styles/AnalysisModal.css';
import { ToDoItem } from './Types';

interface AnalysisResultItem {
    utterance: string;
    percentage: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    dialogName: string;  // Pass the dialog name (parent)
    keywords: string[];  // Pass the list of keywords
    analysisResults: { [dialogKey: string]: { utterance: string; percentage: string }[] };  // Object for list of dialogs and their utterances
    onEditItem?: any;  // Handler for edit action
    onMoveItem?: any;  // Handler for move action
    onDeleteItem?: any;  // Handler for delete action
    onFlagItem?: any;
    toDoList: { [key: string]: ToDoItem };
}

const AnalysisModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    dialogName,
    keywords,
    analysisResults,
    onEditItem,
    onMoveItem,
    onDeleteItem,
    onFlagItem,
    toDoList,
}) => {
    const [selectedDialog, setSelectedDialog] = useState<string | null>(null);

    if (!isOpen) return null;

    const selectedDialogUtterances: AnalysisResultItem[] = selectedDialog
        ? analysisResults[selectedDialog] || []
        : [];

    // Function to check if an utterance has changes, including flags
    const hasChanges = (
        utterance: string,
        toDoList: { [key: string]: ToDoItem },
        dialogKey: string
    ): boolean => {
        const toDoItem = toDoList[utterance];
        return (
            toDoItem?.action === 'remove' ||
            toDoItem?.action === 'edit' ||
            toDoItem?.action === 'move' ||
            toDoItem?.action === 'flag'
        );
    };

    const countPositiveMatchUtterances = (
        utterances: AnalysisResultItem[],
        toDoList: { [key: string]: ToDoItem },
        dialogKey: string
    ): number => {
        return utterances.filter(({ utterance, percentage }) => {
            // Exclude items that have been flagged or have other changes
            return parseFloat(percentage) > 0 && !hasChanges(utterance, toDoList, dialogKey);
        }).length;
    };

    const countChangesInUtterances = (
        utterances: AnalysisResultItem[],
        toDoList: { [key: string]: ToDoItem },
        dialogKey: string
    ): number => {
        return utterances.filter(({ utterance }) => {
            return hasChanges(utterance, toDoList, dialogKey);
        }).length;
    };


    const isDialogResolved = (
        utterances: AnalysisResultItem[],
        toDoList: { [key: string]: ToDoItem },
        dialogKey: string
    ): boolean => {
        const conflictCount = countPositiveMatchUtterances(utterances, {}, dialogKey);
        const changeCount = countChangesInUtterances(utterances, toDoList, dialogKey);

        // Ensure that both flagged and other changed items are considered "resolved"
        return conflictCount > 0 && conflictCount === changeCount;
    };

    const getItemStyle = (
        utterance: string,
        toDoList: { [key: string]: ToDoItem }
    ): React.CSSProperties => {
        const toDoItem = toDoList[utterance];
        if (toDoItem?.action === 'remove') {
            return { textDecoration: 'line-through', color: 'gray' };
        } else if (toDoItem?.action === 'edit') {
            return { color: '#3498db' };
        } else if (toDoItem?.action === 'move') {
            return { color: '#2ecc71' };
        } else if (toDoItem?.flaggedFrom && toDoItem.flaggedFrom.length > 0) {
            return { backgroundColor: '#fff2cc' };
        }
        return {};
    };

    const renderActionText = (
        utterance: string,
        toDoList: { [key: string]: ToDoItem }
    ): JSX.Element | null => {
        const toDoItem = toDoList[utterance];
        
        if (toDoItem?.action === 'edit' && toDoItem.editedText) {
            return (
                <span>
                    {' '}
                    | edited to --&gt; <span style={{ fontWeight: 'bold' }}>{toDoItem.editedText}</span>
                </span>
            );
        } else if (toDoItem?.action === 'move' && toDoItem.newDialogKey) {
            return (
                <span>
                    {' '}
                    | moved to --&gt; <span style={{ fontWeight: 'bold' }}>{toDoItem.newDialogKey}</span>
                </span>
            );
        } else if (toDoItem?.action === 'flag' && toDoItem.flaggedFrom && toDoItem.flaggedFrom.length > 0) {
            return (
                <span>
                    {' '}
                    | flagged from --&gt;{' '}
                    <span style={{ fontWeight: 'bold' }}>{toDoItem.flaggedFrom.join(', ')}</span>
                </span>
            );
        }
        return null;
    };    

    const isActive = (
        utterance: string,
        action: 'remove' | 'edit' | 'move' | 'flag'
    ): boolean => {
        const toDoItem = toDoList[utterance];
        if (action === 'flag') {
            return toDoItem?.flaggedFrom?.includes(selectedDialog || '') || false;
        }
        return toDoItem?.action === action;
    };

    const conflictingDialogCount: number = Object.keys(analysisResults).filter((dialogKey) => {
        const utterances = analysisResults[dialogKey];
        return countPositiveMatchUtterances(utterances, toDoList, dialogKey) > 0;
    }).length;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-button" onClick={onClose}></button>
                <h2>Dialog Analysis</h2>
                <div className="dialog-keyword-bar">
                    <p>
                        Parent Dialog: <strong>{dialogName}</strong>
                    </p>
                    <div className="keywords-list">
                        {keywords.map((keyword, index) => (
                            <span key={index} className="keyword-item">
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="results-log">
                    <div>
                        <p className="analysis-result-label">
                            Interfering Dialogs:
                            <strong style={{ color: conflictingDialogCount > 1 ? 'red' : 'black' }}>
                                ({conflictingDialogCount})
                            </strong>
                        </p>
                        <ul className="Interfering-list">
                            {Object.keys(analysisResults).map((dialogKey, index) => {
                                const utterances = analysisResults[dialogKey];
                                const utteranceCount = countPositiveMatchUtterances(utterances, toDoList, dialogKey);
                                const dialogResolved = isDialogResolved(utterances, toDoList, dialogKey);

                                return (
                                    <li
                                        key={index}
                                        className={`list-item ${selectedDialog === dialogKey ? 'selected' : ''} 
                                        ${utteranceCount > 0 ? 'has-conflict' : dialogResolved ? 'is-resolved' : ''}`}
                                        onClick={() => setSelectedDialog(dialogKey)}
                                    >
                                        <span className="dialog-name">{dialogKey}</span>
                                        <span className="utterance-count">
                                            {utteranceCount > 0 ? `(${utteranceCount})` : ''}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div>
                        <p className="analysis-result-label">
                            Selected Dialog:{' '}
                            <strong>{selectedDialog ? selectedDialog : 'None selected'}</strong>
                        </p>
                        <ul className="Interfering-list">
                            {selectedDialogUtterances.length > 0 ? (
                                selectedDialogUtterances.map((utteranceItem, index) => {
                                    const { utterance, percentage } = utteranceItem;
                                    const utteranceStyle = getItemStyle(utterance, toDoList);
                                    const hasUtteranceChanges = hasChanges(
                                        utterance,
                                        toDoList,
                                        selectedDialog || ''
                                    );

                                    return (
                                        <li
                                            key={index}
                                            className={`list-item ${parseFloat(percentage) > 0 ? 'has-conflict' : ''
                                                } ${hasUtteranceChanges ? 'has-changes' : ''}`}
                                        >
                                            <p className="list-utterance-item" style={utteranceStyle}>
                                                {utterance}
                                                {renderActionText(utterance, toDoList)}
                                            </p>
                                            <p className="list-percentage-item">{percentage}</p>
                                            <div className="action-buttons">
                                                {/* Edit Button */}
                                                {onEditItem && (
                                                    <button
                                                        className={`action-button edit-button ${isActive(utterance, 'edit') ? 'active' : ''}`}
                                                        onClick={() => {
                                                            if (selectedDialog) {
                                                                onEditItem(index, selectedDialog);
                                                            }
                                                        }}
                                                        title="Edit"
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                    </button>
                                                )}

                                                {/* Move Button */}
                                                {onMoveItem && (
                                                    <button
                                                        className={`action-button move-button ${isActive(utterance, 'move') ? 'active' : ''}`}
                                                        onClick={() => {
                                                            if (selectedDialog) {
                                                                onMoveItem(index, selectedDialog);
                                                            }
                                                        }}
                                                        title="Move"
                                                    >
                                                        <FontAwesomeIcon icon={faArrowsAlt} />
                                                    </button>
                                                )}

                                                {/* Delete Button */}
                                                {onDeleteItem && (
                                                    <button
                                                        className={`action-button delete-button ${isActive(utterance, 'remove') ? 'active' : ''}`}
                                                        onClick={() => {
                                                            if (selectedDialog) {
                                                                onDeleteItem(index, selectedDialog);
                                                            }
                                                        }}
                                                        title="Delete"
                                                    >
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                    </button>
                                                )}

                                                {/* Flag Button */}
                                                {onFlagItem && (
                                                    <button
                                                        className={`action-button flag-button ${isActive(utterance, 'flag') ? 'active' : ''}`}
                                                        onClick={() => {
                                                            if (selectedDialog) {
                                                                onFlagItem(index, selectedDialog, dialogName);
                                                            }
                                                        }}
                                                        title={isActive(utterance, 'flag') ? 'Unflag' : 'Flag'}
                                                    >
                                                        <FontAwesomeIcon icon={faFlag} />
                                                    </button>
                                                )}
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
