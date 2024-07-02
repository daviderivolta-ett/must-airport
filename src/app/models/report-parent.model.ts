import { GeoPoint, Timestamp } from 'firebase/firestore';
import { TechElementSubTag } from './tech-element-subtag.model';
import { PRIORITY } from './priority.model';
import { LANGUAGE } from './language.model';
import { ReportTagGroup } from './tag.model';

export class ReportParent {
    [key: string]: any;

    childFlowIds: string[];
    childrenIds: string[];
    isClosed: boolean;
    closingChildId: string | null;
    closingTime: Date | null;
    coverImgUrls: string[];
    creationTime: Date;
    descriptionSelections: string[] | TechElementSubTag[];
    descriptionText: string;
    fields: any;
    language: LANGUAGE;
    lastChildTime: Date;
    location: GeoPoint;
    parentFlowId: string;
    priority: PRIORITY;
    userId: string;
    isValidated: boolean;
    verticalId: string;

    id: string;
    operations: string[];
    validationDate?: Date;
    isArchived?: boolean;
    archivingTime?: Date | null;
    tags?: { parent: ReportTagGroup[], child: ReportTagGroup[] };
    files?: string[];

    constructor(
        childFlowIds: string[],
        childrenIds: string[],
        isClosed: boolean,
        closingChildId: string,
        closingTime: Timestamp | null,
        coverImgUrls: string[],
        creationTime: Timestamp,
        descriptionSelections: string[] | TechElementSubTag[],
        descriptionText: string,
        fields: any,
        language: LANGUAGE,
        lastChildTime: Timestamp,
        location: GeoPoint,
        parentFlowId: string,
        priority: PRIORITY,
        userId: string,
        isValidated: boolean,
        verticalId: string,
        id: string,
        operations: string[],
        validationDate: Timestamp | undefined,
        isArchived?: boolean,
        archivingTime?: Timestamp | null,
        files?: string[]
    ) {
        this.childFlowIds = childFlowIds;
        this.childrenIds = childrenIds;
        this.isClosed = isClosed;
        this.closingChildId = closingChildId;
        closingTime ? this.closingTime = closingTime.toDate() : this.closingTime = null;
        this.coverImgUrls = coverImgUrls;
        this.creationTime = creationTime.toDate();
        this.descriptionSelections = descriptionSelections;
        this.descriptionText = descriptionText;
        this.fields = fields;
        this.language = language;
        this.lastChildTime = lastChildTime.toDate();
        this.location = location;
        this.parentFlowId = parentFlowId;
        this.priority = priority;
        this.userId = userId;
        this.isValidated = isValidated;
        this.verticalId = verticalId;
        this.id = id;
        this.operations = operations;
        if (validationDate) this.validationDate = validationDate.toDate();
        if (isArchived) this.isArchived = isArchived;
        if (archivingTime) this.archivingTime = archivingTime.toDate();
        if (files) this.files = files;
    }

    static createEmpty(): ReportParent {
        return new ReportParent(
            [],
            [],
            false,
            '',
            null,
            [],
            Timestamp.now(),
            [],
            '',
            {},
            LANGUAGE.Italian,
            Timestamp.now(),
            new GeoPoint(44.415229489227684, 8.845336246602141),
            '',
            PRIORITY.NotAssigned,
            '',
            false,
            '',
            '',
            [],
            undefined
        )
    }
}