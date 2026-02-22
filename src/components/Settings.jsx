import { useState } from 'react';
import { useCalorie } from '../context/CalorieContext';
import './Settings.css';

export default function Settings() {
    const {
        maintenanceCalories, setMaintenanceCalories,
        groqApiKey, setGroqApiKey,
        buttons, addButton, removeButton, updateButton,
    } = useCalorie();

    const [showKey, setShowKey] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBtn, setNewBtn] = useState({ name: '', emoji: '🍽️', caloriesPerUnit: '', unit: 'serving' });

    const handleAddButton = () => {
        if (!newBtn.name || !newBtn.caloriesPerUnit) return;
        addButton({ ...newBtn, caloriesPerUnit: Number(newBtn.caloriesPerUnit) });
        setNewBtn({ name: '', emoji: '🍽️', caloriesPerUnit: '', unit: 'serving' });
        setShowAddForm(false);
    };

    const startEdit = (btn) => {
        setEditingId(btn.id);
        setEditForm({ ...btn });
    };

    const saveEdit = () => {
        updateButton(editingId, { ...editForm, caloriesPerUnit: Number(editForm.caloriesPerUnit) });
        setEditingId(null);
    };

    const handleClearData = () => {
        if (window.confirm('This will delete all your logged data. Are you sure?')) {
            localStorage.removeItem('calai-state');
            window.location.reload();
        }
    };

    return (
        <div className="settings-page">
            <h2 className="section-title" style={{ padding: '0 var(--space-4)', marginBottom: 'var(--space-5)' }}>Settings</h2>

            {/* Maintenance Calories */}
            <div className="settings-group glass-card" style={{ margin: '0 var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="settings-group-title">🎯 Daily Calorie Target</div>
                <div className="settings-field">
                    <label>Maintenance Calories</label>
                    <div className="cal-input-wrapper">
                        <input
                            type="number"
                            value={maintenanceCalories}
                            onChange={e => setMaintenanceCalories(Number(e.target.value) || 0)}
                            className="modal-input cal-input"
                        />
                        <span className="cal-input-unit">kcal</span>
                    </div>
                </div>
                <p className="settings-hint">
                    This is your daily calorie goal. Typical range: 1500–3000 kcal.
                </p>
            </div>

            {/* Groq API Key */}
            <div className="settings-group glass-card" style={{ margin: '0 var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="settings-group-title">🤖 Groq API Key</div>
                <div className="settings-field">
                    <label>API Key</label>
                    <div className="key-input-wrapper">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={groqApiKey}
                            onChange={e => setGroqApiKey(e.target.value)}
                            placeholder="gsk_..."
                            className="modal-input key-input"
                        />
                        <button className="key-toggle" onClick={() => setShowKey(!showKey)}>
                            {showKey ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>
                <p className="settings-hint">
                    Get your free API key at{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="settings-link">
                        console.groq.com
                    </a>
                </p>
            </div>

            {/* Button Configuration */}
            <div className="settings-group glass-card" style={{ margin: '0 var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div className="settings-group-header">
                    <div className="settings-group-title">⚡ Quick Track Buttons</div>
                    <button className="add-btn-small" onClick={() => setShowAddForm(true)}>+ Add</button>
                </div>

                <div className="button-list">
                    {buttons.map(btn => (
                        <div key={btn.id} className="button-config-item">
                            {editingId === btn.id ? (
                                <div className="button-edit-form">
                                    <div className="edit-row">
                                        <input
                                            type="text"
                                            value={editForm.emoji}
                                            onChange={e => setEditForm(p => ({ ...p, emoji: e.target.value }))}
                                            className="modal-input emoji-input-sm"
                                            maxLength={2}
                                        />
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                            className="modal-input"
                                            placeholder="Name"
                                        />
                                    </div>
                                    <div className="edit-row">
                                        <input
                                            type="number"
                                            value={editForm.caloriesPerUnit}
                                            onChange={e => setEditForm(p => ({ ...p, caloriesPerUnit: e.target.value }))}
                                            className="modal-input"
                                            placeholder="Calories"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.unit}
                                            onChange={e => setEditForm(p => ({ ...p, unit: e.target.value }))}
                                            className="modal-input"
                                            placeholder="Unit"
                                        />
                                    </div>
                                    <div className="edit-actions">
                                        <button className="modal-btn cancel" onClick={() => setEditingId(null)}>Cancel</button>
                                        <button className="modal-btn confirm" onClick={saveEdit}>Save</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="button-config-info">
                                        <span className="button-config-emoji">{btn.emoji}</span>
                                        <div>
                                            <div className="button-config-name">{btn.name}</div>
                                            <div className="button-config-cal">{btn.caloriesPerUnit} kcal / {btn.unit}</div>
                                        </div>
                                    </div>
                                    <div className="button-config-actions">
                                        <button className="icon-btn" onClick={() => startEdit(btn)}>✏️</button>
                                        <button className="icon-btn danger" onClick={() => removeButton(btn.id)}>🗑️</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {showAddForm && (
                    <div className="button-add-form">
                        <div className="edit-row">
                            <input
                                type="text"
                                value={newBtn.emoji}
                                onChange={e => setNewBtn(p => ({ ...p, emoji: e.target.value }))}
                                className="modal-input emoji-input-sm"
                                maxLength={2}
                            />
                            <input
                                type="text"
                                value={newBtn.name}
                                onChange={e => setNewBtn(p => ({ ...p, name: e.target.value }))}
                                className="modal-input"
                                placeholder="Food name"
                            />
                        </div>
                        <div className="edit-row">
                            <input
                                type="number"
                                value={newBtn.caloriesPerUnit}
                                onChange={e => setNewBtn(p => ({ ...p, caloriesPerUnit: e.target.value }))}
                                className="modal-input"
                                placeholder="Calories per unit"
                            />
                            <input
                                type="text"
                                value={newBtn.unit}
                                onChange={e => setNewBtn(p => ({ ...p, unit: e.target.value }))}
                                className="modal-input"
                                placeholder="Unit (bowl, piece)"
                            />
                        </div>
                        <div className="edit-actions">
                            <button className="modal-btn cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                            <button className="modal-btn confirm" onClick={handleAddButton}>Add</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Danger Zone */}
            <div className="settings-group glass-card danger-zone" style={{ margin: '0 var(--space-4)', marginBottom: 'var(--space-10)' }}>
                <div className="settings-group-title">⚠️ Danger Zone</div>
                <p className="settings-hint">Clear all logged data, buttons, and settings.</p>
                <button className="clear-btn" onClick={handleClearData}>
                    Reset All Data
                </button>
            </div>
        </div>
    );
}
