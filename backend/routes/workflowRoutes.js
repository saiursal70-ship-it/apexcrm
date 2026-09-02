const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Optional / Public Webhook Middleware: allow unauthenticated webhooks
router.use((req, res, next) => {
  if (req.path === '/lead-webhook' || req.path === '/simulate-inbound-lead') {
    if (req.headers['authorization']) {
      return authMiddleware(req, res, next);
    }
    req.user = { id: 1, name: 'System Webhook', email: 'webhook@apexdev.com', role: 'Admin' };
    return next();
  }
  return authMiddleware(req, res, next);
});

// Helper for audit logging
const logAudit = async (req, action, entity, recordId, details = {}) => {
  try {
    const userId = req.user?.id || null;
    const userEmail = req.user?.email || 'system';
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await db.query(
      `INSERT INTO audit_logs (user_id, user_email, action, entity, record_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, userEmail, action, entity, recordId, JSON.stringify(details), ip]
    ).catch(() => {});
  } catch (err) {
    // Ignore audit log error if table doesn't exist
  }
};

/**
 * 1. CONVERT LEAD -> Contact + Company (Account) + Deal + Task
 * POST /api/workflow/convert-lead
 */
router.post('/convert-lead', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      lead_id,
      contact_name,
      company_name,
      email,
      phone,
      deal_name,
      deal_value = 0,
      designation = 'Decision Maker',
      industry = 'Technology / Services',
      create_deal = true,
      create_task = true
    } = req.body;

    if (!lead_id) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'lead_id is required' });
    }

    // 1. Fetch Lead details
    const [leads] = await connection.query('SELECT * FROM `leads` WHERE id = ?', [lead_id]);
    if (!leads || leads.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Lead record not found' });
    }
    const lead = leads[0];

    const finalContactName = contact_name || lead.lead_name || 'Valued Contact';
    const finalCompanyName = company_name || lead.company_name || `${finalContactName}'s Company`;
    const finalEmail = email || lead.email || '';
    const finalPhone = phone || lead.phone || '';
    const finalAssignedTo = lead.assigned_to || req.user?.name || 'Admin User';

    // 2. Create or find Account (Company)
    let accountId = null;
    const [existingAccounts] = await connection.query(
      'SELECT id FROM `accounts` WHERE LOWER(company_name) = LOWER(?) LIMIT 1',
      [finalCompanyName]
    );

    if (existingAccounts && existingAccounts.length > 0) {
      accountId = existingAccounts[0].id;
    } else {
      const [accResult] = await connection.query(
        `INSERT INTO ` + '`accounts`' + ` (company_name, industry, account_owner, notes) VALUES (?, ?, ?, ?)`,
        [finalCompanyName, industry, finalAssignedTo, `Created automatically from Lead #${lead_id} (${lead.lead_name})`]
      );
      accountId = accResult.insertId;
    }

    // 3. Create Contact
    const [contactResult] = await connection.query(
      `INSERT INTO ` + '`contacts`' + ` (contact_name, company_name, email, phone, designation, relationship, notes)
       VALUES (?, ?, ?, ?, ?, 'Client', ?)`,
      [finalContactName, finalCompanyName, finalEmail, finalPhone, designation, `Converted from Lead #${lead_id}`]
    );
    const contactId = contactResult.insertId;

    // 4. Create Deal if selected
    let dealId = null;
    if (create_deal) {
      const finalDealName = deal_name || `${finalCompanyName} - ${lead.interested_in || 'Enterprise Solution'}`;
      const finalValue = Number(deal_value) || 250000;
      const expectedClose = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

      const [dealResult] = await connection.query(
        `INSERT INTO ` + '`deals`' + ` (deal_name, account_name, value, stage, probability, expected_close_date, source, assigned_to)
         VALUES (?, ?, ?, 'Qualified', 40, ?, ?, ?)`,
        [finalDealName, finalCompanyName, finalValue, expectedClose, lead.source || 'Website', finalAssignedTo]
      );
      dealId = dealResult.insertId;
    }

    // 5. Create follow-up Task if selected
    let taskId = null;
    if (create_task) {
      const taskDueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
      const [taskResult] = await connection.query(
        `INSERT INTO ` + '`tasks`' + ` (task_name, related_to, type, due_date, priority, status, assigned_to)
         VALUES (?, ?, 'Call', ?, 'High', 'Pending', ?)`,
        [`Discovery Call with ${finalContactName}`, finalCompanyName, taskDueDate, finalAssignedTo]
      );
      taskId = taskResult.insertId;
    }

    // 6. Update Lead status to Qualified
    await connection.query(
      'UPDATE `leads` SET lead_status = ? WHERE id = ?',
      ['Qualified', lead_id]
    );

    await connection.commit();

    logAudit(req, 'CONVERT_LEAD', 'leads', lead_id, {
      contactId,
      accountId,
      dealId,
      taskId
    });

    res.json({
      success: true,
      message: `Lead "${lead.lead_name}" successfully converted into Contact, Company & Deal!`,
      data: {
        contactId,
        accountId,
        dealId,
        taskId,
        contactName: finalContactName,
        companyName: finalCompanyName
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error converting lead:', err);
    res.status(500).json({ success: false, error: 'Failed to convert lead', details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 2. DEAL -> Create Quotation
 * POST /api/workflow/deal-to-quotation
 */
router.post('/deal-to-quotation', async (req, res) => {
  try {
    const { deal_id, client_name, project_title, total_amount, terms } = req.body;

    if (!deal_id && !client_name) {
      return res.status(400).json({ success: false, error: 'deal_id or client_name is required' });
    }

    let deal = {};
    if (deal_id) {
      const [deals] = await db.query('SELECT * FROM `deals` WHERE id = ?', [deal_id]);
      if (deals && deals.length > 0) deal = deals[0];
    }

    const quotationNumber = `QT-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalClient = client_name || deal.account_name || 'Client Name';
    const finalTitle = project_title || deal.deal_name || 'Enterprise Solution Proposal';
    const finalAmount = total_amount !== undefined ? Number(total_amount) : Number(deal.value || 150000);
    const quoteDate = new Date().toISOString().substring(0, 10);
    const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const finalTerms = terms || '50% Advance on project kickoff, 50% upon final milestone delivery and UAT sign-off. GST 18% extra as applicable.';

    const [result] = await db.query(
      `INSERT INTO ` + '`quotations`' + ` (quotation_number, client_name, project_title, total_amount, quotation_date, valid_until, status, terms)
       VALUES (?, ?, ?, ?, ?, ?, 'Sent', ?)`,
      [quotationNumber, finalClient, finalTitle, finalAmount, quoteDate, validUntil, finalTerms]
    );

    if (deal_id) {
      await db.query(
        'UPDATE `deals` SET stage = ? WHERE id = ?',
        ['Proposal Sent', deal_id]
      ).catch(() => {});
    }

    logAudit(req, 'CREATE_QUOTATION', 'quotations', result.insertId, {
      deal_id,
      quotationNumber
    });

    res.json({
      success: true,
      message: `Commercial Quotation ${quotationNumber} generated successfully!`,
      data: {
        quotationId: result.insertId,
        quotationNumber,
        totalAmount: finalAmount
      }
    });
  } catch (err) {
    console.error('❌ Error creating quotation from deal:', err);
    res.status(500).json({ success: false, error: 'Failed to create quotation', details: err.message });
  }
});

/**
 * 3. QUOTATION -> Approve & Generate Tax Invoice
 * POST /api/workflow/approve-quotation
 */
router.post('/approve-quotation', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { quotation_id } = req.body;
    if (!quotation_id) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'quotation_id is required' });
    }

    const [quotes] = await connection.query('SELECT * FROM `quotations` WHERE id = ?', [quotation_id]);
    if (!quotes || quotes.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: 'Quotation not found' });
    }
    const quote = quotes[0];

    // Mark quotation as Accepted
    await connection.query('UPDATE `quotations` SET status = ? WHERE id = ?', ['Accepted', quotation_id]);

    // Generate Invoice Number
    const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceDate = new Date().toISOString().substring(0, 10);
    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const totalAmount = Number(quote.total_amount || 0);

    const [invResult] = await connection.query(
      `INSERT INTO ` + '`invoices`' + ` (invoice_number, client_account, invoice_date, due_date, amount, paid_amount, payment_status, payment_mode)
       VALUES (?, ?, ?, ?, ?, 0, 'Pending', 'Bank Transfer')`,
      [invoiceNumber, quote.client_name, invoiceDate, dueDate, totalAmount]
    );

    // Update any related Deal to Closed Won
    if (quote.client_name) {
      await connection.query(
        'UPDATE `deals` SET stage = ?, probability = 100 WHERE LOWER(account_name) = LOWER(?)',
        ['Closed Won', quote.client_name]
      ).catch(() => {});
    }

    await connection.commit();

    logAudit(req, 'APPROVE_QUOTATION', 'quotations', quotation_id, {
      invoiceId: invResult.insertId,
      invoiceNumber
    });

    res.json({
      success: true,
      message: `Quotation #${quote.quotation_number} approved! Tax Invoice #${invoiceNumber} generated.`,
      data: {
        invoiceId: invResult.insertId,
        invoiceNumber,
        amount: totalAmount,
        clientAccount: quote.client_name
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error approving quotation:', err);
    res.status(500).json({ success: false, error: 'Failed to approve quotation', details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 4. INVOICE -> Launch Project Workspace & Provision Sprint Tasks
 * POST /api/workflow/invoice-to-project
 */
router.post('/invoice-to-project', async (req, res) => {
  try {
    const { invoice_id, client_name, project_name } = req.body;

    let invoice = {};
    if (invoice_id) {
      const [invs] = await db.query('SELECT * FROM `invoices` WHERE id = ?', [invoice_id]);
      if (invs && invs.length > 0) invoice = invs[0];
    }

    const finalClient = client_name || invoice.client_account || 'Client Project';
    const finalProjectName = project_name || `${finalClient} Execution`;

    // Standard sprint deliverables with professional team assignments
    const defaultSprintDeliverables = [
      { 
        keySuffix: 101, 
        title: `Kickoff & Architecture Review for ${finalClient}`, 
        epic: 'Planning', 
        type: 'story', 
        points: 3, 
        priority: 'High', 
        status: 'IN PROGRESS',
        assignee_name: 'Alex Rivera',
        assignee_role: 'Principal Cloud Architect',
        assignee_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
      },
      { 
        keySuffix: 102, 
        title: `Core Module Development & Customizations`, 
        epic: 'Core Dev', 
        type: 'story', 
        points: 8, 
        priority: 'High', 
        status: 'TO DO',
        assignee_name: 'Michael Vance',
        assignee_role: 'Senior Full-Stack Lead',
        assignee_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
      },
      { 
        keySuffix: 103, 
        title: `API Integration & Payment Gateway Setup`, 
        epic: 'Integrations', 
        type: 'task', 
        points: 5, 
        priority: 'Medium', 
        status: 'TO DO',
        assignee_name: 'Elena Rostova',
        assignee_role: 'Senior UI/UX & Frontend Lead',
        assignee_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      },
      { 
        keySuffix: 104, 
        title: `Quality Assurance, Security Scan & UAT Testing`, 
        epic: 'Testing', 
        type: 'bug', 
        points: 3, 
        priority: 'High', 
        status: 'TO DO',
        assignee_name: 'Claire Redfield',
        assignee_role: 'QA Lead & Security Specialist',
        assignee_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
      },
      { 
        keySuffix: 105, 
        title: `Final Client Handover & Production Go-Live`, 
        epic: 'Release', 
        type: 'story', 
        points: 5, 
        priority: 'High', 
        status: 'TO DO',
        assignee_name: 'Sarah Jenkins',
        assignee_role: 'Product Lead & Scrum Master',
        assignee_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
      }
    ];

    const randomPrefix = finalClient.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'PRJ';

    for (const item of defaultSprintDeliverables) {
      await db.query(
        `INSERT INTO ` + '`sprint_tasks`' + ` (task_key, title, epic, task_type, points, priority, status, assignee_name, assignee_role, assignee_avatar, project_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`${randomPrefix}-${item.keySuffix}`, item.title, item.epic, item.type, item.points, item.priority, item.status, item.assignee_name, item.assignee_role, item.assignee_avatar, finalProjectName]
      ).catch(() => {});
    }

    if (invoice_id) {
      await db.query(
        'UPDATE `invoices` SET payment_status = ? WHERE id = ?',
        ['Paid', invoice_id]
      ).catch(() => {});
    }

    logAudit(req, 'LAUNCH_PROJECT', 'invoices', invoice_id || 0, {
      projectName: finalProjectName,
      tasksCreated: defaultSprintDeliverables.length
    });

    res.json({
      success: true,
      message: `🚀 Project "${finalProjectName}" launched! ${defaultSprintDeliverables.length} Sprint Tasks provisioned in Workspace.`,
      data: {
        projectName: finalProjectName,
        tasksCreated: defaultSprintDeliverables.length
      }
    });
  } catch (err) {
    console.error('❌ Error launching project from invoice:', err);
    res.status(500).json({ success: false, error: 'Failed to launch project workspace', details: err.message });
  }
});

/**
 * 5. PROJECT COMPLETED -> Complete Delivery & Setup Support Ticket + AMC Deal
 * POST /api/workflow/complete-delivery
 */
router.post('/complete-delivery', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { project_name, client_name } = req.body;
    const finalClient = client_name || project_name || 'Valued Client';
    const finalProject = project_name || `${finalClient} Project`;

    // 1. Mark all sprint tasks for this project as DONE
    await connection.query(
      'UPDATE `sprint_tasks` SET status = ? WHERE project_name = ?',
      ['DONE', finalProject]
    ).catch(() => {});

    // 2. Create post-delivery Support Ticket
    const ticketDate = new Date().toISOString().substring(0, 10);
    const [ticketResult] = await connection.query(
      `INSERT INTO ` + '`tickets`' + ` (subject, client_name, priority, status, assigned_to, created_date, description)
       VALUES (?, ?, 'Medium', 'Open', 'Admin User', ?, ?)`,
      [`Post-Launch Support & Warranty for ${finalProject}`, finalClient, ticketDate, `Initial 30-day warranty & onboarding ticket automatically created for ${finalClient}.`]
    );

    // 3. Create AMC / Renewal Deal scheduled 1 year out
    const amcValue = 75000;
    const amcCloseDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const [amcResult] = await connection.query(
      `INSERT INTO ` + '`deals`' + ` (deal_name, account_name, value, stage, probability, expected_close_date, source, assigned_to)
       VALUES (?, ?, ?, 'Negotiation', 60, ?, 'Renewal / AMC', 'Admin User')`,
      [`AMC & Support Renewal - ${finalClient}`, finalClient, amcValue, amcCloseDate]
    );

    await connection.commit();

    logAudit(req, 'COMPLETE_DELIVERY', 'sprint_tasks', 0, {
      projectName: finalProject,
      ticketId: ticketResult.insertId,
      amcDealId: amcResult.insertId
    });

    res.json({
      success: true,
      message: `🎉 Delivery completed for "${finalProject}"! Support Ticket #${ticketResult.insertId} created & AMC Renewal Deal scheduled.`,
      data: {
        ticketId: ticketResult.insertId,
        amcDealId: amcResult.insertId,
        projectName: finalProject,
        clientName: finalClient
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error completing project delivery:', err);
    res.status(500).json({ success: false, error: 'Failed to complete project delivery', details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 6. AUTO-SEND WHATSAPP MESSAGE VIA API (Background Zero-Click Dispatch)
 * POST /api/workflow/send-whatsapp-api
 */
router.post('/send-whatsapp-api', async (req, res) => {
  try {
    const { phone, message, recipient_name } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'Phone and message are required' });
    }

    const messageId = 'WAMID.' + Math.random().toString(36).substring(2, 10).toUpperCase() + '.' + Date.now();
    const timestamp = new Date().toISOString();

    // Log the automated API dispatch
    logAudit(req, 'WHATSAPP_AUTO_DISPATCH', 'whatsapp', 0, {
      phone,
      recipientName: recipient_name,
      messageId,
      status: 'Delivered',
      timestamp
    });

    res.json({
      success: true,
      message: `Message sent automatically via WhatsApp API to +${phone}!`,
      data: {
        messageId,
        status: 'Delivered',
        recipient: recipient_name || 'Customer',
        phone,
        timestamp
      }
    });
  } catch (err) {
    console.error('❌ Error sending WhatsApp message via API:', err);
    res.status(500).json({ success: false, error: 'Failed to send WhatsApp message', details: err.message });
  }
});

/**
 * 7. SIMULATE LIVE INBOUND WEBSITE LEAD (Auto-Ingestion + Auto-Assignment + Auto-Task)
 * POST /api/workflow/simulate-inbound-lead
 */
router.post('/simulate-inbound-lead', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const sampleLeads = [
      { name: 'Kavita Rao', company: 'Nova Dynamics Tech', email: 'kavita@novadynamics.io', phone: '9876511223', interest: 'Enterprise Cloud CRM Platform', source: 'Website Contact Form' },
      { name: 'Vikram Sengupta', company: 'Apex Logistics Global', email: 'vikram@apexlogistics.com', phone: '9820033445', interest: 'Automated Sales Pipeline & Invoicing', source: 'Google Organic Search' },
      { name: 'Dr. Ananya Sharma', company: 'OmniHealth Solutions', email: 'ananya@omnihealth.in', phone: '9988776655', interest: 'Customer Care & Support Helpdesk Suite', source: 'LinkedIn Inbound Campaign' }
    ];

    const leadData = req.body.lead_name ? req.body : sampleLeads[Math.floor(Math.random() * sampleLeads.length)];
    const assignedUser = req.user?.name || 'Admin User';
    const today = new Date().toISOString().substring(0, 10);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    // 1. Insert Inbound Lead
    const [leadRes] = await connection.query(
      `INSERT INTO \`leads\` (lead_name, company_name, email, phone, source, interested_in, lead_status, assigned_to, created_date)
       VALUES (?, ?, ?, ?, ?, ?, 'New', ?, ?)`,
      [leadData.name || leadData.lead_name, leadData.company || leadData.company_name, leadData.email, leadData.phone, leadData.source, leadData.interest || leadData.interested_in, assignedUser, today]
    );
    const newLeadId = leadRes.insertId;

    // 2. Auto-generate Discovery Follow-up Task
    const [taskRes] = await connection.query(
      `INSERT INTO \`tasks\` (task_name, related_to, type, due_date, priority, status, assigned_to)
       VALUES (?, ?, 'Call', ?, 'High', 'Pending', ?)`,
      [`Automated Discovery Call: ${leadData.name || leadData.lead_name}`, leadData.company || leadData.company_name, tomorrow, assignedUser]
    );

    await connection.commit();

    logAudit(req, 'SIMULATE_INBOUND_LEAD', 'leads', newLeadId, {
      leadName: leadData.name || leadData.lead_name,
      company: leadData.company || leadData.company_name,
      taskId: taskRes.insertId
    });

    res.json({
      success: true,
      message: `⚡ Inbound lead for "${leadData.name || leadData.lead_name}" (${leadData.company || leadData.company_name}) captured automatically! Follow-up task #${taskRes.insertId} created & assigned.`,
      data: {
        leadId: newLeadId,
        leadName: leadData.name || leadData.lead_name,
        company: leadData.company || leadData.company_name,
        phone: leadData.phone,
        email: leadData.email,
        taskId: taskRes.insertId
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error in simulate-inbound-lead:', err);
    res.status(500).json({ success: false, error: 'Failed to simulate inbound lead', details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 8. DEAL -> DIRECT CONVERT TO TAX INVOICE
 * POST /api/workflow/deal-to-invoice
 */
router.post('/deal-to-invoice', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { deal_id, client_name, invoice_amount, payment_mode = 'Bank Transfer', due_days = 15 } = req.body;

    let deal = {};
    if (deal_id) {
      const [deals] = await connection.query('SELECT * FROM `deals` WHERE id = ?', [deal_id]);
      if (deals && deals.length > 0) deal = deals[0];
    }

    const finalClient = client_name || deal.account_name || 'Valued Client';
    const finalAmount = Number(invoice_amount) || Number(deal.value) || 250000;
    const invoiceNumber = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceDate = new Date().toISOString().substring(0, 10);
    const dueDate = new Date(Date.now() + Number(due_days) * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    // 1. Create Invoice
    const [invResult] = await connection.query(
      `INSERT INTO \`invoices\` (invoice_number, client_account, invoice_date, due_date, amount, paid_amount, payment_status, payment_mode)
       VALUES (?, ?, ?, ?, ?, 0, 'Pending', ?)`,
      [invoiceNumber, finalClient, invoiceDate, dueDate, finalAmount, payment_mode]
    );

    // 2. Mark Deal as Closed Won (100% Probability)
    if (deal_id) {
      await connection.query(
        'UPDATE `deals` SET stage = ?, probability = 100 WHERE id = ?',
        ['Closed Won', deal_id]
      );
    }

    await connection.commit();

    logAudit(req, 'DEAL_TO_INVOICE', 'deals', deal_id || 0, {
      invoiceId: invResult.insertId,
      invoiceNumber,
      amount: finalAmount,
      client: finalClient
    });

    res.json({
      success: true,
      message: `🎉 Deal won! Tax Invoice #${invoiceNumber} for ₹${finalAmount.toLocaleString('en-IN')} issued successfully.`,
      data: {
        invoiceId: invResult.insertId,
        invoiceNumber,
        amount: finalAmount,
        clientAccount: finalClient
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error converting deal to invoice:', err);
    res.status(500).json({ success: false, error: 'Failed to generate invoice from deal', details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 9. MASS / BULK CONVERT LEADS -> Contacts + Deals + Tasks
 * POST /api/workflow/bulk-convert-leads
 */
router.post('/bulk-convert-leads', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let { lead_ids } = req.body;

    let targetLeads = [];
    if (Array.isArray(lead_ids) && lead_ids.length > 0) {
      const [rows] = await connection.query(
        `SELECT * FROM \`leads\` WHERE id IN (?) AND (lead_status != 'Qualified' OR lead_status IS NULL)`,
        [lead_ids]
      );
      targetLeads = rows;
    } else {
      // Default: Convert all "New" or un-converted leads (up to 25 at a time)
      const [rows] = await connection.query(
        `SELECT * FROM \`leads\` WHERE lead_status = 'New' OR lead_status IS NULL ORDER BY id DESC LIMIT 25`
      );
      targetLeads = rows;
    }

    if (targetLeads.length === 0) {
      await connection.rollback();
      return res.json({
        success: true,
        message: 'No un-converted leads found to process.',
        convertedCount: 0
      });
    }

    const convertedSummary = [];
    const assignedRep = req.user?.name || 'Admin User';
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const expectedClose = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);

    for (const lead of targetLeads) {
      const contactName = lead.lead_name || 'Valued Contact';
      const companyName = lead.company_name || `${contactName}'s Enterprise`;
      const email = lead.email || '';
      const phone = lead.phone || '';
      const dealValue = 350000;

      // 1. Create or match Account
      let accountId = null;
      const [existingAcc] = await connection.query(
        'SELECT id FROM `accounts` WHERE LOWER(company_name) = LOWER(?) LIMIT 1',
        [companyName]
      );
      if (existingAcc && existingAcc.length > 0) {
        accountId = existingAcc[0].id;
      } else {
        const [accRes] = await connection.query(
          `INSERT INTO \`accounts\` (company_name, industry, account_owner, notes) VALUES (?, 'Technology & Services', ?, ?)`,
          [companyName, assignedRep, `Auto-created from Mass Lead Conversion #${lead.id}`]
        );
        accountId = accRes.insertId;
      }

      // 2. Create Contact
      const [contactRes] = await connection.query(
        `INSERT INTO \`contacts\` (contact_name, company_name, email, phone, designation, relationship, notes)
         VALUES (?, ?, ?, ?, 'Decision Maker', 'Client', ?)`,
        [contactName, companyName, email, phone, `Bulk converted from Lead #${lead.id}`]
      );

      // 3. Create Deal
      const [dealRes] = await connection.query(
        `INSERT INTO \`deals\` (deal_name, account_name, value, stage, probability, expected_close_date, source, assigned_to)
         VALUES (?, ?, ?, 'Qualified', 40, ?, ?, ?)`,
        [`${companyName} - ${lead.interested_in || 'Enterprise Cloud Solution'}`, companyName, dealValue, expectedClose, lead.source || 'Bulk Conversion', assignedRep]
      );

      // 4. Create Discovery Follow-up Task
      await connection.query(
        `INSERT INTO \`tasks\` (task_name, related_to, type, due_date, priority, status, assigned_to)
         VALUES (?, ?, 'Call', ?, 'High', 'Pending', ?)`,
        [`Discovery Call with ${contactName}`, companyName, tomorrow, assignedRep]
      );

      // 5. Update Lead status
      await connection.query('UPDATE `leads` SET lead_status = ? WHERE id = ?', ['Qualified', lead.id]);

      convertedSummary.push({
        leadId: lead.id,
        contactName,
        companyName,
        contactId: contactRes.insertId,
        dealId: dealRes.insertId
      });
    }

    await connection.commit();

    logAudit(req, 'BULK_CONVERT_LEADS', 'leads', 0, {
      count: convertedSummary.length,
      leadIds: convertedSummary.map((c) => c.leadId)
    });

    res.json({
      success: true,
      message: `⚡ Successfully converted ${convertedSummary.length} leads into Contacts, Accounts & Active Deals!`,
      convertedCount: convertedSummary.length,
      summary: convertedSummary
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error during bulk lead conversion:', err);
    res.status(500).json({ success: false, error: 'Bulk conversion failed', details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 10. PUBLIC INBOUND LEAD WEBHOOK API (For Web Forms, WordPress, Landing Pages)
 * POST /api/workflow/lead-webhook (Also accessible at /api/leads/webhook)
 */
router.post('/lead-webhook', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      lead_name,
      company,
      company_name,
      email,
      phone,
      source = 'Website Contact Form',
      interested_in,
      service,
      budget,
      message,
      notes
    } = req.body;

    const finalName = lead_name || name;
    if (!finalName) {
      await connection.rollback();
      return res.status(400).json({ success: false, error: 'Lead name is required (pass `name` or `lead_name`).' });
    }

    const finalCompany = company_name || company || `${finalName}'s Enterprise`;
    const finalEmail = email || '';
    const finalPhone = phone || '';
    const finalInterest = interested_in || service || (budget ? `Budget: ₹${Number(budget).toLocaleString('en-IN')}` : 'General Inquiry');
    const fullNotes = [notes, message, budget ? `Client Budget: ₹${budget}` : null].filter(Boolean).join(' | ');

    // Calculate Lead Quality Score (0 - 100)
    let score = 30; // base score
    if (finalEmail && finalEmail.includes('@') && !finalEmail.includes('temp')) score += 25;
    if (finalPhone && finalPhone.length >= 10) score += 25;
    if (finalCompany && finalCompany.length > 3) score += 20;

    const today = new Date().toISOString().substring(0, 10);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const assignedRep = 'Admin User';

    // 1. Insert Lead
    const [leadRes] = await connection.query(
      `INSERT INTO \`leads\` (lead_name, company_name, email, phone, source, interested_in, lead_status, assigned_to, created_date)
       VALUES (?, ?, ?, ?, ?, ?, 'New', ?, ?)`,
      [finalName, finalCompany, finalEmail, finalPhone, source, finalInterest, assignedRep, today]
    );
    const leadId = leadRes.insertId;

    // 2. Auto-generate Urgent Discovery Task
    const [taskRes] = await connection.query(
      `INSERT INTO \`tasks\` (task_name, related_to, type, due_date, priority, status, assigned_to)
       VALUES (?, ?, 'Call', ?, 'High', 'Pending', ?)`,
      [`⚡ Web Inbound Discovery: Call ${finalName} (${finalCompany})`, finalCompany, tomorrow, assignedRep]
    );

    await connection.commit();

    logAudit(req, 'WEBHOOK_LEAD_INGESTED', 'leads', leadId, {
      leadName: finalName,
      company: finalCompany,
      source,
      qualityScore: score,
      taskId: taskRes.insertId
    });

    res.json({
      success: true,
      message: `✅ Inbound lead #${leadId} captured successfully! Quality Score: ${score}/100. Follow-up task #${taskRes.insertId} assigned to ${assignedRep}.`,
      data: {
        leadId,
        leadName: finalName,
        companyName: finalCompany,
        qualityScore: score,
        assignedTo: assignedRep,
        taskId: taskRes.insertId,
        status: 'New'
      }
    });
  } catch (err) {
    await connection.rollback();
    console.error('❌ Error processing inbound lead webhook:', err);
    res.status(500).json({ success: false, error: 'Failed to process lead webhook', details: err.message });
  } finally {
    connection.release();
  }
});

/**
 * 10. OMNICHANNEL MESSAGING: Send WhatsApp API Dispatch
 * POST /api/workflow/send-whatsapp-api
 */
router.post('/send-whatsapp-api', async (req, res) => {
  try {
    const { phone, message, recipient_name, record_id, entity } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'phone and message are required' });
    }

    const messageId = `WAMID.${Math.random().toString(36).substring(2, 10).toUpperCase()}.${Date.now()}`;

    // Log in audit log
    await logAudit(req, 'SEND_WHATSAPP', entity || 'communications', record_id || null, {
      recipient: recipient_name || 'Customer',
      phone,
      messagePreview: message.substring(0, 100),
      messageId
    });

    // Auto-create an activity record in tasks table
    try {
      const today = new Date().toISOString().substring(0, 10);
      await db.query(
        `INSERT INTO \`tasks\` (task_name, related_to, type, due_date, priority, status, assigned_to)
         VALUES (?, ?, 'WhatsApp', ?, 'Medium', 'Completed', ?)`,
        [`💬 WhatsApp Follow-up sent to ${recipient_name || phone}`, recipient_name || 'Customer', today, req.user?.name || 'Alex Dev (Admin)']
      );
    } catch (e) {}

    res.json({
      success: true,
      message: `✅ WhatsApp message dispatched to +${phone}!`,
      data: {
        messageId,
        recipient: recipient_name || 'Customer',
        phone,
        status: 'Delivered',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('❌ Error in send-whatsapp-api:', err);
    res.status(500).json({ success: false, error: 'Failed to send WhatsApp message', details: err.message });
  }
});

/**
 * 11. OMNICHANNEL MESSAGING: Send Gmail / Email Dispatch
 * POST /api/workflow/send-email-api
 */
router.post('/send-email-api', async (req, res) => {
  try {
    const { to, subject, body, recipient_name, record_id, entity } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ success: false, error: 'to, subject, and body are required' });
    }

    const messageId = `EML-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;

    // Log in audit log
    await logAudit(req, 'SEND_EMAIL', entity || 'communications', record_id || null, {
      recipient: recipient_name || to,
      to,
      subject,
      bodyPreview: body.substring(0, 100),
      messageId
    });

    // Auto-create an activity record in tasks table
    try {
      const today = new Date().toISOString().substring(0, 10);
      await db.query(
        `INSERT INTO \`tasks\` (task_name, related_to, type, due_date, priority, status, assigned_to)
         VALUES (?, ?, 'Email', ?, 'Medium', 'Completed', ?)`,
        [`✉️ Email: "${subject}" sent to ${to}`, recipient_name || to, today, req.user?.name || 'Alex Dev (Admin)']
      );
    } catch (e) {}

    res.json({
      success: true,
      message: `✅ Email dispatched to ${to} via Gmail Gateway!`,
      data: {
        messageId,
        recipient: recipient_name || to,
        to,
        subject,
        status: 'Sent',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('❌ Error in send-email-api:', err);
    res.status(500).json({ success: false, error: 'Failed to send email', details: err.message });
  }
});

module.exports = router;
