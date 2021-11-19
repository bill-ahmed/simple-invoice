import Papa from 'papaparse'

/** 
 * Given CSV text data, return formatted 
 * invoice data.
 */
export function parseInvoiceCSV(data) {
  // Sanitize it first
  data = data.replace('\r', '').trim();
  console.log('sanitized parser', data)

  let res =  []
  let parsed = Papa.parse(data, { delimiter: ',' });

  for(let row of parsed.data) {
    res.push({
      description: row[0].trim(),
      rate: row[1].trim(),
      qty: row[2].trim()
    })
  }

  return res;
}

export function sanitizeData(d) {
  d.body.items.forEach(e => {
    e.qty = parseFloat(e.qty);
    e.rate = parseFloat(e.rate);
  })

  return d;
}
