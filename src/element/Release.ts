class Release extends Suggestable {

    public readonly service: Service
    public readonly id: string;
    public readonly version: string;
    public readonly creation: Date;
    public readonly url: string | null;
    public readonly originalURL: string | null;
    public readonly fileName: string | null;
    public readonly fileExtension: string | null;
    public readonly fileSize: number | null;
    public readonly manifestName: string | null;
    public readonly manifestAuthors: string[] | null;
    public readonly manifestVersion: string | null;
    public readonly manifestMain: string | null;
    public readonly manifestVersionAPI: string | null;
    public readonly manifestDependencies: string[] | null;
    public readonly manifestOptionalDependencies: string[] | null;

    public constructor(service: Service, id: string, version: string, creation: Date, url: string | null, originalURL: string | null, fileName: string | null, fileExtension: string | null, fileSize: number | null, manifestName: string | null, manifestAuthors: string[] | null, manifestVersion: string | null, manifestMain: string | null, manifestVersionAPI: string | null, manifestDependencies: string[] | null, manifestOptionalDependencies: string[] | null) {
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
    public static async fromId(id: string | null, resource: Resource | null = null, version: string | null = null): Promise<Release> {
        let response = await Grif.request("/resource/release/get/", {
            release: id,
            resource: resource != null ? resource.id : null,
            version: version
        });
        return Release.fromObject(response);
    }

    public async download(): Promise<DownloadableRelease> {
        let response = await Grif.request("/resource/release/download/", {
            release: this.id,
        });
        return DownloadableRelease.fromObject(response);
    }

    public static fromObject(object: any): Release {
        return new Release(<Service>object.service, object.id, object.version, new Date(object.creation * 1000), object.url, object.originalURL, object.fileName, object.fileExtension, object.fileSize, object.manifestName, object.manifestAuthors, object.manifestVersion, object.manifestMain, object.manifestVersionAPI, object.manifestDependencies, object.manifestOptionalDependencies)
    }


}