import axios from 'axios'
import { createStore  } from 'vuex'
import { AUTHENTICATION } from '../constants';

// Cloud auth providers
import * as msal from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: AUTHENTICATION.azure.client_id,
    authority: 'https://login.microsoftonline.com/consumers/',
    redirectUri: window.location.href
  }
}

const getMSGraphClient = (accessToken) => axios.create({
  baseURL: 'https://graph.microsoft.com/v1.0/me',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})

export default createStore({
  state: {
    /** Axios handler for Microsoft Graph */
    msGraph: null,

    /** Who the user is logged in with. */
    authProvider: '',

    /** Access token for user. */
    accessToken: null,

    /** Details about the user's account. */
    account: null,

    /** Microsoft authentication helper. */
    msal: new msal.PublicClientApplication(msalConfig),

    /** User info such as name, email, avatar, etc. */
    userInfo: { },

    /** Keep track of which modals are open. */
    modals: {
      oneDriveFileSelector: false
    }
  },
  mutations: {
    authProvider(state, newProvider) { state.authProvider = newProvider; },
    accessToken(state, token) { state.accessToken = token; },
    account(state, account) { state.account = account; },
    msal(state, m) { state.msal = m; },
    userInfo(state, u) { state.userInfo = u; },
    msGraph(state, m) { state.msGraph = m; },
    modals(state, m) { let mo = state.modals; state.modals = { ...mo, ...m } }
  },
  getters: {
    /** True iff user logged in with ANY possible provider */
    isLoggedIn(state) { return !!state.authProvider; },

    /** True iff user is authenticated with OneDrive */
    isLoggedInOneDrive(state) { return state.authProvider === 'microsoft'; }
  },
  actions: {
    /** 
     * Checks if user already authenticated 
     * and can be logged in silently.
     */
    async checkAuth({ state, commit }) {
      try {
        let loginResponse = await state.msal.ssoSilent({ scopes: AUTHENTICATION.azure.scopes });
        let msGraphClient = getMSGraphClient(loginResponse.accessToken);
        let userInfo = (await msGraphClient.get('')).data;
        let userPhoto = (await msGraphClient.get('/photo/$value', { responseType: 'arraybuffer' })).data

        console.log(loginResponse)
        commit('authProvider', 'microsoft');
        commit('accessToken', loginResponse.accessToken);
        commit('account', loginResponse.account);
        commit('msGraph', msGraphClient);
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
     * Login with OneDrive. If user session is still active
     * then it will refresh silently. Otherwise, a popup window
     * will prompt user to authenticate.
     */
    async loginOneDrive({ state, commit }) {
      let loginResponse;

      const updateState = async () => {
        let msGraphClient = getMSGraphClient(loginResponse.accessToken);
        let userInfo = (await msGraphClient.get('')).data;
        let userPhoto = (await msGraphClient.get('/photo/$value', { responseType: 'arraybuffer' })).data

        commit('authProvider', 'microsoft');
        commit('accessToken', loginResponse.accessToken);
        commit('account', loginResponse.account);
        commit('msGraph', msGraphClient);
        commit('userInfo', {
          name: userInfo.displayName,
          email: userInfo.userPrincipalName,
          // Annoyingly, MS Graph only gives us the direct image rather than a link to it...
          avatar: 'data:image/jpeg;base64, ' + new Buffer.from(userPhoto, 'binary').toString('base64')
        })
      }

      // See if we can silently login first!
      try {
        loginResponse = await state.msal.ssoSilent({ scopes: AUTHENTICATION.azure.scopes });
        console.log('silent login!', loginResponse)

        await updateState();

      } catch (error) {
        // Silent login failed, ask user now
        try {
          loginResponse = await state.msal.loginPopup({ scopes: AUTHENTICATION.azure.scopes }); 
          console.log('signed in after popup!', loginResponse)

          await updateState();

        } catch (error) {
          localStorage.removeItem('hasPreviousLogin');

          alert('Failed to login. Check console logs for details.')
          console.error('Failed to login', error)
        }
      }
    },
    async logoutOneDrive({ state, commit }) {
      commit('authProvider', '');
      commit('accessToken', '');
      commit('account', '');

      await state.msal.logoutRedirect({
        postLogoutRedirectUri: window.location.href
      });
    }
  }
});