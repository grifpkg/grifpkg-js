class Grif {

    private static session: string | null;

    constructor(session: string | null = null) {
        Grif.session = session;
        if (session == null) {
            Grif.session = this.fromBrowser()
        }
    }

    public getSession(): Session {
        return new Session(null, Grif.session, null, null, null, null, null)
    }

    public static async login(save: boolean = true): Promise<Session> {
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
            let event: any = await new Promise(function (resolve, reject) {
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
                        throw new APIException(event.data.data.error)
                    } else {
                        if (save) {
                            localStorage.setItem(btoa("grifpkg"), btoa(String(event.data.data.session.hash)))
                            Grif.session = String(event.data.data.session.hash)
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
    }

    public async logout(save: boolean = true): Promise<Session> {
        let response = await Grif.request("/session/close/")
        if (save) {
            Grif.session = null;
            localStorage.removeItem(btoa("grifpkg"))
        }
        return Session.fromObject(response);
    }

    public static async request(endpoint, data: any = null): Promise<any> {
        let options: any = {
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
        }
        if (data != null) options["body"] = JSON.stringify(data)
        const response = await fetch(`https://api.grifpkg.com/rest/1${endpoint}`, options)
        let content = null;
        try {
            content = JSON.parse(await response.text()); // done like this in order to support primitive results (bools, non-objects)
        } catch (error) {
            // ignore, failed json
        }
        if (response.status >= 300 || response.status < 200) {
            if (content != null && typeof content == 'object' && 'error' in content) {
                throw new APIException(content.error)
            } else {
                throw new APIException(`server replied with ${String(response.status)}`)
            }
        } else {
            return content;
        }

    }

    public fromBrowser(): string {
        let hash = localStorage.getItem(btoa("grifpkg"));
        if (hash == null) return null;
        return atob(hash);
    }

}