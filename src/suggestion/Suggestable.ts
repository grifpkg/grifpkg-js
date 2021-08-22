abstract class Suggestable {

    public abstract readonly id: string;

    public async suggest(urlSchema: string, jsonURL: string | null, jsonPath: string | null): Promise<UrlSuggestionTestResult | UrlSuggestionTestResult[]> {
        let postData = {
            urlSchema: urlSchema
        }
        if (jsonURL != null && jsonPath != null) {
            postData["jsonURL"] = jsonURL;
            postData["jsonPath"] = jsonPath;
        }
        if (this instanceof Release) {
            postData["release"] = this.id;
        } else if (this instanceof Resource) {
            postData["resource"] = this.id;

        } else {
            throw new Error("unsupported suggestable class")
        }
        let result = await Grif.request("/resource/suggest/url/", postData);
        if (Array.isArray(result)) {
            let testList: UrlSuggestionTestResult[] = [];
            result.forEach(element => {
                testList.push(UrlSuggestionTestResult.fromObject(element));
            });
            return testList;
        } else {
            return UrlSuggestionTestResult.fromObject(result);
        }
    }

}