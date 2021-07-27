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
    getOpenSessions() {
        return __awaiter(this, void 0, void 0, function* () {
            let sessions = new Array();
            let response = yield Grif.request("/session/list/");
            response.forEach(element => {
                sessions.push(Session.fromObject(element));
            });
            return sessions;
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
            let content = yield new Promise(function (resolve, reject) {
                var xhttp = new XMLHttpRequest();
                xhttp.open(data == null ? 'GET' : 'POST', `https://api.grifpkg.com/rest/1${endpoint}`, false);
                xhttp.setRequestHeader("Accept", "application/json");
                xhttp.setRequestHeader("Content-Type", "application/json");
                if (Grif.session != null)
                    xhttp.setRequestHeader("Authorization", `Bearer ${Grif.session}`);
                xhttp.onload = function () {
                    try {
                        resolve(JSON.parse(xhttp.responseText));
                    }
                    catch (error) {
                        reject(new APIException(`Server replied with error ${String(xhttp.status)}`));
                    }
                };
                xhttp.onerror = function () {
                    reject(new APIException(`Server replied with error ${String(xhttp.status)}`));
                };
                xhttp.send(data != null ? JSON.stringify(data) : null);
            });
            if ('error' in content) {
                throw new APIException(content.error);
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
        return new Session(object.id, object.hash, object.userAgent, new Date(object.creation), new Date(object.expiry), object.city, object.country);
    }
}
