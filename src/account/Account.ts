class Account {

    private id: string;
    private username: string;
    private githubId: string;

    public constructor(id: string, username: string, githubId: string) {
        this.id = id;
        this.username = username;
        this.githubId = githubId;
    }

    public getId(): string {
        return this.id;
    }

    public getUsername(): string {
        return this.username;
    }

    public getGithubId(): string {
        return this.githubId;
    }

    public static fromObject(object: any): Account {
        return new Account(object.id, object.username, object.githubId)
    }

    public async update(): Promise<Account> {
        let account = await Grif.request("/session/account/");
        this.id = account.id;
        this.username = account.username;
        this.githubId = account.githubId;
        return this;
    }

    public async getSessions(): Promise<Array<Session>> {
        let sessions = new Array<Session>();
        let response = await Grif.request("/session/list/")
        response.forEach(element => {
            sessions.push(Session.fromObject(element))
        });
        return sessions;
    }

    public async getNotifications(): Promise<Array<Alert>> {
        let alerts = new Array<Alert>();
        let response = await Grif.request("/notifications/get/")
        response.forEach(element => {
            alerts.push(Alert.fromObject(element))
        });
        return alerts;
    }

    public async commercialSubscribe(commercial: boolean): Promise<void> {
        await Grif.request("/notifications/commercial/", {
            subscribe: commercial
        })
        return;
    }

    public async isCommercialSubscribed(): Promise<boolean> {
        return await Grif.request("/notifications/config/");
    }

    public async setBillingAddress(line1: string, line2: string, postCode: string, city: string, state: string, country: string, phone: string, name: string): Promise<void> {
        await Grif.request("/billing/address/set/", {
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
    }

    public async getBillingAddress(): Promise<stripe.BillingDetails> {
        let response = await Grif.request("/billing/address/get/");
        return <stripe.BillingDetails>response;
    }

    public async listSources(): Promise<SourceList> {
        let response = await Grif.request("/billing/source/list/");
        return SourceList.fromObject(response);
    }

    public async setDefaultSource(sourceId: string): Promise<void> {
        await Grif.request("/billing/source/default/", {
            source: sourceId
        });
        return;
    }

    public async attachSource(sourceId: string): Promise<void> {
        await Grif.request("/billing/source/attach/", {
            source: sourceId
        });
        return;
    }

    public async detachSource(sourceId: string): Promise<void> {
        await Grif.request("/billing/source/detach/", {
            source: sourceId
        });
        return;
    }

}