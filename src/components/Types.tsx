export interface Utterance {
    utterance: string;
    dialogKey: string;
    isQuestion: boolean;
    isImperative: boolean;
    objectType: string;
  }

export interface ToDoItem {
    utterance: Utterance;
    action: 'remove' | 'edit' | 'move' | null;
    newDialogKey?: string; // For 'move' action
    editedText?: string; // For 'edit' action
  }