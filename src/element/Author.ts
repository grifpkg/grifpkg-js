class Author {

    public readonly service: Service;
    public readonly id: string | null;
    public readonly username: string | null;
    public readonly authorId: string | null;

    public constructor(service: Service, id: string | null, username: string | null, authorId: string | null) {
        this.service = service;
        this.id = id;
        this.username = username;
        this.authorId = authorId;
    }

    public static fromObject(object: any): Author {
        return new Author(<Service>object.service, object.id, object.username, object.authorId);
    }


}