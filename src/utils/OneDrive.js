import axios from 'axios'
import * as msal from "@azure/msal-browser";
import { AUTHENTICATION } from '../constants';

const msalConfig = {
  auth: {
    clientId: AUTHENTICATION.azure.client_id,
    authority: 'https://login.microsoftonline.com/consumers/',
    redirectUri: window.location.href
  }
}

/**
 * A class to help authenticate and connect
 * to Microsoft OneDrive.
 */
export default class OneDrive {
  /** 
   * Microsoft authentication helper. 
   * @type {msal.PublicClientApplication}
   * 
   */
  static _msal = null;

  /** 
   * Axios handler for Microsoft Graph.
   * 
   * @type {import('axios').AxiosInstance}
   */
  static _msGraph = null;
  static _oneDriveQueryOpts = '?select=id,name,description,parentReference,file,createdBy,lastModifiedBy,lastModifiedDateTime,size,folder,remoteItem,@microsoft.graph.downloadUrl';


  /** 
   * Setup OneDrive helper instance.
   */
  static setup() {
    OneDrive._msal = new msal.PublicClientApplication(msalConfig);
  }

  /**
   * Shared functionality between login methods, 
   * such as silent SSO and regular popup.
   * 
   * @param {String} method The login function to run from MSAL.
   * @returns {Promise<{userInfo: any, userPhoto: any, accessToken: String, account: any}>}
   */
  static async _sharedLogin(method) {
    let loginResponse = await OneDrive._msal[method]({ scopes: AUTHENTICATION.azure.scopes });
    OneDrive._msGraph = axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0/me',
      headers: {
        'Authorization': `Bearer ${loginResponse.accessToken}`
      }
    });

    let accessToken = loginResponse.accessToken;
    let account = loginResponse.account; 
    
    let userInfo = (await OneDrive._msGraph.get('')).data;
    let userPhoto = (await OneDrive._msGraph.get('/photo/$value', { responseType: 'arraybuffer' })).data 

    return { account, accessToken, userInfo, userPhoto }
  }

  /**
   * Returns object iff silent login successful,
   * raises error otherwise.
   */
  static async silentLogin() {
    return await OneDrive._sharedLogin('ssoSilent');
  }

  /**
   * Login normally by prompting user.
   * Raises error if failed.
   */
  static async loginPopup() {
    return await OneDrive._sharedLogin('loginPopup');
  }

  /**
   * Logout the user. The promise returned
   * is not expected to resolve.
   */
  static async logout() {
    let msal = OneDrive._msal;

    OneDrive._msal = null;
    OneDrive._msGraph = null;

    await msal.logoutRedirect({
      postLogoutRedirectUri: window.location.href
    })
  }

  /** Get files located in root of OneDrive. */
  static async rootFiles() {
    return (await OneDrive._msGraph.get('/drive/root/children' + OneDrive._oneDriveQueryOpts)).data
  }

  /** 
   * Get items in a folder given its id
   * @param {String} id
   * */
  static async folderItemsById(id) {
    return (
      await OneDrive._msGraph.get('/drive/items/' + id + '/children' + OneDrive._oneDriveQueryOpts)
    ).data.value
  }

  /**
   * Updates contents of existing file given its id.
   * @param {String} id Unique ID of the file.
   * @param {String} data The file contents to send.
   */
  static async updateFileById(id, data) {
    return (
      await OneDrive._msGraph.put('/drive/items/' + id + '/content', data)
    ).data
  }

  /**
   * Get latest metadata on file with given id from OneDrive.
   * @param {String} id 
   */
  static async getFileById(id) {
    return (
      await OneDrive._msGraph.get('/drive/items/' + id + OneDrive._oneDriveQueryOpts)
    ).data
  }

  /**
   * Download a file from OneDrive given the file object.
   * The object should be as-is returned from either 
   * `rootFiles()` or `folderItemsById(...)`.
   * 
   * @returns {Promise<String>} The item content.
   */
  static async downloadFile(file) {
    let dlURL = file['@microsoft.graph.downloadUrl']
    let mimeType = file.file.mimeType;

    let data = (await axios.get(dlURL, {
      headers: {
        Accept: mimeType
      }
    })).data

    return data
  }
}
