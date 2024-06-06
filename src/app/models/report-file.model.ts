import { DocumentData, Timestamp, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";

export class ReportFile {
    fileName: string;
    url: string;
    name: string;
    date: Date;
    parentId: string;
    vertId: string;

    constructor(fileName: string, url: string, name: string, date: Timestamp, parentId: string, vertId: string) {
        this.fileName = fileName;
        this.url = url;
        this.name = name;
        this.date = date.toDate();
        this.parentId = parentId;
        this.vertId = vertId;
    }
}

export const reportFileConverter = {
    toFirestore(file: ReportFile): DocumentData {
        return {
            fileName: file.fileName,
            url: file.url,
            name: file.name,
            date: Timestamp.fromDate(file.date),
            parentId: file.parentId,
            vertId: file.vertId
        }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot , options: SnapshotOptions): ReportFile {
        const data: DocumentData = snapshot.data(options)!;
        return new ReportFile(data['fileName'], data['url'], data['name'], data['date'], data['parentId'], data['vertId']);
    }
}