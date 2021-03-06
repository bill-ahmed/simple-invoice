<template>
  <div class="col h-screen">
    <HelpModalVue v-if="showHelp" v-on:close="showHelp = false"/>
    <OneDriveFilePickerVue v-if="$store.state.modals.oneDriveFileSelector" v-on:update="parseAndLoadData" />

    <div class="row w-screen flex-grow overflow-x-auto">
      <div class="flex flex-col shadow-md m-4 p-6 w-1/5 bg-white rounded-lg overflow-auto">
        <div class="mb-4 row justify-between">
          <h2> Invoice Template </h2>

          <button @click="showHelp = true" class="hover:bg-gray-200 ring-1 ring-gray-200 btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>

            <span> Help </span>
          </button>
        </div>

        <!-- Meta data controls -->
        <div>
          <div>
            <label>Invoice # (*)</label>
            <input v-model="invoiceMeta.id" placeholder='e.g. 000003' class="w-full"/>

            <label>Date Issued (*)</label>
            <input v-model="invoiceMeta.dateIssue" type="date" class="w-full"/>

            <label>Due Date (*)</label>
            <input v-model="invoiceMeta.dateDue" type="date" class="w-full"/>

            <h4 class="mt-4 font-medium"> Override Headers </h4>

            <label>Description</label>
            <input v-model="invoiceMeta.headers.description" class="w-full"/>

            <label>Price</label>
            <input v-model="invoiceMeta.headers.amount" class="w-full"/>

            <label>Quantity</label>
            <input v-model="invoiceMeta.headers.qty" class="w-full"/>

            <label>Line Total</label>
            <input v-model="invoiceMeta.headers.lineTotal" class="w-full"/>

            <div @click="invoiceMeta.showNotes = !invoiceMeta.showNotes" class="cursor-pointer w-full flex flex-row items-center justify-between">
              <p class="mr-4"> Show additional notes </p>
              <input class="m-0" type="checkbox" :checked="invoiceMeta.showNotes"/>
            </div>
          </div>
        </div>
      </div>

      <EditorVue class="rounded-md" :loading="loading" :meta="invoiceMeta" :data="invoiceData"/>

      <!-- Right-side options -->
      <div class="col w-1/5 overflow-auto">
        <!-- Controls -->
        <div class="m-4 mt-16 mb-2 p-2 shadow-md bg-white rounded-md">
          <input type="file" :key="filePickerKey" id="file_picker" class="hidden" accept=".csv"/>
          <div class="col relative">
            <div v-if="loading">
              <h3> Please wait... </h3>
            </div>

            <AvatarCardVue v-else v-on:sync="manualSync" />
          </div>
        </div>

        <div class="m-4 mb-2 p-6 shadow-md bg-white rounded-md">
          <button v-if="!$store.getters.isLoggedIn" class="my-2 btn-success btn-icon w-full" @click="save(false)"> 
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            
            <span> Save Locally</span> 
          </button>

          <button class="my-2 btn-info btn-icon w-full" @click="print">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>

            <span> Download PDF </span>
          </button>

          <br/>

          <div class="col my-2">
            <button class="m-2 btn-warn btn-outlined btn-icon w-full" @click="importData">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
              <span> Import File </span>
            </button>

            <button class="m-2 btn-bare btn-outlined btn-icon w-full" @click="exportData(false)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />                   </svg>
              <span> Export Data </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import EditorVue from './components/Editor.vue'
import editorStyles from './styles/app.css.json';
import { clone, downloadFile, exportInvoiceCSV, parseInvoiceCSV, sanitizeData, validateInvoiceData } from './utils';
import { INVOICE_METADATA_DEFAULTS, INVOICE_DATA_DEFAULTS, AUTHENTICATION } from './constants';
import HelpModalVue from './components/HelpModal.vue';
import AvatarCardVue from './components/AvatarCard.vue';
import OneDriveFilePickerVue from './components/OneDriveFilePicker.vue';

export default {
  name: 'App',
  components: {
    EditorVue,
    HelpModalVue,
    AvatarCardVue,
    OneDriveFilePickerVue
  },
  data() {
    let invoiceData = INVOICE_DATA_DEFAULTS;
    let invoiceMeta = INVOICE_METADATA_DEFAULTS;

    let existing = localStorage.getItem('invoiceData');
    let existingMeta = localStorage.getItem('invoiceDataMeta');

    if(existing) invoiceData = { ...invoiceData, ...(JSON.parse(existing)) }
    if(existingMeta) invoiceMeta = { ...invoiceMeta, ...(JSON.parse(existingMeta)) }

    return {
      loading: true,
      showHelp: false,
      
      errors: [],
      
      invoiceMeta,
      invoiceData,
      
      filePickerKey: 0,  // Hacky way of clearing the input each time it's read

      toast: useToast()
    }
  },
  mounted() {
    // Don't bother checking every time if user isn't authenticated
    if(localStorage.getItem('hasPreviousLogin'))
      this.$store.dispatch('checkAuth').then(() => { this.loading = false; });

    else
      this.loading = false;
  },
  methods: {
    debug(d) { console.log('debug:', d) },
    
    async manualSync(skipNotification) {
      // Save locally first in case anything else breaks!
      this.save(true)

      let res = await this.$store.dispatch('fileSync', this.exportData(true));

      // If truthy, then result is newer data from server
      if(res)
        this.parseAndLoadData(res)

      if(!skipNotification)
        this.toast.success('Synced with the cloud!')
    },
    
    save(skipNotification) {
      localStorage.setItem('invoiceDataMeta', JSON.stringify(this.invoiceMeta))
      localStorage.setItem('invoiceData', JSON.stringify(this.invoiceData))

      if(!skipNotification)
        this.toast.success('Saved locally!')
    },
    
    importData() {
      let elem = document.getElementById('file_picker');

      elem.addEventListener('input', () => {
        console.log('new file')
        let file = elem.files[0];
        let reader = new FileReader();

        // Keep track of the file name the user used
        this.invoiceMeta.filename = file.name

        reader.onload = () => {
          this.parseAndLoadData(reader.result);          

          // Clear value each time so we get updated file
          this.filePickerKey++;

          this.toast.info('Updated invoice.')
        }

        reader.readAsText(file);
      });

      elem.click();
    },
    parseAndLoadData(data) {
      let parsed = parseInvoiceCSV(data);
      let invoiceData = this.invoiceData;
      invoiceData.body.items = parsed;

      this.invoiceData = sanitizeData(invoiceData);
    },
    exportData(skipDownload) {
      let data = exportInvoiceCSV(this.invoiceData.body.items);

      if(!skipDownload)
        downloadFile(this.invoiceMeta.filename, data);
      
      return data;
    },

    print() {
      // Make sure everything is there
      let validationResult = validateInvoiceData(clone(this.invoiceMeta), clone(this.invoiceData))
      if(validationResult !== true) {
        alert(`The following missing fields (*) are required:\n\n${validationResult.join(', ')}`)
        return;
      }

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
              body { margin: 1.25rem; font-family: calibri }
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

<style scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
