import React, { useState, useEffect } from 'react';
import type { FC } from 'react';

interface DialogAnalyzerProps {
    utterances: any[];
    dialogs: any[];
    services: any[];
}

export const DialogAnalyzer: FC<DialogAnalyzerProps> = ({ utterances, dialogs, services }) => {
    const [exclusiveWordsMap, setExclusiveWordsMap] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        const newExclusiveWordsMap: any = {};

        dialogs.forEach(dialog => {
            const dialogKey = dialog.dialogKey;
            const currentUtterances = utterances.filter(utterance => utterance.dialogKey === dialogKey);
            const currentWords = currentUtterances.flatMap(utterance => utterance.text ? utterance.text.split(/\s+/) : []);

            const otherUtterances = utterances.filter(utterance => utterance.dialogKey !== dialogKey);
            const otherWords = otherUtterances.flatMap(utterance => utterance.text ? utterance.text.split(/\s+/) : []);

            newExclusiveWordsMap[dialogKey] = currentWords.filter(word => !otherWords.includes(word));
        });

        setExclusiveWordsMap(newExclusiveWordsMap);
    }, [utterances, dialogs]);

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
                        const exclusiveWordsDisplay = dialogExclusiveWords.length > 0
                            ? dialogExclusiveWords.join(', ')
                            : '0 exclusive words';

                        return (
                            <tr key={index}>
                                <td>{dialog.dialogKey}</td>
                                <td>{exclusiveWordsDisplay}</td>
                                <td>{/* Frequent words data here */}</td>
                            </tr>
                        );
                    })}
                </tbody>

            </table>
        </div>
    );
};
