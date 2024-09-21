export interface Utterance {
    utterance: string;
    dialogKey: string;
    isQuestion: boolean;
    isImperative: boolean;
    objectType: string;
  }

  export interface ToDoItem {
    utterance: Utterance;
    action: 'remove' | 'edit' | 'move' | 'flag' | null;
    newDialogKey?: string; // For 'move' action
    editedText?: string; // For 'edit' action
    flaggedFrom?: string[]; // For 'flag' action
  }
  