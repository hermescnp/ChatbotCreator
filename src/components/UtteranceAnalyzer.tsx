import React, { useState } from 'react';
import { generateAlternatives } from './generateAlternatives'

interface Utterance {
  utterance: string;
  dialogKey: string;
  isQuestion: boolean;
  isImperative: boolean;
  objectType: string;
}

interface DialogAnalyzerProps {
  utterances: Utterance[];
  dialogs: any[];
  services: any[];
  setUtterances: React.Dispatch<React.SetStateAction<Utterance[]>>;
}

export const UtteranceAnalyzer: React.FC<DialogAnalyzerProps> = ({ utterances, dialogs, services, setUtterances }) => {
  const [selectedDialog, setSelectedDialog] = useState<string>('');
  const [newUtteranceText, setNewUtteranceText] = useState<string>('');
  const [isQuestion, setIsQuestion] = useState<boolean>(false);
  const [isImperative, setIsImperative] = useState<boolean>(false);

  const handleDialogChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDialog(event.target.value);
  };

  const addUtteranceToDialog = () => {
    const newUtteranceObject: Utterance = {
      utterance: newUtteranceText,
      dialogKey: selectedDialog,
      isQuestion,
      isImperative,
      objectType: 'Default',
    };

    setUtterances(currentUtterances => [...currentUtterances, newUtteranceObject]);
    setNewUtteranceText('');
    setIsQuestion(false);
    setIsImperative(false);
  };

  const countWords = (sentence: string) => {
    return sentence.split(/\s+/).filter(word => word.trim() !== '').length;
  };

  const colors = ['#F0F8FF', '#FAEBD7', '#F5F5DC', '#FFE4C4', '#FFF8DC'];

  const getColorForIndex = (index: number) => {
    return colors[index % colors.length];
  };

  const filteredAndSortedUtterances = selectedDialog
    ? utterances
        .filter(utterance => utterance.dialogKey === selectedDialog)
        .sort((a, b) => countWords(a.utterance) - countWords(b.utterance))
    : [];

  return (
    <div>
 <div className="field-container">
        <div className="object-details">
          <select onChange={handleDialogChange} value={selectedDialog}>
            <option value="">Select a dialog</option>
            {dialogs.map((dialog, index) => (
              <option key={index} value={dialog.dialogKey}>
                {dialog.dialogKey}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={newUtteranceText}
          onChange={(e) => setNewUtteranceText(e.target.value)}
          placeholder="Enter new utterance"
        />
        <label>
          <input
            type="checkbox"
            checked={isQuestion}
            onChange={(e) => setIsQuestion(e.target.checked)}
          /> Is Question
        </label>
        <label>
          <input
            type="checkbox"
            checked={isImperative}
            onChange={(e) => setIsImperative(e.target.checked)}
          /> Is Imperative
        </label>
        <button className="add-button" onClick={addUtteranceToDialog}>Add Utterance</button>
      </div>

      {selectedDialog && (
        <div style={{ marginTop: '20px' }}>
          <table border={1}>
            <thead>
              <tr>
                <th>Utterance</th>
                <th># of Words</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUtterances.flatMap((utterance, index) => {
                const alternatives : any = generateAlternatives(utterance);
                const color = getColorForIndex(index);
                return [
                  <tr key={`utterance-${index}`} style={{ backgroundColor: color }}>
                    <td><strong>{utterance.utterance}</strong></td>
                    <td>{countWords(utterance.utterance)}</td>
                  </tr>,
                  ...alternatives.map((alt : any, altIndex : any) => (
                    <tr key={`alternative-${index}-${altIndex}`} style={{ backgroundColor: color }}>
                      <td colSpan={2}>{alt}</td>
                    </tr>
                  )),
                ];
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
