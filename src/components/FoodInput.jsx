import { useState, useRef } from 'react';
import { useCalorie } from '../context/CalorieContext';
import { estimateCalories, estimateCaloriesFromImage } from '../services/groqService';
import './FoodInput.css';

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function FoodInput() {
    const { groqApiKey, buttons, currentDayLog, addMeal, setCurrentView } = useCalorie();
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file.');
            return;
        }

        if (file.size > 20 * 1024 * 1024) {
            setError('Image must be smaller than 20MB.');
            return;
        }

        setImageFile(file);
        setError('');
        const url = URL.createObjectURL(file);
        setImagePreview(url);
    };

    const removeImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() && !imageFile) return;

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

            let response;

            if (imageFile) {
                const base64 = await fileToBase64(imageFile);
                response = await estimateCaloriesFromImage({
                    imageBase64: base64,
                    mimeType: imageFile.type,
                    userInput: input.trim(),
                    buttonItems,
                    previousMeals: currentDayLog.meals,
                    apiKey: groqApiKey,
                });
            } else {
                response = await estimateCalories({
                    userInput: input.trim(),
                    buttonItems,
                    previousMeals: currentDayLog.meals,
                    apiKey: groqApiKey,
                });
            }

            setResult(response);
        } catch (err) {
            setError(err.message || 'Failed to estimate calories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (!result) return;
        const isExercise = result.type === 'exercise';
        const description = imageFile
            ? (input.trim() || '📷 Food from image')
            : input.trim();
        addMeal({
            type: result.type || 'food',
            description: isExercise ? `🏋️ ${description}` : description,
            totalCalories: result.totalCalories,
            totalProtein: result.totalProtein || 0,
            totalCarbs: result.totalCarbs || 0,
            totalFats: result.totalFats || 0,
            totalFiber: result.totalFiber || 0,
            items: result.items,
            explanation: result.explanation,
        });
        setInput('');
        setResult(null);
        removeImage();
    };

    const handleDiscard = () => {
        setResult(null);
    };

    return (
        <div className="food-input-section">
            <div className="section-header">
                <h2 className="section-title">🤖 AI Estimate</h2>
                <span className="section-subtitle">Describe your meal or exercise</span>
            </div>

            <div className="food-input-container glass-card">
                <textarea
                    className="food-textarea"
                    placeholder={imageFile
                        ? "Optionally add details about the food in the image..."
                        : "e.g., 2 parathas with butter... or ran for 30 minutes..."}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={3}
                    disabled={loading}
                />

                {imagePreview && (
                    <div className="image-preview-container animate-fade-in">
                        <img src={imagePreview} alt="Food preview" className="image-preview" />
                        <button
                            className="image-remove-btn"
                            onClick={removeImage}
                            disabled={loading}
                            title="Remove image"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="image-file-input"
                    disabled={loading}
                />

                <div className="food-input-actions">
                    {!groqApiKey && (
                        <button className="api-key-hint" onClick={() => setCurrentView('settings')}>
                            ⚙️ Set API Key
                        </button>
                    )}
                    <button
                        className="upload-image-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        title="Upload food image"
                    >
                        📷 {imageFile ? 'Change Image' : 'Add Image'}
                    </button>
                    <button
                        className="submit-btn"
                        onClick={handleSubmit}
                        disabled={(!input.trim() && !imageFile) || loading}
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
                <div className={`food-result glass-card animate-slide-up ${result.type === 'exercise' ? 'exercise-result' : ''}`}>
                    <div className="result-header">
                        <div className="result-total">
                            <span className={`result-cal-num ${result.type === 'exercise' ? 'exercise-cal' : ''}`}>
                                {result.type === 'exercise' ? '-' : ''}{result.totalCalories}
                            </span>
                            <span className="result-cal-unit">kcal</span>
                        </div>
                        <div className="result-label">
                            {result.type === 'exercise' ? '🔥 Estimated calories burned' : 'Estimated total'}
                        </div>
                    </div>

                    {/* Macro summary pills (only for food) */}
                    {result.type !== 'exercise' && (
                    <div className="result-macros-summary">
                        <div className="macro-pill protein">
                            <span className="macro-pill-value">{result.totalProtein || 0}g</span>
                            <span className="macro-pill-label">Protein</span>
                        </div>
                        <div className="macro-pill carbs">
                            <span className="macro-pill-value">{result.totalCarbs || 0}g</span>
                            <span className="macro-pill-label">Carbs</span>
                        </div>
                        <div className="macro-pill fats">
                            <span className="macro-pill-value">{result.totalFats || 0}g</span>
                            <span className="macro-pill-label">Fats</span>
                        </div>
                        <div className="macro-pill fiber">
                            <span className="macro-pill-value">{result.totalFiber || 0}g</span>
                            <span className="macro-pill-label">Fiber</span>
                        </div>
                    </div>
                    )}

                    {result.items && result.items.length > 0 && (
                        <div className="result-items">
                            <div className="result-items-header">
                                <span className="ri-name">Item</span>
                                <span className="ri-cal">Cal</span>
                                <span className="ri-macro">P</span>
                                <span className="ri-macro">C</span>
                                <span className="ri-macro">F</span>
                            </div>
                            {result.items.map((item, i) => (
                                <div key={i} className="result-item">
                                    <span className="result-item-name">{item.name}</span>
                                    <span className="result-item-cal">{item.calories}</span>
                                    <span className="result-item-macro">{item.protein || 0}g</span>
                                    <span className="result-item-macro">{item.carbs || 0}g</span>
                                    <span className="result-item-macro">{item.fats || 0}g</span>
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
