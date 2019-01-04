import { Observable } from "tns-core-modules/data/observable";
import { OdooClient } from "nativescript-odoo/odoo-api/odoo-client";

export class HelloWorldModel extends Observable {
    public message: string;
    private odooClient: OdooClient;

    constructor() {
        super();
        this.odooClient = OdooClient.getInstance();
        this.odooClient.setServerUrl("http://yourdomain.com");
    }

    onTap() {
        console.log("onTap");
        let self = this;
        this.odooClient
            .logout()
            .then(function(res) {
                self.odooClient
                    .authenticate("username", "password", "dbName")
                    .then(user => {
                        console.log("user: ", user);
                        self.odooClient
                            .searchRead({
                                model: "res.users",
                            })
                            .then(res => {
                                console.log(res);
                            });
                    })
                    .catch(function(error) {
                        console.log("error ", error);
                    });
            })
            .catch(function(error) {
                console.log(error);
            });
    }
}
