export class OdooVersion {
    public serverVersion: string;
    public isEnterprise: boolean = false;

    public static parse(result): OdooVersion {
        let odooVersion: OdooVersion = new OdooVersion();
        odooVersion.serverVersion = result.server_version;
        let serverVersionInfo = result.server_version_info;
        if (serverVersionInfo.length > 5) {
            odooVersion.isEnterprise = serverVersionInfo[5] === "e";
        }
        return odooVersion;
    }
}