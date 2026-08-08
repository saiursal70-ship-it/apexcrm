const express = require('express');
const router = express.Router();
const createCrudRouter = require('../utils/crudFactory');

// Each entity: table name + whitelist of editable columns
router.use('/leads', createCrudRouter('leads', [
    'lead_name', 'company_name', 'email', 'phone', 'source', 'interested_in', 'lead_status', 'assigned_to', 'created_date'
]));

router.use('/contacts', createCrudRouter('contacts', [
    'contact_name', 'company_name', 'email', 'phone', 'designation', 'relationship', 'address', 'notes'
]));

router.use('/accounts', createCrudRouter('accounts', [
    'company_name', 'industry', 'website', 'address', 'gst_tax_id', 'company_size', 'account_owner', 'notes'
]));

router.use('/deals', createCrudRouter('deals', [
    'deal_name', 'account_name', 'value', 'stage', 'probability', 'expected_close_date', 'source', 'assigned_to'
]));

router.use('/tasks', createCrudRouter('tasks', [
    'task_name', 'related_to', 'type', 'due_date', 'priority', 'status', 'assigned_to'
]));

router.use('/appointments', createCrudRouter('appointments', [
    'title', 'with_person', 'appointment_date', 'appointment_time', 'location', 'status', 'notes'
]));

router.use('/products', createCrudRouter('products', [
    'product_name', 'category', 'description', 'price', 'unit', 'tax', 'status'
]));

router.use('/invoices', createCrudRouter('invoices', [
    'invoice_number', 'client_account', 'invoice_date', 'due_date', 'amount', 'paid_amount', 'payment_status', 'payment_mode'
]));

router.use('/campaigns', createCrudRouter('campaigns', [
    'campaign_name', 'type', 'start_date', 'end_date', 'budget', 'status', 'notes'
]));

router.use('/tickets', createCrudRouter('tickets', [
    'subject', 'client_name', 'priority', 'status', 'assigned_to', 'created_date', 'description'
]));

router.use('/quotations', createCrudRouter('quotations', [
    'quotation_number', 'client_name', 'project_title', 'email', 'phone', 'total_amount', 'quotation_date', 'valid_until', 'status', 'terms'
]));

router.use('/sprint-tasks', createCrudRouter('sprint_tasks', [
    'task_key', 'title', 'epic', 'task_type', 'points', 'subtask_count', 'priority', 'status', 'assignee_name', 'assignee_avatar', 'project_name'
]));

module.exports = router;
