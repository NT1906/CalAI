import { useCalorie } from '../context/CalorieContext';
import './CalorieDashboard.css';

export default function CalorieDashboard() {
    const { currentDayLog, maintenanceCalories, removeMeal, buttons } = useCalorie();
    const consumed = currentDayLog.totalCalories;
    const remaining = maintenanceCalories - consumed;
    const percentage = Math.min((consumed / maintenanceCalories) * 100, 100);

    // SVG circle params
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Color based on percentage
    let ringColor = 'var(--color-success)';
    let statusText = 'On Track';
    if (percentage >= 90 && percentage < 100) {
        ringColor = 'var(--color-warning)';
        statusText = 'Almost There';
    } else if (percentage >= 100) {
        ringColor = 'var(--color-danger)';
        statusText = 'Over Limit';
    }

    const buttonCalorieEntries = buttons
        .filter(btn => (currentDayLog.buttonQuantities[btn.id] || 0) > 0)
        .map(btn => {
            const qty = currentDayLog.buttonQuantities[btn.id];
            return {
                name: `${btn.emoji} ${btn.name} × ${qty}`,
                calories: qty * btn.caloriesPerUnit,
            };
        });

    return (
        <div className="calorie-dashboard">
            <div className="section-header" style={{ padding: '0 var(--space-4)' }}>
                <h2 className="section-title">Today's Progress</h2>
            </div>

            <div className="dashboard-ring-container glass-card">
                <div className="ring-wrapper">
                    <svg className="progress-ring" viewBox="0 0 160 160">
                        {/* Background ring */}
                        <circle
                            cx="80" cy="80" r={radius}
                            fill="none"
                            stroke="var(--border-glass)"
                            strokeWidth="8"
                        />
                        {/* Progress ring */}
                        <circle
                            cx="80" cy="80" r={radius}
                            fill="none"
                            stroke={ringColor}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            style={{
                                transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease',
                                transform: 'rotate(-90deg)',
                                transformOrigin: '50% 50%',
                                filter: `drop-shadow(0 0 8px ${ringColor})`,
                            }}
                        />
                    </svg>
                    <div className="ring-center">
                        <div className="ring-consumed">{consumed}</div>
                        <div className="ring-divider">of {maintenanceCalories}</div>
                        <div className="ring-unit">kcal</div>
                    </div>
                </div>

                <div className="dashboard-stats">
                    <div className="stat-item">
                        <span className="stat-label">Remaining</span>
                        <span className={`stat-value ${remaining < 0 ? 'over' : ''}`}>
                            {remaining >= 0 ? remaining : `+${Math.abs(remaining)}`}
                        </span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-label">Status</span>
                        <span className="stat-value status" style={{ color: ringColor }}>{statusText}</span>
                    </div>
                </div>
            </div>

            {/* Logged items */}
            {(buttonCalorieEntries.length > 0 || currentDayLog.meals.length > 0) && (
                <div className="logged-items" style={{ padding: '0 var(--space-4)' }}>
                    <h3 className="logged-title">Today's Log</h3>

                    {buttonCalorieEntries.map((entry, i) => (
                        <div key={`btn-${i}`} className="logged-item glass-card">
                            <div className="logged-item-info">
                                <span className="logged-item-name">{entry.name}</span>
                                <span className="logged-item-type">Quick Track</span>
                            </div>
                            <span className="logged-item-cal">{entry.calories} kcal</span>
                        </div>
                    ))}

                    {currentDayLog.meals.map((meal, i) => {
                        const isExercise = meal.type === 'exercise';
                        return (
                        <div key={`meal-${i}`} className={`logged-item glass-card ${isExercise ? 'logged-exercise' : ''}`}>
                            <div className="logged-item-info">
                                <span className="logged-item-name">{meal.description}</span>
                                <span className="logged-item-type">{isExercise ? 'Exercise' : 'AI Estimated'}</span>
                            </div>
                            <div className="logged-item-right">
                                <span className={`logged-item-cal ${isExercise ? 'exercise-burned' : ''}`}>
                                    {isExercise ? `-${meal.totalCalories}` : meal.totalCalories} kcal
                                </span>
                                <button
                                    className="logged-item-remove"
                                    onClick={() => removeMeal(i)}
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
