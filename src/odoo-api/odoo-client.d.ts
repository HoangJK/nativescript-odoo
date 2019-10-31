import { OdooRequest } from "./odoo-request";
import { OdooUser } from "./odoo-user";
export declare class OdooClient extends OdooRequest {
    private static _instance;
    private constructor();
    static getInstance(): OdooClient;
    setServerUrl(serverUrl: string): OdooClient;
    getServerUrl(): string;
    private setCurrentUser;
    private removeCurrentUser;
    getCurrentUser(): OdooUser;
    getUserContext: () => {};
    private setSessionId;
    private removeSessionId;
    getSessionId(): string;
    connect(): Promise<any>;
    getVersionInfo(): Promise<any>;
    getDatabases(): Promise<Array<string>>;
    authenticate(userName: string, password: string, db: string, optional?: any): Promise<OdooUser>;
    private getSessionInfo;
    logout(): Promise<void>;
    searchRead(params: {
        model: string;
        domain?: Array<any>;
        fields?: Array<string>;
        limit?: number;
        offset?: number;
        context?: any;
        sort?: string;
    }): Promise<any>;
    callKW(params: {
        model: string;
        method: string;
        args: any;
        kwargs?: any;
    }): Promise<any>;
    create(params: {
        model: string;
        args: Array<{
            [key: string]: any;
        }>;
        kwargs?: any;
    }): Promise<any>;
    read(params: {
        model: string;
        args: Array<any>;
        kwargs?: any;
    }): Promise<any>;
    write(params: {
        model: string;
        args: [Array<number>, {
            [key: string]: any;
        }];
        kwargs?: any;
    }): Promise<any>;
    unlink(params: {
        model: string;
        args: Array<any>;
        kwargs?: any;
    }): Promise<any>;
    onchange(params: {
        model: string;
        args: Array<any>;
        kwargs?: any;
    }): Promise<any>;
}
