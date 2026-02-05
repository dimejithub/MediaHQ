import { useAuth } from '@/App';
import { toast } from 'sonner';

export default function Settings() {
  const { user, demoMode } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleExport = (collection) => {
    if (demoMode) {
      toast.info('Export not available in demo mode');
      return;
    }
    window.open(`${process.env.REACT_APP_BACKEND_URL}/api/data/export?collection=${collection}`, '_blank');
  };

  const handleImport = () => {
    if (demoMode) {
      toast.info('Import not available in demo mode');
      return;
    }
    toast.info('CSV import functionality coming soon');
  };

  return (
    <div className="p-8" data-testid="settings-page">
      <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
      <p className="text-slate-400 mb-8">Manage data import and export</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📤 Export Data</h2>
          <p className="text-sm text-slate-400 mb-4">Download your data as CSV files</p>
          <div className="space-y-3">
            <button 
              onClick={() => handleExport('users')} 
              data-testid="export-users-btn"
              className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700"
            >
              👥 Export Team Members
            </button>
            <button 
              onClick={() => handleExport('services')} 
              data-testid="export-services-btn"
              className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700"
            >
              🗓️ Export Services
            </button>
            <button 
              onClick={() => handleExport('equipment')} 
              data-testid="export-equipment-btn"
              className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700"
            >
              🎥 Export Equipment
            </button>
            <button 
              onClick={() => handleExport('rotas')} 
              data-testid="export-rotas-btn"
              className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700"
            >
              📝 Export Rotas
            </button>
          </div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📥 Import Data</h2>
          <p className="text-sm text-slate-400 mb-4">Upload CSV files to import data. Format must match exported files.</p>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 border-dashed">
              <input 
                type="file" 
                accept=".csv" 
                className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-700 file:text-white hover:file:bg-slate-600" 
                data-testid="import-file-input"
              />
            </div>
            <button 
              onClick={handleImport}
              data-testid="import-data-btn"
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all border border-slate-600"
            >
              📤 Import Data
            </button>
          </div>
          
          {!isAdmin && (
            <p className="mt-4 text-sm text-amber-400">
              ⚠️ Admin privileges required for data import
            </p>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">ℹ️ App Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Version</p>
            <p className="text-white font-medium">1.0.0</p>
          </div>
          <div>
            <p className="text-slate-400">Mode</p>
            <p className="text-white font-medium">{demoMode ? 'Demo' : 'Production'}</p>
          </div>
          <div>
            <p className="text-slate-400">User</p>
            <p className="text-white font-medium">{user?.name || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-slate-400">Role</p>
            <p className="text-white font-medium capitalize">{user?.role?.replace('_', ' ') || 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}