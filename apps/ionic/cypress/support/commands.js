/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
var logLevel = Cypress.env('LOG_LEVEL') || 'info';
var PERMANENT_TEST_USER_ACCESS_TOKEN_FOR_18535 = '42ff4170172357b7312bb127fb58d5ea464943c1';
var ACCESS_TOKEN_TO_GET_OR_CREATE_REFERRER_SPECIFIC_USER = 'test-token';
var accessToken = Cypress.env('ACCESS_TOKEN') || PERMANENT_TEST_USER_ACCESS_TOKEN_FOR_18535 || ACCESS_TOKEN_TO_GET_OR_CREATE_REFERRER_SPECIFIC_USER;
var baseUrl = Cypress.config('baseUrl');
if (!baseUrl) {
    throw new Error("baseUrl is not set in cypress.json");
}
var testUserName = 'testuser';
var testUserPassword = 'testing123';
cy.getOAuthAppOrigin = function () {
    var oauthAppOrigin = Cypress.env('OAUTH_APP_ORIGIN');
    if (oauthAppOrigin.indexOf("http") === -1) {
        if (oauthAppOrigin.indexOf("localhost") !== -1) {
            oauthAppOrigin = "http://" + oauthAppOrigin;
        }
        else {
            oauthAppOrigin = "https://" + oauthAppOrigin;
        }
    }
    return oauthAppOrigin;
};
cy.oauthAppIsHTTPS = function () {
    return cy.getOAuthAppOrigin().indexOf("https://") === 0;
};
cy.getApiOrigin = function () {
    cy.log("=== getApiOrigin ===");
    var host = Cypress.env('API_ORIGIN');
    var configInstructions = "cypress open";
    if (!host || host === 'undefined') {
        throw 'Please set API_ORIGIN in the cypress/configs folder and provide the config like\n\t' + configInstructions;
    }
    if (host.indexOf('quantimo.do') === -1) {
        throw "API_ORIGIN must be a quantimo.do domain so cypress can clear cookies but is " + host + ".  API_ORIGIN is defined in the cypress/configs directory";
    }
    return host;
};
Cypress.Commands.add('goToApiLoginPageAndLogin', function (email, password) {
    if (email === void 0) { email = testUserName; }
    if (password === void 0) { password = testUserPassword; }
    cy.log("=== goToApiLoginPageAndLogin as " + email + " ===");
    cy.visitApi("/api/v2/auth/login?logout=1");
    cy.enterCredentials('input[name="email"]', email, 'input[name="password"]', password, 'input[type="submit"]');
});
Cypress.Commands.add('goToMobileConnectPage', function () {
    cy.log("=== goToMobileConnectPage ===");
    cy.visitApi("/api/v1/connect/mobile?log=testuser&pwd=testing123&clientId=ghostInspector");
    cy.wait(5000);
});
Cypress.Commands.add('logoutViaApiLogoutUrl', function () {
    cy.log("=== logoutViaApiLogoutUrl ===");
    cy.visitApi("/api/v2/auth/logout").then(function () {
        cy.wait(2000);
        cy.visitApi("/api/v2/auth/login").then(function () {
            cy.get('input[name="email"]')
                .type(testUserName)
                .clear();
        });
    });
});
/**
 * @return {string}
 */
function UpdateQueryString(key, value, uri) {
    var re = new RegExp("([?&])" + key + "=.*?(&|$)", 'i');
    var separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
        return uri.replace(re, "$1" + key + "=" + value + "$2");
    }
    return uri + separator + key + "=" + value;
}
Cypress.Commands.add('loginWithAccessTokenIfNecessary', function (path, waitForAvatar) {
    if (path === void 0) { path = '/#/app/reminders-inbox'; }
    if (waitForAvatar === void 0) { waitForAvatar = true; }
    cy.log(path + " - loginWithAccessTokenIfNecessary");
    //let logout = UpdateQueryString('logout', true, path)
    //cy.visitIonicAndSetApiOrigin(logout)
    var withToken = UpdateQueryString('access_token', accessToken, path);
    cy.visitIonicAndSetApiOrigin(withToken);
    if (waitForAvatar) {
        debugger
        cy.get('#navBarAvatar > img', { timeout: 40000 });
    }
});
Cypress.Commands.add('visitIonicAndSetApiOrigin', function (path) {
    if (path === void 0) { path = '/#/app/reminders-inbox'; }
    path = UpdateQueryString('apiOrigin', cy.getApiOrigin(), path);
    path = UpdateQueryString('logLevel', logLevel, path);
    if (Cypress.env('LOGROCKET')) {
        path = UpdateQueryString('logrocket', 1, path);
    }
    var url = path;
    if (path.indexOf('http') !== 0) {
        url = cy.getOAuthAppOrigin() + path;
    }
    cy.log(url + " - visitIonicAndSetApiOrigin");
    cy.visit(url);
});
Cypress.Commands.add('visitWithApiOriginParam', function (url, options) {
    if (options === void 0) { options = {}; }
    cy.log("=== visitWithApiOriginParam at " + url + " ===");
    if (!options.qs) {
        options.qs = { apiOrigin: cy.getApiOrigin() };
    }
    // @ts-ignore
    options.qs.apiOrigin = cy.getApiOrigin();
    cy.visit(url, options);
});
// noinspection JSUnusedLocalSymbols
Cypress.Commands.add('visitApi', function (path, options) {
    if (options === void 0) { options = {}; }
    cy.log("=== visitApi at " + path + " ===");
    if (!options.qs) {
        options.qs = {};
    }
    // @ts-ignore
    options.qs.XDEBUG_SESSION_START = 'PHPSTORM';
    cy.visit(cy.getApiOrigin() + path, options);
});
// @ts-ignore
Cypress.Commands.add('containsCaseInsensitive', function (selector, content) {
    function caseInsensitive(str) {
        // escape special characters
        // eslint-disable-next-line no-useless-escape
        var input = str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return new RegExp("" + input, 'i');
    }
    cy.get(selector, { timeout: 10000 }).contains(caseInsensitive(content));
    return cy;
});
Cypress.Commands.add('urlShouldContainCaseInsensitive', function (content) {
    cy.url().then(function (url) {
        url = url.toLowerCase();
        content = content.toLowerCase();
        if (url.indexOf(content) === -1) {
            throw "URL " + url + " does not contain " + content;
        }
    });
});
Cypress.Commands.add('assertInputValueEquals', function (selector, expectedValue) {
    cy.get(selector, { timeout: 30000 })
        .scrollIntoView()
        .should('be.visible')
        .then(function ($el) {
        // @ts-ignore
        expect($el[0].value).to.eq(expectedValue);
    });
});
Cypress.Commands.add('assertInputValueContains', function (selector, expectedValue) {
    cy.get(selector, { timeout: 30000 })
        .scrollIntoView()
        .should('be.visible')
        .then(function ($el) {
        // @ts-ignore
        expect($el[0].value).to.contain(expectedValue);
    });
});
Cypress.Commands.add('assertInputValueDoesNotContain', function (selector, expectedValue) {
    cy.get(selector, { timeout: 15000 })
        .scrollIntoView()
        .should('be.visible')
        .then(function ($el) {
        // @ts-ignore
        expect($el[0].value).not.to.contain(expectedValue);
    });
});
Cypress.Commands.add('clearAndType', function (selector, text) {
    cy.log("=== clearAndType ===");
    cy.get(selector, { timeout: 15000 })
        .scrollIntoView()
        .should('be.visible')
        .clear({ force: true })
        .type(text, { force: true });
});
Cypress.Commands.add('enterCredentials', function (usernameSelector, username, passwordSelector, password, submitSelector) {
    if (usernameSelector === void 0) { usernameSelector = 'input[name="email"]'; }
    if (username === void 0) { username = 'testuser'; }
    if (passwordSelector === void 0) { passwordSelector = 'input[name="password"]'; }
    if (password === void 0) { password = 'testing123'; }
    if (submitSelector === void 0) { submitSelector = 'input[type="submit"]'; }
    cy.log("=== enterCredentials ===");
    cy.get(usernameSelector)
        .click({ force: true })
        .type(username, { force: true });
    cy.get(passwordSelector)
        .click({ force: true })
        .type(password, { force: true });
    cy.log('Clicking submit');
    var submitSelectors = [submitSelector];
    submitSelectors.forEach(function (selector) {
        cy.get(selector)
            .click({ force: true });
        cy.log('Clicked submit');
    });
});
Cypress.Commands.add('disableSpeechAndSkipIntro', function () {
    // Seeing if commenting this fixes run error messages cy.log("=== disableSpeechAndSkipIntro ===")
    if (Cypress.browser.name === 'chrome') {
        //cy.get('.pane > div > div > #disableSpeechButton > span', { timeout: 30000 }).click();
    }
    cy.get('.slider > .slider-slides > .slider-slide:nth-child(1) > .button-bar > #skipButtonIntro').click();
});
Cypress.Commands.add('enterNewUserCredentials', function (clickAccept) {
    cy.log("=== enterNewUserCredentials ===");
    var d = new Date();
    var newUserLogin = "testuser" + d.getTime();
    var newUserEmail = "testuser" + d.getTime() + "@gmail.com";
   // cy.get('input[name="user_login"]').type(newUserLogin, { force: true });
    cy.get('input[name="email"]').type(newUserEmail, { force: true });
    cy.get('input[name="password"]').click({ force: true }).type('qwerty', { force: true });
    cy.get('input[name="passwordConfirm"]').click({ force: true }).type('qwerty', { force: true });
    cy.get('#registerButton').click({ force: true });
    if (!baseUrl) {
        throw new Error("baseUrl is not set in cypress.json");
    }
    if (clickAccept && baseUrl.indexOf("quantimo.do") === -1) {
        cy.log("OAUTH_APP_ORIGIN is external so we have to click approve on oauth page");
        cy.get('#button-approve').click({ force: true });
    }
});
Cypress.Commands.add('logOutViaSettingsPage', function (useMenuButton) {
    if (useMenuButton === void 0) { useMenuButton = false; }
    cy.log("=== logOutViaSettingsPage ===");
    if (useMenuButton) {
        cy.get('#menu-item-settings').click({ force: true });
        cy.get('#menu-item-settings > a').click({ force: true });
    }
    else {
        cy.visitIonicAndSetApiOrigin("/#/app/settings");
    }
    cy.get('#userName', { timeout: 30000 }).click({ force: true });
    cy.get('#yesButton').click({ force: true });
    cy.log('We should end up back at intro after logout');
    cy.get('#skipButtonIntro').should('exist');
});
Cypress.Commands.add('allowUncaughtException', function (expectedErrorMessage) {
    if (expectedErrorMessage) {
        cy.log("Allowing uncaught exceptions containing " + expectedErrorMessage);
    }
    else {
        cy.log('Disabling allowance of uncaught exceptions');
    }
    Cypress.env('expectedErrorMessage', expectedErrorMessage);
});
Cypress.Commands.add('checkForBrokenImages', function () {
    cy.log('Checking for broken images...');
    cy.wait(2000);
    // noinspection JSUnusedLocalSymbols
    cy.get('img', { timeout: 30000 })
        // eslint-disable-next-line no-unused-vars
        .each(function ($el, index, $list) {
        if (!$el) {
            cy.log("No $element at index: " + index);
            return;
        }
        // @ts-ignore
        if (!$el[0].naturalWidth) {
            var src_1 = $el[0].getAttribute('src');
            cy.url().then(function (url) {
                var message = "The image with src \n  " + src_1 + " \n  is broken! \n outerHTML is: \n  " + $el[0].outerHTML + "  \n URL: " + url;
                cy.log(message);
                throw message;
            });
        }
    });
});
// @ts-ignore
Cypress.Commands.add('iframeLoaded', { prevSubject: 'element' }, function ($iframe) {
    var contentWindow = $iframe.prop('contentWindow');
    return new Promise(function (resolve) {
        if (contentWindow &&
            contentWindow.document.readyState === 'complete') {
            resolve(contentWindow);
        }
        else {
            $iframe.on('load', function () {
                resolve(contentWindow);
            });
        }
    });
});
// @ts-ignore
Cypress.Commands.add('getInDocument', { prevSubject: 'document' }, function (document, selector) { return Cypress.$(selector, document); });
// @ts-ignore
// @ts-ignore
Cypress.Commands.add('getWithinIframe', function (targetElement) {
    return cy.get('iframe').then(function (iframe) {
        return cy.iframeLoaded(iframe).then(function () {
            cy.document().then(function (doc) {
                return cy.getInDocument(doc, targetElement);
            });
        });
    });
});
/**
 * @param {string} variableName
 * @param {boolean} topResultShouldContainSearchTerm
 */
Cypress.Commands.add('searchAndClickTopResult', function (variableName, topResultShouldContainSearchTerm) {
    cy.log("=== searchAndClickTopResult for " + variableName + " ===");
    cy.wait(1000);
    cy.get('#variableSearchBox').type(variableName, { force: true, timeout: 5000 });
    var firstResultSelector = '#variable-search-result';
    cy.log('Wait for search results to load');
    cy.wait(1000); // Wait in case we only have common variables locally
    // Sometimes we just get local variables so we can't cy.wait('@get-variables')
    // cy.wait('@get-variables', {timeout: 30000}).should('have.property', 'status', 200)
    cy.log("Click on " + variableName + " in dropdown search results");
    if (topResultShouldContainSearchTerm) {
        cy.get(firstResultSelector, { timeout: 20000 })
            .contains(variableName)
            .click({ force: true });
    }
    else {
        cy.get(firstResultSelector, { timeout: 20000 })
            .click({ force: true });
    }
});
Cypress.Commands.add('setTimeZone', function () {
    cy.log("=== setTimeZone for ===");
    // TODO
});
/**
 * @param {string} str
 */
Cypress.Commands.add('clickActionSheetButtonContaining', function (str) {
    cy.log(str + " Action Sheet Button");
    cy.wait(2000);
    var button = '.action-sheet-option';
    if (!str) {
        throw new Error('str is required');
    }
    if (str.indexOf('Delete') !== -1) {
        button = '.destructive';
    }
    cy.get(button, { timeout: 5000 })
        .contains(str)
        .click({ force: true });
});
/**
 * @param {string} str
 */
Cypress.Commands.add('toastContains', function (str) {
    cy.get('.md-toast-text').should('contain', str);
});
//Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message));
beforeEach(function () {
    var url = Cypress.config('baseUrl');
    if (!url) {
        // eslint-disable-next-line no-debugger
        debugger;
        throw Error("baseUrl not set!");
    }
    cy.log("baseUrl is " + url);
    cy.log("API_ORIGIN is " + cy.getApiOrigin());
});
beforeEach(function () {
    cy.server();
    cy.intercept('GET', '/api/v3/measurements*').as('measurements');
    cy.intercept('GET', '/api/v3/variables*').as('get-variables');
    cy.intercept('POST', '/api/v3/measurements*').as('post-measurement');
    cy.intercept('POST', '/api/v3/measurements/delete').as('delete-measurements');
    cy.intercept('POST', '/api/v3/trackingReminderNotifications*').as('post-notifications');
});
