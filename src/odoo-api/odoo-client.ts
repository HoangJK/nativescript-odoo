import * as appSettings from "tns-core-modules/application-settings";

import { OdooEndpoint, OdooMethod, OdooLocalStorageKey } from "./odoo-constants";
import { OdooRequest } from "./odoo-request";
import { OdooUser } from "./odoo-user";

export class OdooClient extends OdooRequest {
    private static _instance: OdooClient;

    private constructor() {
        super();
    }

    public static getInstance(): OdooClient {
        return this._instance || (this._instance = new this());
    }

    public setServerUrl(serverUrl: string): OdooClient {
        appSettings.setString(OdooLocalStorageKey.SERVER_URL, serverUrl);
        return this;
    }

    public getServerUrl(): string {
        return appSettings.getString(OdooLocalStorageKey.SERVER_URL);
    }

    private setCurrentUser(user: OdooUser) {
        appSettings.setString(OdooLocalStorageKey.CURRENT_USER, JSON.stringify(user));
    }

    private removeCurrentUser() {
        appSettings.remove(OdooLocalStorageKey.CURRENT_USER);
    }

    public getCurrentUser(): OdooUser {
        let currentUser = appSettings.getString(OdooLocalStorageKey.CURRENT_USER);
        if (currentUser) return JSON.parse(currentUser);
        return null;
    }

    public getUserContext() {
        if (this.getCurrentUser() && this.getCurrentUser().context) {
            return this.getCurrentUser().context;
        }
        return {};
    }

    private setSessionId(sessionId): OdooClient {
        appSettings.setString(OdooLocalStorageKey.SESSION_ID, sessionId);
        return this;
    }

    private removeSessionId() {
        appSettings.remove(OdooLocalStorageKey.SESSION_ID);
    }

    public getSessionId(): string {
        return appSettings.getString(OdooLocalStorageKey.SESSION_ID);
    }

    public connect() {
        if (!this.getServerUrl()) {
            throw new Error("Server URL is empty");
        }
        return this.getVersionInfo();
    }

    public getVersionInfo(): Promise<any> {
        if (!this.getServerUrl()) {
            throw new Error("Server URL is empty");
        }
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.VERSION_INFO,
        });
    }

    public getDatabases(): Promise<Array<string>> {
        if (!this.getServerUrl()) {
            throw new Error("Server URL is empty");
        }
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.DATABASE_LIST,
            params: {
                context: {},
            },
        });
    }

    public authenticate(userName: string, password: string, db: string, optional?: any) {
        if (!this.getServerUrl()) {
            throw new Error("Server URL is empty");
        }
        let self = this;
        let params = {
            db: db,
            login: userName,
            password: password,
        };
        if (optional) {
            params = { ...params, ...optional };
        }
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.AUTHENTICATE,
            params: params,
        })
            .then(result => {
                return self.getSessionInfo();
            })
            .then((sessionInfo: any) => {
                let user: OdooUser;
                if (sessionInfo) {
                    self.setSessionId(sessionInfo.session_id);
                    user = OdooUser.parse(sessionInfo);
                    self.setCurrentUser(user);
                }
                return Promise.resolve(user);
            })
            .catch(error => {
                return Promise.reject(error);
            });
    }

    private getSessionInfo() {
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.GET_SESSION_INFO,
            params: {},
        });
    }

    public logout() {
        if (!this.getServerUrl()) {
            throw new Error("Server URL is empty");
        }
        let self = this;
        return this.httpRequestGet({
            url: this.getServerUrl() + OdooEndpoint.LOGOUT,
        })
            .then(result => {
                self.removeCurrentUser();
                self.removeSessionId();
                return Promise.resolve();
            })
            .catch(error => {
                return Promise.reject(error);
            });
    }

    public searchRead(params: {
        model: string;
        domain?: Array<any>;
        fields?: Array<string>;
        limit?: number;
        offset?: number;
        context?: any;
        sort?: string;
    }) {
        if (!this.getServerUrl()) {
            throw new Error("Server URL is empty");
        }
        if (!params.context) params.context = this.getUserContext();
        if (!params.domain) params.domain = [];
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.SEARCH_READ,
            params: params,
        });
    }

    public callKW(params: { model: string; method: string; args: any; kwargs?: any }) {
        params.kwargs = params.kwargs || {};
        params.kwargs.context = params.kwargs.context || {};
        (<any>Object).assign(params.kwargs.context, this.getUserContext());
        return this.httpRequestPost({
            url: this.getServerUrl() + OdooEndpoint.CALL_KW,
            params: params,
        });
    }

    public create(params: { model: string; args: Array<{ [key: string]: any }>; kwargs?: any }) {
        return this.callKW({
            model: params.model,
            method: OdooMethod.CREATE,
            args: params.args,
            kwargs: params.kwargs || {},
        });
    }

    public read(params: { model: string; args: Array<any>; kwargs?: any }) {
        return this.callKW({
            model: params.model,
            method: OdooMethod.READ,
            args: params.args,
            kwargs: params.kwargs || {},
        });
    }

    public write(params: { model: string; args: [Array<number>, { [key: string]: any }]; kwargs?: any }) {
        return this.callKW({
            model: params.model,
            method: OdooMethod.WRITE,
            args: params.args,
            kwargs: params.kwargs || {},
        });
    }

    public unlink(params: { model: string; args: Array<any>; kwargs?: any }) {
        return this.callKW({
            model: params.model,
            method: OdooMethod.UNLINK,
            args: params.args,
            kwargs: params.kwargs || {},
        });
    }

    public onchange(params: { model: string; args: Array<any>; kwargs?: any }) {
        return this.callKW({
            model: params.model,
            method: OdooMethod.ONCHANGE,
            args: params.args,
            kwargs: params.kwargs || {},
        });
    }
}
