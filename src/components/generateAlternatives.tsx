import React from 'react';

interface Utterance {
    utterance: string;
}

export const generateAlternatives = (utterance: Utterance) => {
    let alternatives = new Set<string>();

    // Función para normalizar el texto: minúsculas, eliminar tildes y caracteres especiales
    const normalizeText = (text: string) => {
        return text.toLowerCase()
                   .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
                   .replace(/[^a-z0-9\s]/g, ''); // Eliminar caracteres especiales excepto números y espacios
    };

    // Función para revisar si alguna palabra termina con "s"
    const hasWordEndingWithS = (text: string) => text.split(' ').some(word => word.endsWith('s'));

    // Función para revisar si alguna palabra termina con "r"
    const hasWordEndingWithR = (text: string) => text.split(' ').some(word => word.endsWith('r'));

    // Función para revisar si alguna palabra posee "qu"
    const hasWordWithQU = (text: string) => text.split(' ').some(word => word.includes('qu'));

    // Función para remover la "s" final de cada palabra, si existe
    const removeFinalSFromWords = (text: string) => {
        return text.split(' ').map(word => word.endsWith('s') ? word.slice(0, -1) : word).join(' ');
    };

    // Función para remover la "r" final de cada palabra, si existe
    const removeFinalRFromWords = (text: string) => {
        return text.split(' ').map(word => word.endsWith('r') ? word.slice(0, -1) : word).join(' ');
    };

    // Función para reemplazar la "qu" por "k", si existe
    const replaceQUWithK = (text: string) => {
        return text.split(' ').map(word => word.replace(/qu/g, 'k')).join(' ');
    };

    // Función para omitir la "h" al inicio de las palabras, si existe
    const omitInitialHFromWords = (text: string) => {
        return text.split(' ').map(word => word.startsWith('h') ? word.slice(1) : word).join(' ');
    };

    // Función para reemplazar "ll" por "y"
    const replaceLLWithY = (text: string) => {
        return text.replace(/ll/g, 'y');
    };

    // Función para reemplazar "para" por "pa"
    const replaceParaWithPa = (text: string) => {
        return text.replace(/\bpara\b/g, 'pa');
    };

    // Normalizar el texto antes de analizarlo
    let normalizedUtterance = normalizeText(utterance.utterance);

    // Revisa si el utterance normalizado tiene palabras que terminan en "s"
    if (hasWordEndingWithS(normalizedUtterance)) {
        alternatives.add(removeFinalSFromWords(normalizedUtterance));
    }
    // Revisa si el utterance normalizado tiene palabras que terminan en "r"
    if (hasWordEndingWithR(normalizedUtterance)) {
        alternatives.add(removeFinalRFromWords(normalizedUtterance));
    }
    // Revisa si el utterance normalizado tiene palabras con "qu"
    if (hasWordWithQU(normalizedUtterance)) {
        alternatives.add(replaceQUWithK(normalizedUtterance));
    }
    // Revisa si el utterance normalizado tiene palabras que comienzan con "h"
    if (normalizedUtterance.includes(' h') || normalizedUtterance.startsWith('h')) {
        alternatives.add(omitInitialHFromWords(normalizedUtterance));
    }
    // Revisa si el utterance normalizado tiene "ll"
    if (normalizedUtterance.includes('ll')) {
        alternatives.add(replaceLLWithY(normalizedUtterance));
    }
    // Revisa si el utterance normalizado contiene "para"
    if (normalizedUtterance.includes('para')) {
        alternatives.add(replaceParaWithPa(normalizedUtterance));
    }

    // Convertir Set a Array para retornar
    return Array.from(alternatives);
};
