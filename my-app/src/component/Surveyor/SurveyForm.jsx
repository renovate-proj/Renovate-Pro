"use client";
import React, { useState } from 'react';
import { Plus, Trash2, Save, Ruler, ArrowRight, Home, X } from 'lucide-react';
import api from '../../lib/api';

const SurveyForm = ({ appointmentId, onComplete, onCancel }) => {
    // Structure: Array of Room Objects, locally.
    // We will flattening this before sending to API.
    const [rooms, setRooms] = useState([
        { id: 1, type: 'Living Room', walls: [{ length: 1, angle: 90, height: 2.4 }] }
    ]);
    const [submitting, setSubmitting] = useState(false);

    const addRoom = () => {
        setRooms([...rooms, { id: Date.now(), type: 'Bedroom', walls: [{ length: 0, angle: 0, height: 2.4 }] }]);
    };

    const removeRoom = (id) => {
        setRooms(rooms.filter(r => r.id !== id));
    };

    const updateRoomType = (id, type) => {
        setRooms(rooms.map(r => r.id === id ? { ...r, type } : r));
    };

    const addWall = (roomId) => {
        setRooms(rooms.map(r => {
            if (r.id === roomId) {
                return { ...r, walls: [...r.walls, { length: 0, angle: 90, height: r.walls[0].height }] };
            }
            return r;
        }));
    };

    const updateWall = (roomId, wallIndex, field, value) => {
        setRooms(rooms.map(r => {
            if (r.id === roomId) {
                const newWalls = [...r.walls];
                newWalls[wallIndex] = { ...newWalls[wallIndex], [field]: parseFloat(value) || 0 };
                return { ...r, walls: newWalls };
            }
            return r;
        }));
    };

    const removeWall = (roomId, wallIndex) => {
        setRooms(rooms.map(r => {
            if (r.id === roomId) {
                return { ...r, walls: r.walls.filter((_, i) => i !== wallIndex) };
            }
            return r;
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // Validate: all walls must have length > 0
            const hasInvalidWalls = rooms.some(room =>
                room.walls.some(wall => wall.length < 0.1 || wall.height < 0.1)
            );
            if (hasInvalidWalls) {
                alert("All walls must have a length and height of at least 0.1m");
                setSubmitting(false);
                return;
            }

            // Flatten data for Backend (SurveyData Schema)
            // Schema expects: rooms: [{ room_type, length_m, angle_deg, height_m, features... }]
            const flatData = [];
            rooms.forEach(room => {
                room.walls.forEach(wall => {
                    flatData.push({
                        room_type: room.type,
                        length_m: wall.length,
                        angle_deg: wall.angle,
                        height_m: wall.height,
                        features: [] // feature support can be added later
                    });
                });
            });

            // Calculate Checksum (Mock) - In real app, create SHA-256 hash of data
            // For now, backend might expect it.
            const checksum = "SHA-256-" + Date.now();

            const payload = {
                apptid: appointmentId,
                siteLocation: { address: "Fetched from Appt", coordinates: [0, 0] }, // Backend might fill this or we usually pass it from formatted data
                rooms: flatData,
                checksum: checksum
            };

            // Note: In a real scenario, siteLocation should come from the appointment details or current GPS.
            // For this MVP integration, we might need to adjust based on what Backend expects.
            // Let's assume Backend validates checksum. 

            await api.post('/surveys/submit', payload);
            alert("Survey Submitted Successfully!");
            onComplete();
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit survey: " + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 flex justify-between items-center shadow-sm z-10">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <Ruler className="text-[var(--color-primary)] h-6 w-6" /> Digital Survey Form
                    </h2>
                    <p className="text-xs text-gray-500 pl-8">Appointment ID: {appointmentId}</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={onCancel} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2.5 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-blue-800 transition flex items-center gap-2 shadow-md disabled:opacity-70"
                    >
                        {submitting ? 'Submitting...' : <><Save className="h-4 w-4" /> Finalize Survey</>}
                    </button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto p-6 space-y-8 pb-32">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm text-blue-600">
                        <Home className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">Survey Instructions</h3>
                        <p className="text-sm text-blue-700 mt-1">
                            Add rooms and define walls sequentially (clockwise).
                            Ensure the last wall connects back to the start (automatically handled by the backend, but good to verify).
                            Measure lengths in meters.
                        </p>
                    </div>
                </div>

                {rooms.map((room, rIndex) => (
                    <div key={room.id} className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition hover:shadow-md">
                        {/* Room Header */}
                        <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <span className="bg-gray-200 text-gray-600 font-bold w-8 h-8 flex items-center justify-center rounded-lg">
                                    {rIndex + 1}
                                </span>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Room Type</label>
                                    <select
                                        value={room.type}
                                        onChange={(e) => updateRoomType(room.id, e.target.value)}
                                        className="text-lg font-bold bg-transparent border-b border-dashed border-gray-400 focus:border-[var(--color-primary)] outline-none cursor-pointer hover:border-gray-600 transition"
                                    >
                                        <option value="Living Room">Living Room</option>
                                        <option value="Bedroom">Bedroom</option>
                                        <option value="Kitchen">Kitchen</option>
                                        <option value="Bathroom">Bathroom</option>
                                        <option value="Balcony">Balcony</option>
                                        <option value="Svc_Room">Service Room</option>
                                        <option value="Corridor">Corridor</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => removeRoom(room.id)}
                                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
                                title="Remove Room"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Walls Section */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {room.walls.map((wall, wIndex) => (
                                    <div key={wIndex} className="bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Wall {wIndex + 1}</span>
                                            {room.walls.length > 1 && (
                                                <button onClick={() => removeWall(room.id, wIndex)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Length (m)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number" step="0.01" min="0"
                                                        value={wall.length}
                                                        onChange={(e) => updateWall(room.id, wIndex, 'length', e.target.value)}
                                                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none font-mono font-medium"
                                                        placeholder="0.00"
                                                    />
                                                    <span className="absolute right-3 top-2 text-gray-400 text-xs font-bold">m</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">Angle (°)</label>
                                                    <input
                                                        type="number" step="0.5"
                                                        value={wall.angle}
                                                        onChange={(e) => updateWall(room.id, wIndex, 'angle', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] outline-none font-mono text-sm"
                                                        placeholder="90"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">Height</label>
                                                    <input
                                                        type="number" step="0.1"
                                                        value={wall.height}
                                                        onChange={(e) => updateWall(room.id, wIndex, 'height', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[var(--color-primary)] outline-none font-mono text-sm"
                                                        placeholder="2.4"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Connector Line (Visual) */}
                                        {wIndex < room.walls.length - 1 && (
                                            <div className="absolute -right-6 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
                                                <ArrowRight className="text-gray-300 h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Wall Button */}
                                <button
                                    onClick={() => addWall(room.id)}
                                    className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-blue-50 transition min-h-[160px]"
                                >
                                    <Plus className="h-6 w-6 mb-1" />
                                    <span className="text-sm font-bold">Add Wall</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addRoom}
                    className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-gray-50 transition flex items-center justify-center gap-2 text-lg shadow-sm"
                >
                    <Plus className="h-6 w-6" /> Add Another Room
                </button>
            </div>
        </div>
    );
};

export default SurveyForm;
