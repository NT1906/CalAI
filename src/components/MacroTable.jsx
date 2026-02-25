import { useCalorie } from '../context/CalorieContext';
import './MacroTable.css';

export default function MacroTable() {
    const { currentDayLog, buttons } = useCalorie();

    // Collect all macro entries from AI-estimated meals
    const mealEntries = currentDayLog.meals.map((meal) => ({
        name: meal.description,
        calories: meal.totalCalories || 0,
        protein: meal.totalProtein || 0,
        carbs: meal.totalCarbs || 0,
        fats: meal.totalFats || 0,
        fiber: meal.totalFiber || 0,
        items: meal.items || [],
        type: 'meal',
    }));

    // Collect quick-tracked button entries with macros
    const buttonEntries = buttons
        .filter(btn => (currentDayLog.buttonQuantities[btn.id] || 0) > 0)
        .map(btn => {
            const qty = currentDayLog.buttonQuantities[btn.id];
            return {
                name: `${btn.emoji} ${btn.name} × ${qty}`,
                calories: qty * btn.caloriesPerUnit,
                protein: qty * (btn.proteinPerUnit || 0),
                carbs: qty * (btn.carbsPerUnit || 0),
                fats: qty * (btn.fatsPerUnit || 0),
                fiber: qty * (btn.fiberPerUnit || 0),
                items: [],
                type: 'button',
            };
        });

    const allEntries = [...buttonEntries, ...mealEntries];

    // Compute daily totals
    const dailyTotals = allEntries.reduce(
        (acc, entry) => ({
            calories: acc.calories + entry.calories,
            protein: acc.protein + entry.protein,
            carbs: acc.carbs + entry.carbs,
            fats: acc.fats + entry.fats,
            fiber: acc.fiber + entry.fiber,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );

    if (allEntries.length === 0) {
        return null;
    }

    return (
        <div className="macro-table-section">
            <div className="section-header">
                <h2 className="section-title">📊 Daily Macros</h2>
                <span className="section-subtitle">Nutrition breakdown</span>
            </div>

            {/* Daily totals bar */}
            <div className="macro-totals glass-card">
                <div className="macro-total-item">
                    <span className="mt-value calories">{dailyTotals.calories}</span>
                    <span className="mt-label">kcal</span>
                </div>
                <div className="macro-total-divider" />
                <div className="macro-total-item">
                    <span className="mt-value protein">{dailyTotals.protein}g</span>
                    <span className="mt-label">Protein</span>
                </div>
                <div className="macro-total-divider" />
                <div className="macro-total-item">
                    <span className="mt-value carbs">{dailyTotals.carbs}g</span>
                    <span className="mt-label">Carbs</span>
                </div>
                <div className="macro-total-divider" />
                <div className="macro-total-item">
                    <span className="mt-value fats">{dailyTotals.fats}g</span>
                    <span className="mt-label">Fats</span>
                </div>
                <div className="macro-total-divider" />
                <div className="macro-total-item">
                    <span className="mt-value fiber">{dailyTotals.fiber}g</span>
                    <span className="mt-label">Fiber</span>
                </div>
            </div>

            {/* Macro bar chart */}
            {(dailyTotals.protein + dailyTotals.carbs + dailyTotals.fats) > 0 && (
                <div className="macro-bar-container glass-card">
                    <div className="macro-bar">
                        {dailyTotals.protein > 0 && (
                            <div
                                className="macro-bar-segment protein"
                                style={{ flex: dailyTotals.protein * 4 }}
                                title={`Protein: ${dailyTotals.protein}g (${dailyTotals.protein * 4} kcal)`}
                            />
                        )}
                        {dailyTotals.carbs > 0 && (
                            <div
                                className="macro-bar-segment carbs"
                                style={{ flex: dailyTotals.carbs * 4 }}
                                title={`Carbs: ${dailyTotals.carbs}g (${dailyTotals.carbs * 4} kcal)`}
                            />
                        )}
                        {dailyTotals.fats > 0 && (
                            <div
                                className="macro-bar-segment fats"
                                style={{ flex: dailyTotals.fats * 9 }}
                                title={`Fats: ${dailyTotals.fats}g (${dailyTotals.fats * 9} kcal)`}
                            />
                        )}
                    </div>
                    <div className="macro-bar-legend">
                        <span className="legend-item"><span className="legend-dot protein" /> Protein {Math.round((dailyTotals.protein * 4) / Math.max(dailyTotals.calories, 1) * 100)}%</span>
                        <span className="legend-item"><span className="legend-dot carbs" /> Carbs {Math.round((dailyTotals.carbs * 4) / Math.max(dailyTotals.calories, 1) * 100)}%</span>
                        <span className="legend-item"><span className="legend-dot fats" /> Fats {Math.round((dailyTotals.fats * 9) / Math.max(dailyTotals.calories, 1) * 100)}%</span>
                    </div>
                </div>
            )}

            {/* Per-food breakdown table */}
            <div className="macro-table-container glass-card">
                <div className="macro-table">
                    <div className="macro-table-head">
                        <span className="mt-cell name">Food</span>
                        <span className="mt-cell num">Cal</span>
                        <span className="mt-cell num">P(g)</span>
                        <span className="mt-cell num">C(g)</span>
                        <span className="mt-cell num">F(g)</span>
                        <span className="mt-cell num">Fib(g)</span>
                    </div>

                    {allEntries.map((entry, i) => (
                        <div key={i} className="macro-table-group">
                            <div className="macro-table-row meal-row">
                                <span className="mt-cell name" title={entry.name}>
                                    {entry.name}
                                </span>
                                <span className="mt-cell num bold">{entry.calories}</span>
                                <span className="mt-cell num protein-text">{entry.protein}</span>
                                <span className="mt-cell num carbs-text">{entry.carbs}</span>
                                <span className="mt-cell num fats-text">{entry.fats}</span>
                                <span className="mt-cell num fiber-text">{entry.fiber}</span>
                            </div>
                            {entry.type === 'meal' && entry.items && entry.items.length > 1 && (
                                entry.items.map((item, j) => (
                                    <div key={j} className="macro-table-row sub-row">
                                        <span className="mt-cell name sub">{item.name}</span>
                                        <span className="mt-cell num sub">{item.calories}</span>
                                        <span className="mt-cell num sub">{item.protein || 0}</span>
                                        <span className="mt-cell num sub">{item.carbs || 0}</span>
                                        <span className="mt-cell num sub">{item.fats || 0}</span>
                                        <span className="mt-cell num sub">{item.fiber || 0}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    ))}

                    {/* Totals row */}
                    <div className="macro-table-row total-row">
                        <span className="mt-cell name">Daily Total</span>
                        <span className="mt-cell num bold">{dailyTotals.calories}</span>
                        <span className="mt-cell num bold protein-text">{dailyTotals.protein}</span>
                        <span className="mt-cell num bold carbs-text">{dailyTotals.carbs}</span>
                        <span className="mt-cell num bold fats-text">{dailyTotals.fats}</span>
                        <span className="mt-cell num bold fiber-text">{dailyTotals.fiber}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
