import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET all enquiries
export async function GET() {
  try {
    const enquiries = await query('SELECT * FROM enquiries ORDER BY id DESC', []);
    return NextResponse.json({ success: true, data: enquiries });
  } catch (error) {
    console.error('Failed to fetch enquiries:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

// POST new enquiries (single or bulk array)
export async function POST(request) {
  try {
    const body = await request.json();
    const dataArray = Array.isArray(body) ? body : [body];

    if (dataArray.length === 0) {
      return NextResponse.json({ success: false, error: 'No data provided' }, { status: 400 });
    }

    // Prepare fields based on schema
    const fields = [
      'enquiry_date', 'child_name', 'parent_name', 'whatsapp_no', 'class', 
      'source_area', 'follow_up_date_1', 'follow_up_date_2', 'follow_up_date_3', 
      'status', 'admission_no', 'join_date', 'remarks', 'internal_notes'
    ];

    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO enquiries (${fields.join(', ')}) VALUES (${placeholders})`;

    // Insert all records
    for (const data of dataArray) {
      const values = fields.map(field => data[field] || null);
      await query(sql, values);
    }

    return NextResponse.json({ success: true, message: `Inserted ${dataArray.length} enquiries` });
  } catch (error) {
    console.error('Failed to insert enquiries:', error);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
