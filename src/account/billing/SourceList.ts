class SourceList {

    private default: string;
    private sources: Array<stripe.Source>;

    public constructor(defaultv: string, sources: Array<stripe.Source>) {
        this.default = defaultv;
        this.sources = sources
    }

    public static fromObject(object: any): SourceList {
        let list = new Array<stripe.Source>();
        object.sources.forEach(element => {
            list.push(<stripe.Source>element)
        });
        return new SourceList(object.default, list);
    }

    public getDefault(): string {
        return this.default;
    }

    public getAll(): Array<stripe.Source> {
        return this.sources;
    }

}