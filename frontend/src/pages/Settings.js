import { useState } from 'react';
import { Settings as SettingsIcon, Download, Upload, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Settings() {
  const [exportCollection, setExportCollection] = useState('users');
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/data/export?collection=${exportCollection}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportCollection}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${exportCollection} exported successfully`);
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  const handleImport = async (event, collection) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        toast.error('CSV file is empty or invalid');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index]?.trim() || '';
        });
        if (Object.keys(obj).length > 0) {
          data.push(obj);
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/data/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ collection, data })
      });

      if (!response.ok) throw new Error('Failed to import data');
      toast.success(`${data.length} records imported to ${collection}`);
    } catch (error) {
      toast.error('Failed to import data');
      console.error(error);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="settings-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-base text-slate-600">Manage data import and export</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Collection</label>
              <Select value={exportCollection} onValueChange={setExportCollection}>
                <SelectTrigger data-testid="export-collection-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Team Members</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="rotas">Rotas</SelectItem>
                  <SelectItem value="training_videos">Training Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleExport} className="w-full" data-testid="export-btn">
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
            <p className="text-xs text-muted-foreground">
              Download data as CSV file for backup or external analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Import Team Members</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleImport(e, 'users')}
                  disabled={importing}
                  data-testid="import-users-input"
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/90 file:cursor-pointer"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Import Services</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleImport(e, 'services')}
                  disabled={importing}
                  data-testid="import-services-input"
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/90 file:cursor-pointer"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Import Equipment</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleImport(e, 'equipment')}
                  disabled={importing}
                  data-testid="import-equipment-input"
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/90 file:cursor-pointer"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Import CSV files with matching column headers. Ensure data format matches exported files.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium mb-1">CSV Format Requirements:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>First row must contain column headers</li>
                <li>Use comma (,) as delimiter</li>
                <li>Enclose fields with commas in quotes</li>
                <li>Match exported format for best results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-1">Sample CSV Structure (Team Members):</h4>
              <code className="block bg-secondary p-3 rounded-md text-xs mt-2">
                user_id,email,name,role,skills,availability<br/>
                user_abc123,john@example.com,John Doe,member,"Camera,Sound",available
              </code>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-4">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> Importing data will add new records. It will not update existing records. 
                Export data first as a backup before importing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
