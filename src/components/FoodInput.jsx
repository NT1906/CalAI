import { useState } from 'react';
import { useCalorie } from '../context/CalorieContext';
import { estimateCalories } from '../services/groqService';
import './FoodInput.css';

export default function FoodInput() {
    const { groqApiKey, buttons, currentDayLog, addMeal, setCurrentView } = useCalorie();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!input.trim()) return;

        if (!groqApiKey) {
            setError('Please set your Groq API key in Settings first.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Build button items with current quantities
            const buttonItems = buttons.map(btn => ({
                name: btn.name,
                quantity: currentDayLog.buttonQuantities[btn.id] || 0,
                caloriesPerUnit: btn.caloriesPerUnit,
                unit: btn.unit,
            }));

            const response = await estimateCalories({
                userInput: input.trim(),
                buttonItems,
                previousMeals: currentDayLog.meals,
                apiKey: groqApiKey,
            });

            setResult(response);
        } catch (err) {
            setError(err.message || 'Failed to estimate calories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (!result) return;
        addMeal({
            description: input.trim(),
            totalCalories: result.totalCalories,
            items: result.items,
            explanation: result.explanation,
        });
        setInput('');
        setResult(null);
    };

    const handleDiscard = () => {
        setResult(null);
    };

    return (
        <div className="food-input-section">
            <div className="section-header">
                <h2 className="section-title">🤖 AI Estimate</h2>
                <span className="section-subtitle">Describe your meal</span>
            </div>

            <div className="food-input-container glass-card">
                <textarea
                    className="food-textarea"
                    placeholder="e.g., I had 2 parathas with butter, a bowl of curd, and a cup of tea with sugar..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={3}
                    disabled={loading}
                />

                <div className="food-input-actions">
                    {!groqApiKey && (
                        <button className="api-key-hint" onClick={() => setCurrentView('settings')}>
                            ⚙️ Set API Key
                        </button>
                    )}
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={!input.trim() || loading}
                    >
                        {loading ? (
                            <span className="loading-dots">
                                <span>●</span><span>●</span><span>●</span>
                            </span>
                        ) : (
                            '✨ Estimate Calories'
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="food-error animate-fade-in">
                    <span>⚠️</span> {error}
                </div>
            )}

            {result && (
                <div className="food-result glass-card animate-slide-up">
                    <div className="result-header">
                        <div className="result-total">
                            <span className="result-cal-num">{result.totalCalories}</span>
                            <span className="result-cal-unit">kcal</span>
                        </div>
                        <div className="result-label">Estimated total</div>
                    </div>

                    {result.items && result.items.length > 0 && (
                        <div className="result-items">
                            {result.items.map((item, i) => (
                                <div key={i} className="result-item">
                                    <span className="result-item-name">{item.name}</span>
                                    <span className="result-item-cal">{item.calories} kcal</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {result.explanation && (
                        <div className="result-explanation">{result.explanation}</div>
                    )}

                    <div className="result-actions">
                        <button className="modal-btn cancel" onClick={handleDiscard}>Discard</button>
                        <button className="modal-btn confirm" onClick={handleConfirm}>✓ Add to Log</button>
                    </div>
                </div>
            )}
        </div>
    );
}
