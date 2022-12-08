var crypto = require('crypto');
const { PrismaClient } = require('@prisma/client')
const credentials = require("./utils/credentials");
var randomBytes = require('bluebird').promisify(require('crypto').randomBytes);
const qm = require("../ionic/src/js/qmHelpers");
const prisma = new PrismaClient()
let oaClients = prisma.oa_clients;
let client;
const clientId = qm.getClientId();

BigInt.prototype["toJSON"] = function () {
  return this.toString();
};


async function main() {
  // ... you will write your Prisma Client queries here
  const count = await oaClients.count();
  client = await oaClients.findUnique({
    where: {
      client_id: clientId,
    }
  })
  if(!client){
    throw Error("Client not found for client_id: " + clientId);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


async function generateRandomToken() {
  const t = await randomBytes(256).then(function(buffer) {
    return crypto
      .createHash('sha1')
      .update(buffer)
      .digest('hex');
  });
  return t;
}

async function createAccessTokenForUser(user, req){
  let unixTimestamp = Math.round(+new Date()/1000);
  unixTimestamp += (30*86400);
  var date = qm.timeHelper.iso(unixTimestamp)
  let accessToken = await generateRandomToken();
  // if(req && req.session && req.session.id){
  //     accessToken = req.session.id
  // } else {
  //     accessToken = await generateRandomToken();
  // }

  let tokenData = {
    data: {
      user_id: user.ID,
      expires: date,
      access_token: accessToken,
      client_id: client.client_id,
      scope: "readmeasurements writemeasurements",
    },
  };
  const token = await prisma.oa_access_tokens.create(tokenData)
  user.access_token = token;
  return token
}
async function findUserById(id){
  const user = await prisma.wp_users.findUnique({
    where: {
      ID: id,
    },
  })
  user.id = user.ID.toString()
  return user
}
async function findUserByEmail(email){
  const user = await prisma.wp_users.findUnique({
    where: {
      user_email: email,
    },
  })
  if(!user){
    qmLog.error("User not found for email " + email);
    return null
  }
  user.id = user.ID.toString()
  return user
}

async function createUser(data) {
  let email = data.email;
  let password = data.password || data.token || await generateRandomToken();
  const user = await prisma.wp_users.create({
    data: {
      user_login: email,
      user_email: email,
      user_pass: password,
      client_id: credentials.quantimodo.clientId,
      // posts: {
      //     create: { title: 'Hello World' },
      // },
      // profile: {
      //     create: { bio: 'I like turtles' },
      // },
    },
  })
  console.log(`Created new user: ${user.name} (ID: ${user.id})`)
  return user
}

module.exports =  {
  prisma,
  createAccessToken: createAccessTokenForUser,
  findUserByEmail,
  findUserById,
  createUser
}
