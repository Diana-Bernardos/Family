import React from 'react';

function MonthSelector({ currentDate, onMonthChange }) {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const handlePrevMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() - 1);
        onMonthChange(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + 1);
        onMonthChange(newDate);
    };

    return (
        <div className="month-selector">
            <button onClick={handlePrevMonth}>&lt;</button>
            <span>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={handleNextMonth}>&gt;</button>
        </div>
    );
}

export default MonthSelector;