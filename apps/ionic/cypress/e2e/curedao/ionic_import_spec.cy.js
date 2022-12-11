// load type definitions that come with Cypress module
/// <reference types="cypress" />
describe('Import Data', function () {
  function goToImportPageFromInbox () {
    cy.loginWithAccessTokenIfNecessary('/#/app/reminders-inbox')
    cy.get('#menu-item-import > a').click({ force: true })
  }
  it('Check that we can go to demo import page without logging in', function () {
    cy.visit('https://demo.quantimo.do/#/app/import')
    cy.get('#navBarAvatar > img', { timeout: 40000 })
    // cy.get('#disconnect-worldweatheronline-button', { timeout: 30000 })
    //         .scrollIntoView()
    //         .click()
  })
  it('Connect Canada Weather', function () {
    cy.loginWithAccessTokenIfNecessary('/#/app/import')
    cy.get('#import-data-worldweatheronline-button').click()
  })
  it('Connects Tigerview', function () {
    goToImportPageFromInbox()
    cy.get('#import-data-tigerview-button').click()
  })
  it('Connects Withings', function () {
    goToImportPageFromInbox()
    cy.get("#withings-item", { timeout: 30000 })
    if (Cypress.$('#disconnect-withings-button').length > 0) {
      cy.get('#disconnect-withings-button', { timeout: 30000 }).click({ force: true })
      //cy.url().should('contain', 'upgrade')
    } else {
      cy.log("#disconnect-withings-button does not exist")
    }
    cy.get('#import-data-withings-button', { timeout: 30000 }).click({ force: true })
    //cy.url().should('contain', 'upgrade')
    // TODO: Implement check for upgrade stuff
    // cy.get('input[name="email"]').click({ force: true });
    // cy.get('input[name="password"]').click({ force: true });
    // cy.get('input[name="password"]').click({ force: true });
    // cy.get('input[name="password"]').type("{enter}", { force: true });
    // cy.get('.list-group > a.list-group-item:nth-of-type(1)').click({ force: true });
    // cy.get('button[name="authorized"].btn.btn-main.dark-blue').click({ force: true });
    // cy.get('#disconnect-withings-button').click({ force: true });
    // cy.get('i.ion-ios-gear-outline').click({ force: true });
    // cy.get('#userName > p').click({ force: true });
    // cy.get('#yesButton > span').click({ force: true });
  })
})
