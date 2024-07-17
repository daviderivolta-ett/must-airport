export enum PRIORITY {
    NotAssigned = '',
    Low = 'low',
    Medium = 'medium',
    High = 'high',
}

export interface StatusDetail {
    displayName: string,
    color: string,
    order: number
}

export class Priority {
    static parsePriorities(string: string | undefined): PRIORITY {
        let priority: PRIORITY;
        if (!string) return PRIORITY.NotAssigned;
        switch (string) {
            case 'low':
                priority = PRIORITY.Low;
                break;

            case 'medium':
                priority = PRIORITY.Medium;
                break;

            case 'high':
                priority = PRIORITY.High
                break;

            default:
                priority = PRIORITY.NotAssigned
                break;
        }
        return priority;
    }
}