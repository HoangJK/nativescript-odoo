import * as http from "tns-core-modules/http";

export class OdooRequest {
    buildHeader() {
        let header = {
            "Content-Type": "application/json",
            "X-Openerp-Session-Id": this.getSessionId() || undefined,
        };
        // This code make header to { "Content-Type": "application/json" } when this.getSessionId() is null
        return JSON.parse(JSON.stringify(header));
    }

    buildParams(params?: any) {
        return JSON.stringify({
            jsonrpc: "2.0",
            method: "call",
            params: params,
        });
    }

    httpRequestPost(args: { url: string; params?: {} }) {
        let httpRequest = http.request({
            headers: this.buildHeader(),
            url: args.url,
            method: "POST",
            content: args.params ? this.buildParams(args.params) : this.buildParams({}),
        });
        return this.httpRequestProcess(httpRequest);
    }

    httpRequestGet(args: { url: string }) {
        let httpRequest = http.request({
            headers: {},
            url: args.url,
            method: "GET",
        });
        return this.httpRequestProcessForHtmlResponse(httpRequest);
    }

    httpRequestProcess(httpRequest: Promise<any>) {
        let self = this;
        return httpRequest
            .then(res => {
                if (res && res.content && res.content.toJSON) {
                    let data = res.content.toJSON();
                    if (data.error) {
                        return self.handleOdooErrors(data);
                    } else {
                        return Promise.resolve(data.result);
                    }
                } else {
                    return Promise.reject({
                        message: "API Error",
                    });
                }
            })
            .catch(err => {
                return Promise.reject(err);
            });
    }

    httpRequestProcessForHtmlResponse(httpRequest: Promise<any>) {
        return httpRequest
            .then(res => {
                if (res && res.content) {
                    return Promise.resolve(res.content);
                } else {
                    return Promise.reject({
                        message: "API Error",
                    });
                }
            })
            .catch(err => {
                return Promise.reject(err);
            });
    }

    handleOdooErrors(response: any) {
        if (!response.error) {
            return Promise.reject(response.result);
        }

        let error = response.error;
        let errorObj = {
            title: "    ",
            message: "",
            fullTrace: error,
        };

        if (error.code === 200 && error.message === "Odoo Server Error" && error.data.name === "werkzeug.exceptions.NotFound") {
            errorObj.title = "page_not_found";
            errorObj.message = "HTTP Error";
        } else if (
            (error.code === 100 && error.message === "Odoo Session Expired") || // v8
            (error.code === 300 && error.message === "OpenERP WebClient Error" && error.data.debug.match("SessionExpiredException")) // v7
        ) {
            errorObj.title = "session_expired";
            this.logout();
        } else if (error.message === "Odoo Server Error" && /FATAL:  database "(.+)" does not exist/.test(error.data.message)) {
            errorObj.title = "database_not_found";
            errorObj.message = error.data.message;
        } else if (error.data.name === "openerp.exceptions.AccessError") {
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

    // For override
    getSessionId(): string {
        return "";
    }

    logout() {}
}
