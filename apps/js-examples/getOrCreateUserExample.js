let fetch;
import('node-fetch').then(nodeFetch => {
    fetch = nodeFetch;
});
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

// Function to get or create a user
async function getOrCreateFdaiUserId(yourUserId) {
  let your_user = await getOrCreateUserFromYourDB(yourUserId);
  if(your_user && your_user.fdai_user_id) {
    return your_user;
  }
  console.log("Creating user at url: " + url, "with data: " + JSON.stringify(data));

  let response = await fetch(`https://safe.fdai.earth/api/v1/user`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'X-Client-ID': process.env.FDAI_CLIENT_ID,
      'X-Client-Secret': process.env.FDAI_CLIENT_SECRET
    },
    body: JSON.stringify({
      clientUserId: yourUserId
    })
  });
  response = await response.json();
  // Update your user with the fdai_user_id
  await prisma.users.update({
    where: { id: yourUserId },
    data: {
      fdai_user_id: response.user.id
    }
  });
  return response.user.id
}

setupTest().then(async () => {
  const yourUser = await getOrCreateUserFromYourDB(yourUserId);
  // get or create FDAi User ID
  const fdaiUserId = await getOrCreateFdaiUserId(yourUserId);
  // save measurements
  const measurements = [
    {
      "type": "temperature",
      "value": 98.6,
      "unit": "F",
      "timestamp": new Date().toISOString()
    }
  ];

})
