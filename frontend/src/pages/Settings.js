export default function Settings() {
  const handleExport = (collection) => {
    window.open(`${process.env.REACT_APP_BACKEND_URL}/api/data/export?collection=${collection}`, '_blank');
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Settings</h1>
      <p className="text-gray-600 mb-8">Manage data import and export</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Export Data</h2>
          <div className="space-y-3">
            <button onClick={() => handleExport('users')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-left">Export Team Members</button>
            <button onClick={() => handleExport('services')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-left">Export Services</button>
            <button onClick={() => handleExport('equipment')} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-left">Export Equipment</button>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Import Data</h2>
          <p className="text-sm text-gray-600 mb-4">Upload CSV files to import data. Format must match exported files.</p>
          <div className="space-y-3">
            <input type="file" accept=".csv" className="block w-full text-sm" />
            <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md">Import Data</button>
          </div>
        </div>
      </div>
    </div>
  );
}