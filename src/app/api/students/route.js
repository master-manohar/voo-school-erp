import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET all students
export async function GET() {
  try {
    const students = await query('SELECT * FROM students ORDER BY id DESC', []);
    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

// POST new students (single or bulk array)
export async function POST(request) {
  try {
    const body = await request.json();
    const dataArray = Array.isArray(body) ? body : [body];

    if (dataArray.length === 0) {
      return NextResponse.json({ success: false, error: 'No data provided' }, { status: 400 });
    }

    // Prepare fields based on schema
    const fields = [
      'admission_no', 'student_full_name', 'date_of_birth', 'gender', 'blood_group',
      'class_as_per_doj', 'admsn_class', 'section', 'join_date', 'father_full_name',
      'father_mobile', 'father_whatsapp', 'father_email', 'father_occupation',
      'father_qualification', 'father_aadhaar', 'father_alt_mobile', 'mother_full_name',
      'mother_mobile', 'mother_whatsapp', 'mother_email', 'mother_occupation',
      'mother_qualification', 'mother_aadhaar', 'mother_alt_mobile', 'sibling_1_name',
      'sibling_1_class', 'sibling_2_name', 'sibling_2_class', 'medical_allergy_notes',
      'emergency_contact', 'emergency_mobile', 'relation', 'aadhaar_no', 'pen_no',
      'apaar_udise', 'full_address', 'status', 'photo_link', 'exit_date', 'exit_reason',
      'tc_no', 'tc_date'
    ];

    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO students (${fields.join(', ')}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE student_full_name=VALUES(student_full_name)`;
    // Notice ON DUPLICATE KEY UPDATE: if we upload the same student_no twice it avoids crashing and just updates the name (or could update more)

    // Insert all records
    for (const data of dataArray) {
      const values = fields.map(field => data[field] || null);
      await query(sql, values);
    }

    return NextResponse.json({ success: true, message: `Inserted/Updated ${dataArray.length} students` });
  } catch (error) {
    console.error('Failed to insert students:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
