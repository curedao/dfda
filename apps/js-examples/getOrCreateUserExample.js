const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()
let randomUserIdForTest = Math.floor(Math.random() * Math.pow(2, 31));
let yourUserId = randomUserIdForTest; // Replace with your user ID
// update user id in the users table for testing
async function setupTest() {
  return prisma.users.updateMany({
    where: { user_login: "testuser" },
    data: {
      id: yourUserId
    }
  }).then(() => {
    // truncate fdai_users table
    prisma.fdai_users.deleteMany().then(() => {
      console.log("Test setup complete");
    })
  })
}


function getOrCreateUserFromYourDB(yourUserId) {
  return prisma.users.findUnique({
    where: {
      id: yourUserId
    }
  })
}

// Simplified function to log errors
function logError(message) {
  debugger
  console.error(message);
}

// Function to make API calls
function fdaiApiCall(method, url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.setRequestHeader("X-Client-ID", getFdaiClientId());
    xhr.setRequestHeader("X-Client-Secret", getFdaiClientSecret());
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 400) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.responseText));
      }
    };
    xhr.onerror = function(error) {
      reject(new Error("Network error", error));
    };
    xhr.send(JSON.stringify(data));
  });
}

function getFdaiClientId() {
  if(process.env.FDAI_CLIENT_ID) {
    return process.env.FDAI_CLIENT_ID;
  }
  return "oauth_test_client";
}

function getFdaiClientSecret() {
  if(process.env.FDAI_CLIENT_SECRET) {
    return process.env.FDAI_CLIENT_SECRET;
  }
  return "oauth_test_client_secret";
}

function getFdaiApiOrigin() {
  if(process.env.FDAI_API_ORIGIN) {
    return process.env.FDAI_API_ORIGIN;
  }
  return "https://safe.fdai.earth";
}

// Function to get or create a user
async function getOrCreateFdaiUserId(yourUserId) {
  let your_user = await getOrCreateUserFromYourDB(yourUserId);
  if(your_user && your_user.fdai_user_id) {
    return your_user;
  }
  const url = `${getFdaiApiOrigin()}/api/v1/user`;
  const data = {
    clientUserId: yourUserId,
    clientId: getFdaiClientId(),
    clientSecret: getFdaiClientSecret()
  };

  console.log("Creating user at url: " + url, "with data: " + JSON.stringify(data));
  const response = await fdaiApiCall("POST", url, data);
  // Update your user with the fdai_user_id
  await prisma.users.update({
    where: { id: yourUserId },
    data: {
      fdai_user_id: response.user.id
    }
  });
  return response.user.id
}


async function testGetOrCreateUserFromYourDB() {
// Example usage
  const fdaiUserId = await getOrCreateFdaiUserId(yourUserId);
  console.log(fdaiUser);
  return fdaiUser;
}

setupTest().then(() => {
  console.log("Test setup complete");
  testGetOrCreateUserFromYourDB().then((yourUser) => {
    console.log("Test passed");
    process.exit(0);
  }).catch((error) => {
    logError(error);
    process.exit(1);
  })
})
