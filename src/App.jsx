import { useCalorie } from './context/CalorieContext';
import DateNavbar from './components/DateNavbar';
import QuickButtons from './components/QuickButtons';
import FoodInput from './components/FoodInput';
import MacroTable from './components/MacroTable';
import CalorieDashboard from './components/CalorieDashboard';
import WeeklySummary from './components/WeeklySummary';
import Settings from './components/Settings';
import './App.css';

function App() {
  const { currentView, setCurrentView } = useCalorie();

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">🔥</span>
          <span className="logo-text">Cal<span className="logo-accent">AI</span></span>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {currentView === 'home' && (
          <div className="view-home animate-fade-in">
            <DateNavbar />
            <CalorieDashboard />
            <QuickButtons />
            <FoodInput />
            <MacroTable />
          </div>
        )}

        {currentView === 'weekly' && (
          <div className="view-weekly animate-fade-in">
            <WeeklySummary />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="view-settings animate-fade-in">
            <Settings />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="app-bottom-nav">
        <button
          className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentView('home')}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Home</span>
        </button>
        <button
          className={`nav-item ${currentView === 'weekly' ? 'active' : ''}`}
          onClick={() => setCurrentView('weekly')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Weekly</span>
        </button>
        <button
          className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentView('settings')}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
