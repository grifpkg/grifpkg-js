class DownloadableRelease {

    public readonly url: string;
    public readonly release: Release;
    public readonly resource: Resource | null;

    public constructor(url: string, release: Release, resource: Resource | null) {
        this.url = url;
        this.release = release;
        this.resource = resource;
    }

    public static fromObject(object: any): DownloadableRelease {
        return new DownloadableRelease(object.url, Release.fromObject(object.release), object.resource != null ? Resource.fromObject(object.resource) : null)
    }

}