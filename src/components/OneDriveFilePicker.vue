<template>
  <div class="modal">
    <!-- Modal content -->
    <div class="w-1/2 p-5 bg-white shadow-2xl rounded-md overflow-y-auto" style="max-height: 75vh">
      <h3> OneDrive file picker TODO </h3>
      <button @click="goBack"> Back </button>
      <button @click="close"> Cancel </button>
      <button @click="d"> debug </button>
      
      <div>
        <div v-if="loading">
          <h4> Loading... </h4>
        </div>

        <!-- Render files available -->
        <div class="flex flex-col">
          <div 
            v-for="item in items" 
            :key="item.id" 
            class="w-full m-1 py-1 px-4 hover:bg-gray-200 rounded-md cursor-pointer"
            @click="item.folder ? openFolder(item.id) : openFile(item.id)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      root: '/drive/items/',

      /** Which fields we want back */
      queryOpts: '?select=id,name,description,parentReference,file,createdBy,lastModifiedBy,lastModifiedDateTime,size,folder,remoteItem,@microsoft.graph.downloadUrl',
      
      msGraph: this.$store.state.msGraph,

      items: [],
      parents: []
    }
  },
  mounted() {
    // Get initial file data loaded
    this.msGraph.get('/drive/root/children' + this.queryOpts).then(({ data }) => {
      this.items = data.value
      console.log(this.items)
      this.parents.unshift(this.items[0].parentReference.id)
      this.loading = false;
    })
  },
  methods: {
    d() { console.log('parents', JSON.parse(JSON.stringify(this.parents))) },
    close() { this.$store.commit('modals', { oneDriveFileSelector: false }) },

    async openFolder(id, skipShift = false) {
      this.loading = true

      if (!skipShift)
        this.parents.unshift(this.items[0].parentReference.id)

      this.items = (await this.msGraph.get(this.root + id + '/children' + this.queryOpts)).data.value;

      console.log('new items', this.items)

      this.loading = false
    },
    async openFile(id) {
      console.log('open file', id)
    },
    async goBack() {
      // Prevent going back if at root!
      if(this.parents.length === 1)
        return

      console.log(this.items)
      await this.openFolder(this.parents.shift(), true);
    }
  }
}
</script>

<style>

</style>