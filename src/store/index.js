import { createStore  } from 'vuex'
import { AUTHENTICATION } from '../constants';

// Cloud auth providers
import * as msal from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: AUTHENTICATION.azure.client_id,
    authority: 'https://login.microsoftonline.com/consumers/',
    redirectUri: 'http://localhost:8080'
  }
}

export default createStore({
  state: {
    /** Who the user is logged in with. */
    authProvider: '',

    /** Access token for user. */
    accessToken: null,

    /** Details about the user's account. */
    account: null,

    /** Microsoft authentication helper. */
    msal: new msal.PublicClientApplication(msalConfig),
  },
  mutations: {
    authProvider(state, newProvider) { state.authProvider = newProvider; },
    accessToken(state, token) { state.accessToken = token; },
    account(state, account) { state.account = account; },
    msal(state, m) { state.msal = m; }
  },
  getters: {
    /** True iff user logged in with ANY possible provider */
    isLoggedIn(state) { return !!state.authProvider; },

    /** 
     * True iff user is authenticated with OneDrive
     */
    isLoggedInOneDrive(state) { return state.authProvider === 'microsoft'; }
  },
  actions: {
    /** 
     * Checks if user already authenticated 
     * and can be logged in silently.
     */
    async checkAuth({ state, commit }) {
      try {
        let loginResponse = await state.msal.ssoSilent(AUTHENTICATION.azure.scopes);

        commit('authProvider', 'microsoft');
        commit('accessToken', loginResponse.accessToken);
        commit('account', loginResponse.account);

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

      const updateState = () => {
        commit('authProvider', 'microsoft');
        commit('accessToken', loginResponse.accessToken);
        commit('account', loginResponse.account);
      }

      // See if we can silently login first!
      try {
        loginResponse = await state.msal.ssoSilent(AUTHENTICATION.azure.scopes);
        console.log('silent login!', loginResponse)

        updateState();

      } catch (error) {
        // Silent login failed, ask user now
        try {
          loginResponse = await state.msal.loginPopup(AUTHENTICATION.azure.scopes); 
          console.log('signed in after popup!', loginResponse)

          updateState();

        } catch (error) {
          console.error('failed to login', error)
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