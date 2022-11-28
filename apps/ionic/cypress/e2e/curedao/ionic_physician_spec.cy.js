// load type definitions that come with Cypress module
/// <reference types="cypress" />
let unixTime = Math.floor(Date.now() / 1000)
let urls = {
  physicianOAuth: '/api/v1/oauth/authorize?response_type=token&scope=readmeasurements&client_id=m-thinkbynumbers-org',
}
function generateTestEmail(){
  let testUsername = `testuser${unixTime}`;
  let testEmail = `${testUsername}@quantimo.do`;
  return testEmail;
}
let testEmail = generateTestEmail();
function enterPasswordsAndClickRegister () {
  cy.get('#password-group > input').type('testing123')
  cy.get('#password-confirm-group > input').type('testing123')
  cy.get('#submit-button-group > div > input.btn.btn-primary').click()
}
function validRegistration () {
  changeTestUsernameAndEmail()
  // cy.get('#username-group > input')
  //       .clear()
  //       .type(testUsername)
  cy.get('#email-group > input')
        .clear()
        .type(testEmail)
  enterPasswordsAndClickRegister()
}
function changeTestUsernameAndEmail () {
  unixTime = Math.floor(Date.now() / 1000)
  testEmail = generateTestEmail();
}
function checkIntroWithAccessToken () {
  cy.url().should('include', 'intro')
  cy.url().should('include', 'quantimodoAccessToken')
}
describe('Physician Dashboard', function () {
  it.skip('List kids on Kiddomodo parent dashboard', function () {
    cy.visit('https://physician.quantimo.do/#/app/physician?clientId=kiddomodo&accessToken=test-token')
    cy.get('md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > #tab-item-4 > .ng-binding', { timeout: 20000 })
        .contains('Kid')
    cy.get('.ng-pristine > #sharing-invitation-card > #card-header > span > .ng-binding', { timeout: 20000 })
        .contains('kid')
  })
  it.skip('Patient creates account and is sent to OAuth url', function () {
    cy.visitApi(urls.physicianOAuth)
    validRegistration()
    cy.url().should('include', urls.physicianOAuth)
    cy.get('#button-approve').click()
    checkIntroWithAccessToken()
    cy.disableSpeechAndSkipIntro()
  })
})
