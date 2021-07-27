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

    public static fromObject(object: any) {
        return new Alert(object.id, new Date(object.creation * 1000), object.seen == null ? null : new Date(object.seen * 1000), object.action, object.subject, object.text, object.commercial)
    }

}