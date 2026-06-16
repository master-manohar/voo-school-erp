import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request, context) {
  try {
    const { params } = context;
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();

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

    let setClauses = [];
    let values = [];

    // Filter fields to only what's in the body
    for (const field of fields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, error: 'No data to update' }, { status: 400 });
    }

    values.push(id);
    const sql = `UPDATE students SET ${setClauses.join(', ')} WHERE id = ?`;
    await query(sql, values);

    return NextResponse.json({ success: true, message: 'Student updated successfully' });

  } catch (error) {
    console.error('Failed to update student:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

// DELETE student
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await query('DELETE FROM students WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    console.error('Failed to delete student:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
