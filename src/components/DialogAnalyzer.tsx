import React, { useState, useEffect } from 'react';
import type { FC } from 'react';

interface DialogAnalyzerProps {
    utterances: any[];
    dialogs: any[];
    services: any[];
}

export const DialogAnalyzer: FC<DialogAnalyzerProps> = ({ utterances, dialogs, services }) => {
    const [exclusiveWordsMap, setExclusiveWordsMap] = useState<{ [key: string]: string[] }>({});
    const [frequentWordsMap, setFrequentWordsMap] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const newExclusiveWordsMap: any = {};
        const newFrequentWordsMap: any = {};

        dialogs.forEach(dialog => {
            const dialogKey = dialog.dialogKey;
            const currentUtterances = utterances.filter(item => item.dialogKey === dialogKey);
            const currentWords = currentUtterances.flatMap(item => item.utterance ? processWords(item.utterance) : []);

            // Calculate exclusive words
            const otherUtterances = utterances.filter(item => item.dialogKey !== dialogKey);
            const otherWords = otherUtterances.flatMap(item => item.utterance ? processWords(item.utterance) : []);
            const uniqueWords = new Set(currentWords.filter(word => !otherWords.includes(word)));
            newExclusiveWordsMap[dialogKey] = Array.from(uniqueWords);

            // Calculate frequent words
            const wordFrequency = currentWords.reduce((acc: any, word: any) => {
                acc[word] = (acc[word] || 0) + 1;
                return acc;
            }, {});
            const sortedWords = Object.entries(wordFrequency)
                                      .sort((a: any, b: any) => b[1] - a[1])
                                      .map(item => item[0])
                                      .slice(0, 5);
            newFrequentWordsMap[dialogKey] = sortedWords;
        });

        setExclusiveWordsMap(newExclusiveWordsMap);
        setFrequentWordsMap(newFrequentWordsMap);
    }, [utterances, dialogs]);

    const processWords = (sentence: string) => {
        return sentence.toLowerCase()
                       .replace(/[¿?.,]/g, '')
                       .split(/\s+/)
                       .filter(word => isNaN(word as any) && word.trim() !== '');
    };

    return (
        <div>
            <table border={1}>
                <thead>
                    <tr>
                        <th key='dialog'>Dialog Name</th>
                        <th>Exclusive words</th>
                        <th>Frequent Words</th>
                    </tr>
                </thead>
                <tbody>
                    {dialogs.map((dialog, index) => {
                        const dialogExclusiveWords = exclusiveWordsMap[dialog.dialogKey] || [];
                        const dialogFrequentWords = frequentWordsMap[dialog.dialogKey] || [];
                        const exclusiveWordsDisplay = dialogExclusiveWords.length > 0
                            ? dialogExclusiveWords.join(', ')
                            : '0 exclusive words';
                        const frequentWordsDisplay = dialogFrequentWords.join(', ');

                        return (
                            <tr key={index}>
                                <td>{dialog.dialogKey}</td>
                                <td>{exclusiveWordsDisplay}</td>
                                <td>{frequentWordsDisplay}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
