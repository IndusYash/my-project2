import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToCitizen = () => {
    console.log('🏠 Navigating back to citizen portal from admin panel');
    navigate('/');
  };

  const handleLogout = () => {
    console.log('🚪 Logging out from admin panel');
    localStorage.removeItem('jharkhand-admin-auth');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Panel Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Back button and title */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToCitizen}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                title="Back to Citizen Portal"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Citizen Portal</span>
                <span className="sm:hidden">Back</span>
              </button>
              
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">Jharkhand Government - Civic Issues Management</p>
              </div>
            </div>

            {/* Right side - Logout button */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Government Official</p>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Content */}
      <AdminDashboard />
    </div>
  );
};

export default AdminPanel;
