// load type definitions that come with Cypress module
/// <reference types="cypress" />
function saveMeasurement() {
    cy.get('#saveButton').click({force: true})
    cy.log('Waiting for measurement to post to API...')
    cy.wait('@post-measurement', {timeout: 30000}).its('response.statusCode').should('eq', 201)
    cy.log('Waiting for measurement with id to be stored...')
    cy.wait(500)
}

/**
 * @param {number} val
 * @param {string} variableName
 * @param {string} valence
 */
function recordRatingCheckHistory(val, variableName, valence) {
    cy.url().should('contain', '/measurement-add')
    cy.get("#" + valence + "-rating-with-value-" + val).click({force: true})
    saveMeasurement()
    checkChartsPage(variableName)
    goToHistoryForVariable(variableName)
    let desiredImageName = ratingValueToImage(val, valence)
    cy.get("#historyItem-0 > img", {timeout: 30000})
        .invoke('attr', 'src')
        .should('contain', desiredImageName)
}
/**
 * @param {string} variableName
 */
function checkChartsPage (variableName) {
    cy.loginWithAccessTokenIfNecessary('/#/app/chart-search', true)
    cy.wait(2000)
    cy.searchAndClickTopResult(variableName, true)
    cy.wait(2000)
    cy.url().should('contain', 'charts')
    cy.url().should('contain', variableName)
    cy.log('Chart is present and titled')
    cy.contains(`${variableName} Over Time`, {timeout: 30000})
    cy.get('#menu-more-button').click({ force: true })
    cy.clickActionSheetButtonContaining('Settings')
}

function ratingValueToImage(value, valence) {
    const ratingImages = {
        positive: [
            'img/rating/face_rating_button_256_depressed.png',
            'img/rating/face_rating_button_256_sad.png',
            'img/rating/face_rating_button_256_ok.png',
            'img/rating/face_rating_button_256_happy.png',
            'img/rating/face_rating_button_256_ecstatic.png',
        ],
        negative: [
            'img/rating/face_rating_button_256_ecstatic.png',
            'img/rating/face_rating_button_256_happy.png',
            'img/rating/face_rating_button_256_ok.png',
            'img/rating/face_rating_button_256_sad.png',
            'img/rating/face_rating_button_256_depressed.png',
        ],
        numeric: [
            'img/rating/numeric_rating_button_256_1.png',
            'img/rating/numeric_rating_button_256_2.png',
            'img/rating/numeric_rating_button_256_3.png',
            'img/rating/numeric_rating_button_256_4.png',
            'img/rating/numeric_rating_button_256_5.png',
        ],
    }
    return ratingImages[valence][value - 1]
}

function getTopMeasurementTitle() {
    return cy.get('#historyItemTitle-0', {timeout: 40000})
}

/**
 * @param {number} [dosageValue]
 * @param variableName
 */
function recordTreatmentMeasurementAndCheckHistoryPage(dosageValue, variableName) {
    if (!dosageValue) {
        let d = new Date()
        dosageValue = d.getMinutes()
    }
    var variableCategory = 'Treatments'
    cy.loginWithAccessTokenIfNecessary('/#/app/measurement-add-search?variableCategoryName=' + variableCategory)
    cy.get('#variable-category-selector').should('have.value', variableCategory)
    cy.searchAndClickTopResult(variableName, true)
    cy.log('Click Remind me to track')
    cy.get('#reminderButton').click({force: true})
    cy.log('Check that reminders add page was reached')
    cy.url().should('include', '#/app/reminder-add')
    cy.get('#cancelButton').click({force: true})
    cy.log('Get dosage value from current time (minutes)')
    cy.log('Assign current minutes to dosage')
    cy.get('#defaultValue').type(dosageValue.toString(), {force: true})
    cy.get('#unitSelector').should('contain', 'Milligrams')
    cy.log('Check that mg is selected')
    saveMeasurement()
    cy.visitIonicAndSetApiOrigin('/#/app/history-all-category/' + variableCategory)
    let treatmentStringNoQuotes = `${dosageValue} mg Aaa Test Treatment`
    getTopMeasurementTitle().invoke('text').then((text) => {
        //debugger
        if(text.trim() !== treatmentStringNoQuotes){
            cy.log("ERROR: top value should be " + treatmentStringNoQuotes + " but is " + text.trim())
        }
    })
    getTopMeasurementTitle().should('contain', treatmentStringNoQuotes)
}

/**
 * @param {string} itemTitle
 */
function editHistoryPageMeasurement(itemTitle) {
    cy.log(`Editing history measurement with title containing: ${itemTitle}`)
    getTopMeasurementTitle().contains(itemTitle)
    cy.get('#action-sheet-button-0', {timeout: 30000}).click({force: true})
    cy.clickActionSheetButtonContaining('Edit')
    cy.wait(2000)
    cy.url().should('include', 'measurement-add')
}

function deleteMeasurements(variableName) {
    goToHistoryForVariable(variableName)
    cy.log('Deleting measurements...')
    let deleted = false
    cy.get("body").then(($body) => {
        let selector = "#showActionSheet-button > i"
        let number = $body.find(selector).length
        cy.log(number + " measurements to delete")
        if (number > 0) { //evaluates as true
            cy.get(selector, {timeout: 30000})
                // eslint-disable-next-line no-unused-vars
                .each(($el, _index, _$list) => {
                    cy.log(`Deleting ${$el.text()} reminder`)
                    cy.wrap($el).click({force: true, timeout: 10000})
                    cy.clickActionSheetButtonContaining('Delete')
                    cy.wait('@measurements-delete', {timeout: 30000})
                        .its('response.statusCode').should('eq', 204)
                    deleted = true
                })
        }
    })
    cy.get('#historyList > div', {timeout: 30000})
        // eslint-disable-next-line no-unused-vars
        .each(($el, _index, _$list) => {
            let html = $el.html() // $el is a wrapped jQuery element
            if (html.indexOf('showActionSheet') !== -1 && $el.is('visible')) {
                cy.log(`Deleting ${$el.text()} reminder`)
                cy.wrap($el).click()
                cy.clickActionSheetButtonContaining('Delete')
                cy.wait('@measurements-delete', {timeout: 30000})
                    .its('response.statusCode').should('eq', 204)
                deleted = true
            } else {
                // It's a header
            }
        })
    if (deleted) {
        cy.log('Waiting for deletions to post...')
        cy.wait(5000)
    }
}

function goToHistoryForVariable(variableName, login) {
    if (login) {
        cy.loginWithAccessTokenIfNecessary('/#/app/history-all-variable/' + variableName)
    } else {
        cy.visitIonicAndSetApiOrigin('/#/app/history-all-variable/' + variableName)
    }
}

describe('Measurements', function () {
    // Skipping because it fails randomly and can't reproduce failure locally
    it('Goes to edit measurement from history page', function () {
        cy.loginWithAccessTokenIfNecessary('/#/app/history-all-category/Anything')
        // cy.wait('@measurements', {timeout: 30000})
        //     .its('response.statusCode').should('eq', 200)
        getTopMeasurementTitle().click({force: true})
        cy.clickActionSheetButtonContaining('Edit')
        cy.wait(2000)
        cy.url().should('include', 'measurement-add')
    })
    // Skipping because it fails randomly and can't reproduce failure locally
    it('Records, edits, and deletes an emotion measurement', function () {
        let variableName = 'Alertness'
        let valence = 'positive'
        cy.loginWithAccessTokenIfNecessary('/#/app/measurement-add-search')
        checkChartsPage(variableName)
        goToHistoryForVariable(variableName, true)
        // cy.wait('@measurements', {timeout: 30000})
        //     .its('response.statusCode').should('eq', 200)
        deleteMeasurements(variableName)
        cy.loginWithAccessTokenIfNecessary('/#/app/measurement-add-search')
        cy.searchAndClickTopResult(variableName, true)
        let d = new Date()
        let seconds = d.getSeconds()
        let initialValue = (seconds % 5) + 1
        recordRatingCheckHistory(initialValue, variableName, valence)
        cy.get('#hidden-measurement-id-0').then(($el) => {
            let measurementId = $el.text()
            //debugger
            expect(measurementId).length.to.be.greaterThan(0)
            cy.get('#action-sheet-button-0').click({force: true})
            cy.clickActionSheetButtonContaining('Edit')
            let newMoodValue = ((initialValue % 5) + 1)
            cy.get('#variable-name').contains(variableName)
            recordRatingCheckHistory(newMoodValue, variableName, valence)
            cy.loginWithAccessTokenIfNecessary('/#/app/measurement-add?id=' + measurementId)
            cy.get('#variable-name', {timeout: 10000}).contains(variableName, {timeout: 10000})
            cy.wait(1000)
            goToHistoryForVariable(variableName)
            cy.get("#hidden-measurement-id-0").then(($el) => {
                let editedMeasurementId = $el.text()
                expect(measurementId).length.to.be.greaterThan(0)
                cy.get('#action-sheet-button-0').click({force: true})
                cy.clickActionSheetButtonContaining('Edit')
                cy.get('#deleteButton').click({force: true})
                cy.wait(500)
                goToHistoryForVariable(variableName)
                cy.get("#hidden-measurement-id-0").should('not.contain', editedMeasurementId)
            })
        })
    })
    // Skipping because it fails randomly and can't reproduce failure locally
    it('Record, edit, and delete a treatment measurement', function () {
        let dosageValue = Math.floor(Math.random() * 100) + 10
        let variableName = 'Aaa Test Treatment'
        let variableCategoryName = 'Treatments'
        recordTreatmentMeasurementAndCheckHistoryPage(dosageValue, variableName)
        editHistoryPageMeasurement(dosageValue.toString())
        let newDosageValue = dosageValue / 10
        cy.get('#defaultValue').type(newDosageValue.toString(), {force: true})
        saveMeasurement()
        cy.visitIonicAndSetApiOrigin('/#/app/history-all-category/' + variableCategoryName)
        editHistoryPageMeasurement(newDosageValue.toString())
        cy.get('button.button.icon-left.ion-trash-a').click({force: true})
        cy.wait(1000)
        cy.url().should('include', '/#/app/history-all-category/' + variableCategoryName)
        cy.log('Check that deleted measurement is gone (must use does not equal instead of does not contain because a ' +
            'measurement of 0mg will be true if the value is 50mg)')
        getTopMeasurementTitle()
            .should('not.contain', `${newDosageValue} mg ` + variableName)
    })
    // Seeing if skip fixes timeout problem
    it('Looks at primary outcome charts', function () {
        cy.loginWithAccessTokenIfNecessary('/#/app/track', true)
        cy.loginWithAccessTokenIfNecessary('/#/app/track', true) // Avoid leftover redirects
        cy.get('div.primary-outcome-variable-rating-buttons > img:nth-child(4)').click({ force: true })
        cy.get('g.highcharts-series > rect:nth-of-type(1)', {timeout: 30000}).should('exist')
        // cy.get('#distributionChart > div > svg > text.highcharts-title > tspan')
        //     .should('contain', 'Mood Distribution', {timeout: 30000})
        cy.log('Use the scroll bar to see the charts below')
        cy.get('div.scroll-bar.scroll-bar-v > div')
        // cy.get('#lineChart > div > svg > text > tspan').should('contain', 'Mood Over Time')
        cy.get('#distributionChart > div > svg > g:nth-child(9)').should('exist')
    })
})
