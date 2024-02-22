import { GeoPoint, Timestamp } from 'firebase/firestore';
import { ReportParentFields } from './report-parent.fields.model';
import { TechElementSubTag } from './tech-element-subtag.model';
import { PRIORITY } from './priority.model';
import { LANGUAGE } from './language.model';
import { Operation } from './operation.model';

export class ReportParent {
    [key: string]: any;

    childFlowId: string;
    childrenIds: string[];
    closed: boolean;
    closingChildId: string;
    closingTime: Date;
    coverImgUrls: string[];
    creationTime: Date;
    descriptionSelections: string[] | TechElementSubTag[];
    descriptionText: string;
    fields: ReportParentFields;
    language: LANGUAGE;
    lastChildTime: Date;
    location: GeoPoint;
    parentFlowId: string;
    priority: PRIORITY;
    userId: string;
    verticalId: string;

    id: string;
    operations: Operation[];
    validationDate?: Date;

    constructor(
        childFlowId: string,
        childrenIds: string[],
        closed: boolean,
        closingChildId: string,
        closingTime: Timestamp,
        coverImgUrls: string[],
        creationTime: Timestamp,
        descriptionSelections: string[] | TechElementSubTag[],
        descriptionText: string,
        fields: ReportParentFields,
        language: LANGUAGE,
        lastChildTime: Timestamp,
        location: GeoPoint,
        parentFlowId: string,
        priority: PRIORITY,
        userId: string,
        verticalId: string,
        id: string,
        operations: Operation[],
        validationDate: Timestamp | undefined
    ) {
        this.childFlowId = childFlowId;
        this.childrenIds = childrenIds;
        this.closed = closed;
        this.closingChildId = closingChildId;
        this.closingTime = closingTime.toDate();
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
        this.verticalId = verticalId;
        this.id = id;
        this.operations = operations;
        this.validationDate = validationDate?.toDate();
    }

    static createEmpty(): ReportParent {
        return new ReportParent(
            '',
            [],
            false,
            '',
            Timestamp.now(),
            [],
            Timestamp.now(),
            [],
            '',
            ReportParentFields.createEmpty(),
            LANGUAGE.Italian,
            Timestamp.now(),
            new GeoPoint(44.415229489227684, 8.845336246602141),
            '',
            PRIORITY.NotAssigned,
            '',
            '',
            '',
            [],
            undefined
        )
    }
}