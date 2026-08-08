const db = require('./config/db');

async function updateInvoicesTable() {
  try {
    console.log('Adding paid_amount column to invoices table if not exists...');
    
    // Check if paid_amount column exists
    const [cols] = await db.query(`SHOW COLUMNS FROM invoices LIKE 'paid_amount'`);
    if (cols.length === 0) {
      await db.query(`ALTER TABLE invoices ADD COLUMN paid_amount DECIMAL(12,2) DEFAULT 0 AFTER amount`);
      console.log('Column paid_amount added to invoices table.');
    } else {
      console.log('Column paid_amount already exists.');
    }

    // Update existing records sample data
    await db.query(`UPDATE invoices SET paid_amount = amount WHERE payment_status = 'Paid'`);
    await db.query(`UPDATE invoices SET paid_amount = 150000 WHERE invoice_number = 'INV-1002' OR payment_status = 'Partially Paid'`);
    
    console.log('Invoices sample data updated.');
    process.exit(0);
  } catch (err) {
    console.error('Error updating invoices table:', err.message);
    process.exit(1);
  }
}

updateInvoicesTable();
