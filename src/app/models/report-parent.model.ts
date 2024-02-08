import { GeoPoint, Timestamp } from 'firebase/firestore';
import { ReportParentFields } from './report-parent.fields.model';
import { TechElementSubTag } from './tech-element-subtag.model';

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
    language: string;
    lastChildTime: Date;
    location: GeoPoint;
    parentFlowId: string;
    userId: string;
    verticalId: string
    id: string;

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
        language: string,
        lastChildTime: Timestamp,
        location: GeoPoint,
        parentFlowId: string,
        userId: string,
        verticalId: string,
        id: string
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
        this.userId = userId;
        this.verticalId = verticalId;
        this.id = id;
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
            '',
            Timestamp.now(),
            new GeoPoint(44.415229489227684, 8.845336246602141),
            '',
            '',
            '',
            ''
        )
    }
}