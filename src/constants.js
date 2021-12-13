export const AUTHENTICATION = {
  azure: {
    client_id: process.env.VUE_APP_AZURE_CLIENT_ID,
    scopes: ['profile', 'User.Read', 'Files.Read.All', 'Files.ReadWrite.All']
  }
};

export const INVOICE_METADATA_DEFAULTS = {
  id: '',
  currency: 'CAD',
  tax: 0,
  amountPaid: 0,
  dateIssue: '',
  dateDue: '',
  showNotes: false,
  filename: 'my-invoice.csv',

  // Override headers for the table
  headers: {
    description: 'Description',
    amount: 'Rate',
    qty: 'Qty',
    lineTotal: 'Line Total'
  }
};

export const INVOICE_DATA_DEFAULTS = {
  header: {
    from: {
      name: '',
      address: '',
      phone: ''
    },
    to: {
      name: '',
      address: ''
    }
  },
  body: {
    items: []
  },
  footer: {
    notes: ''
  }
};