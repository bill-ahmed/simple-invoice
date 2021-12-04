export const INVOICE_METADATA_DEFAULTS = {
  id: '',
  currency: 'CAD',
  tax: 0,
  amountPaid: 0,
  dateIssue: '',
  dateDue: '',
  showNotes: false,

  // Override headers for the table
  headers: {
    description: 'Description',
    amount: 'Rate',
    qty: 'Qty',
    lineTotal: 'Line Total'
  }
}

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
}