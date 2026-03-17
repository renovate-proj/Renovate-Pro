"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Download, Eye, X, Check, Clock, FileText, User, Lock, Mail, Phone, Bell, LogOut, Edit2, Trash2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

// Mock Documents (Placeholder for future implementation)
const mockDocuments = [
    { id: 1, name: 'Site Survey Blueprint - Oak Street', date: '2026-01-15', status: 'ready', formats: ['pdf', 'svg', 'csv'] },
    { id: 2, name: 'Floor Plan - Maple Drive', date: '2026-01-10', status: 'delivered', formats: ['pdf', 'svg'] },
];

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [documents, setDocuments] = useState(mockDocuments);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    // Modals
    const [showBookModal, setShowBookModal] = useState(false);
    const [newBooking, setNewBooking] = useState({ date: '', time: '', address: '', lat: 19.0760, lng: 72.8777 });
    const [bookingLoading, setBookingLoading] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const res = await api.get('/appointments/my');
                setAppointments(res.data.data);
            } catch (error) {
                console.error("Failed to fetch appointments", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchAppointments();
    }, [user]);

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        try {
            // Combine date and time
            const dateTime = new Date(`${newBooking.date}T${newBooking.time}`);

            await api.post('/appointments/book', {
                date_time: dateTime,
                address: newBooking.address,
                geocode: { lat: newBooking.lat, lng: newBooking.lng } // Mock geocode usage for UI simplicity
            });

            // Refresh list
            const res = await api.get('/appointments/my');
            setAppointments(res.data.data);
            setShowBookModal(false);
            setNewBooking({ date: '', time: '', address: '', lat: 19.0760, lng: 72.8777 });
            alert("Appointment Booked Successfully!");
        } catch (error) {
            console.error("Booking failed", error);
            alert("Failed to book appointment.");
        } finally {
            setBookingLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-100 text-blue-700 border border-blue-200';
            case 'Completed': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-serif font-bold text-[var(--color-primary)]">
                        Renovate<span className="text-[var(--color-secondary)]">Pro</span>
                    </h1>
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium text-gray-600">Welcome, {user?.fullName}</span>
                        <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition font-medium text-sm">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 flex gap-8">
                    {['dashboard', 'documents', 'profile'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 font-medium transition capitalize border-b-2 ${activeTab === tab
                                    ? 'text-[var(--color-primary)] border-[var(--color-secondary)]'
                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-[var(--color-primary)] to-emerald-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h2 className="text-3xl font-serif font-bold mb-2 relative z-10">Overview</h2>
                            <p className="opacity-90 relative z-10">Manage your renovation journey with ease.</p>

                            <button
                                onClick={() => setShowBookModal(true)}
                                className="mt-6 bg-[var(--color-secondary)] text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-yellow-600 transition flex items-center gap-2 relative z-10"
                            >
                                <Plus className="h-5 w-5" /> Book New Survey
                            </button>
                        </div>

                        {/* Appointments Section */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-[var(--color-primary)]" /> Your Appointments
                            </h3>

                            {loading ? (
                                <p className="text-gray-500 animate-pulse">Loading appointments...</p>
                            ) : appointments.length > 0 ? (
                                <div className="grid gap-4">
                                    {appointments.map((apt) => (
                                        <div key={apt._id} className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition group">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                                            {apt.status}
                                                        </span>
                                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(apt.date_time).toLocaleDateString()} at {new Date(apt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="font-semibold text-lg text-gray-800">{apt.address}</p>
                                                    <p className="text-sm text-gray-500 mt-1">Surveyor: {apt.surveyor_id?.fullName || "Pending Assignment"}</p>
                                                </div>
                                                {apt.status === 'Scheduled' && (
                                                    <button className="text-red-500 hover:text-red-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500">No appointments found. Book one to get started!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Documents & Profile Placeholders (Preserved Essence) */}
                {activeTab === 'documents' && (
                    <div className="bg-white rounded-xl shadow-sm p-8">
                        <h3 className="text-xl font-bold mb-6">Project Documents</h3>
                        <div className="space-y-4">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-[var(--color-primary)]" />
                                        <div>
                                            <p className="font-medium text-gray-800">{doc.name}</p>
                                            <p className="text-sm text-gray-500">{doc.date}</p>
                                        </div>
                                    </div>
                                    <button className="text-[var(--color-primary)] font-medium text-sm hover:underline">Download</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl">
                        <h3 className="text-xl font-bold mb-6">My Profile</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                <p className="text-lg font-medium text-gray-900">{user?.fullName}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                <p className="text-lg font-medium text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Role</label>
                                <p className="text-lg font-medium text-gray-900">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Booking Modal */}
            {showBookModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Book a Survey</h3>
                            <button onClick={() => setShowBookModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                        </div>

                        <form onSubmit={handleBookAppointment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                                    placeholder="Enter full property address"
                                    value={newBooking.address}
                                    onChange={e => setNewBooking({ ...newBooking, address: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                                        value={newBooking.date}
                                        onChange={e => setNewBooking({ ...newBooking, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                                        value={newBooking.time}
                                        onChange={e => setNewBooking({ ...newBooking, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={bookingLoading}
                                className="w-full mt-4 bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:bg-emerald-800 transition shadow-lg disabled:opacity-70"
                            >
                                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;