import Papa from 'papaparse'

/** 
 * Given CSV text data, return formatted 
 * invoice data.
 */
export function parseInvoiceCSV(data) {
  // Sanitize it first
  data = data.replace('\r', '').trim();

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

/** Turn array of invoice items into a csv string. */
export function exportInvoiceCSV(data) {
  return Papa.unparse(data, { header: false })
}

export function sanitizeData(d) {
  d.body.items.forEach(e => {
    e.qty = parseFloat(e.qty);
    e.rate = parseFloat(e.rate);
  })

  return d;
}

/** 
 * Trigger a download of in-memory data via the browser's "save as" dialog.
 * Taken from: https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
 */
export function downloadFile(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
