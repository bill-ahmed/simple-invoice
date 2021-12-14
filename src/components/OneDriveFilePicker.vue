<template>
  <div class="modal">
    <!-- Modal content -->
    <div class="w-1/2 p-12 flex flex-col items-start bg-white shadow-2xl rounded-md h-3/4">
      <h2> OneDrive File Picker </h2>
      <p class="my-2"> Choose a file below to open </p>

      <div class="mt-2 mb-4 flex flex-row w-full items-center">
        <button class="mr-4" @click="goBack"> Back </button>
        <h3 class="py-1 px-3 m-0 rounded-md bg-gray-100 flex-grow" style="font-size: 12pt"> {{ path }} </h3>
        <button @click="refresh" class="btn-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div class="mb-4 w-full overflow-hidden overflow-y-auto">
        <div v-if="loading">
          <h4> Loading... </h4>
        </div>

        <!-- Render files available -->
        <div v-else class="flex flex-col btn-icon w-full">
          <div 
            v-for="item in items" 
            :key="item.id" 
            
            class="w-full m-1 py-1 px-4 hover:bg-gray-200 rounded-md cursor-pointer flex flex-row"
            :class="{ 'bg-blue-200 hover:bg-blue-200': fileChosen?.id === item.id }"

            @click="item.folder ? openFolder(item.id) : selectFile(item)"
          >
            <svg v-if="item.folder" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>

            <span> {{ item.name }} </span>
          </div>
        </div>
      </div>

      <div style="flex-grow: 1;"/>

      <div class="flex flex-row self-end items-end">
        <button @click="close" class="mx-2 btn-bare btn-outlined"> Cancel </button>
        <button @click="openFile" class="mx-2 btn-success" :class="{ 'btn-disabled': !fileChosen || loading }"> Open </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import OneDrive from '../utils/OneDrive'

export default {
  data() {
    return {
      loading: true,
      path: '',

      /** URL to where the file is */
      fileChosen: null,
      currentFolderId: null,

      items: [],
      parents: []
    }
  },
  mounted() {

    // Get initial file data loaded
    OneDrive.rootFiles().then((data) => {
      this.items = data.value
      this.currentFolderId = this.items[0].parentReference.id
      
      this.parents.unshift({
        id: this.items[0].parentReference.id,
        name: this.items[0].parentReference.name
      })

      this.updatePath();
      this.loading = false;
    })
  },
  methods: {
    d() { console.log('parents', JSON.parse(JSON.stringify(this.parents)), this.items) },
    close() { this.$store.commit('modals', { oneDriveFileSelector: false }) },
    
    /** Get path name of current directory */
    updatePath() {
      let pClone = JSON.parse(JSON.stringify(this.parents))
      let currDir = this.items[0]?.parentReference.name || ''

      let initPath = pClone.reverse().map(e => e.name || '').filter(e => e !== '').join('/') + '/';
      let finalPath = initPath + (pClone.at(-1)?.name === currDir ? '' : currDir)
      
      this.path = finalPath.startsWith('/') ? finalPath : '/' + finalPath
    },

    async openFolder(id, skipShift = false) {
      this.loading = true
      this.fileChosen = null;
      this.currentFolderId = id;

      if (!skipShift) {
        this.parents.unshift({
          id: this.items[0].parentReference.id,
          name: this.items[0].parentReference.name
        })
      }

      this.items = await OneDrive.folderItemsById(id)

      this.updatePath();
      this.loading = false
    },
    async goBack() {
      // Prevent going back if at root!
      if(this.parents.length === 1)
        return

      await this.openFolder(this.parents.shift().id, true);
    },
    async refresh() {
      this.loading = true
      this.fileChosen = null;

      this.items = await OneDrive.folderItemsById(this.currentFolderId);

      this.loading = false;
    },
    async openFile() {
      if(confirm(`Open "${this.fileChosen.name}"? All data will be overrided!`)) {
        this.loading = true;

        let mimeType = this.fileChosen.file.mimeType;

        if(mimeType !== 'application/octet-stream') {
          alert('Must be a valid CSV file!');
          this.loading = false;
          return;
        }

        let data = await OneDrive.downloadFile(this.fileChosen);
        
        this.$emit('update', data);
        this.close();
      }
    },
    selectFile(file) {
      this.fileChosen = file
    },
  }
}
</script>

<style>

</style>