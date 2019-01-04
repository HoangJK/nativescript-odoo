import { Observable } from "tns-core-modules/data/observable";
import { OdooClient } from "nativescript-odoo/odoo-api/odoo-client";

export class HelloWorldModel extends Observable {
    public message: string;
    private odooClient: OdooClient;

    constructor() {
        super();
        this.odooClient = OdooClient.getInstance();
        this.odooClient.setServerUrl("http://192.168.1.162:8069");
    }

    onTap() {
        console.log("onTap");
        let self = this;
        this.odooClient
            .logout()
            .then(function(res) {
                self.odooClient
                    .authenticate("caophuc55", "123456", "moretarget-06-12-2018")
                    .then(user => {
                        console.log("authenticate ", user);
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
