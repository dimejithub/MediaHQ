import { useState, useEffect } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function TemplateButton({ label, icon, fields, onClick }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700 flex items-center justify-between">
      <span>{icon} {label}</span>
      <span className="text-sm text-slate-400">{fields}</span>
    </button>
  );
}

function ExportButton({ label, icon, onClick }) {
  return (
    <button onClick={onClick} className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-left border border-slate-700">
      {icon} {label}
    </button>
  );
}

export default function Settings() {
  const { user, demoMode } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [importCollection, setImportCollection] = useState('users');
  const [csvData, setCsvData] = useState([]);
  const [importing, setImporting] = useState(false);

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
        toast.error('CSV file is empty');
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

      setCsvData(data);
      toast.success(`Loaded ${data.length} rows`);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (demoMode) {
      toast.info('Import not available in demo mode');
      return;
    }
    if (csvData.length === 0) {
      toast.error('Please upload a CSV file first');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/data/import-csv?collection=${importCollection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ data: csvData })
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`Imported ${result.imported} of ${result.total} records`);
        setCsvData([]);
      } else {
        toast.error('Import failed');
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📋 Download Templates</h2>
          <p className="text-sm text-slate-400 mb-4">Download CSV templates for data import</p>
          <div className="space-y-3">
            <TemplateButton label="Team Members" icon="👥" fields="name, email, role, phone, skills" onClick={() => handleDownloadTemplate('users')} />
            <TemplateButton label="Services" icon="🗓️" fields="title, date, time, type" onClick={() => handleDownloadTemplate('services')} />
            <TemplateButton label="Equipment" icon="🎥" fields="name, category, status, notes" onClick={() => handleDownloadTemplate('equipment')} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📤 Export Data</h2>
          <p className="text-sm text-slate-400 mb-4">Download your data as CSV files</p>
          <div className="space-y-3">
            <ExportButton label="Export Team Members" icon="👥" onClick={() => handleExport('users')} />
            <ExportButton label="Export Services" icon="🗓️" onClick={() => handleExport('services')} />
            <ExportButton label="Export Equipment" icon="🎥" onClick={() => handleExport('equipment')} />
            <ExportButton label="Export Rotas" icon="📝" onClick={() => handleExport('rotas')} />
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">📥 Import Data</h2>
          <p className="text-sm text-slate-400 mb-4">Upload CSV files matching the template format</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Data Type</label>
                <select value={importCollection} onChange={(e) => setImportCollection(e.target.value)}
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

              <button onClick={handleImport} disabled={importing || csvData.length === 0}
                className="w-full px-4 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {importing ? '⏳ Importing...' : `📤 Import ${csvData.length} Records`}
              </button>
            </div>

            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              {csvData.length > 0 ? (
                <div>
                  <h3 className="text-sm font-bold text-white mb-2">Preview ({csvData.length} rows)</h3>
                  <p className="text-xs text-slate-400">Ready to import</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">Upload a CSV to preview</p>
              )}
            </div>
          </div>
          
          {!isAdmin && (
            <p className="mt-4 text-sm text-amber-400">⚠️ Admin privileges required for import</p>
          )}
        </div>
      </div>

      <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">ℹ️ App Info</h2>
        <div className="grid grid-cols-4 gap-4 text-sm">
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
