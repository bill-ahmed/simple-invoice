<template>
  <h4 v-if="loading"> Please wait... </h4>
  <div v-else>
    <div class="flex flex-col items-center justify-center absolute p-1 w-16 h-16 rounded-full -top-12 left-0 right-0 ml-auto mr-auto" style="background: #FAFAFA">
      <svg v-if="!$store.getters.isLoggedIn" xmlns="http://www.w3.org/2000/svg" class="p-2 shadow-md rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>

      <img v-else-if="$store.getters.isLoggedInOneDrive" :src="$store.state.userInfo.avatar" class="shadow-md rounded-full"/>
    </div>

    <button v-if="!$store.getters.isLoggedIn" class="mt-6 btn-info btn-icon w-full" @click="loginOneDrive">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>

      <span> Login OneDrive </span>
    </button>

    <!-- <button v-if="!$store.getters.isLoggedIn" class="mt-4 btn-info btn-icon w-full" @click="false">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>

      <span> Login Google Drive </span>
    </button> -->

    <div v-if="$store.getters.isLoggedIn" class="my-2 flex flex-col items-center">
      <h3 class="m-0 mt-2"> {{ $store.state.userInfo.name }} </h3>
      <h4 class="text-gray-400"> {{ $store.state.userInfo.email }} </h4>

      <!-- Controls for OneDrive -->
      <div v-if="$store.getters.isLoggedInOneDrive" class="my-2 flex flex-col items-center">

        <div v-if="!!$store.state.fileChosen" class="mb-8 flex flex-col w-full">
          <!-- Info about the file currently opened -->
          <div class="mb-4 flex flex-col text-gray-400">
            <p> <b>Name:</b> {{ fileMetaData().name }} </p>
            <p> <b>Size:</b> {{ fileSize() }} </p>
            <p 
              class="italic" 
              :title="new Date(fileMetaData().lastModifiedDateTime).toLocaleString()"
            > 
              Last update: {{ fileDate() }} 
            </p>
          </div>

          <div class="flex flex-row w-full items-center">
            <div 
              @click="autoSyncInterval ? stopAutoSync() : startAutoSync()" 
              class="cursor-pointer w-1/2 flex flex-row items-center justify-between ring-2 ring-gray-300 rounded-md p-2 h-8"
              :class="{ 'bg-gray-200': !!autoSyncInterval }"
            >
              <p class="mr-2"> Auto Sync </p>
              <input class="m-0" type="checkbox" :checked="!!autoSyncInterval"/>
            </div>

            <button @click="sync(false)" class="btn-bare btn-outlined text-xs p-1 w-1/2 h-8 ml-4"> Sync Now </button>
          </div>
        </div>

        <div class="w-full flex flex-row justify-center items-center">
          <button @click="openOneDriveFilePicker" class="mr-5 w-1/2 btn-icon btn-outlined btn-bare"> 
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
            </svg>

            <span> Open </span> 
          </button>

          <button class="btn-outlined btn-warn w-1/2 btn-icon" v-if="$store.getters.isLoggedInOneDrive" @click="logoutOneDrive">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>

            Logout
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getFileSizeString, niceDate } from '../utils';

export default {
  data() {
    return {
      loading: false,
      autoSyncInterval: null,
    };
  },
  mounted() {
    // Start syncing if enabled, or unset
    let syncEnabled = JSON.parse(localStorage.getItem('autosync')) === true
    let syncUnset = JSON.parse(localStorage.getItem('autosync')) == null

    if(syncEnabled || syncUnset)
      this.startAutoSync();

  },
  methods: {
    sync(skipNotification) { console.log(new Date(), 'Syncing now.'); this.$emit('sync', skipNotification ?? false) },
    startAutoSync() {
      console.log("Enable auto sync.")
      localStorage.setItem('autosync', true)
      this.autoSyncInterval = setInterval(() => { this.sync(true) }, 30000) 
    },
    stopAutoSync() {
      console.log("Disable auto sync.")
      localStorage.setItem('autosync', false)
      
      clearInterval(this.autoSyncInterval); 
      
      this.autoSyncInterval = null; 
    },

    fileMetaData() { return this.$store.state.fileChosen },
    fileSize() { return getFileSizeString(this.fileMetaData().size) },
    fileDate() { return niceDate(new Date(this.fileMetaData().lastModifiedDateTime)) },

    async loginOneDrive() {
      this.loading = true;
      localStorage.setItem('hasPreviousLogin', 'true');

      await this.$store.dispatch('loginOneDrive');

      this.loading = false;
    },
    async logoutOneDrive() {
      this.loading = true;

      localStorage.removeItem('fileChosen')
      localStorage.removeItem('hasPreviousLogin');

      if(confirm('Are you sure you want to log out?'))
        await this.$store.dispatch('logoutOneDrive');
      
      this.loading = false;
    },

    openOneDriveFilePicker() {
      this.$store.commit('modals', { oneDriveFileSelector: true })
    }
  },
}
</script>

<style scoped>

</style>