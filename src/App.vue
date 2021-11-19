<template>
  <div class="col h-screen">
    <div class="shadow-md p-2 bg-white"> Header </div>

    <div class="row w-screen flex-grow overflow-x-auto">
      <div class="debug shadow-md m-4 p-2 w-1/6 bg-white rounded-lg">
        Left panel

        <button @click="print">print </button>
      </div>
      <EditorVue :meta="invoiceMeta" :data="invoiceData"/>
    </div>
  </div>
</template>

<script>
import EditorVue from './components/Editor.vue'
import mockData from './mockData.json'
import editorStyles from './styles/app.css.json';

export default {
  name: 'App',
  components: {
    EditorVue
  },
  data() {
    return {
      invoiceMeta: {
        id: '000004',
        dateOfIssue: '11-11-2021',
        dueDate: '11-12-2021',
        currency: 'CAD',
        tax: 0,
        amountPaid: 0
      },
      invoiceData: mockData.invoiceData,
    }
  },
  methods: {
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
