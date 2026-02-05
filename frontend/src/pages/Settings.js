import { useState } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Settings() {
  const { user, demoMode } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [importData, setImportData] = useState({ collection: 'users', data: [] });
  const [importing, setImporting] = useState(false);
  const [csvPreview, setCsvPreview] = useState(null);

  const handleExport = (collection) => {
    if (demoMode) {
      toast.info('Export not available in demo mode');
      return;
    }
    window.open(`${BACKEND_URL}/api/data/export?collection=${collection}`, '_blank');
  };

  const handleDownloadTemplate = (collection) => {
    if (demoMode) {
      toast.info('Templates not available in demo mode');
      return;
    }
    window.open(`${BACKEND_URL}/api/data/template/${collection}`, '_blank');
    toast.success(`Downloading ${collection} template`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error('CSV file is empty or has no data rows');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });
        data.push(row);
      }

      setCsvPreview({ headers, data: data.slice(0, 5), totalRows: data.length });
      setImportData({ ...importData, data });
      toast.success(`Loaded ${data.length} rows from CSV`);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (demoMode) {
      toast.info('Import not available in demo mode');
      return;
    }

    if (importData.data.length === 0) {
      toast.error('Please upload a CSV file first');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/data/import-csv?collection=${importData.collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: importData.data })
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`Imported ${result.imported} of ${result.total} records`);
        if (result.errors?.length > 0) {
          result.errors.forEach(err => toast.error(err));
        }
        setCsvPreview(null);
        setImportData({ collection: 'users', data: [] });
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Import failed');
      }
    } catch (err) {
      toast.error('Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8" data-testid="settings-page">
      <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
      <p className="text-slate-400 mb-8">Manage data import and export</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download Templates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📋 Download Templates</h2>
          <p className="text-sm text-slate-400 mb-4">Download CSV templates with the correct format for data import</p>
          <div className="space-y-3">
            <button onClick={() => handleDownloadTemplate('users')} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700 flex items-center justify-between">
              <span>👥 Team Members Template</span>
              <span className="text-sm text-slate-400">name, email, role, phone, skills</span>
            </button>
            <button onClick={() => handleDownloadTemplate('services')} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700 flex items-center justify-between">
              <span>🗓️ Services Template</span>
              <span className="text-sm text-slate-400">title, date, time, type</span>
            </button>
            <button onClick={() => handleDownloadTemplate('equipment')} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700 flex items-center justify-between">
              <span>🎥 Equipment Template</span>
              <span className="text-sm text-slate-400">name, category, status, notes</span>
            </button>
          </div>
        </div>

        {/* Export Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📤 Export Data</h2>
          <p className="text-sm text-slate-400 mb-4">Download your data as CSV files</p>
          <div className="space-y-3">
            <button onClick={() => handleExport('users')} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700">
              👥 Export Team Members
            </button>
            <button onClick={() => handleExport('services')} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700">
              🗓️ Export Services
            </button>
            <button onClick={() => handleExport('equipment')} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700">
              🎥 Export Equipment
            </button>
            <button onClick={() => handleExport('rotas')} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700">
              📝 Export Rotas
            </button>
          </div>
        </div>
        
        {/* Import Data */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📥 Import Data</h2>
          <p className="text-sm text-slate-400 mb-4">Upload CSV files matching the template format. Download a template first to see the required columns.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Data Type</label>
                <select value={importData.collection} onChange={(e) => setImportData({ ...importData, collection: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
                  <option value="users">Team Members</option>
                  <option value="services">Services</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Upload CSV File</label>
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 border-dashed">
                  <input type="file" accept=".csv" onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-700 file:text-white hover:file:bg-slate-600" />
                </div>
              </div>

              <button onClick={handleImport} disabled={importing || importData.data.length === 0}
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {importing ? '⏳ Importing...' : `📤 Import ${importData.data.length} Records`}
              </button>
            </div>

            {/* Preview */}
            <div>
              {csvPreview ? (
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <h3 className="text-sm font-bold text-white mb-2">Preview ({csvPreview.totalRows} rows total)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr>
                          {csvPreview.headers.map((h, i) => (
                            <th key={i} className="text-left p-1 text-slate-400 border-b border-slate-700">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.data.map((row, i) => (
                          <tr key={i}>
                            {csvPreview.headers.map((h, j) => (
                              <td key={j} className="p-1 text-slate-300 truncate max-w-[100px]">{row[h]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {csvPreview.totalRows > 5 && (
                    <p className="text-xs text-slate-500 mt-2">Showing 5 of {csvPreview.totalRows} rows</p>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 h-full flex items-center justify-center">
                  <p className="text-slate-500 text-sm">Upload a CSV to preview data</p>
                </div>
              )}
            </div>
          </div>
          
          {!isAdmin && (
            <p className="mt-4 text-sm text-amber-400">⚠️ Admin privileges required for data import</p>
          )}
        </div>
      </div>

      {/* App Info */}
      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">ℹ️ App Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Version</p>
            <p className="text-white font-medium">2.0.0</p>
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
