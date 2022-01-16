import Papa from 'papaparse'

/**
 * Clones a Javscript Object. Can be very
 * expensive if the object is large.
 */
export function clone(o) { return JSON.parse(JSON.stringify(o)); }

/** 
 * Given CSV text data, return formatted 
 * invoice data.
 */
export function parseInvoiceCSV(data) {
  // Sanitize it first
  data = data.replace('\r', '').trim();

  let res =  []
  let rowId = 0;
  let parsed = Papa.parse(data, { delimiter: ',' });

  try {
    for(let row of parsed.data) {
      res.push({
        id: rowId++,
        description: row[0].trim(),
        rate: row[1].trim(),
        qty: row[2].trim()
      })
    } 
  } catch (error) {
    alert('There was an unknown error when trying to parse the file. Please make sure it is a valid CSV! Check console logs for details.')
    console.error('Failed parsing CSV:')
    console.error(error);

    console.error('Data given:')
    console.error(data)

    return []
  }

  return res;
}

/** Turn array of invoice items into a csv string. */
export function exportInvoiceCSV(data) {
  // Clone the original
  // We want to ignore specific keys, such as the "id" field
  let cloned = []
  data.forEach(e => cloned.push({
    description: e.description,
    rate: e.rate,
    qty: e.qty
  }));

  return Papa.unparse(cloned, { header: false })
}

export function sanitizeData(d) {
  d.body.items.forEach(e => {
    e.qty = parseFloat(e.qty);
    e.rate = parseFloat(e.rate);
  })

  return d;
}

/**
 * Validates invoice contents
 * and metadata.
 * 
 * @returns True iff data is valid, array of missing fields otherwise.
 */
export function validateInvoiceData(meta, contents) {
  let missing = [];
  const empty = (e) => e.trim() === '';

  // Check metadata fields
  let { id, dateIssue, dateDue } = meta;

  if(empty(id))         missing.push('Invoice ID');
  if(empty(dateDue))    missing.push('Date Due');
  if(empty(dateIssue))  missing.push('Date Issued');

  // Check content fields
  let { name, address } = contents.header.from;
  if(empty(name))    missing.push('Your Name');
  if(empty(address)) missing.push('Your Address');

  ({ name, address } = contents.header.to);
  if(empty(name))    missing.push('To Name');
  if(empty(address)) missing.push('To Address');

  return missing.length > 0 ? missing : true;
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

/** Get string representation of a file size.
 * e.g. 2,560 -> 2.56 KB
 * e.g. 1,572,864 -> 1.57 MB
 * 
 * @param {number} size
 * @returns {string} A human-readable string.
 */
export function getFileSizeString(size) {
  if(size < 0) return '∞';
  if(size === undefined || size == null) return 'Unknown';

  const DP = 2;   // Number of fixed decimal places for rounding

  const B = 1;
  const KB = 1024;
  const MB = 1048576;
  const GB = 1073741824;
  const TB = 1099511627776;
  const PB = 1125899906842624;

  const B_s = `${(size / B).toFixed(DP)} B`;
  const KB_s = `${(size / KB).toFixed(DP)} KB`;
  const MB_s = `${(size / MB).toFixed(DP)} MB`;
  const GB_s = `${(size / GB).toFixed(DP)} GB`;
  const TB_s = `${(size / TB).toFixed(DP)} TB`;

  if(size < B){
    return B_s;
  }
  if(size < KB){
    return B_s;
  }
  if(size < MB){
    return KB_s;
  }
  if(size < GB){
    return MB_s;
  }
  if(size < TB){
    return GB_s;
  }
  if(size < PB) {
    return TB_s;
  }

  console.error('File size too large to convert:', size);
  return "ERROR -- Too large";
}

/**
 * Human readable date format.
 * e.g. "Today", "a minute ago", etc.
 * @param {Date} d 
 * @returns {string} 
 */
export function niceDate(d) {
  let now = new Date();
  
  let sec = 1000;
  let min = sec * 60;
  let hour = min * 60;
  let day = hour * 24;

  let diff = now - d;

  // TODO: Make singular instead of plural when only one of that unit
  if (diff < sec) return 'a second ago'
  if (diff < min) return `${Math.floor(diff / sec)} seconds ago`
  if (diff < hour) return `${Math.floor(diff / min)} minutes ago`
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`

  return d.toLocaleString();
}
