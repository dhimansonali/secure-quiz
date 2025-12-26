import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Download, Search, LogOut, Trophy, TrendingUp, Clock, Trash2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

export default function Admin() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Fetch data from MongoDB API
    const fetchData = async () => {
      try {
        console.log('Fetching admin data with token:', token);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error('Failed to fetch submissions');
        }

        const data = await response.json();
        console.log('Admin data received:', data);
        console.log('Submissions:', data.submissions);
        console.log('Analytics:', data.analytics);
        setSubmissions(data.submissions || []);
        setAnalytics(data.analytics || null);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleExport = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz-submissions.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Export failed: ' + error.message);
    }
  };

  const handleReset = async (email) => {
    if (!confirm(`Reset quiz for ${email}? This cannot be undone.`)) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Reset failed');

      // Optimistic update
      setSubmissions(prev => prev.filter(s => s.email !== email));
      alert('User reset successfully');
    } catch (error) {
      console.error('Error resetting:', error);
      alert('Reset failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    navigate('/admin/login');
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.archetype.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!token) {
    return <div>Please login to access admin dashboard</div>;
  }

  if (isLoading) {
    console.log('Still loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading admin dashboard...</div>
      </div>
    );
  }

  console.log('Rendering with submissions:', submissions.length);
  console.log('Rendering with analytics:', analytics);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/60">Real-time quiz submissions and analytics</p>
          </div>
          <button
            onClick={handleLogout}
            className="glass rounded-lg px-4 py-2 text-white flex items-center space-x-2 hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </motion.header>

      {/* Stats Cards */}
      {analytics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">{analytics.totalSubmissions}</span>
            </div>
            <p className="text-white/60">Total Submissions</p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {analytics.archetypeDistribution?.[0]?.archetype || 'N/A'}
              </span>
            </div>
            <p className="text-white/60">Top Archetype</p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {analytics.archetypeDistribution?.length || 0}
              </span>
            </div>
            <p className="text-white/60">Archetype Types</p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-400" />
              <span className="text-sm text-white font-semibold">Live</span>
            </div>
            <p className="text-white/60">Real-time Updates</p>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      {analytics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Archetype Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.archetypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="archetype" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Percentage Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.archetypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ archetype, percentage }) => `${archetype}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.archetypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Submissions Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-xl p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Submissions</h3>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              onClick={handleExport}
              className="glass rounded-lg px-4 py-2 text-white flex items-center space-x-2 hover:bg-white/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-white/60">Email</th>
                <th className="text-left py-3 px-4 text-white/60">Name</th>
                <th className="text-left py-3 px-4 text-white/60">Archetype</th>
                <th className="text-left py-3 px-4 text-white/60">Confidence</th>
                <th className="text-left py-3 px-4 text-white/60">Date</th>
                <th className="text-left py-3 px-4 text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((submission, index) => (
                <motion.tr
                  key={submission.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-white">{submission.email}</td>
                  <td className="py-3 px-4 text-white">{submission.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                      {submission.archetype}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{submission.confidence}</td>
                  <td className="py-3 px-4 text-white/60">
                    {new Date(submission.completedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleReset(submission.email)}
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
                      title="Reset this user's submission"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-8 text-white/60">
            No submissions yet.
          </div>
        )}
      </motion.div>
    </div>
  );
}
