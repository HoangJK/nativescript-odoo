import { Observable } from 'tns-core-modules/data/observable';
import { OdooClient } from "nativescript-odoo/odoo-api/odoo-client";
import { OdooUser } from "nativescript-odoo/odoo-api/odoo-user";

export class HelloWorldModel extends Observable {
    public message: string;
    private odooClient: OdooClient;

    constructor() {
        super();
    }
}
