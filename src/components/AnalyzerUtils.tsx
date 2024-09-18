import { Utterance } from './Types'; // Import relevant types

// Helper function to clean up special characters
const cleanUpText = (text: string) => {
  return text.replace(/[¿?.,!]/g, '').toLowerCase();
};

export const getUtteranceStatus = (
  utterances: Utterance[],
  keywords: string[],
  currentStatuses: { [utterance: string]: string },
  setKeywordsByDialog: React.Dispatch<React.SetStateAction<any>>,
  setCurrentStatuses: React.Dispatch<React.SetStateAction<{ [utterance: string]: string }>>,
  setTransformedUtterances: React.Dispatch<React.SetStateAction<Utterance[]>>,
  selectedDialog: string
) => {
  const updatedStatuses = { ...currentStatuses };

  if (keywords.length === 0) {
    utterances.forEach((utterance) => {
      updatedStatuses[utterance.utterance] = '0%';
    });
  } else {
    utterances.forEach((utterance) => {
      // Clean up the utterance text to remove special characters
      const utteranceWords = cleanUpText(utterance.utterance).split(/\s+/);
      const matchedKeywordsCount = keywords.filter((keyword) =>
        utteranceWords.includes(keyword.toLowerCase())
      ).length;

      const keywordPercentage =
        keywords.length > 0
          ? ((matchedKeywordsCount / keywords.length) * 100).toFixed(0) + '%'
          : '0%';

      updatedStatuses[utterance.utterance] = keywordPercentage;
    });
  }

  setKeywordsByDialog((prevKeywords : any) => ({
    ...prevKeywords,
    [selectedDialog]: {
      keywords,
      statuses: updatedStatuses,
    },
  }));

  setCurrentStatuses(updatedStatuses);

  setTransformedUtterances((prevUtterances) =>
    prevUtterances.map((utterance) => ({
      ...utterance,
      status: updatedStatuses[utterance.utterance] || '',
    }))
  );
};

// Function to calculate statuses for non-selected dialogs and log the results
export const getNonSelectedDialogsStatus = (
  utterances: Utterance[],
  dialogs: any[],
  selectedDialog: string,
  currentKeywords: string[]
) => {
  const results: { [dialogKey: string]: { utterance: string, percentage: string }[] } = {};

  dialogs.forEach((dialog) => {
    if (dialog.dialogKey !== selectedDialog) {
      const dialogUtterances = utterances.filter(
        (utterance) => utterance.dialogKey === dialog.dialogKey
      );

      const dialogResults: { utterance: string, percentage: string }[] = [];

      dialogUtterances.forEach((utterance) => {
        const utteranceWords = cleanUpText(utterance.utterance).split(/\s+/);
        const matchedKeywordsCount = currentKeywords.filter((keyword) =>
          utteranceWords.includes(keyword.toLowerCase())
        ).length;

        const keywordPercentage =
          currentKeywords.length > 0
            ? ((matchedKeywordsCount / currentKeywords.length) * 100).toFixed(0) + '%'
            : '0%';

        dialogResults.push({ utterance: utterance.utterance, percentage: keywordPercentage });
      });

      results[dialog.dialogKey] = dialogResults;
    }
  });

  return results;
};

