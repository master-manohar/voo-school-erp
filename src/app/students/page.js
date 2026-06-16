'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Edit, Trash2 } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const json = await res.json();
      if (json.success) {
        setStudents(json.data);
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
        
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (rawData.length < 2) return;
        
        let headerRowIndex = 0;
        for (let i = 0; i < rawData.length; i++) {
          if (rawData[i].some(cell => typeof cell === 'string' && cell.includes('Student Full Name'))) {
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
        }).filter(obj => obj['Admission No. ★'] || obj['Admission No']); 

        const mappedData = parsedData.map(row => {
          const getVal = (partialKey) => {
            const key = Object.keys(row).find(k => k.includes(partialKey));
            return key ? row[key] : null;
          };

          return {
            admission_no: getVal('Admission No'),
            student_full_name: getVal('Student Full Name'),
            date_of_birth: getVal('Date of Birth'),
            gender: getVal('Gender'),
            blood_group: getVal('Blood Group'),
            class_as_per_doj: getVal('Class AS PER DOJ'),
            admsn_class: getVal('Admsn class'),
            section: getVal('Section'),
            join_date: getVal('Join Date'),
            father_full_name: getVal('Father Full Name'),
            father_mobile: getVal('Father Mobile'),
            father_whatsapp: getVal('Father WhatsApp'),
            father_email: getVal('Father Email'),
            father_occupation: getVal('Father Occupation'),
            father_qualification: getVal('Father Qualification'),
            father_aadhaar: getVal('Father Aadhaar'),
            father_alt_mobile: getVal('Father Alt. Mobile'),
            mother_full_name: getVal('Mother Full Name'),
            mother_mobile: getVal('Mother Mobile'),
            mother_whatsapp: getVal('Mother WhatsApp'),
            mother_email: getVal('Mother Email'),
            mother_occupation: getVal('Mother Occupation'),
            mother_qualification: getVal('Mother Qualification'),
            mother_aadhaar: getVal('Mother Aadhaar'),
            mother_alt_mobile: getVal('Mother Alt. Mobile'),
            sibling_1_name: getVal('Sibling 1 Name'),
            sibling_1_class: getVal('Sibling 1 Class'),
            sibling_2_name: getVal('Sibling 2 Name'),
            sibling_2_class: getVal('Sibling 2 Class'),
            medical_allergy_notes: getVal('Medical / Allergy Notes'),
            emergency_contact: getVal('Emergency Contact'),
            emergency_mobile: getVal('Emergency Mobile'),
            relation: getVal('Relation'),
            aadhaar_no: getVal('Aadhaar No.'),
            pen_no: getVal('PEN No.'),
            apaar_udise: getVal('APAAR / UDISE'),
            full_address: getVal('Full Address'),
            status: getVal('Status') || getVal('STATUS'),
            photo_link: getVal('Photo Link'),
            exit_date: getVal('Exit Date'),
            exit_reason: getVal('Exit Reason'),
            tc_no: getVal('TC No.'),
            tc_date: getVal('TC Date')
          };
        });

        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mappedData)
        });

        if (res.ok) {
          alert('Import successful!');
          fetchStudents();
        } else {
          alert('Failed to import.');
        }

      } catch (err) {
        console.error(err);
        alert('Error parsing Excel file.');
      } finally {
        setImporting(false);
        e.target.value = null; 
      }
    };
    reader.readAsBinaryString(file);
  };

  const openEditModal = (student) => {
    setEditing({ ...student });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/students/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing)
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchStudents();
      } else {
        alert('Failed to save.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Directory</h1>
        <div className="flex gap-4">
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors">
            <Upload size={18} />
            {importing ? 'Importing...' : 'Bulk Import (Excel/CSV)'}
            <input type="file" accept=".xlsx, .csv" className="hidden" onChange={handleFileUpload} disabled={importing} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto max-h-[70vh]">
        <table className="min-w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr className="text-gray-700 uppercase text-xs">
              <th className="px-4 py-3">Adm No.</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Father Name</th>
              <th className="px-4 py-3">Father Mobile</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-4 text-gray-500">No students found. Import some data!</td></tr>
            ) : (
              students.map((st) => (
                <tr key={st.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 font-semibold">{st.admission_no}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{st.student_full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{st.admsn_class || st.class_as_per_doj}</td>
                  <td className="px-4 py-3 text-gray-600">{st.father_full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{st.father_mobile}</td>
                  <td className="px-4 py-3">
                    <span className={\`px-2 py-1 rounded text-xs font-semibold \${
                      st.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }\`}>
                      {st.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEditModal(st)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(st.id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Edit Student</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.student_full_name || ''} onChange={(e) => setEditing({...editing, student_full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission No.</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.admission_no || ''} onChange={(e) => setEditing({...editing, admission_no: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Class</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.admsn_class || ''} onChange={(e) => setEditing({...editing, admsn_class: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full border rounded p-2 bg-white" value={editing.status || 'ACTIVE'} onChange={(e) => setEditing({...editing, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="IN-ACTIVE">IN-ACTIVE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father Name</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.father_full_name || ''} onChange={(e) => setEditing({...editing, father_full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father Mobile</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.father_mobile || ''} onChange={(e) => setEditing({...editing, father_mobile: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother Name</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.mother_full_name || ''} onChange={(e) => setEditing({...editing, mother_full_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother Mobile</label>
                  <input type="text" className="w-full border rounded p-2" value={editing.mother_mobile || ''} onChange={(e) => setEditing({...editing, mother_mobile: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                  <textarea className="w-full border rounded p-2" rows="2" value={editing.full_address || ''} onChange={(e) => setEditing({...editing, full_address: e.target.value})}></textarea>
                </div>
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
