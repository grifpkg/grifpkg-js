class Session {
    private id: string;
    private hash: string;
    private userAgent: string;
    private creation: Date;
    private expiry: Date;
    private city: string | null;
    private country: string | null;

    public constructor(id: string, hash: string, userAgent: string, creation: Date, expiry: Date, city: string | null, country: string | null) {
        this.id = id;
        this.hash = hash;
        this.userAgent = userAgent;
        this.creation = creation;
        this.expiry = expiry;
        this.city = city;
        this.country = country;
    }

    public static fromObject(object: any): Session {
        return new Session(object.id, object.hash, object.userAgent, new Date(object.creation * 1000), object.expiry == null ? null : new Date(object.expiry * 1000), object.city, object.country)
    }

    public getAccount(): Account {
        return new Account(null, null, null)
    }

    public async update(): Promise<Session> {
        let session = await Grif.request("/session/get/");
        this.id = session.id;
        this.hash = session.hash;
        this.userAgent = session.userAgent;
        this.creation = new Date(session.creation * 1000);
        this.expiry = session.expiry == null ? null : new Date(session.expiry * 1000)
        this.city = session.city;
        this.country = session.country;
        return this;
    }

}