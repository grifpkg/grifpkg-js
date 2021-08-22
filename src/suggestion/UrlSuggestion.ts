class UrlSuggestion {

    public readonly id: string;
    public readonly suggestedBy: Account;
    public readonly approvedBy: Account | null;
    public readonly url: string | null;
    public readonly urlSchema: string;
    public readonly jsonURL: string | null;
    public readonly jsonPath: string | null;
    public readonly fileName: string | null;
    public readonly creation: Date;
    public readonly uses: number | null;

    public constructor(id: string, suggestedBy: Account, approvedBy: Account | null, url: string | null, urlSchema: string, jsonURL: string | null, jsonPath: string | null, fileName: string | null, creation: Date, uses: number | null) {
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

    public static fromObject(object: any): UrlSuggestion {
        return new UrlSuggestion(object.id, Account.fromObject(object.suggestedBy), object.approvedBy != null ? Account.fromObject(object.approvedBy) : null, object.url, object.urlSchema, object.jsonURL, object.jsonPath, object.fileName, new Date(object.creation * 1000), object.uses)
    }

}