import { Tag } from './tag.model';

export class WebAppConfig {
    tags: WebAppConfigTags;
    name: string;
    style: WebAppConfigStyle;
    logoUrl: string;
    labels: WebAppConfigLabels;

    constructor(tags: WebAppConfigTags, name: string, style: WebAppConfigStyle, logoUrl: string, labels: WebAppConfigLabels) {
        this.tags = tags;
        this.name = name;
        this.style = style;
        this.logoUrl = logoUrl;
        this.labels = labels;
    }

    static createEmpty(): WebAppConfig {
        return new WebAppConfig(
            {
                parent: {
                    label: 'Elemento tecnico',
                    tags: []
                },
                child: {
                    label: 'Guasto',
                    tags: []
                }
            },
            'MUST',
            {
                accentColor: 'rgb(31, 111, 235)'
            },
            './assets/images/logo.png',
            {
                priority: {
                    high: 'alta',
                    medium: 'media',
                    low: 'bassa'
                },
                operation: {
                    inspection: 'ispezione',
                    maintenance: 'intervento'
                }
            }
        );
    }
}

export interface WebAppConfigTags {
    parent: WebAppConfigTag;
    child: WebAppConfigTag;
}

export interface WebAppConfigTag {
    label: string;
    tags: Tag[];
}

export interface WebAppConfigStyle {
    accentColor: string;
}

export interface WebAppConfigLabels {
    priority: {
        high: string,
        medium: string,
        low: string
    },
    operation: {
        inspection: 'ispezione',
        maintenance: 'intervento'
    }
}

export type MobileAppConfigParentFlow = {
    [key: string]: string;
}

export type MobileAppConfigChildFlow = {
    actionName?: string;
    flowUrl?: string
    isClosing: boolean;
    isRequired: boolean;
    flowJson: string;
}

export enum MobileAppMobileAppConfigComponentType {
    Camera = 'camera',
    Branch = 'branch',
    Selection = 'selection',
    Form = 'form'
}

export type MobileAppConfigOption = {
    id: string;
    name: string;
    description?: string;
    options?: MobileAppConfigOption[];
    child?: MobileAppConfigComponent;
}

export type MobileAppConfigComponent = {
    id: string;
    component: MobileAppMobileAppConfigComponentType;
    title?: string;
    description?: string;
    editor?: string;
    editorDescription?: string;
    mandatory?: boolean;
    multiple?: boolean;
    child?: MobileAppConfigComponent;
    options?: MobileAppConfigComponent[]
}