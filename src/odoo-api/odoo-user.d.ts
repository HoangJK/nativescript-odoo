import { OdooVersion } from "./odoo-version";
export declare class OdooUser {
    partnerId: number;
    companyId: number;
    name: string;
    username: string;
    database: string;
    sessionId: string;
    isSuperuser: boolean;
    context: {
        lang: string;
        tz: boolean;
        uid: number;
    };
    odooVersion: OdooVersion;
    static parse(result: any): OdooUser;
}
