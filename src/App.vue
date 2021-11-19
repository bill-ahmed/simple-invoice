<template>
  <div class="col h-screen">
    <div class="row w-screen flex-grow overflow-x-auto">
      <div class="shadow-md m-4 p-2 w-1/4 bg-white rounded-lg overflow-auto">
        <div class="mb-8">
          <div class="mb-4 row justify-between items-baseline">
            <h2> Editor </h2>
            <button class="my-2 btn-success w-24" @click="save"> Save </button>
          </div>

          <div class="col justify-evenly">
            <input type="file" id="file_picker" class="hidden"/>
            <div class="row">
              <button class="mx-2 btn-warn w-full" @click="importData"> Import </button>
              <button class="mx-2 btn-info w-full" @click="print"> Print </button>
            </div>
          </div>
        </div>

        <div>
          <label>Invoice #</label>
          <input v-model="invoiceMeta.id" placeholder='e.g. 000003' class="w-full"/>

          <label>Date Issued</label>
          <input type="date" class="w-full"/>

          <label>Due Date</label>
          <input type="date" class="w-full"/>

          <hr class="mt-2 mb-3"/>
          
          <label>From*</label>
          <input v-model="invoiceData.header.from.name" placeholder='e.g. "John Doe"' class="w-full"/>

          <label>From Address*</label>
          <textarea v-model="invoiceData.header.from.address" rows="4" class="w-full"/>


          <label>To*</label>
          <input v-model="invoiceData.header.to.name" placeholder='e.g. "John Doe"' class="w-full"/>

          <label>To Address*</label>
          <textarea v-model="invoiceData.header.to.address" rows="4" class="w-full"/>
        </div>
      </div>
      <EditorVue class="rounded-md" :meta="invoiceMeta" :data="invoiceData"/>
    </div>
  </div>
</template>

<script>
import EditorVue from './components/Editor.vue'
import editorStyles from './styles/app.css.json';
import { parseInvoiceCSV, sanitizeData } from './utils';

export default {
  name: 'App',
  components: {
    EditorVue
  },
  data() {
    let existingMeta = localStorage.getItem('invoiceDataMeta');
    let existing = localStorage.getItem('invoiceData');

    return {
      invoiceMeta: existingMeta ? JSON.parse(existingMeta) : {
        id: '000004',
        dateOfIssue: '11-11-2021',
        dueDate: '11-12-2021',
        currency: 'CAD',
        tax: 0,
        amountPaid: 0
      },
      invoiceData: existing ? JSON.parse(existing) : {
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
      },
    }
  },
  methods: {
    save() {
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
