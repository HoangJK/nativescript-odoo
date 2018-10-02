# NativeScript Odoo Client (API)
## Installation
Run 
```javascript
tns plugin add nativescript-odoo
```
## Basic method support
* Version information 
* Authentication
* Basic Model methods (read, search_read, write, unlink, call_kw)
## Usage
```ts
// app.component.ts
import { Component } from "@angular/core";
import { OdooClient } from "nativescript-odoo/odoo-api/odoo-client";
import { OdooUser } from "nativescript-odoo/odoo-api/odoo-user";

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent {
    public odooClient: OdooClient;
    public serverUrl = "http://yourdomain.com";
    public username = "username";
    public serverUrl = "password";

    constructor() {
	    // Init OdooClient & Connect With Odoo Server
        let self = this;
        this.odooClient = OdooClient.getInstance();
        this.odooClient.setServerUrl(this.serverUrl)
        .connect({
            onConnectSuccess: (versionInfo) => {
                console.log("---versionInfo: ", versionInfo);
                self.odooClient.getDatabases()
                    .then((databases: Array<string>) => {
                        console.log("---getDatabases: ", databases);
                        self.odooClient.authenticate(this.username, this.password, databases[0])
                            .then((user: OdooUser) => {
                                console.log("---authenticate: ", self.odooClient.getCurrentUser());
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    }).catch((error) => {
                        console.error(error);
                    });
            },
            onConnectError: (error) => {
                console.error(error);
            }
        });
    }
}
```
## License

Apache License Version 2.0, January 2004