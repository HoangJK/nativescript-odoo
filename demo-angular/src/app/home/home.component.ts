import { Component } from "@angular/core";
import { OdooClient } from "nativescript-odoo/odoo-api/odoo-client";

@Component({
    selector: "Home",
    templateUrl: "./home.component.html",
})
export class HomeComponent {
    public odooClient: OdooClient;
    public serverUrl = "http://yourdomain.com";
    public username = "username";
    public password = "username";

    constructor() {
        this.test();
    }

    async test() {
        // Get Odoo Client instance
        this.odooClient = OdooClient.getInstance();

        // Set Odoo Server Url
        this.odooClient.setServerUrl(this.serverUrl);

        // Connect Odoo server and get version
        let versionInfo;
        try {
            versionInfo = await this.odooClient.connect();
            console.log("=> Version info");
            console.dir(versionInfo);
        } catch (err) {
            alert(err);
        }

        // Get database
        let databases;
        if (versionInfo) {
            try {
                databases = await this.odooClient.getDatabases();
                console.log("=> Database");
                console.dir(databases);
            } catch (err) {
                alert(err);
            }
        }

        // Authentication with username and password
        let userInfo;
        try {
            userInfo = await this.odooClient.authenticate(this.username, this.password, databases[0]);
            console.log("=> User info");
            console.dir(userInfo);
        } catch (err) {
            alert(err);
        }

        // Logout
        try {
            await this.odooClient.logout();
            console.log("=> Logout successfully");
        } catch (err) {
            alert(err);
        }
    }
}
