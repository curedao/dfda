const chai = require("chai");
const expect = chai.expect;
const { PrismaClient } = require('@prisma/client');
const FDAiClient = require("./FDAiClient");

const prisma = new PrismaClient();
const fdaiClient = new FDAiClient(process.env.FDAI_CLIENT_ID, process.env.FDAI_CLIENT_SECRET, process.env.FDAI_API_ORIGIN);

describe("FDAiClient SDK Test", function() {
  let randomUserIdForTest = Math.floor(Math.random() * Math.pow(2, 31));
  let yourUserId = randomUserIdForTest; // This simulates a unique user ID for the test

  before(async function() {
    // Setup test environment: update user in the database for testing
    await prisma.users.updateMany({
      where: { user_login: "testuser" },
      data: { id: yourUserId }
    });
    await prisma.fdai_users.deleteMany(); // Cleanup any previous test data
  });

  after(async function() {
    // Cleanup: reset the database changes made during the test
    await prisma.fdai_users.deleteMany();
    // Optionally reset users table or other cleanup actions
  });

  it("should create an FDAi user ID for a given client user ID", async function() {
    const response = await fdaiClient.createUser(yourUserId);
    expect(response).to.have.property("user");
    expect(response.user).to.have.property("id");

    // Verify the user was created in the FDAi system by checking if the fdai_user_id was saved
    const updatedUser = await prisma.users.findUnique({
      where: { id: yourUserId }
    });
    expect(updatedUser.fdai_user_id).to.equal(response.user.id);
  });

  // Add more tests as needed
});

