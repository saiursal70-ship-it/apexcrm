// Central configuration for CRM modules.
// Each entry drives: the sidebar label, API endpoint, table columns, form fields,
// and Kanban Board column grouping properties.

const entityConfig = {
  leads: {
    label: 'Leads',
    title: 'Leads',
    idField: 'id',
    statusField: 'lead_status',
    titleField: 'lead_name',
    subtitleField: 'company_name',
    columns: ['lead_name', 'company_name', 'email', 'phone', 'source', 'lead_status', 'assigned_to'],
    fields: [
      { name: 'lead_name', label: 'Lead Name', type: 'text', required: true },
      { name: 'company_name', label: 'Company Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'source', label: 'Source', type: 'select', options: ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Walk-in'] },
      { name: 'interested_in', label: 'Interested In', type: 'text' },
      { name: 'lead_status', label: 'Lead Status', type: 'select', options: ['New', 'Contacted', 'Qualified', 'Lost'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
    ]
  },
  contacts: {
    label: 'Contacts',
    title: 'Contacts',
    idField: 'id',
    statusField: 'relationship',
    titleField: 'contact_name',
    subtitleField: 'company_name',
    columns: ['contact_name', 'company_name', 'email', 'phone', 'designation', 'relationship'],
    fields: [
      { name: 'contact_name', label: 'Contact Name', type: 'text', required: true },
      { name: 'company_name', label: 'Company Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'designation', label: 'Designation', type: 'text' },
      { name: 'relationship', label: 'Relationship', type: 'select', options: ['Client', 'Vendor', 'Partner', 'Other'] },
      { name: 'address', label: 'Address', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  deals: {
    label: 'Deals',
    title: 'Deals',
    idField: 'id',
    statusField: 'stage',
    titleField: 'deal_name',
    subtitleField: 'account_name',
    valueField: 'value',
    columns: ['deal_name', 'account_name', 'value', 'stage', 'probability', 'expected_close_date'],
    fields: [
      { name: 'deal_name', label: 'Deal Name', type: 'text', required: true },
      { name: 'account_name', label: 'Account Name', type: 'text' },
      { name: 'value', label: 'Value (₹)', type: 'number' },
      { name: 'stage', label: 'Stage', type: 'select', options: ['New Leads', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'] },
      { name: 'probability', label: 'Probability (%)', type: 'number' },
      { name: 'expected_close_date', label: 'Expected Close Date', type: 'date' },
      { name: 'source', label: 'Source', type: 'text' },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
    ]
  },
  tasks: {
    label: 'Tasks',
    title: 'Tasks / Activities',
    idField: 'id',
    statusField: 'status',
    titleField: 'task_name',
    subtitleField: 'related_to',
    columns: ['task_name', 'related_to', 'type', 'due_date', 'priority', 'status'],
    fields: [
      { name: 'task_name', label: 'Task Name', type: 'text', required: true },
      { name: 'related_to', label: 'Related To (Lead/Deal)', type: 'text' },
      { name: 'type', label: 'Type', type: 'select', options: ['Call', 'Email', 'Meeting', 'Other'] },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
    ]
  },
  appointments: {
    label: 'Appointments',
    title: 'Appointments',
    idField: 'id',
    statusField: 'status',
    titleField: 'title',
    subtitleField: 'with_person',
    columns: ['title', 'with_person', 'appointment_date', 'appointment_time', 'status'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'with_person', label: 'With', type: 'text' },
      { name: 'appointment_date', label: 'Date', type: 'date' },
      { name: 'appointment_time', label: 'Time', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Completed', 'Cancelled'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  invoices: {
    label: 'Invoices',
    title: 'Invoices & Payments',
    idField: 'id',
    statusField: 'payment_status',
    titleField: 'invoice_number',
    subtitleField: 'client_account',
    valueField: 'amount',
    columns: ['invoice_number', 'client_account', 'invoice_date', 'amount', 'payment_status'],
    fields: [
      { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
      { name: 'client_account', label: 'Client / Account', type: 'text' },
      { name: 'invoice_date', label: 'Invoice Date', type: 'date' },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'amount', label: 'Amount (₹)', type: 'number' },
      { name: 'payment_status', label: 'Payment Status', type: 'select', options: ['Pending', 'Paid', 'Overdue'] },
      { name: 'payment_mode', label: 'Payment Mode', type: 'text' },
    ]
  },
};

export default entityConfig;
