var Odoo = require("nativescript-odoo").Odoo;
var odoo = new Odoo();

describe("greet function", function() {
    it("exists", function() {
        expect(odoo.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(odoo.greet()).toEqual("Hello, NS");
    });
});