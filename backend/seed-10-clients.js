const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('⏳ Clearing old data and creating 10 Client Dataset...');

    // Disable foreign key checks for clean truncation/deletion
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Truncate existing tables
    const tables = ['users', 'leads', 'contacts', 'accounts', 'deals', 'tasks', 'appointments', 'invoices', 'products', 'campaigns', 'tickets'];
    for (const table of tables) {
      await db.query(`TRUNCATE TABLE ${table};`);
    }

    await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('🧹 Old data removed successfully!');

    // 1. SEED USERS (Admin user & Sales Manager)
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedSalesPassword = await bcrypt.hash('sales123', 10);

    await db.query(`
      INSERT INTO users (name, email, password, profile_image, role) VALUES
      ('Admin User', 'admin@demo.com', ?, 'https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff', 'Admin'),
      ('Shruti Joshi', 'admin@crm.com', ?, 'https://ui-avatars.com/api/?name=Shruti+Joshi&background=7c3aed&color=fff', 'Admin'),
      ('Sales Manager', 'sales@demo.com', ?, 'https://ui-avatars.com/api/?name=Sales+Manager&background=059669&color=fff', 'User');
    `, [hashedAdminPassword, hashedAdminPassword, hashedSalesPassword]);
    console.log('✅ Seeded default login users: admin@demo.com, admin@crm.com & sales@demo.com');

    // 2. SEED 10 CLIENT ACCOUNTS
    await db.query(`
      INSERT INTO accounts (company_name, industry, website, address, gst_tax_id, company_size, account_owner) VALUES
      ('Apex Digital Solutions', 'IT Services', 'www.apexdigital.com', 'Bangalore, India', 'GST29APEX001', '100-250', 'Admin User'),
      ('Nova Healthcare Systems', 'Healthcare', 'www.novahealth.org', 'Mumbai, India', 'GST27NOVA002', '500-1000', 'Admin User'),
      ('Zenith Logistics & Supply', 'Logistics', 'www.zenithlogistics.com', 'Chennai, India', 'GST33ZEN003', '250-500', 'Admin User'),
      ('Starlight Retail Group', 'Retail & E-Commerce', 'www.starlightretail.com', 'Delhi, India', 'GST07STAR004', '50-100', 'Admin User'),
      ('Quantum Financial Advisors', 'Banking & Finance', 'www.quantumfin.com', 'Mumbai, India', 'GST27QUAN005', '100-250', 'Admin User'),
      ('BlueSky Real Estate', 'Real Estate', 'www.blueskyrealestate.in', 'Hyderabad, India', 'GST36BLUE006', '250-500', 'Admin User'),
      ('Evolve EdTech Solutions', 'Education', 'www.evolveedtech.com', 'Pune, India', 'GST27EVOL007', '20-50', 'Admin User'),
      ('Nexus Renewable Energy', 'Clean Energy', 'www.nexusenergy.com', 'Ahmedabad, India', 'GST24NEX008', '100-250', 'Admin User'),
      ('CyberShield Technologies', 'Cybersecurity', 'www.cybershield.tech', 'Bangalore, India', 'GST29CYB009', '50-100', 'Admin User'),
      ('Global Dynamics Mfg', 'Manufacturing', 'www.globaldynamics.com', 'Kolkata, India', 'GST19GLOB010', '1000+', 'Admin User');
    `);
    console.log('✅ Seeded 10 Accounts');

    // 3. SEED 10 CONTACTS
    await db.query(`
      INSERT INTO contacts (contact_name, company_name, email, phone, designation, relationship, address) VALUES
      ('Rajesh Verma', 'Apex Digital Solutions', 'rajesh@apexdigital.com', '9876543210', 'Chief Executive Officer', 'Client', 'Bangalore, India'),
      ('Dr. Ananya Iyer', 'Nova Healthcare Systems', 'ananya@novahealth.org', '9876543211', 'Medical Director', 'Client', 'Mumbai, India'),
      ('Vikram Singh', 'Zenith Logistics & Supply', 'vikram@zenithlogistics.com', '9876543212', 'VP Operations', 'Client', 'Chennai, India'),
      ('Priya Nair', 'Starlight Retail Group', 'priya@starlightretail.com', '9876543213', 'Head of E-Commerce', 'Client', 'Delhi, India'),
      ('Amit Kulkarni', 'Quantum Financial Advisors', 'amit@quantumfin.com', '9876543214', 'Managing Partner', 'Partner', 'Mumbai, India'),
      ('Sunita Kapoor', 'BlueSky Real Estate', 'sunita@blueskyrealestate.in', '9876543215', 'General Manager', 'Client', 'Hyderabad, India'),
      ('Arjun Mehta', 'Evolve EdTech Solutions', 'arjun@evolveedtech.com', '9876543216', 'Product Head', 'Client', 'Pune, India'),
      ('Meera Joshi', 'Nexus Renewable Energy', 'meera@nexusenergy.com', '9876543217', 'Chief Sustainability Officer', 'Client', 'Ahmedabad, India'),
      ('Rohan Deshmukh', 'CyberShield Technologies', 'rohan@cybershield.tech', '9876543218', 'CISO', 'Vendor', 'Bangalore, India'),
      ('Sanjay Patel', 'Global Dynamics Mfg', 'sanjay@globaldynamics.com', '9876543219', 'Plant Director', 'Client', 'Kolkata, India');
    `);
    console.log('✅ Seeded 10 Contacts');

    // 4. SEED 10 LEADS
    await db.query(`
      INSERT INTO leads (lead_name, company_name, email, phone, source, interested_in, lead_status, assigned_to) VALUES
      ('Apex Cloud Expansion', 'Apex Digital Solutions', 'rajesh@apexdigital.com', '9876543210', 'Website', 'Cloud Infrastructure', 'Qualified', 'Admin User'),
      ('Nova Hospital Integration', 'Nova Healthcare Systems', 'ananya@novahealth.org', '9876543211', 'Referral', 'Hospital CRM Module', 'Contacted', 'Admin User'),
      ('Zenith Fleet Tracking', 'Zenith Logistics & Supply', 'vikram@zenithlogistics.com', '9876543212', 'Social Media', 'IoT Fleet Automation', 'Qualified', 'Admin User'),
      ('Starlight Multi-Channel POS', 'Starlight Retail Group', 'priya@starlightretail.com', '9876543213', 'Email Campaign', 'Omnichannel POS System', 'New', 'Admin User'),
      ('Quantum Portal Audit', 'Quantum Financial Advisors', 'amit@quantumfin.com', '9876543214', 'Walk-in', 'Fintech Security Suite', 'Qualified', 'Admin User'),
      ('BlueSky ERP Rollout', 'BlueSky Real Estate', 'sunita@blueskyrealestate.in', '9876543215', 'Website', 'Real Estate ERP', 'Contacted', 'Admin User'),
      ('Evolve LMS Portal', 'Evolve EdTech Solutions', 'arjun@evolveedtech.com', '9876543216', 'Referral', 'EdTech LMS Expansion', 'Qualified', 'Admin User'),
      ('Nexus Solar Analytics', 'Nexus Renewable Energy', 'meera@nexusenergy.com', '9876543217', 'Social Media', 'Clean Energy Analytics', 'New', 'Admin User'),
      ('CyberShield SOC Platform', 'CyberShield Technologies', 'rohan@cybershield.tech', '9876543218', 'Email Campaign', 'Security Operations Suite', 'Contacted', 'Admin User'),
      ('Global Smart Factory IoT', 'Global Dynamics Mfg', 'sanjay@globaldynamics.com', '9876543219', 'Walk-in', 'Smart Plant Automation', 'Qualified', 'Admin User');
    `);
    console.log('✅ Seeded 10 Leads');

    // 5. SEED 10 DEALS
    await db.query(`
      INSERT INTO deals (deal_name, account_name, value, stage, probability, expected_close_date, source, assigned_to) VALUES
      ('Apex Cloud Infrastructure', 'Apex Digital Solutions', 1250000.00, 'Proposal Sent', 70, '2026-08-20', 'Website', 'Admin User'),
      ('Nova Hospital CRM Suite', 'Nova Healthcare Systems', 820000.00, 'Negotiation', 80, '2026-08-25', 'Referral', 'Admin User'),
      ('Zenith Fleet Automation', 'Zenith Logistics & Supply', 1500000.00, 'Closed Won', 100, '2026-07-15', 'Social Media', 'Admin User'),
      ('Starlight Omnichannel POS', 'Starlight Retail Group', 650000.00, 'New Leads', 30, '2026-09-05', 'Email Campaign', 'Admin User'),
      ('Quantum Fintech Security', 'Quantum Financial Advisors', 980000.00, 'Negotiation', 75, '2026-08-30', 'Walk-in', 'Admin User'),
      ('BlueSky Property ERP', 'BlueSky Real Estate', 1800000.00, 'Proposal Sent', 65, '2026-09-15', 'Website', 'Admin User'),
      ('Evolve LMS Portal Suite', 'Evolve EdTech Solutions', 540000.00, 'Closed Won', 100, '2026-07-10', 'Referral', 'Admin User'),
      ('Nexus Solar Analytics Platform', 'Nexus Renewable Energy', 1100000.00, 'Contacted', 40, '2026-09-20', 'Social Media', 'Admin User'),
      ('CyberShield SOC Automation', 'CyberShield Technologies', 1420000.00, 'Qualified', 60, '2026-09-10', 'Email Campaign', 'Admin User'),
      ('Global Smart Factory IoT', 'Global Dynamics Mfg', 2200000.00, 'Closed Won', 100, '2026-07-05', 'Walk-in', 'Admin User');
    `);
    console.log('✅ Seeded 10 Deals');

    // 6. SEED 10 INVOICES
    await db.query(`
      INSERT INTO invoices (invoice_number, client_account, invoice_date, due_date, amount, payment_status, payment_mode) VALUES
      ('INV-2026-001', 'Apex Digital Solutions', '2026-07-01', '2026-07-15', 1250000.00, 'Paid', 'Bank Transfer'),
      ('INV-2026-002', 'Nova Healthcare Systems', '2026-07-05', '2026-07-20', 410000.00, 'Pending', 'Cheque'),
      ('INV-2026-003', 'Zenith Logistics & Supply', '2026-06-25', '2026-07-10', 1500000.00, 'Paid', 'Bank Transfer'),
      ('INV-2026-004', 'Starlight Retail Group', '2026-07-10', '2026-07-25', 325000.00, 'Pending', 'Credit Card'),
      ('INV-2026-005', 'Quantum Financial Advisors', '2026-06-15', '2026-06-30', 980000.00, 'Overdue', 'Bank Transfer'),
      ('INV-2026-006', 'BlueSky Real Estate', '2026-07-02', '2026-07-17', 900000.00, 'Paid', 'Cheque'),
      ('INV-2026-007', 'Evolve EdTech Solutions', '2026-06-28', '2026-07-12', 540000.00, 'Paid', 'Bank Transfer'),
      ('INV-2026-008', 'Nexus Renewable Energy', '2026-07-12', '2026-07-27', 550000.00, 'Pending', 'Bank Transfer'),
      ('INV-2026-009', 'CyberShield Technologies', '2026-07-08', '2026-07-23', 1420000.00, 'Pending', 'NEFT'),
      ('INV-2026-010', 'Global Dynamics Mfg', '2026-06-20', '2026-07-05', 2200000.00, 'Paid', 'RTGS');
    `);
    console.log('✅ Seeded 10 Invoices');

    // 7. SEED 10 TASKS
    await db.query(`
      INSERT INTO tasks (task_name, related_to, type, due_date, priority, status, assigned_to) VALUES
      ('Present Cloud Architecture Deck', 'Apex Digital Solutions', 'Meeting', '2026-08-05', 'High', 'In Progress', 'Admin User'),
      ('Schedule Hospital Security Review', 'Nova Healthcare Systems', 'Call', '2026-08-06', 'High', 'Pending', 'Admin User'),
      ('Finalize Logistics Contract Signing', 'Zenith Logistics & Supply', 'Meeting', '2026-07-16', 'Medium', 'Completed', 'Admin User'),
      ('Send Retail POS Trial License', 'Starlight Retail Group', 'Email', '2026-08-08', 'Low', 'Pending', 'Admin User'),
      ('Follow up on Overdue Audit Invoice', 'Quantum Financial Advisors', 'Call', '2026-08-01', 'High', 'Pending', 'Admin User'),
      ('Review Real Estate Blueprint Plans', 'BlueSky Real Estate', 'Meeting', '2026-08-10', 'Medium', 'In Progress', 'Admin User'),
      ('Deploy EdTech LMS Production Build', 'Evolve EdTech Solutions', 'Email', '2026-07-12', 'High', 'Completed', 'Admin User'),
      ('Prepare Clean Energy Proposal Draft', 'Nexus Renewable Energy', 'Email', '2026-08-12', 'Medium', 'Pending', 'Admin User'),
      ('Conduct SOC Vulnerability Demo', 'CyberShield Technologies', 'Meeting', '2026-08-04', 'High', 'In Progress', 'Admin User'),
      ('Sign Smart Factory Handover Specs', 'Global Dynamics Mfg', 'Meeting', '2026-07-08', 'High', 'Completed', 'Admin User');
    `);
    console.log('✅ Seeded 10 Tasks');

    // 8. SEED 10 APPOINTMENTS
    await db.query(`
      INSERT INTO appointments (title, with_person, appointment_date, appointment_time, location, status, notes) VALUES
      ('Cloud Solution Review', 'Rajesh Verma (Apex)', '2026-08-05', '10:30 AM', 'Bangalore HQ', 'Scheduled', 'Discuss cloud server specs'),
      ('Hospital Integration Demo', 'Dr. Ananya Iyer (Nova)', '2026-08-06', '02:00 PM', 'Google Meet', 'Scheduled', 'Live CRM walkthrough'),
      ('Operations Sign-off', 'Vikram Singh (Zenith)', '2026-07-16', '11:00 AM', 'Chennai Office', 'Completed', 'Contract executed'),
      ('POS Requirements Gathering', 'Priya Nair (Starlight)', '2026-08-08', '04:00 PM', 'Zoom Meeting', 'Scheduled', 'E-commerce integration'),
      ('Audit Settlement Call', 'Amit Kulkarni (Quantum)', '2026-08-01', '03:30 PM', 'Phone Call', 'Scheduled', 'Payment timeline discussion'),
      ('ERP Site Survey', 'Sunita Kapoor (BlueSky)', '2026-08-10', '11:30 AM', 'Hyderabad Site', 'Scheduled', 'On-site technical survey'),
      ('LMS Portal Handover', 'Arjun Mehta (Evolve)', '2026-07-12', '10:00 AM', 'Pune Hub', 'Completed', 'Training session complete'),
      ('Solar Tech Briefing', 'Meera Joshi (Nexus)', '2026-08-12', '01:00 PM', 'Google Meet', 'Scheduled', 'Green energy data flow'),
      ('Security SOC Briefing', 'Rohan Deshmukh (CyberShield)', '2026-08-04', '05:00 PM', 'Bangalore Office', 'Scheduled', 'Threat detection demo'),
      ('Factory Automation Inspection', 'Sanjay Patel (Global Mfg)', '2026-07-08', '09:30 AM', 'Kolkata Plant', 'Completed', 'Final sign-off');
    `);
    console.log('✅ Seeded 10 Appointments');

    // 9. SEED PRODUCTS
    await db.query(`
      INSERT INTO products (product_name, category, description, price, unit, tax, status) VALUES
      ('Enterprise CRM License', 'Software', 'Annual CRM cloud user subscription', 18000.00, 'Per User', 18, 'Active'),
      ('Cloud ERP Module', 'Software', 'Integrated ERP system per organization', 250000.00, 'License', 18, 'Active'),
      ('IoT Fleet Automation', 'Hardware/Software', 'Real-time vehicle tracking GPS unit', 35000.00, 'Per Unit', 18, 'Active'),
      ('Security Audit Service', 'Service', 'End-to-end vulnerability assessment', 120000.00, 'Project', 18, 'Active');
    `);
    console.log('✅ Seeded Products');

    // 10. SEED CAMPAIGNS & TICKETS
    await db.query(`
      INSERT INTO campaigns (campaign_name, type, start_date, end_date, budget, status) VALUES
      ('Q3 Enterprise Growth Campaign', 'Email', '2026-07-01', '2026-09-30', 150000.00, 'Active'),
      ('Smart Automation Summit 2026', 'Event', '2026-08-15', '2026-08-17', 300000.00, 'Planned');
    `);

    await db.query(`
      INSERT INTO tickets (subject, client_name, priority, status, assigned_to, description) VALUES
      ('API rate limit query', 'Apex Digital Solutions', 'High', 'Open', 'Admin User', 'Client requested higher API call limits.'),
      ('Invoice GST tax line clarification', 'Nova Healthcare Systems', 'Medium', 'In Progress', 'Admin User', 'Clarification needed on tax breakdown.');
    `);
    console.log('✅ Seeded Campaigns & Support Tickets');

    console.log('🎉 10 CLIENT DATASET SEEDED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    process.exit(1);
  }
}

seedDatabase();
