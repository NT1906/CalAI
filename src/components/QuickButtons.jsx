import { useState } from 'react';
import { useCalorie } from '../context/CalorieContext';
import './QuickButtons.css';

export default function QuickButtons() {
    const { buttons, currentDayLog, updateButtonQuantity, addButton, removeButton, updateButton } = useCalorie();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingButton, setEditingButton] = useState(null);
    const [newBtn, setNewBtn] = useState({ name: '', emoji: '🍽️', caloriesPerUnit: 0, unit: 'serving' });

    const handleAdd = () => {
        if (!newBtn.name || newBtn.caloriesPerUnit <= 0) return;
        addButton(newBtn);
        setNewBtn({ name: '', emoji: '🍽️', caloriesPerUnit: 0, unit: 'serving' });
        setShowAddModal(false);
    };

    const handleEdit = () => {
        if (!editingButton) return;
        updateButton(editingButton.id, editingButton);
        setEditingButton(null);
    };

    const handleDelete = (id) => {
        removeButton(id);
        setEditingButton(null);
    };

    return (
        <div className="quick-buttons-section">
            <div className="section-header">
                <h2 className="section-title">Quick Track</h2>
                <span className="section-subtitle">Tap to add portions</span>
            </div>

            <div className="quick-buttons-grid">
                {buttons.map((btn, index) => {
                    const qty = currentDayLog.buttonQuantities[btn.id] || 0;
                    const cals = qty * btn.caloriesPerUnit;
                    return (
                        <div
                            key={btn.id}
                            className={`quick-button glass-card ${qty > 0 ? 'has-quantity' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <button
                                className="quick-btn-edit"
                                onClick={() => setEditingButton({ ...btn })}
                                title="Edit"
                            >
                                ✏️
                            </button>
                            <div className="quick-btn-emoji">{btn.emoji}</div>
                            <div className="quick-btn-name">{btn.name}</div>
                            <div className="quick-btn-info">{btn.caloriesPerUnit} kcal / {btn.unit}</div>

                            <div className="quick-btn-controls">
                                <button
                                    className="qty-btn minus"
                                    onClick={() => updateButtonQuantity(btn.id, -1)}
                                    disabled={qty <= 0}
                                >
                                    −
                                </button>
                                <span className="qty-display">{qty}</span>
                                <button
                                    className="qty-btn plus"
                                    onClick={() => updateButtonQuantity(btn.id, 1)}
                                >
                                    +
                                </button>
                            </div>

                            {qty > 0 && (
                                <div className="quick-btn-total">{cals} kcal</div>
                            )}
                        </div>
                    );
                })}

                <button
                    className="quick-button add-button glass-card"
                    onClick={() => setShowAddModal(true)}
                >
                    <div className="add-btn-icon">+</div>
                    <div className="add-btn-text">Add Item</div>
                </button>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal glass-card" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Add Food Item</h3>
                        <div className="modal-field">
                            <label>Emoji</label>
                            <input
                                type="text"
                                value={newBtn.emoji}
                                onChange={e => setNewBtn(p => ({ ...p, emoji: e.target.value }))}
                                maxLength={2}
                                className="modal-input emoji-input"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Rice"
                                value={newBtn.name}
                                onChange={e => setNewBtn(p => ({ ...p, name: e.target.value }))}
                                className="modal-input"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Calories per unit</label>
                            <input
                                type="number"
                                placeholder="e.g., 200"
                                value={newBtn.caloriesPerUnit || ''}
                                onChange={e => setNewBtn(p => ({ ...p, caloriesPerUnit: Number(e.target.value) }))}
                                className="modal-input"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Unit name</label>
                            <input
                                type="text"
                                placeholder="e.g., bowl, piece"
                                value={newBtn.unit}
                                onChange={e => setNewBtn(p => ({ ...p, unit: e.target.value }))}
                                className="modal-input"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button className="modal-btn confirm" onClick={handleAdd}>Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingButton && (
                <div className="modal-overlay" onClick={() => setEditingButton(null)}>
                    <div className="modal glass-card" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Edit Food Item</h3>
                        <div className="modal-field">
                            <label>Emoji</label>
                            <input
                                type="text"
                                value={editingButton.emoji}
                                onChange={e => setEditingButton(p => ({ ...p, emoji: e.target.value }))}
                                maxLength={2}
                                className="modal-input emoji-input"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Name</label>
                            <input
                                type="text"
                                value={editingButton.name}
                                onChange={e => setEditingButton(p => ({ ...p, name: e.target.value }))}
                                className="modal-input"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Calories per unit</label>
                            <input
                                type="number"
                                value={editingButton.caloriesPerUnit || ''}
                                onChange={e => setEditingButton(p => ({ ...p, caloriesPerUnit: Number(e.target.value) }))}
                                className="modal-input"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Unit name</label>
                            <input
                                type="text"
                                value={editingButton.unit}
                                onChange={e => setEditingButton(p => ({ ...p, unit: e.target.value }))}
                                className="modal-input"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn danger" onClick={() => handleDelete(editingButton.id)}>Delete</button>
                            <button className="modal-btn cancel" onClick={() => setEditingButton(null)}>Cancel</button>
                            <button className="modal-btn confirm" onClick={handleEdit}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
