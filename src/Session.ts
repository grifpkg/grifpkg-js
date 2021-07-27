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
        return new Session(object.id, object.hash, object.userAgent, new Date(object.creation), new Date(object.expiry), object.city, object.country)
    }

}