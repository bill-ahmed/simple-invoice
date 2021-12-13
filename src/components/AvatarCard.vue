<template>
  <div class="flex flex-col items-center justify-center absolute p-1 w-16 h-16 rounded-full -top-16 left-0 right-0 ml-auto mr-auto" style="background: #FAFAFA">
    <svg v-if="!$store.getters.isLoggedIn" xmlns="http://www.w3.org/2000/svg" class="p-2 shadow-md rounded-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>

    <img v-else-if="$store.getters.isLoggedInOneDrive" :src="$store.state.userInfo.avatar" class="shadow-md rounded-full"/>
  </div>

  <button v-if="!$store.getters.isLoggedIn" class="mt-4 btn-info btn-icon w-full" @click="loginOneDrive">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>

    <span> Login OneDrive </span>
  </button>

  <button v-if="!$store.getters.isLoggedIn" class="mt-4 btn-info btn-icon w-full" @click="false">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>

    <span> Login Google Drive </span>
  </button>

  <div v-if="$store.getters.isLoggedIn" class="my-2 flex flex-col items-center">
    <h3 class="m-0"> {{ $store.state.userInfo.name }} </h3>
    <h4 class="text-gray-400"> {{ $store.state.userInfo.email }} </h4>

    <!-- Controls for OneDrive -->
    <div v-if="$store.getters.isLoggedInOneDrive" class="my-2 flex flex-col items-center">
      <button @click="openOneDriveFilePicker"> Open File </button>

      <button class="mt-4 btn-outlined btn-warn w-32 btn-icon text-sm" v-if="$store.getters.isLoggedInOneDrive" @click="logoutOneDrive">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>

        Logout
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

    };
  },
  methods: {
    async loginOneDrive() {
      this.loading = true;
      await this.$store.dispatch('loginOneDrive');

      this.loading = false;
    },
    logoutOneDrive() {
      if(confirm('Are you sure you want to log out?'))
        this.$store.dispatch('logoutOneDrive');
    },
    openOneDriveFilePicker() {
      this.$store.commit('modals', { oneDriveFileSelector: true })
    }
  }
}
</script>

<style>

</style>