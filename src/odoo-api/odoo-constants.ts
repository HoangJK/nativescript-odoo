export class OdooEndpoint {
    public static readonly VERSION_INFO = "/web/webclient/version_info";
    public static readonly DATABASE_LIST = "/web/database/list";
    public static readonly AUTHENTICATE = "/web/session/authenticate";
    public static readonly GET_SESSION_INFO = "/web/session/get_session_info";
    public static readonly LOGOUT = "/web/session/logout";
    public static readonly SEARCH_READ = "/web/dataset/search_read";
    public static readonly CALL_KW = "/web/dataset/call_kw";
    public static readonly CALL_BUTTON = "/web/dataset/call_button";
}

export class OdooMethod {
    public static readonly CREATE = "create";
    public static readonly READ = "read";
    public static readonly WRITE = "write";
    public static readonly UNLINK = "unlink";
    public static readonly ONCHANGE = "onchange";
    public static readonly READ_GROUP = "read_group";
}

export class OdooLocalStorageKey {
    public static readonly SERVER_URL: string = "NSOdooServerUrl";
    public static readonly SESSION_ID: string = "NSOdooSessionId";
    public static readonly CURRENT_USER: string = "NSOdooCurrentUser";
}
