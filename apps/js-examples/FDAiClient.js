const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

class FDAiClient {
  constructor(clientId, clientSecret = "oauth_test_client_secret",
              apiOrigin = "https://safe.fdai.earth") {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.apiOrigin = apiOrigin;
  }

  apiCall(method, endpoint, data) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${this.apiOrigin}${endpoint}`;
      xhr.open(method, url, true);
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.setRequestHeader("X-Client-ID", this.clientId);
      xhr.setRequestHeader("X-Client-Secret", this.clientSecret);
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 400) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.responseText));
        }
      };
      xhr.onerror = () => {
        reject(new Error("Network error"));
      };
      xhr.send(JSON.stringify(data));
    });
  }

  createUser(clientUserId) {
    const data = {
      clientUserId: clientUserId,
      clientId: this.clientId,
      clientSecret: this.clientSecret
    };
    return this.apiCall("POST", "/api/v1/user", data);
  }
}

module.exports = FDAiClient;
