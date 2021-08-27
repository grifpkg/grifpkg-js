/// <reference path="./../suggestion/Suggestable.ts" />
class Resource extends Suggestable {

    public readonly id: string;
    public readonly service: Service;
    public readonly resourceId: string;
    public readonly paid: boolean;
    public readonly name: string;
    public readonly author: Author;
    public readonly downloads: number | null;
    public readonly ratings: number | null;
    public readonly rating: number | null;
    public readonly description: string;

    public constructor(id: string, service: Service, resourceId: string, paid: boolean, name: string, author: Author, downloads: number | null, ratings: number | null, rating: number | null, description: string | null) {
        super()
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

    public static async fromId(id: string): Promise<Resource> {
        let response = await Grif.request("/resource/get/", {
            resource: id,
        });
        return Resource.fromObject(response);
    }

    public async getReleases(): Promise<Release[]> {
        let response = await Grif.request("/resource/release/list/", {
            resource: this.id,
        });
        let result: Release[] = []
        response.forEach(element => {
            result.push(Release.fromObject(element));
        });
        return result;
    }

    public async getRelease(version: string = null): Promise<Release> {
        return Release.fromId(null, this, version)
    }

    public static fromObject(object: any): Resource {
        return new Resource(object.id, <Service>object.service, object.resourceId, Boolean(object.paid), object.name, Author.fromObject(object.author), object.downloads, object.ratings, object.rating, object.description)
    }

    public static async getPopular(page: number = 0): Promise<Resource[]> {
        let resources: Resource[] = []
        let response = await Grif.request("/resource/list/by/popularity/", {
            page: page,
        });
        response.forEach(resourceData => {
            resources.push(Resource.fromObject(resourceData))
        });
        return response
    }

}