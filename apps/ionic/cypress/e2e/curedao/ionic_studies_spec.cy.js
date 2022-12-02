// load type definitions that come with Cypress module
/// <reference types="cypress" />
/**
 * @param {string} effect
 * @param {string} cause
 */
function checkStudyPage (effect, cause) {
  cy.get('i.ion-social-facebook', {timeout: 90000}).should('exist')
  cy.get('.voteButtons', {timeout: 90000}).should('exist')
  cy.get('.study-title', {timeout: 90000}).should('contain', effect)
  cy.get('.study-title', {timeout: 90000}).should('contain', cause)
  // Randomly fails cy.checkForBrokenImages()
}
describe('Studies', function () {
  /**
   * @param {string} cause
   */
  function selectCause (cause) {
    cy.get('#select-predictor-button').click({ force: true })
    cy.get('#input-4').type(cause, { force: true })
    cy.wait(2000)
    cy.get('#variable-item-title > span').contains(cause).click({ force: true })
    cy.get('button[type="button"].md-button > span').click({ force: true })
  }
  it('Logs out so the next test works', function () {
    cy.log("Can't visit different hosts in the same test")
    cy.logoutViaApiLogoutUrl()
  })
  it('Tries to joins a study and is sent to login', function () {
    cy.visitIonicAndSetApiOrigin(
      '/#/app/study-join?causeVariableName=Flaxseed%20Oil&' +
        'effectVariableName=Overall%20Mood&' +
        'studyId=cause-53530-effect-1398-population-study&' +
        'logout=1')
    cy.get('#joinStudyButton').click({ force: true })
    cy.get('#signInButton > span').click({ force: true })
  })
  it('Creates a study and votes on it', function () {
      // Very flakey!
    let effect = 'Overall Mood'
    let cause = 'Sleep Duration'
    cy.loginWithAccessTokenIfNecessary('/#/app/study-creation')
    selectCause(cause)
    cy.get('#select-outcome-button').click({ force: true })
    cy.get('#input-6').type(effect, { force: true })
    cy.log('Wait for filtering')
    cy.wait(4000)
    cy.get('#variable-item-title > span', {timeout: 20000})
        .contains(effect).click({ force: true })
    cy.get('button[type="button"].md-button > span').click({ force: true }).then(function(){
      //debugger
      // TODO:  Update this
      // cy.get('#createStudyButton', { timeout: 3000 }).click({ force: true })
      // cy.get('#goToStudyButton', { timeout: 30000 }).click({ force: true })
      // checkStudyPage(effect, cause)
      // cy.get('.voteButtons').click({ force: true })
      // cy.visitIonicAndSetApiOrigin(`/#/app/study?causeVariableName=${cause}&effectVariableName=${effect}`)
      // checkStudyPage(effect, cause)
    })
      cy.logOutViaSettingsPage(false)
  })
  it('Looks at a study anonymously', function () {
      // Very flakey!
    let effect = 'Overall Mood'
    let cause = 'Sleep Duration'
    cy.visitIonicAndSetApiOrigin(`/#/app/study?causeVariableName=${cause}&` +
        `effectVariableName=${effect}&` +
      'logout=1')
      cy.wait(1000)
    checkStudyPage(effect, cause)
  })
  it('Goes to study from positive predictors page', function () {
    cy.loginWithAccessTokenIfNecessary('/#/app/predictors-positive', true)
      cy.wait(5000) // Leftover redirect from previous test
    cy.log('Have to go to /#/app/predictors-positive twice for some reason because we randomly get redirected to join study page')
    cy.loginWithAccessTokenIfNecessary('/#/app/predictors-positive', true)
    cy.log('Click the first study.  TODO: Speed this up and reduce timeout')
    cy.get('.study-tag-line:first', { timeout: 15000 })
        .click({ force: true })
    cy.log(
        'Study page displays.  TODO: Reduce timeout and make sure that we populate with initial correlation before fetching full study')
    cy.get('#studyHeaderHtml', { timeout: 60000 })
        .should('contain', 'Overall Mood')
      cy.logOutViaSettingsPage(false)
  })
    // Ionic tests keep randomly getting stuck here
  it.skip('Joins study from static v2/study page', function () {
    cy.visitApi(`/api/v2/study?logLevel=info&effectVariableName=Overall%20Mood&causeVariableName=Flaxseed%20Oil`)
    cy.contains('Join This Study')
        .invoke('removeAttr', 'target') // Cypress can't follow to new tab
        .click({ force: true })
      // Changing domains started crashing cypress randomly with NEW URL chrome-error://chromewebdata/
      // https://github.com/cypress-io/cypress/issues/1506
    //cy.wait(10000)
    cy.checkForBrokenImages()
    // cy.get('.button-bar > button[id="joinStudyButton"].button').click({ force: true })
    // cy.wait(15000)
    // cy.get('#signUpButton').click({ force: true })
    // // TODO: Fix random CypressError: Timed out retrying: Expected to find element: '#login-page-link', but never found it.
    // cy.get('#login-page-link').click({ force: true })
    // cy.login()
    // cy.wait(5000)
    // cy.get('#go-to-inbox-button').click({ force: true })
    // cy.get('#hideHelpInfoCardButton').click({ force: true })
    // cy.get('#hideHelpInfoCardButton').click({ force: true })
    // cy.get('#hideHelpInfoCardButton').click({ force: true })
    //   cy.logOutViaSettingsPage(false)
  })
    it('Joins study from predictors page', function () {
        cy.loginWithAccessTokenIfNecessary('/#/app/predictors/Energy', true)
        cy.get('#join-cause-1486-effect-1306-population-study', { timeout: 15000 })
            .click({ force: true })
        cy.wait(5000) // Leftover redirect from previous test
        cy.get('#app-container > ion-side-menu-content > ion-nav-view > ion-view:nth-child(3) > div > div > div > p', { timeout: 60000 })
            .should('contain', 'Body Weight')

        cy.loginWithAccessTokenIfNecessary('/#/app/predictors/Energy', true)
        cy.wait(5000) // Leftover redirect from previous test
        cy.debug()
        cy.get('#join-cause-1444-effect-1306-population-study', { timeout: 15000 })
            .click({ force: true })
        cy.get('#app-container > ion-side-menu-content > ion-nav-view > ion-view:nth-child(3) > div > div > div > p', { timeout: 60000 })
            .should('contain', 'Sickness')
    })
})
