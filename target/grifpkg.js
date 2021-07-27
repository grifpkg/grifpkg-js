var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class APIException extends Error {
    constructor(msg) {
        super(msg);
        // Set the prototype explicitly.
        Object.setPrototypeOf(this, APIException.prototype);
    }
}
class Grif {
    constructor(session = null) {
        Grif.session = session;
        if (session == null) {
            Grif.session = this.fromBrowser();
        }
    }
    getSession() {
        return new Session(null, Grif.session, null, null, null, null, null);
    }
    static login(save = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (window != null) {
                // generates popup
                let h = 600;
                let w = 400;
                const y = window.top.outerHeight / 2 + window.top.screenY - (h / 2);
                const x = window.top.outerWidth / 2 + window.top.screenX - (w / 2);
                let popup = window.open("https://api.grifpkg.com/rest/1/login/", 'Login', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`);
                let listenerActive = true;
                // check if the window gets closed before a result was retrieved
                let interval = setInterval(() => {
                    if (popup.closed && listenerActive) {
                        listenerActive = false;
                        throw new APIException("The popup was closed before any session was retrieved");
                    }
                }, 50);
                // waits for result
                let event = yield new Promise(function (resolve, reject) {
                    window.addEventListener("message", (event) => {
                        if (listenerActive) {
                            if (event.origin == "https://api.grifpkg.com") {
                                listenerActive = false;
                                resolve(event);
                            }
                        }
                    }, false);
                });
                switch (event.data.type) {
                    case 'login':
                        if ('error' in event.data.data) {
                            throw new APIException(event.data.data.error);
                        }
                        else {
                            if (save) {
                                localStorage.setItem(btoa("grifpkg"), btoa(String(event.data.data.session.hash)));
                                Grif.session = String(event.data.data.session.hash);
                            }
                            // do not listen for further events (task completed)
                            listenerActive = false;
                            clearInterval(interval);
                            // close window (result already got)
                            if (!popup.closed) {
                                popup.close();
                            }
                            return Session.fromObject(event.data.data.session);
                        }
                        break;
                }
            }
            else {
                throw new APIException("In order to create a login popup, you must be executing grifpkg from a Document Object Model");
            }
        });
    }
    logout(save = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield Grif.request("/session/close/");
            if (save) {
                Grif.session = null;
                localStorage.removeItem(btoa("grifpkg"));
            }
            return Session.fromObject(response);
        });
    }
    static request(endpoint, data = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                method: data == null ? 'GET' : 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': Grif.session != null ? `Bearer ${Grif.session}` : null,
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
            };
            if (data != null)
                options["body"] = JSON.stringify(data);
            const response = yield fetch(`https://api.grifpkg.com/rest/1${endpoint}`, options);
            let content = null;
            try {
                content = response.json();
            }
            catch (error) {
                // ignore, failed json
            }
            if (response.status >= 300 || response.status < 200) {
                if (content != null && typeof content == 'object' && 'error' in content) {
                    throw new APIException(content.error);
                }
                else {
                    throw new APIException(`server replied with ${String(response.status)}`);
                }
            }
            else {
                return content;
            }
        });
    }
    fromBrowser() {
        let hash = localStorage.getItem(btoa("grifpkg"));
        if (hash == null)
            return null;
        return atob(hash);
    }
}
class Account {
    constructor(id, username, githubId) {
        this.id = id;
        this.username = username;
        this.githubId = githubId;
    }
    static fromObject(object) {
        return new Account(object.id, object.username, object.githubId);
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            let account = yield Grif.request("/session/account/");
            this.id = account.id;
            this.username = account.username;
            this.githubId = account.githubId;
            return this;
        });
    }
    getSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            let sessions = new Array();
            let response = yield Grif.request("/session/list/");
            response.forEach(element => {
                sessions.push(Session.fromObject(element));
            });
            return sessions;
        });
    }
    getNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            let alerts = new Array();
            let response = yield Grif.request("/notifications/get/");
            response.forEach(element => {
                alerts.push(Alert.fromObject(element));
            });
            return alerts;
        });
    }
    commercialSubscribe(commercial) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Grif.request("/notifications/commercial/", {
                subscribe: commercial
            });
            return;
        });
    }
    isCommercialSubscribed() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Grif.request("/notifications/config/");
        });
    }
    setBillingAddress(line1, line2, postCode, city, state, country, phone, name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Grif.request("/billing/address/set/", {
                line1: line1,
                line2: line2,
                postCode: postCode,
                city: city,
                state: state,
                country: country,
                phone: phone,
                name: name
            });
            return;
        });
    }
    getBillingAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield Grif.request("/billing/address/get/");
            return response;
        });
    }
    listSources() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield Grif.request("/billing/source/list/");
            return SourceList.fromObject(response);
        });
    }
    setDefaultSource(sourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Grif.request("/billing/source/default/", {
                source: sourceId
            });
            return;
        });
    }
    attachSource(sourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Grif.request("/billing/source/attach/", {
                source: sourceId
            });
            return;
        });
    }
    detachSource(sourceId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Grif.request("/billing/source/detach/", {
                source: sourceId
            });
            return;
        });
    }
}
class Session {
    constructor(id, hash, userAgent, creation, expiry, city, country) {
        this.id = id;
        this.hash = hash;
        this.userAgent = userAgent;
        this.creation = creation;
        this.expiry = expiry;
        this.city = city;
        this.country = country;
    }
    static fromObject(object) {
        return new Session(object.id, object.hash, object.userAgent, new Date(object.creation * 1000), object.expiry == null ? null : new Date(object.expiry * 1000), object.city, object.country);
    }
    getAccount() {
        return new Account(null, null, null);
    }
    update() {
        return __awaiter(this, void 0, void 0, function* () {
            let session = yield Grif.request("/session/get/");
            this.id = session.id;
            this.hash = session.hash;
            this.userAgent = session.userAgent;
            this.creation = new Date(session.creation * 1000);
            this.expiry = session.expiry == null ? null : new Date(session.expiry * 1000);
            this.city = session.city;
            this.country = session.country;
            return this;
        });
    }
}
class SourceList {
    constructor(defaultv, sources) {
        this.default = defaultv;
        this.sources = sources;
    }
    static fromObject(object) {
        let list = new Array();
        object.sources.forEach(element => {
            list.push(element);
        });
        return new SourceList(object.default, list);
    }
    getDefault() {
        return this.default;
    }
    getAll() {
        return this.sources;
    }
}
class Alert {
    constructor(id, creation, seen, action, subject, text, commercial) {
        this.id = id;
        this.creation = creation;
        this.seen = seen;
        this.action = action;
        this.subject = subject;
        this.text = text;
        this.commercial = commercial;
    }
    static fromObject(object) {
        return new Alert(object.id, new Date(object.creation * 1000), object.seen == null ? null : new Date(object.seen * 1000), object.action, object.subject, object.text, object.commercial);
    }
}
