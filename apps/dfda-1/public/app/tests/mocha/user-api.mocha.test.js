"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
var chai = require("chai")
var expect = chai.expect

describe("Measurement", function () {
    function getBupropionMeasurement(startAt){
        return {
            "combinationOperation": "SUM",
            "inputType": "value",
            "pngPath": "https://static.quantimo.do/img/variable_categories/treatments.png",
            startAt,
            "unitAbbreviatedName": "mg",
            "unitId": 7,
            "unitName": "Milligrams",
            "upc": null,
            "valence": null,
            "value": 150,
            "variableCategoryId": "Treatments",
            "variableCategoryName": "Treatments",
            "variableName": "Bupropion Sr",
            "note": "",
        }
    }
    it('can add to measurement queue and round startAt', function () {

    })
})

describe("Notifications", function () {
    it('can parse pushed tracking reminder notification', function(done) {
        // noinspection HtmlRequiredAltAttribute,RequiredAttributes,HtmlUnknownAttribute

        done()
    })
})
describe("Units", function () {
    it('can get units', function(done) {
        var units = qm.unitHelper.getAllUnits()
        qmLog.debug("units:", units)
        qm.assert.greaterThan(5, units.length)
        done()
    })
})
function generateRandomEmail() {
    let rand = Math.round(Math.random() * 1000000);
    return "testuser" + rand + "@quantimo.do";
}

describe("Users", function () {
    it('can login via email and password via function', function(done) {
        this.timeout(10000)
        let request = { body: { email: "testuser@mikesinn.com", password: "testing123" } };
    })
})

