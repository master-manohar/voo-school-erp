import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request, context) {
  try {
    const { params } = context;
    const { id } = await params; // Next.js 15+ needs await for params, safe practice
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Fields that can be updated
    const updateFields = [
      'enquiry_date', 'child_name', 'parent_name', 'whatsapp_no', 'class', 
      'source_area', 'follow_up_date_1', 'follow_up_date_2', 'follow_up_date_3', 
      'status', 'admission_no', 'join_date', 'remarks', 'internal_notes'
    ];

    let setClauses = [];
    let values = [];

    // Filter fields to only what's in the body
    for (const field of updateFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, error: 'No data to update' }, { status: 400 });
    }

    // Special Logic: Moving to 'Joined' state
    let newAdmissionNo = null;
    let newlyJoined = false;

    if (body.status === 'Joined') {
      // Check if it already has an admission number
      const existing = await query('SELECT admission_no FROM enquiries WHERE id = ?', [id]);
      if (existing.length > 0 && !existing[0].admission_no) {
        // Needs an admission number
        const currentYear = new Date().getFullYear();
        // Find highest admission number for this year in students table to auto-increment
        const students = await query(`SELECT admission_no FROM students WHERE admission_no LIKE ? ORDER BY id DESC LIMIT 1`, [\`\${currentYear}-%\`]);
        
        let nextSequence = 1;
        if (students.length > 0) {
          const lastNumStr = students[0].admission_no.split('-')[1];
          if (lastNumStr) {
            nextSequence = parseInt(lastNumStr, 10) + 1;
          }
        }
        
        newAdmissionNo = \`\${currentYear}-\${nextSequence}\`;
        
        // Add to our update
        if (!setClauses.includes('admission_no = ?')) {
          setClauses.push('admission_no = ?');
          values.push(newAdmissionNo);
        } else {
          // If admission_no was in body but empty, find its index and replace value
          const idx = setClauses.indexOf('admission_no = ?');
          values[idx] = newAdmissionNo;
        }

        // Also update join_date if not set
        if (!setClauses.includes('join_date = ?') && !body.join_date) {
          const today = new Date().toISOString().split('T')[0];
          setClauses.push('join_date = ?');
          values.push(today);
          body.join_date = today; // to use later for student record
        }
        
        newlyJoined = true;
      }
    }

    values.push(id);
    const sql = `UPDATE enquiries SET ${setClauses.join(', ')} WHERE id = ?`;
    await query(sql, values);

    // If newly joined, insert into students table
    if (newlyJoined) {
      // Get the full updated enquiry
      const fullEnquiryRes = await query('SELECT * FROM enquiries WHERE id = ?', [id]);
      if (fullEnquiryRes.length > 0) {
        const enquiry = fullEnquiryRes[0];
        
        const studentSql = `
          INSERT INTO students (
            admission_no, student_full_name, admsn_class, join_date, 
            father_full_name, father_whatsapp
          ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        const studentValues = [
          enquiry.admission_no,
          enquiry.child_name || '',
          enquiry.class || '',
          enquiry.join_date || '',
          enquiry.parent_name || '',
          enquiry.whatsapp_no || ''
        ];
        
        try {
          await query(studentSql, studentValues);
          console.log(`Auto-created student record for admission no: ${enquiry.admission_no}`);
        } catch (insertErr) {
          console.error("Failed to insert into students automatically:", insertErr);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Enquiry updated successfully',
      admission_no: newAdmissionNo || body.admission_no
    });

  } catch (error) {
    console.error('Failed to update enquiry:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

// DELETE enquiry
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await query('DELETE FROM enquiries WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Enquiry deleted' });
  } catch (error) {
    console.error('Failed to delete enquiry:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
