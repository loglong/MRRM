"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthContext = void 0;
class AuthContext {
    static set(user) {
        this._current = user;
    }
    static current() {
        return this._current;
    }
    static clear() {
        this._current = null;
    }
    static getOrgId() {
        return this._current?.orgId ?? null;
    }
    static getUserId() {
        return this._current?.userId ?? null;
    }
}
exports.AuthContext = AuthContext;
AuthContext._current = null;
//# sourceMappingURL=auth-context.js.map