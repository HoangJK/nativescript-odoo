import * as http from "tns-core-modules/http";
import * as localStorage from "nativescript-localstorage";
import { OdooUser } from "./odoo-user";

export class OdooLocalStorageKey {
    public static readonly SERVER_URL: string = "NSOdooServerUrl";
    public static readonly SESSION_ID: string = "NSOdooSessionId";
    public static readonly CURRENT_USER: string = "NSOdooCurrentUser";
}

export class OdooEndpoint {
    public static readonly VERSION_INFO = "/web/webclient/version_info";
    public static readonly DATABASE_LIST = "/web/database/list";
    public static readonly AUTHENTICATE_URL = "/web/session/authenticate";
    public static readonly LOGOUT = "/web/session/logout";
    public static readonly SEARCH_READ = "/web/dataset/search_read";
    public static readonly CALL_KW = "/web/dataset/call_kw";
}

export class OdooMethod {
    public static readonly CALL = "call";
    public static readonly CREATE = "create";
    public static readonly WRITE = "write";
    public static readonly READ_GROUP = "read_group";
}

export class OdooClient {
    private static _instance: OdooClient;

    private constructor() { }

    public static getInstance(): OdooClient {
        return this._instance || (this._instance = new this());
    }

    public setServerUrl(serverUrl: string): OdooClient {
        localStorage.setItem(OdooLocalStorageKey.SERVER_URL, serverUrl);
        return this;
    }

    public getServerUrl(): string {
        return localStorage.getItem(OdooLocalStorageKey.SERVER_URL);
    }

    private setCurrentUser(user: OdooUser) {
        localStorage.setItem(OdooLocalStorageKey.CURRENT_USER, JSON.stringify(user));
    }

    private removeCurrentUser() {
        localStorage.removeItem(OdooLocalStorageKey.CURRENT_USER);
    }

    public getCurrentUser(): OdooUser {
        let currentUser = localStorage.getItem(OdooLocalStorageKey.CURRENT_USER);
        if (currentUser)
            return JSON.parse(currentUser);
        return null;
    }

    private setSessionId(sessionId): OdooClient {
        localStorage.setItem(OdooLocalStorageKey.SESSION_ID, sessionId);
        return this;
    }

    private removeSessionId() {
        localStorage.removeItem(OdooLocalStorageKey.SESSION_ID);
    }

    public getSessionId(): string {
        return localStorage.getItem(OdooLocalStorageKey.SESSION_ID);
    }

    public connect(params: { onConnectSuccess: Function, onConnectError: Function }) {
        if (!this.getServerUrl()) {
            throw (new Error("Server URL is empty"));
        }
        this.getVersionInfo().then((versionInfo) => {
            params.onConnectSuccess(versionInfo);
        }).catch((error) => {
            params.onConnectError(error);
        });
        return this;
    }

    public getVersionInfo(): Promise<any> {
        if (!this.getServerUrl()) {
            throw (new Error("Server URL is empty"));
        }
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.VERSION_INFO,
        });
    }

    public getDatabases(): Promise<Array<string>> {
        if (!this.getServerUrl()) {
            throw (new Error("Server URL is empty"));
        }
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.DATABASE_LIST,
            params: {
                context: {}
            }
        });
    }

    public authenticate(userName: string, password: string, db: string) {
        if (!this.getServerUrl()) {
            throw (new Error("Server URL is empty"));
        }
        let self = this;
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.AUTHENTICATE_URL,
            params: {
                db: db,
                login: userName,
                password: password
            }
        }).then((result) => {
            self.setSessionId(result.session_id);
            let user: OdooUser = OdooUser.parse(result);
            self.setCurrentUser(user);
            return Promise.resolve(user);
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    public logout() {
        if (!this.getServerUrl()) {
            throw (new Error("Server URL is empty"));
        }
        let self = this;
        return this.httpRequestGet({
            url: this.getServerUrl() + OdooEndpoint.LOGOUT,
        }).then((result) => {
            self.removeCurrentUser();
            self.removeSessionId();
            return Promise.resolve();
        }).catch((error) => {
            return Promise.reject(error);
        });
    }

    public searchRead(params: {
        model: string,
        domain?: Array<any>,
        fields?: Array<string>,
        limit?: number,
        offset?: number,
        context?: any,
        sort?: string
    }) {
        if (!this.getServerUrl()) {
            throw (new Error("Server URL is empty"));
        }
        if (!params.context) params.context = this.getUserContext();
        if (!params.domain) params.domain = [];
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.SEARCH_READ,
            params: params
        });
    }

    public callKW(params: {
        model: string, method: string, args: any, kwargs?: any
    }) {
        let self = this;
        params.kwargs = params.kwargs || {};
        params.kwargs.context = params.kwargs.context || {};
        (<any>Object).assign(params.kwargs.context, this.getUserContext());
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.CALL_KW,
            params: params
        });
    }

    public createRecord(params: {
        model: string,
        args: Array<{ [key: string]: any }>;
        kwargs?: any;
    }) {
        return this.callKW({
            model: params.model,
            method: OdooMethod.CREATE,
            args: params.args,
            kwargs: params.kwargs || {}
        });
    }

    public updateRecord(params: {
        model: string,
        args: [Array<number>, { [key: string]: any }];
        kwargs?: any;
    }) {
        return this.callKW({
            model: params.model,
            method: OdooMethod.WRITE,
            args: params.args,
            kwargs: params.kwargs || {}
        });
    }


    // HTTP REQUEST BUILDER

    private httpRequestPost(args: {
        url: string,
        params?: {}
    }) {
        let httpRequest = http.request({
            headers: this.buildHeader(),
            url: args.url,
            method: "POST",
            content: args.params ? this.buildParams(args.params) : this.buildParams({})
        });
        return this.httpRequestProcess(httpRequest);
    }

    private httpRequestGet(args: {
        url: string,
        params?: {}
    }) {
        let httpRequest = http.request({
            headers: this.buildHeader(),
            url: args.url,
            method: "GET"
        });
        return this.httpRequestProcess(httpRequest);
    }

    private httpRequestProcess(httpRequest: Promise<any>) {
        let self = this;
        return httpRequest.then((res) => {
            if (res && res.content && res.content.toJSON) {
                let data = res.content.toJSON();
                if (data.error) {
                    return self.handleOdooErrors(data);
                } else {
                    return Promise.resolve(data.result);
                }
            } else {
                return Promise.reject({
                    message: "API Error"
                });
            }
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    private getUserContext() {
        if (this.getCurrentUser() && this.getCurrentUser().context) {
            return this.getCurrentUser().context;
        }
        return {};
    }

    private buildHeader() {
        return {
            "Content-Type": "application/json",
            "X-Openerp-Session-Id": this.getSessionId() || Math.ceil(Math.random() * 100000000000000)
        };
    }

    private buildParams(params?: any) {
        return JSON.stringify({
            jsonrpc: "2.0",
            method: OdooMethod.CALL,
            params: params,
        });
    }

    private handleOdooErrors(response: any) {
        if (!response.error) {
            return Promise.reject(response.result);
        }

        let error = response.error;
        let errorObj = {
            title: "    ",
            message: "",
            fullTrace: error
        };

        if (error.code === 200 && error.message === "Odoo Server Error" && error.data.name === "werkzeug.exceptions.NotFound") {
            errorObj.title = "page_not_found";
            errorObj.message = "HTTP Error";
        } else if ((error.code === 100 && error.message === "Odoo Session Expired") || // v8
            (error.code === 300 && error.message === "OpenERP WebClient Error" && error.data.debug.match("SessionExpiredException")) // v7
        ) {
            errorObj.title = "session_expired";
            this.logout();
        } else if ((error.message === "Odoo Server Error" && /FATAL:  database "(.+)" does not exist/.test(error.data.message))) {
            errorObj.title = "database_not_found";
            errorObj.message = error.data.message;
        } else if ((error.data.name === "openerp.exceptions.AccessError")) {
            errorObj.title = "AccessError";
            errorObj.message = error.data.message;
        } else {
            let split = ("" + error.data.fault_code).split("\n")[0].split(" -- ");
            if (split.length > 1) {
                error.type = split.shift();
                error.data.fault_code = error.data.fault_code.substr(error.type.length + 4);
            }

            if (error.code === 200 && error.type) {
                errorObj.title = error.type;
                errorObj.message = error.data.fault_code.replace(/\n/g, "<br />");
            } else {
                errorObj.title = error.message;
                errorObj.message = error.data.debug.replace(/\n/g, "<br />");
            }
        }
        return Promise.reject(errorObj);
    }
}