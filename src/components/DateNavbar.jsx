import { useCalorie } from '../context/CalorieContext';
import './DateNavbar.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DateNavbar() {
    const { activeDate, setActiveDate, getWeekDates, getDateStr, getDayLog, maintenanceCalories } = useCalorie();
    const weekDates = getWeekDates(new Date(activeDate + 'T12:00:00'));
    const today = getDateStr();

    return (
        <nav className="date-navbar">
            <div className="date-navbar-scroll">
                {weekDates.map((dateStr) => {
                    const date = new Date(dateStr + 'T12:00:00');
                    const dayName = DAY_NAMES[date.getDay()];
                    const dayNum = date.getDate();
                    const monthName = MONTH_NAMES[date.getMonth()];
                    const isActive = dateStr === activeDate;
                    const isToday = dateStr === today;
                    const dayLog = getDayLog(dateStr);
                    const hasData = dayLog.totalCalories > 0;
                    const isOver = dayLog.totalCalories > maintenanceCalories;

                    return (
                        <button
                            key={dateStr}
                            className={`date-item ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
                            onClick={() => setActiveDate(dateStr)}
                        >
                            <span className="date-day-name">{dayName}</span>
                            <span className="date-day-num">{dayNum}</span>
                            <span className="date-month">{monthName}</span>
                            {hasData && (
                                <span className={`date-dot ${isOver ? 'over' : 'under'}`}></span>
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
