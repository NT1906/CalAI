import { useCalorie } from '../context/CalorieContext';
import './WeeklySummary.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeeklySummary() {
    const { getWeeklySummary, maintenanceCalories, setActiveDate, setCurrentView, getDateStr } = useCalorie();
    const summary = getWeeklySummary();
    const today = getDateStr();

    const maxCal = Math.max(
        maintenanceCalories,
        ...summary.map(d => d.totalCalories)
    );

    const totalDifference = summary.reduce((sum, day) => {
        if (day.status === 'empty') return sum;
        return sum + day.difference;
    }, 0);

    const activeDays = summary.filter(d => d.status !== 'empty').length;

    const handleDayClick = (dateStr) => {
        setActiveDate(dateStr);
        setCurrentView('home');
    };

    return (
        <div className="weekly-summary">
            <div className="weekly-header">
                <h2 className="section-title" style={{ padding: '0 var(--space-4)' }}>Weekly Overview</h2>
            </div>

            {/* Summary card */}
            <div className="weekly-totals glass-card" style={{ margin: '0 var(--space-4)', marginBottom: 'var(--space-5)' }}>
                <div className="weekly-total-main">
                    <span className={`weekly-total-num ${totalDifference > 0 ? 'surplus' : 'deficit'}`}>
                        {totalDifference > 0 ? '+' : ''}{totalDifference}
                    </span>
                    <span className="weekly-total-unit">kcal</span>
                </div>
                <div className="weekly-total-label">
                    {totalDifference >= 0 ? 'Surplus' : 'Deficit'} this week
                    {activeDays > 0 && ` (${activeDays} day${activeDays !== 1 ? 's' : ''} tracked)`}
                </div>
            </div>

            {/* Bar chart */}
            <div className="weekly-chart glass-card" style={{ margin: '0 var(--space-4)' }}>
                <div className="chart-bars">
                    {summary.map((day) => {
                        const date = new Date(day.date + 'T12:00:00');
                        const dayName = DAY_NAMES[date.getDay()];
                        const dayNum = date.getDate();
                        const barHeight = maxCal > 0 ? (day.totalCalories / maxCal) * 100 : 0;
                        const maintenanceLine = maxCal > 0 ? (maintenanceCalories / maxCal) * 100 : 0;
                        const isToday = day.date === today;

                        return (
                            <button
                                key={day.date}
                                className={`chart-bar-group ${isToday ? 'today' : ''}`}
                                onClick={() => handleDayClick(day.date)}
                            >
                                <div className="chart-bar-wrapper">
                                    {/* Maintenance line */}
                                    <div
                                        className="maintenance-line"
                                        style={{ bottom: `${maintenanceLine}%` }}
                                    ></div>
                                    {/* Bar */}
                                    <div
                                        className={`chart-bar ${day.status}`}
                                        style={{
                                            height: `${barHeight}%`,
                                            transition: 'height 0.5s ease',
                                        }}
                                    ></div>
                                </div>
                                <div className="chart-label">{dayName}</div>
                                <div className="chart-date">{dayNum}</div>
                                {day.status !== 'empty' && (
                                    <div className={`chart-cal ${day.status}`}>
                                        {day.totalCalories}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-dot deficit"></span>
                        <span>Deficit</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-dot surplus"></span>
                        <span>Surplus</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-line"></span>
                        <span>Maintenance ({maintenanceCalories})</span>
                    </div>
                </div>
            </div>

            {/* Daily breakdown */}
            <div className="weekly-breakdown" style={{ padding: '0 var(--space-4)', marginTop: 'var(--space-5)' }}>
                <h3 className="logged-title">Daily Breakdown</h3>
                {summary.map((day) => {
                    const date = new Date(day.date + 'T12:00:00');
                    const dayName = DAY_NAMES[date.getDay()];
                    const dayNum = date.getDate();
                    const isToday = day.date === today;

                    return (
                        <button
                            key={day.date}
                            className="breakdown-item glass-card"
                            onClick={() => handleDayClick(day.date)}
                        >
                            <div className="breakdown-date">
                                <span className="breakdown-day">{dayName}</span>
                                <span className="breakdown-num">{dayNum}</span>
                                {isToday && <span className="breakdown-today">Today</span>}
                            </div>
                            <div className="breakdown-right">
                                {day.status === 'empty' ? (
                                    <span className="breakdown-empty">No data</span>
                                ) : (
                                    <>
                                        <span className="breakdown-cal">{day.totalCalories} kcal</span>
                                        <span className={`breakdown-diff ${day.status}`}>
                                            {day.difference > 0 ? '+' : ''}{day.difference}
                                        </span>
                                    </>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
