export class TechElementSubCategory {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    static createEmpty(): TechElementSubCategory {
        return new TechElementSubCategory('', '');
    }
}