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
class Suggestable {
    suggest(urlSchema, jsonURL, jsonPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let postData = {
                urlSchema: urlSchema
            };
            if (jsonURL != null && jsonPath != null) {
                postData["jsonURL"] = jsonURL;
                postData["jsonPath"] = jsonPath;
            }
            if (this instanceof Release) {
                postData["release"] = this.id;
            }
            else if (this instanceof Resource) {
                postData["resource"] = this.id;
            }
            else {
                throw new Error("unsupported suggestable class");
            }
            let result = yield Grif.request("/resource/suggest/url/", postData);
            if (Array.isArray(result)) {
                let testList = [];
                result.forEach(element => {
                    testList.push(UrlSuggestionTestResult.fromObject(element));
                });
                return testList;
            }
            else {
                return UrlSuggestionTestResult.fromObject(result);
            }
        });
    }
}
/// <reference path="./../suggestion/Suggestable.ts" />
class Resource extends Suggestable {
    constructor(id, service, resourceId, paid, name, author, downloads, ratings, rating, description) {
        super();
        this.id = id;
        this.service = service;
        this.resourceId = resourceId;
        this.paid = paid;
        this.name = name;
        this.author = author;
        this.downloads = downloads;
        this.ratings = ratings;
        this.rating = rating;
        this.description = description;
    }
    static fromId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield Grif.request("/resource/get/", {
                resource: id,
            });
            return Resource.fromObject(response);
        });
    }
    getReleases() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield Grif.request("/resource/release/list/", {
                resource: this.id,
            });
            let result = [];
            response.forEach(element => {
                result.push(Release.fromObject(element));
            });
            return result;
        });
    }
    getRelease(version = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return Release.fromId(null, this, version);
        });
    }
    static fromObject(object) {
        return new Resource(object.id, object.service, object.resourceId, Boolean(object.paid), object.name, Author.fromObject(object.author), object.downloads, object.ratings, object.rating, object.description);
    }
}
class Release extends Suggestable {
    constructor(service, id, version, creation, url, originalURL, fileName, fileExtension, fileSize, manifestName, manifestAuthors, manifestVersion, manifestMain, manifestVersionAPI, manifestDependencies, manifestOptionalDependencies) {
        super();
        this.service = service;
        this.id = id;
        this.version = version;
        this.creation = creation;
        this.url = url;
        this.originalURL = originalURL;
        this.fileName = fileName;
        this.fileExtension = fileExtension;
        this.fileSize = fileSize;
        this.manifestName = manifestName;
        this.manifestAuthors = manifestAuthors;
        this.manifestVersion = manifestVersion;
        this.manifestVersionAPI = manifestVersionAPI;
        this.manifestDependencies = manifestDependencies;
        this.manifestOptionalDependencies = manifestOptionalDependencies;
    }
    /**
     * @description provide an id for fetching a known release, or provide a resource and a readable version name (or null for getting the latest version)
     */
    static fromId(id, resource = null, version = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield Grif.request("/resource/release/get/", {
                release: id,
                resource: resource != null ? resource.id : null,
                version: version
            });
            return Release.fromObject(response);
        });
    }
    download() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield Grif.request("/resource/release/download/", {
                release: this.id,
            });
            return DownloadableRelease.fromObject(response);
        });
    }
    static fromObject(object) {
        return new Release(object.service, object.id, object.version, new Date(object.creation * 1000), object.url, object.originalURL, object.fileName, object.fileExtension, object.fileSize, object.manifestName, object.manifestAuthors, object.manifestVersion, object.manifestMain, object.manifestVersionAPI, object.manifestDependencies, object.manifestOptionalDependencies);
    }
}
/// <reference path="./element/Resource.ts" />
/// <reference path="./element/Release.ts" />
class Grif {
    constructor(session = null) {
        Grif.session = session;
        if (session == null) {
            Grif.session = this.fromBrowser();
        }
    }
    isAuthenticated() {
        return Grif.session != null;
    }
    getSession() {
        return new Session(null, Grif.session, null, null, null, null, null);
    }
    queryResource(name, authorName = null, service = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (service != null)
                service = service;
            let response = yield Grif.request("/resource/query/", {
                name: name,
                author: authorName,
                service: Number(service)
            });
            let result = [];
            response.forEach(element => {
                result.push(Resource.fromObject(element));
            });
            return result;
        });
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
    static request(endpoint, data = null, hash = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                method: data == null ? 'GET' : 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': hash != null ? `Bearer ${hash}` : Grif.session != null ? `Bearer ${Grif.session}` : null,
                },
                redirect: 'follow',
                referrerPolicy: 'no-referrer',
            };
            if (data != null)
                options["body"] = JSON.stringify(data);
            const response = yield fetch(`https://api.grifpkg.com/rest/1${endpoint}`, options);
            let content = null;
            try {
                content = JSON.parse(yield response.text()); // done like this in order to support primitive results (bools, non-objects)
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
try {
    module.exports = {
        default: Grif,
        Resource: Resource,
        Release: Release
    };
}
catch (error) {
    // outside node context, native
}
class Account {
    constructor(id, username, githubId) {
        this.id = id;
        this.username = username;
        this.githubId = githubId;
    }
    /**
     * @deprecated
     */
    getId() {
        return this.id;
    }
    /**
     * @deprecated
     */
    getUsername() {
        return this.username;
    }
    /**
     * @deprecated
     */
    getGithubId() {
        return this.githubId;
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
    /**
     * @deprecated
     */
    getId() {
        return this.id;
    }
    /**
     * @deprecated
     */
    getUserAgent() {
        return this.userAgent;
    }
    /**
     * @deprecated
     */
    getCreation() {
        return this.creation;
    }
    /**
     * @deprecated
     */
    getExpiry() {
        return this.expiry;
    }
    /**
     * @deprecated
     */
    getCity() {
        return this.city;
    }
    /**
     * @deprecated
     */
    getCountry() {
        return this.country;
    }
    /**
     * @deprecated
     */
    getAccount() {
        return new Account(null, null, null);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield Grif.request("/session/close/", null, this.hash);
            return Session.fromObject(response);
        });
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
    /**
     * @deprecated
     */
    getId() {
        return this.id;
    }
    /**
     * @deprecated
     */
    getCreation() {
        return this.creation;
    }
    /**
     * @deprecated
     */
    getSeen() {
        return this.seen;
    }
    /**
     * @deprecated
     */
    getAction() {
        return this.action;
    }
    /**
     * @deprecated
     */
    getSubject() {
        return this.subject;
    }
    /**
     * @deprecated
     */
    getText() {
        return this.text;
    }
    /**
     * @deprecated
     */
    isCommercial() {
        return this.commercial;
    }
    /**
     * @deprecated
     */
    static fromObject(object) {
        return new Alert(object.id, new Date(object.creation * 1000), object.seen == null ? null : new Date(object.seen * 1000), object.action, object.subject, object.text, object.commercial);
    }
}
class Author {
    constructor(service, id, username, authorId) {
        this.service = service;
        this.id = id;
        this.username = username;
        this.authorId = authorId;
    }
    static fromObject(object) {
        return new Author(object.service, object.id, object.username, object.authorId);
    }
}
class DownloadableRelease {
    constructor(url, release, resource) {
        this.url = url;
        this.release = release;
        this.resource = resource;
    }
    static fromObject(object) {
        return new DownloadableRelease(object.url, Release.fromObject(object.release), object.resource != null ? Resource.fromObject(object.resource) : null);
    }
}
var Service;
(function (Service) {
    Service[Service["Unknown"] = -1] = "Unknown";
    Service[Service["SpigotMC"] = 0] = "SpigotMC";
})(Service || (Service = {}));
class UrlSuggestion {
    constructor(id, suggestedBy, approvedBy, url, urlSchema, jsonURL, jsonPath, fileName, creation, uses) {
        this.id = id;
        this.suggestedBy = suggestedBy;
        this.approvedBy = approvedBy;
        this.url = url;
        this.urlSchema = urlSchema;
        this.jsonURL = jsonURL;
        this.jsonPath = jsonPath;
        this.fileName = fileName;
        this.creation = creation;
        this.uses = uses;
    }
    static fromObject(object) {
        return new UrlSuggestion(object.id, Account.fromObject(object.suggestedBy), object.approvedBy != null ? Account.fromObject(object.approvedBy) : null, object.url, object.urlSchema, object.jsonURL, object.jsonPath, object.fileName, new Date(object.creation * 1000), object.uses);
    }
}
class UrlSuggestionTestResult {
    constructor(release, urlSuggestion, result, message) {
        this.release = release;
        this.urlSuggestion = urlSuggestion;
        this.result = result;
        this.message = message;
    }
    static fromObject(object) {
        return new UrlSuggestionTestResult(Release.fromObject(object.release), object.urlSuggestion != null ? UrlSuggestion.fromObject(object.urlSuggestion) : null, Boolean(object.result), object.message);
    }
}
