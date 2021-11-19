<template>
  <div class="col h-screen">
    <div class="row w-screen flex-grow overflow-x-auto">
      <div class="shadow-md m-4 p-2 w-1/5 bg-white rounded-lg overflow-auto">
        <div class="mb-4">
          <h2> Editor </h2>
        </div>

        <div>          
          <label>From*</label>
          <input v-model="invoiceData.header.from.name" placeholder='e.g. "John Doe"' class="w-full" spellcheck="false"/>

          <label>From Address*</label>
          <textarea v-model="invoiceData.header.from.address" rows="5" class="text-sm w-full" spellcheck="false"/>


          <label>To*</label>
          <input v-model="invoiceData.header.to.name" placeholder='e.g. "John Doe"' class="w-full" spellcheck="false"/>

          <label>To Address*</label>
          <textarea v-model="invoiceData.header.to.address" rows="5" class="text-sm w-full" spellcheck="false"/>

          <label>Notes</label>
          <textarea v-model="invoiceData.footer.notes" rows="7" class="text-sm w-full"/>
        </div>
      </div>

      <EditorVue class="rounded-md" :meta="invoiceMeta" :data="invoiceData"/>

      <div class="col w-1/6 overflow-auto">
        <!-- Meta data controls -->
        <div class="m-4 mb-2 p-2 flex-grow shadow-md bg-white rounded-md">
          <div>
            <label>Invoice #</label>
            <input v-model="invoiceMeta.id" placeholder='e.g. 000003' class="w-full"/>

            <label>Date Issued</label>
            <input v-model="invoiceMeta.dateIssue" type="date" class="w-full"/>

            <label>Due Date</label>
            <input v-model="invoiceMeta.dateDue" type="date" class="w-full"/>

            <hr class="mt-2 mb-3"/>

            <h4 class="font-medium"> Override headers </h4>

            <label>Description</label>
            <input v-model="invoiceMeta.headers.description" class="w-full"/>

            <label>Rate</label>
            <input v-model="invoiceMeta.headers.amount" class="w-full"/>

            <label>Qty</label>
            <input v-model="invoiceMeta.headers.qty" class="w-full"/>

            <label>Line Total</label>
            <input v-model="invoiceMeta.headers.lineTotal" class="w-full"/>
          </div>
        </div>

        <!-- Controls -->
        <div class="m-4 mt-2 p-2 shadow-md bg-white rounded-md">
          <div>
            <input type="file" id="file_picker" class="hidden"/>
            <div class="col">
              <button class="my-2 btn-success" @click="save"> Save </button>
              <button class="my-2 btn-info w-full" @click="print"> Print </button>

              <br/>

              <button class="my-2 btn-warn w-full" @click="importData"> Import </button>
              <button class="my-2 rounded-md border-2 border-gray-300 w-full" @click="exportData"> Export </button>

              <button @click="debug">debug</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EditorVue from './components/Editor.vue'
import editorStyles from './styles/app.css.json';
import { parseInvoiceCSV, sanitizeData } from './utils';
import { INVOICE_METADATA_DEFAULTS, INVOICE_DATA_DEFAULTS } from './constants';

export default {
  name: 'App',
  components: {
    EditorVue
  },
  data() {
    let invoiceData = INVOICE_DATA_DEFAULTS;
    let invoiceMeta = INVOICE_METADATA_DEFAULTS;

    let existing = localStorage.getItem('invoiceData');
    let existingMeta = localStorage.getItem('invoiceDataMeta');

    if(existing) invoiceData = { ...invoiceData, ...(JSON.parse(existing)) }
    if(existingMeta) invoiceMeta = { ...invoiceMeta, ...(JSON.parse(existingMeta)) }

    return {
      invoiceMeta,
      invoiceData
    }
  },
  methods: {
    debug() { this.invoiceData.body.items[0].description = 'test' },
    save() {
      console.log('saving meta', this.invoiceMeta, this.invoiceMeta.dateIssue)
      localStorage.setItem('invoiceDataMeta', JSON.stringify(this.invoiceMeta))
      localStorage.setItem('invoiceData', JSON.stringify(this.invoiceData))
    },
    importData() {
      let elem = document.getElementById('file_picker');
      elem.addEventListener('change', () => {
        let file = elem.files[0];
        let reader = new FileReader();

        reader.onload = () => {
          let parsed = parseInvoiceCSV(reader.result);
          let invoiceData = this.invoiceData;
          invoiceData.body.items = parsed;

          this.invoiceData = sanitizeData(invoiceData)
        }

        reader.readAsText(file);
      });

      elem.click();
    },
    exportData() { alert('To-do!') },
    print() {
      // Element to print
      let elem = document.getElementById('printMe')

      // Grab any scoped styles we might need
      let stylesToAdd = editorStyles.styles.reduce((p, c) => { return p + '\n' + c[0] + c[1] }, '')

      var printWindow = window.open('', '', 'height=600,width=900');
      printWindow.document.write(
        `
          <html>
            <head>
              <title>Invoice ${this.invoiceMeta.id}</title>
              <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
            </head>

            <body>
              ${elem.innerHTML}
            </body>
            <style>
              ${stylesToAdd}
            </style>
          </html>
        `
      );

      // Need to wait for the styles to load
      // If css doesn't load fast enough, 
      // may need to bump the timeout...        
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500)
    }
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
