import { TechElementSubCategory } from "./tech-element-subcategory.model";

export class TechElementCategory {
    id: string;
    name: string;
    subCategories: TechElementSubCategory[]

    constructor(
        id: string,
        name: string,
        subCategories: TechElementSubCategory[]
    ) {
        this.id = id;
        this.name = name;
        this.subCategories = subCategories;
    }

    static createEmpty(): TechElementCategory {
        return new TechElementCategory(
            '',
            '',
            []
        )
    }
}