"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, Navigation, Phone, MessageSquare, Camera, FileText, Upload, X, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import SurveyForm from '../../../component/Surveyor/SurveyForm';

const SurveyorDashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);

  // Fetch Tasks (My Appointments)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/appointments/tasks'); // Returns appointments assigned to this surveyor
        setTasks(res.data.data);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTasks();
  }, [user]);

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    try {
      await api.patch(`/appointments/${selectedTask._id}/status`, { status: "Completed" });

      // Refresh
      const res = await api.get('/appointments/tasks');
      setTasks(res.data.data);
      setShowCompleteModal(false);
      setSelectedTask(null);
      alert("Survey Marked as Completed!");
    } catch (error) {
      console.error("Failed to complete task", error);
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-[var(--color-primary)]">
            Surveyor<span className="text-[var(--color-secondary)]">Portal</span>
          </h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gray-600 hidden md:block">Welcome, {user?.fullName}</span>
            <button onClick={logout} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition font-medium text-sm">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Task List */}
          <div className="lg:w-1/2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Assigned Tasks ({tasks.length})</h2>
              <span className="text-sm text-gray-500">Today: {new Date().toLocaleDateString()}</span>
            </div>

            {loading ? (
              <p className="text-gray-500 animate-pulse">Loading tasks...</p>
            ) : tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div
                    key={task._id}
                    onClick={() => setSelectedTask(task)}
                    className={`bg-white rounded-xl p-5 border cursor-pointer transition hover:shadow-md ${selectedTask?._id === task._id ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : 'border-gray-100'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(task.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">{task.address}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(task.date_time).toLocaleDateString()}
                    </p>
                    {task.customer_id?.fullName && (
                      <p className="text-sm text-gray-400 mt-1">Customer: {task.customer_id.fullName}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No tasks assigned yet.</p>
              </div>
            )}
          </div>

          {/* Task Details / Action Panel */}
          <div className="lg:w-1/2">
            {selectedTask ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 sticky top-24">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Task Details</h2>
                    <p className="text-gray-500 text-sm">ID: {selectedTask._id}</p>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 lg:hidden">
                    <X />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Property Address</p>
                      <p className="font-medium text-gray-900 text-lg leading-snug">{selectedTask.address}</p>
                      <button className="mt-2 text-sm text-[var(--color-secondary)] font-semibold hover:underline flex items-center gap-1">
                        <Navigation className="h-4 w-4" /> Get Directions
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Scheduled For</p>
                      <p className="font-medium text-gray-900 text-lg">
                        {new Date(selectedTask.date_time).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-bold text-gray-800 mb-4">Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50 transition group">
                        <Camera className="h-6 w-6 text-gray-400 group-hover:text-[var(--color-primary)]" />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-[var(--color-primary)]">Upload Photos</span>
                      </button>
                      <button
                        onClick={() => setShowSurveyForm(true)}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-blue-50 transition group"
                      >
                        <FileText className="h-6 w-6 text-gray-400 group-hover:text-[var(--color-primary)]" />
                        <span className="text-sm font-medium text-gray-600 group-hover:text-[var(--color-primary)]">Survey Form</span>
                      </button>
                    </div>

                    {selectedTask.status !== 'Completed' && (
                      <button
                        onClick={() => setShowCompleteModal(true)}
                        className="w-full mt-6 bg-[var(--color-primary)] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-800 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" /> Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 border-2 border-dashed rounded-xl">
                <MapPin className="h-12 w-12 mb-4 opacity-20" />
                <p>Select a task to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Survey Form Modal */}
      {showSurveyForm && selectedTask && (
        <SurveyForm
          appointmentId={selectedTask._id}
          onComplete={() => setShowSurveyForm(false)}
          onCancel={() => setShowSurveyForm(false)}
        />
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Complete Survey?</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to mark this survey as completed?</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteTask}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyorDashboard;
