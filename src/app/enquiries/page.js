'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Edit, Trash2, Plus } from 'lucide-react';

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/enquiries');
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cleanHeader = (header) => header.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Get headers and clean them
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rawData.length < 2) return;
        
        // Let's find the header row (sometimes row 2 in complex sheets, but let's assume it's row 1 or 2)
        // In the provided sheet, headers are on row 12 (0-indexed 11) because of title metadata
        // Let's just find the row that contains 'Child Name'
        let headerRowIndex = 0;
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i].some(cell => typeof cell === 'string' && cell.includes('Child Name'))) {
            headerRowIndex = i;
            break;
          }
        }

        const headers = rawData[headerRowIndex].map(h => h ? cleanHeader(h.toString()) : '');
        const rows = rawData.slice(headerRowIndex + 1);

        const parsedData = rows.map(row => {
          const obj = {};
          headers.forEach((h, i) => {
            if (h) obj[h] = row[i];
          });
          return obj;
        }).filter(obj => obj['Child Name']); // Only rows with a child name

        // Map to DB fields
        const mappedData = parsedData.map(row => {
          // Helper to safely find a value by partial header match
          const getVal = (partialKey) => {
            const key = Object.keys(row).find(k => k.includes(partialKey));
            return key ? row[key] : null;
          };

          return {
            enquiry_date: getVal('Enquiry Date'),
            child_name: getVal('Child Name'),
            parent_name: getVal('Parent Name'),
            whatsapp_no: getVal('WhatsApp No'),
            class: getVal('Class'),
            source_area: getVal('Source/Area'),
            follow_up_date_1: getVal('Follow-up Date 1'),
            follow_up_date_2: getVal('Follow-up Date 2'),
            follow_up_date_3: getVal('Follow-up Date 3'),
            status: getVal('STATUS'),
            admission_no: getVal('Admission No'),
            join_date: getVal('Join Date'),
            remarks: getVal('Remarks'),
            internal_notes: getVal('Internal Notes')
          };
        });

        const res = await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappedData)
        });

        if (res.ok) {
          alert('Import successful!');
          fetchEnquiries();
        } else {
          alert('Failed to import.');
        }

      } catch (err) {
        console.error(err);
        alert('Error parsing Excel file.');
      } finally {
        setImporting(false);
        e.target.value = null; // reset input
      }
    };
    reader.readAsBinaryString(file);
  };

  const openEditModal = (enquiry) => {
    setEditing({ ...enquiry });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/enquiries/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing)
      });
      const data = await res.json();
      if (data.success) {
        if (data.admission_no) {
          alert(`Successfully joined! Generated Admission No: ${data.admission_no}`);
        }
        setIsModalOpen(false);
        fetchEnquiries();
      } else {
        alert('Failed to save.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const res = await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      if (res.ok) fetchEnquiries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Enquiries Management</h1>
        <div className="flex gap-4">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
            <Upload size={18} />
            {importing ? 'Importing...' : 'Bulk Import (Excel/CSV)'}
            <input type="file" accept=".xlsx, .csv" className="hidden" onChange={handleFileUpload} disabled={importing} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 uppercase text-sm border-b">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Child Name</th>
              <th className="px-4 py-3">Parent Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
            ) : enquiries.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-gray-500">No enquiries found. Import some data!</td></tr>
            ) : (
              enquiries.map((eq) => (
                <tr key={eq.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600">#{eq.id}</td>
                  <td className="px-4 py-3">{eq.enquiry_date?.substring(0,10) || '-'}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{eq.child_name}</td>
                  <td className="px-4 py-3 text-gray-600">{eq.parent_name}</td>
                  <td className="px-4 py-3 text-gray-600">{eq.whatsapp_no}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      eq.status === 'Joined' ? 'bg-green-100 text-green-800' :
                      eq.status === 'Follow-up' ? 'bg-yellow-100 text-yellow-800' :
                      eq.status === 'Not Interested' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {eq.status || 'Follow-up'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditModal(eq)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(eq.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Enquiry</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.child_name || ''} onChange={(e) => setEditing({...editing, child_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.parent_name || ''} onChange={(e) => setEditing({...editing, parent_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp No</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.whatsapp_no || ''} onChange={(e) => setEditing({...editing, whatsapp_no: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.class || ''} onChange={(e) => setEditing({...editing, class: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full border rounded p-2 bg-white" value={editing.status || 'Follow-up'} onChange={(e) => setEditing({...editing, status: e.target.value})}>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Joined">Joined</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source/Area</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.source_area || ''} onChange={(e) => setEditing({...editing, source_area: e.target.value})} />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea className="w-full border rounded p-2" rows="3" value={editing.remarks || ''} onChange={(e) => setEditing({...editing, remarks: e.target.value})}></textarea>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
