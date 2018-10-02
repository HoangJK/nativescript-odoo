import { OdooVersion } from "./odoo-version";

export class OdooUser {
    public partnerId: number;
    public companyId: number;
    public name: string;
    public username: string;
    public database: string;
    public sessionId: string;
    public isSuperuser: boolean;
    public context: {
        lang: string,
        tz: boolean,
        uid: number
    };
    public odooVersion: OdooVersion;

    public static parse(result): OdooUser {
        let user: OdooUser = new OdooUser();
        user.partnerId = result.partner_id;
        user.companyId = result.company_id;
        user.name = result.name;
        user.username = result.username;
        user.database = result.db;
        user.sessionId = result.session_id;
        user.isSuperuser = result.is_superuser;
        user.context = result.user_context;
        if (result.server_version_info) {
            user.odooVersion = OdooVersion.parse(result);
        }
        return user;
    }

}