import { createStore } from 'vuex'
import { POSITION, useToast } from "vue-toastification";

// Cloud auth providers
import OneDrive from '../utils/OneDrive';

OneDrive.setup();

export default createStore({
  state: {
    /** Who the user is logged in with. */
    authProvider: '',

    /** Access token for user. */
    accessToken: null,

    /** Details about the user's account. */
    account: null,

    /** User info such as name, email, avatar, etc. */
    userInfo: { },

    /** Keep track of which modals are open. */
    modals: {
      oneDriveFileSelector: false
    },

    /** Don't actually use this property...only for forcing a refresh */
    isFileChosen: !!localStorage.getItem('fileChosen'),

    toast: useToast()
  },
  mutations: {
    authProvider(state, newProvider) { state.authProvider = newProvider; },
    accessToken(state, token) { state.accessToken = token; },
    account(state, account) { state.account = account; },
    userInfo(state, u) { state.userInfo = u; },
    modals(state, m) { let mo = state.modals; state.modals = { ...mo, ...m } },
    isFileChosen(state, f) { state.isFileChosen = f; }
  },
  getters: {
    /** True iff user logged in with ANY possible provider */
    isLoggedIn(state) { return !!state.authProvider; },

    /** True iff user is authenticated with OneDrive */
    isLoggedInOneDrive(state) { return state.authProvider === 'microsoft'; }
  },
  actions: {
    fileOpened({ commit }, file) {
      localStorage.setItem('fileChosen', JSON.stringify(file));
      commit('isFileChosen', true);
    },

    /** 
     * Sync file to cloud storage. Truthy if new data
     * is retrieved, false otherwise.
     * Raises exception if error is encountered.
     */
    async fileSync({ state, dispatch }, data) {
      let file = JSON.parse(localStorage.getItem('fileChosen'));

      switch (state.authProvider) {
        case 'microsoft':
          // Check if new version exists
          let lastModified = new Date(file.lastModifiedDateTime);
          let latestVersion = await OneDrive.getFileById(file.id);

          console.log('server newer?', new Date(latestVersion.lastModifiedDateTime) > lastModified, { local: file.lastModifiedDateTime, server: latestVersion.lastModifiedDateTime })

          // If server is newer, override local
          if(new Date(latestVersion.lastModifiedDateTime) > lastModified) {
            dispatch('fileOpened', latestVersion);
            return await OneDrive.downloadFile(latestVersion)
          }

          else { // Otherwise, update server
            await OneDrive.updateFileById(file.id, data);

            // Refresh local copy as well!
            dispatch('fileOpened', await OneDrive.getFileById(file.id));
          }

          break;
        
        case 'google':
          // TODO
          console.error('IMPLEMENT SYNC WITH GOOGLE!')
          break;
      
        default:
          break;
      }

      return false;
    },

    /** 
     * Checks if user already authenticated 
     * and can be logged in silently.
     */
    async checkAuth({ state, commit }) {
      try {
        let { accessToken, account, userInfo, userPhoto } = await OneDrive.silentLogin();

        commit('authProvider', 'microsoft');
        commit('accessToken', accessToken);
        commit('account', account);
        commit('userInfo', {
          name: userInfo.displayName,
          email: userInfo.userPrincipalName,
          // Annoyingly, MS Graph only gives us the direct image rather than a link to it...
          avatar: 'data:image/jpeg;base64, ' + new Buffer.from(userPhoto, 'binary').toString('base64')
        })

        // TODO: Support for Google Drive

      } catch (error) {
        // Silently fail
      }
    },
    /**
     * Login with OneDrive. A popup window
     * will prompt user to authenticate.
     */
    async loginOneDrive({ state, commit }) {
      try {
        console.log('trying login')
        let { accessToken, account, userInfo, userPhoto } = await OneDrive.loginPopup();

        commit('authProvider', 'microsoft');
        commit('accessToken', accessToken);
        commit('account', account);
        commit('userInfo', {
          name: userInfo.displayName,
          email: userInfo.userPrincipalName,
          // Annoyingly, MS Graph only gives us the direct image rather than a link to it...
          avatar: 'data:image/jpeg;base64, ' + new Buffer.from(userPhoto, 'binary').toString('base64')
        });

      } catch (error) {
        localStorage.removeItem('fileChosen')
        localStorage.removeItem('hasPreviousLogin')

        state.toast.error('Error trying to login. Check console logs for details.', { timeout: 10000, position: POSITION.BOTTOM_CENTER })
        console.error('Failed to login', error)
      }
    },
    async logoutOneDrive({ state, commit }) {
      commit('authProvider', '');
      commit('accessToken', '');
      commit('account', '');

      await OneDrive.logout();
    }
  }
});