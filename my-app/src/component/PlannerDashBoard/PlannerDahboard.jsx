"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Eye, Search, Download, User, Briefcase, X } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PlannerDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [surveyors, setSurveyors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedSurveyor, setSelectedSurveyor] = useState('');

  // Blueprint Modal
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [blueprintSvg, setBlueprintSvg] = useState(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, survRes] = await Promise.all([
          api.get('/appointments/all'),
          api.get('/auth/surveyors')
        ]);
        setProjects(apptRes.data.data);
        setSurveyors(survRes.data.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleAssignSurveyor = async () => {
    if (!selectedProject || !selectedSurveyor) return;
    try {
      await api.patch(`/appointments/${selectedProject._id}/assign`, { surveyorId: selectedSurveyor });
      alert("Surveyor Assigned Successfully");
      setShowAssignModal(false);
      const res = await api.get('/appointments/all');
      setProjects(res.data.data);
    } catch (error) {
      console.error("Assignment failed", error);
      alert("Failed to assign surveyor");
    }
  };

  const handleViewBlueprint = async (apptId) => {
    try {
      const res = await api.get(`/blueprints/appointment/${apptId}`);
      setBlueprintSvg(res.data.data.svgData);
      setShowBlueprintModal(true);
    } catch (error) {
      console.error("Failed to fetch blueprint", error);
      alert("Blueprint not found. Has the survey been submitted?");
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // Stats for Charts
  const stats = useMemo(() => {
    const statusCounts = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    return { pieData };
  }, [projects]);

  const COLORS = { Scheduled: '#3b82f6', Completed: '#10b981', Cancelled: '#ef4444', Pending: '#fbbf24' };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[var(--color-primary)]">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-16 z-10 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-2xl font-serif font-bold text-[var(--color-primary)]">Planner Dashboard</h1>
          <p className="text-sm text-gray-500">Manage appointments and allocations</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="w-full sm:w-auto bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition shadow-md flex items-center justify-center gap-2">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </header>

      <main className="p-6 flex flex-col lg:flex-row gap-6">
        {/* Project Grid */}
        <div className="flex-1 space-y-6 min-w-0">
          <h2 className="text-xl font-bold text-gray-800">All Appointments ({projects.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-5 group flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    project.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                    {project.status}
                  </span>
                  <div className="text-right whitespace-nowrap ml-2">
                    <p className="text-xs text-gray-500">{new Date(project.date_time).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{new Date(project.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 truncate" title={project.address}>{project.address}</h3>
                <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                  <User className="h-3 w-3 shrink-0" /> <span className="truncate">Customer: {project.customer_id?.fullName || 'Unknown'}</span>
                </p>

                <div className="mt-auto flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {project.surveyor_id ? project.surveyor_id.fullName : "Unassigned"}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-2 shrink-0">
                    {project.status === 'Completed' && (
                      <button
                        onClick={() => handleViewBlueprint(project._id)}
                        className="text-gray-500 hover:text-[var(--color-primary)] transition"
                        title="View Blueprint"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowAssignModal(true);
                      }}
                      className="text-sm text-[var(--color-primary)] font-medium hover:underline whitespace-nowrap"
                    >
                      {project.surveyor_id ? "Reassign" : "Assign"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Stats */}
        <aside className="w-full lg:w-80 space-y-6 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#ccc'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>
      </main>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Assign Surveyor</h3>
            <p className="text-sm text-gray-600 mb-4">Select a surveyor for <span className="font-medium">{selectedProject?.address}</span></p>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {surveyors.map(surv => (
                <label key={surv._id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="surveyor"
                    value={surv._id}
                    onChange={(e) => setSelectedSurveyor(e.target.value)}
                    className="text-[var(--color-primary)] focus:ring-[var(--color-primary)] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{surv.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{surv.email}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSurveyor}
                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-emerald-800"
                disabled={!selectedSurveyor}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blueprint Viewer Modal */}
      {showBlueprintModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">Project Blueprint</h3>
              <div className="flex items-center gap-2">
                <button className="text-sm bg-[var(--color-primary)] text-white px-3 py-1.5 rounded hover:bg-emerald-700 flex items-center gap-1">
                  <Download className="h-4 w-4" /> Download SVG
                </button>
                <button onClick={() => setShowBlueprintModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 p-4 overflow-auto flex items-center justify-center">
              {blueprintSvg ? (
                <div
                  className="bg-white shadow-lg p-4"
                  dangerouslySetInnerHTML={{ __html: blueprintSvg }}
                />
              ) : (
                <p>Loading Blueprint...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerDashboard;