class Alert {

    private id: string;
    private creation: Date;
    private seen: Date | null;
    private action: string | null;
    private subject: string;
    private text: string;
    private commercial: boolean;

    public constructor(id: string, creation: Date, seen: Date | null, action: string | null, subject: string, text: string, commercial: boolean) {
        this.id = id;
        this.creation = creation;
        this.seen = seen;
        this.action = action;
        this.subject = subject;
        this.text = text;
        this.commercial = commercial
    }

    /**
     * @deprecated
     */
    public getId(): string {
        return this.id;
    }

    /**
     * @deprecated
     */
    public getCreation(): Date {
        return this.creation;
    }

    /**
     * @deprecated
     */
    public getSeen(): Date | null {
        return this.seen;
    }

    /**
     * @deprecated
     */
    public getAction(): string {
        return this.action;
    }

    /**
     * @deprecated
     */
    public getSubject(): string {
        return this.subject;
    }

    /**
     * @deprecated
     */
    public getText(): string {
        return this.text;
    }

    /**
     * @deprecated
     */
    public isCommercial(): boolean {
        return this.commercial;
    }

    /**
     * @deprecated
     */
    public static fromObject(object: any) {
        return new Alert(object.id, new Date(object.creation * 1000), object.seen == null ? null : new Date(object.seen * 1000), object.action, object.subject, object.text, object.commercial)
    }

}