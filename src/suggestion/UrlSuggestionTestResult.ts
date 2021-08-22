class UrlSuggestionTestResult {

    public readonly release: Release;
    public readonly urlSuggestion: UrlSuggestion | null;
    public readonly result: boolean;
    public readonly message: string | null;

    public constructor(release: Release, urlSuggestion: UrlSuggestion | null, result: boolean, message: string | null) {
        this.release = release;
        this.urlSuggestion = urlSuggestion;
        this.result = result;
        this.message = message;
    }

    public static fromObject(object: any): UrlSuggestionTestResult {
        return new UrlSuggestionTestResult(Release.fromObject(object.release), object.urlSuggestion != null ? UrlSuggestion.fromObject(object.urlSuggestion) : null, Boolean(object.result), object.message)
    }

}