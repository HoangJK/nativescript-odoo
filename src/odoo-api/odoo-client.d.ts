import { OdooUser } from "./odoo-user";
export declare class OdooLocalStorageKey {
    static readonly SERVER_URL: string;
    static readonly SESSION_ID: string;
    static readonly CURRENT_USER: string;
}
export declare class OdooEndpoint {
    static readonly VERSION_INFO: string;
    static readonly DATABASE_LIST: string;
    static readonly AUTHENTICATE_URL: string;
    static readonly LOGOUT: string;
    static readonly SEARCH_READ: string;
    static readonly CALL_KW: string;
}
export declare class OdooMethod {
    static readonly CALL: string;
    static readonly CREATE: string;
    static readonly WRITE: string;
    static readonly READ_GROUP: string;
}
export declare class OdooClient {
    private static _instance;
    private constructor();
    static getInstance(): OdooClient;
    setServerUrl(serverUrl: string): OdooClient;
    getServerUrl(): string;
    private setCurrentUser(user);
    private removeCurrentUser();
    getCurrentUser(): OdooUser;
    private setSessionId(sessionId);
    private removeSessionId();
    getSessionId(): string;
    connect(params: {
        onConnectSuccess: Function;
        onConnectError: Function;
    }): this;
    getVersionInfo(): Promise<any>;
    getDatabases(): Promise<Array<string>>;
    authenticate(userName: string, password: string, db: string): Promise<OdooUser>;
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
    createRecord(params: {
        model: string;
        args: Array<{
            [key: string]: any;
        }>;
        kwargs?: any;
    }): Promise<any>;
    updateRecord(params: {
        model: string;
        args: [Array<number>, {
            [key: string]: any;
        }];
        kwargs?: any;
    }): Promise<any>;
    private httpRequestPost(args);
    private httpRequestGet(args);
    private httpRequestProcess(httpRequest);
    private getUserContext();
    private buildHeader();
    private buildParams(params?);
    private handleOdooErrors(response);
}
