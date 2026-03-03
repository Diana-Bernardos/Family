// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
    // Estado para almacenar nuestro valor
    // Pasar la función inicial al useState para que solo se ejecute una vez
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Obtener del localStorage por key
            const item = window.localStorage.getItem(key);
            // Analizar el JSON almacenado o devolver el valor inicial
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Devolver una versión envuelta de la función setter de useState que ...
    // ... persiste el nuevo valor en localStorage.
    const setValue = value => {
        try {
            // Permitir que el valor sea una función para que tengamos la misma API que useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            // Guardar el estado
            setStoredValue(valueToStore);
            // Guardar en localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
};