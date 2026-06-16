import { query } from '../lib/db.js';

async function createTables() {
  console.log('Connected to MySQL via db.js.');

  const createEnquiriesTable = `
    CREATE TABLE IF NOT EXISTS enquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enquiry_date VARCHAR(255),
      child_name VARCHAR(255),
      parent_name VARCHAR(255),
      whatsapp_no VARCHAR(255),
      class VARCHAR(255),
      source_area VARCHAR(255),
      follow_up_date_1 VARCHAR(255),
      follow_up_date_2 VARCHAR(255),
      follow_up_date_3 VARCHAR(255),
      status VARCHAR(255) DEFAULT 'Follow-up',
      admission_no VARCHAR(255),
      join_date VARCHAR(255),
      remarks TEXT,
      internal_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  const createStudentsTable = `
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admission_no VARCHAR(255) UNIQUE,
      student_full_name VARCHAR(255),
      date_of_birth VARCHAR(255),
      gender VARCHAR(255),
      blood_group VARCHAR(255),
      class_as_per_doj VARCHAR(255),
      admsn_class VARCHAR(255),
      section VARCHAR(255),
      join_date VARCHAR(255),
      father_full_name VARCHAR(255),
      father_mobile VARCHAR(255),
      father_whatsapp VARCHAR(255),
      father_email VARCHAR(255),
      father_occupation VARCHAR(255),
      father_qualification VARCHAR(255),
      father_aadhaar VARCHAR(255),
      father_alt_mobile VARCHAR(255),
      mother_full_name VARCHAR(255),
      mother_mobile VARCHAR(255),
      mother_whatsapp VARCHAR(255),
      mother_email VARCHAR(255),
      mother_occupation VARCHAR(255),
      mother_qualification VARCHAR(255),
      mother_aadhaar VARCHAR(255),
      mother_alt_mobile VARCHAR(255),
      sibling_1_name VARCHAR(255),
      sibling_1_class VARCHAR(255),
      sibling_2_name VARCHAR(255),
      sibling_2_class VARCHAR(255),
      medical_allergy_notes TEXT,
      emergency_contact VARCHAR(255),
      emergency_mobile VARCHAR(255),
      relation VARCHAR(255),
      aadhaar_no VARCHAR(255),
      pen_no VARCHAR(255),
      apaar_udise VARCHAR(255),
      full_address TEXT,
      status VARCHAR(255) DEFAULT 'ACTIVE',
      photo_link VARCHAR(255),
      exit_date VARCHAR(255),
      exit_reason TEXT,
      tc_no VARCHAR(255),
      tc_date VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log('Creating enquiries table...');
    await query(createEnquiriesTable);
    console.log('Enquiries table created or already exists.');

    console.log('Creating students table...');
    await query(createStudentsTable);
    console.log('Students table created or already exists.');
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  }
}

createTables();
