// in cypress/support/index.d.ts
// load type definitions that come with Cypress module
/// <reference types="cypress" />
declare namespace Cypress {
    // noinspection JSUnusedGlobalSymbols
    interface Chainable {
        allowUncaughtException(expectedErrorMessage?: string): Chainable<Element>
        assertInputValueContains(selector: string, expected: string): Chainable<Element>
        assertInputValueDoesNotContain(selector: string, expected: string): Chainable<Element>
        assertInputValueEquals(selector: string, expected: string): Chainable<Element>
        checkForBrokenImages(): Chainable<Element>
        clearAndType(selector: string, text: string): Chainable<Element>
        clickActionSheetButtonContaining(str?: string): Chainable<Element>
        containsCaseInsensitive(selector: string, content: string): Chainable<Element>
        disableSpeechAndSkipIntro(): Chainable<Element>
        enterCredentials(usernameSelector?: string, username?: string, passwordSelector?: string, password?: string, submitSelector?: string ): Chainable<Element>
        enterNewUserCredentials(clickAccept: boolean): Chainable<Element>
        getInDocument(document: any, selector: any): Chainable<Element>
        getWithinIframe(targetElement: any): Chainable<Element>
        goToApiLoginPageAndLogin(email?: string, password?: string): Chainable<Element>
        goToMobileConnectPage(): Chainable<Element>
        iframeLoaded($iframe: any): Chainable<Element>
        loginWithAccessTokenIfNecessary(path: string, waitForAvatar?: boolean): Chainable<Element>
        logoutViaApiLogoutUrl(): Chainable<Element>
        logoutViaAppLogoutUrl(): Chainable<Element>
        logOutViaSettingsPage(useMenuButton: boolean): Chainable<Element>
        searchAndClickTopResult(variableName: string, topResultShouldContainSearchTerm?: boolean): Chainable<Element>
        setTimeZone(): Chainable<Element>
        sendSlackNotification(messageBody?: any): Chainable<Element>
        urlShouldContainCaseInsensitive(content: string): Chainable<Element>
        visitApi(url: string, options?: Partial<VisitOptions>): Chainable<Element>
        visitWithApiOriginParam(url: string, options?: Partial<VisitOptions>): Chainable<Element>
        visitIonicAndSetApiOrigin(path: string): Chainable<Element>
        toastContains(str: string): Chainable<Element>
        getOAuthAppOrigin(): string
        oauthAppIsHTTPS(): boolean
        getApiOrigin(): string
    }
}
