const db = require('./config/db');

async function initQuotationsTable() {
  try {
    console.log('Creating quotations table if not exists...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS quotations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          quotation_number VARCHAR(50) NOT NULL,
          client_name VARCHAR(150) NOT NULL,
          project_title VARCHAR(200),
          email VARCHAR(150),
          phone VARCHAR(20),
          total_amount DECIMAL(12,2) DEFAULT 0,
          quotation_date DATE,
          valid_until DATE,
          status VARCHAR(30) DEFAULT 'Draft',
          terms TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Quotations table verified/created.');

    const [rows] = await db.query('SELECT COUNT(*) as cnt FROM quotations');
    if (rows[0].cnt === 0) {
      await db.query(`
        INSERT INTO quotations (quotation_number, client_name, project_title, email, phone, total_amount, quotation_date, valid_until, status, terms) VALUES
        ('QT-1001', 'Bharat Industries', 'Enterprise CRM & Automation Suite', 'bharat@bharatind.com', '9876500001', 650000, '2026-08-01', '2026-08-15', 'Sent', '50% Advance, 50% on project delivery.'),
        ('QT-1002', 'Prakash Ltd.', 'Cloud Infrastructure Migration', 'prakash@prakashltd.com', '9876500002', 420000, '2026-08-02', '2026-08-17', 'Draft', 'GST (18%) extra as applicable.');
      `);
      console.log('Sample quotations inserted successfully.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error initializing quotations table:', err.message);
    process.exit(1);
  }
}

initQuotationsTable();
