import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CalorieContext = createContext(null);

const getDateStr = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

const getWeekDates = (centerDate = new Date()) => {
    const dates = [];
    const start = new Date(centerDate);
    start.setDate(start.getDate() - 3);
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        dates.push(getDateStr(d));
    }
    return dates;
};

const DEFAULT_BUTTONS = [
    { id: '1', name: 'Rice', emoji: '🍚', caloriesPerUnit: 200, proteinPerUnit: 4, carbsPerUnit: 45, fatsPerUnit: 0.5, fiberPerUnit: 1, unit: 'bowl' },
    { id: '2', name: 'Roti', emoji: '🫓', caloriesPerUnit: 120, proteinPerUnit: 3, carbsPerUnit: 20, fatsPerUnit: 3.5, fiberPerUnit: 2, unit: 'piece' },
    { id: '3', name: 'Dal', emoji: '🍲', caloriesPerUnit: 150, proteinPerUnit: 9, carbsPerUnit: 20, fatsPerUnit: 3, fiberPerUnit: 4, unit: 'bowl' },
    { id: '4', name: 'Chicken', emoji: '🍗', caloriesPerUnit: 250, proteinPerUnit: 30, carbsPerUnit: 0, fatsPerUnit: 14, fiberPerUnit: 0, unit: 'serving' },
    { id: '5', name: 'Egg', emoji: '🥚', caloriesPerUnit: 75, proteinPerUnit: 6, carbsPerUnit: 1, fatsPerUnit: 5, fiberPerUnit: 0, unit: 'piece' },
    { id: '6', name: 'Milk', emoji: '🥛', caloriesPerUnit: 150, proteinPerUnit: 8, carbsPerUnit: 12, fatsPerUnit: 8, fiberPerUnit: 0, unit: 'glass' },
];

const loadState = () => {
    try {
        const saved = localStorage.getItem('calai-state');
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load state:', e);
    }
    return null;
};

const saveState = (state) => {
    try {
        localStorage.setItem('calai-state', JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save state:', e);
    }
};

// Map of default macro values by button id for migration
const DEFAULT_MACROS = {
    '1': { proteinPerUnit: 4, carbsPerUnit: 45, fatsPerUnit: 0.5, fiberPerUnit: 1 },   // Rice
    '2': { proteinPerUnit: 3, carbsPerUnit: 20, fatsPerUnit: 3.5, fiberPerUnit: 2 },   // Roti
    '3': { proteinPerUnit: 9, carbsPerUnit: 20, fatsPerUnit: 3, fiberPerUnit: 4 },     // Dal
    '4': { proteinPerUnit: 30, carbsPerUnit: 0, fatsPerUnit: 14, fiberPerUnit: 0 },    // Chicken
    '5': { proteinPerUnit: 6, carbsPerUnit: 1, fatsPerUnit: 5, fiberPerUnit: 0 },      // Egg
    '6': { proteinPerUnit: 8, carbsPerUnit: 12, fatsPerUnit: 8, fiberPerUnit: 0 },     // Milk
};

const migrateButtons = (buttons) => {
    return buttons.map(btn => {
        if (btn.proteinPerUnit !== undefined) return btn; // already migrated
        const defaults = DEFAULT_MACROS[btn.id] || { proteinPerUnit: 0, carbsPerUnit: 0, fatsPerUnit: 0, fiberPerUnit: 0 };
        return { ...btn, ...defaults };
    });
};

export function CalorieProvider({ children }) {
    const savedState = loadState();

    const [activeDate, setActiveDate] = useState(getDateStr());
    const [dailyLogs, setDailyLogs] = useState(savedState?.dailyLogs || {});
    const [buttons, setButtons] = useState(() => migrateButtons(savedState?.buttons || DEFAULT_BUTTONS));
    const [maintenanceCalories, setMaintenanceCalories] = useState(savedState?.maintenanceCalories || 2000);
    const [groqApiKey, setGroqApiKey] = useState(savedState?.groqApiKey || '');
    const [currentView, setCurrentView] = useState('home'); // 'home' | 'weekly' | 'settings'

    // Save to localStorage whenever state changes
    useEffect(() => {
        saveState({ dailyLogs, buttons, maintenanceCalories, groqApiKey });
    }, [dailyLogs, buttons, maintenanceCalories, groqApiKey]);

    const getDayLog = useCallback((dateStr) => {
        return dailyLogs[dateStr] || { meals: [], buttonQuantities: {}, totalCalories: 0 };
    }, [dailyLogs]);

    const currentDayLog = getDayLog(activeDate);

    const updateButtonQuantity = useCallback((buttonId, delta) => {
        setDailyLogs(prev => {
            const dayLog = prev[activeDate] || { meals: [], buttonQuantities: {}, totalCalories: 0 };
            const currentQty = dayLog.buttonQuantities[buttonId] || 0;
            const newQty = Math.max(0, currentQty + delta);

            const button = buttons.find(b => b.id === buttonId);
            if (!button) return prev;

            const qtyDiff = newQty - currentQty;
            const calDiff = qtyDiff * button.caloriesPerUnit;

            return {
                ...prev,
                [activeDate]: {
                    ...dayLog,
                    buttonQuantities: { ...dayLog.buttonQuantities, [buttonId]: newQty },
                    totalCalories: dayLog.totalCalories + calDiff,
                }
            };
        });
    }, [activeDate, buttons]);

    const addMeal = useCallback((meal) => {
        // meal: { type, description, totalCalories, items: [{name, calories}], explanation }
        const isExercise = meal.type === 'exercise';
        const calorieDelta = isExercise ? -meal.totalCalories : meal.totalCalories;
        setDailyLogs(prev => {
            const dayLog = prev[activeDate] || { meals: [], buttonQuantities: {}, totalCalories: 0 };
            return {
                ...prev,
                [activeDate]: {
                    ...dayLog,
                    meals: [...dayLog.meals, { ...meal, timestamp: new Date().toISOString() }],
                    totalCalories: Math.max(0, dayLog.totalCalories + calorieDelta),
                }
            };
        });
    }, [activeDate]);

    const removeMeal = useCallback((mealIndex) => {
        setDailyLogs(prev => {
            const dayLog = prev[activeDate];
            if (!dayLog) return prev;
            const meal = dayLog.meals[mealIndex];
            if (!meal) return prev;
            const isExercise = meal.type === 'exercise';
            const calorieDelta = isExercise ? -meal.totalCalories : meal.totalCalories;
            const newMeals = [...dayLog.meals];
            newMeals.splice(mealIndex, 1);
            return {
                ...prev,
                [activeDate]: {
                    ...dayLog,
                    meals: newMeals,
                    totalCalories: Math.max(0, dayLog.totalCalories - calorieDelta),
                }
            };
        });
    }, [activeDate]);

    const addButton = useCallback((button) => {
        setButtons(prev => [...prev, { ...button, id: Date.now().toString() }]);
    }, []);

    const removeButton = useCallback((buttonId) => {
        setButtons(prev => prev.filter(b => b.id !== buttonId));
    }, []);

    const updateButton = useCallback((buttonId, updates) => {
        setButtons(prev => prev.map(b => b.id === buttonId ? { ...b, ...updates } : b));
    }, []);

    const getButtonCalories = useCallback(() => {
        const dayLog = getDayLog(activeDate);
        let total = 0;
        for (const btn of buttons) {
            const qty = dayLog.buttonQuantities[btn.id] || 0;
            total += qty * btn.caloriesPerUnit;
        }
        return total;
    }, [activeDate, buttons, getDayLog]);

    const getWeeklySummary = useCallback(() => {
        const weekDates = getWeekDates(new Date(activeDate));
        return weekDates.map(dateStr => {
            const log = getDayLog(dateStr);
            const diff = log.totalCalories - maintenanceCalories;
            return {
                date: dateStr,
                totalCalories: log.totalCalories,
                maintenance: maintenanceCalories,
                difference: diff,
                status: log.totalCalories === 0 ? 'empty' : diff > 0 ? 'surplus' : 'deficit',
            };
        });
    }, [activeDate, getDayLog, maintenanceCalories]);

    const value = {
        activeDate,
        setActiveDate,
        currentDayLog,
        dailyLogs,
        buttons,
        maintenanceCalories,
        setMaintenanceCalories,
        groqApiKey,
        setGroqApiKey,
        currentView,
        setCurrentView,
        updateButtonQuantity,
        addMeal,
        removeMeal,
        addButton,
        removeButton,
        updateButton,
        getButtonCalories,
        getWeeklySummary,
        getDayLog,
        getDateStr,
        getWeekDates,
    };

    return (
        <CalorieContext.Provider value={value}>
            {children}
        </CalorieContext.Provider>
    );
}

export function useCalorie() {
    const context = useContext(CalorieContext);
    if (!context) throw new Error('useCalorie must be used within CalorieProvider');
    return context;
}
