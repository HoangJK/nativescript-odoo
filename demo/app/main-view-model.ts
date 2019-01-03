import { Observable } from "tns-core-modules/data/observable";
import { OdooClient } from "nativescript-odoo/odoo-api/odoo-client";

export class HelloWorldModel extends Observable {
  public message: string;
  private odooClient: OdooClient;

  constructor() {
    super();
    this.odooClient = OdooClient.getInstance();
    this.odooClient.setServerUrl("yourdomain.com");
    this.odooClient.authenticate("admin", "admin", "dbName").then(user => {
      this.odooClient
        .searchRead({
          model: "res.users"
        })
        .then(res => {
          console.log(res);
        });
    });
  }
}
