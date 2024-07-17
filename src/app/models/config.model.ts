import { GeoPoint } from 'firebase/firestore';
import { Tag, TagGroup } from './tag.model';
import { VERTICAL } from './vertical.model';

export class WebAppConfig {
    name: string;
    id: VERTICAL;
    position: WebAppConfigPosition;
    assets: WebAppConfigAssets;
    style: WebAppConfigStyle;
    labels: WebAppConfigLabels;
    components: WebAppConfigComponentsType[];
    tags: WebAppConfigTags;
    flows: WebAppConfigFlows;

    constructor(
        name: string,
        id: VERTICAL,
        position: WebAppConfigPosition,
        assets: WebAppConfigAssets,
        style: WebAppConfigStyle,
        labels: WebAppConfigLabels,
        components: WebAppConfigComponentsType[],
        tags: WebAppConfigTags,
        flows: WebAppConfigFlows
    ) {
        this.name = name;
        this.id = id;
        this.position = position;
        this.assets = assets;
        this.style = style;
        this.labels = labels;
        this.components = components;
        this.tags = tags;
        this.flows = flows;
    }

    static createDefault(): WebAppConfig {
        return new WebAppConfig(
            'MUST',
            VERTICAL.Default,
            {
                location: new GeoPoint(44.41361028797091, 8.844596073925151),
                zoom: 13
            },
            {
                logoUrl: './assets/images/logo.png'
            },
            {
                accentColor: 'rgb(31, 111, 235)'
            },
            {
                priority: {
                    high: {
                        displayName: 'Alta',
                        color: '#FF0000',
                        order: 3
                    },
                    medium: {
                        displayName: 'Media',
                        color: '#FFA500',
                        order: 2
                    },
                    low: {
                        displayName: 'Bassa',
                        color: '#008000',
                        order: 1
                    }
                },
                operation: {
                    inspection: 'ispezione',
                    maintenance: 'intervento'
                }
            },
            [],
            {
                parent: { elements: [], groups: [] },
                child: { elements: [], groups: [] }
            },
            {
                parent: [],
                child: []
            }
        );
    }
}

export interface WebAppConfigPosition {
    location: GeoPoint,
    zoom: number
}

export interface WebAppConfigAssets {
    logoUrl: string
}

export interface WebAppConfigStyle {
    accentColor: string;
}

export enum WebAppConfigComponentsType {
    ReportFile = "report_file",
    AdditionalLayers = "additional_layers"
}

export interface WebAppConfigLabels {
    priority: {
        high: {
            displayName: string,
            color: string,
            order: number
        },
        medium: {
            displayName: string,
            color: string,
            order: number
        },
        low: {
            displayName: string,
            color: string,
            order: number
        }
    },
    operation: {
        inspection: 'ispezione',
        maintenance: 'intervento'
    }
}

export interface WebAppConfigTags {
    parent: WebAppConfigTagType,
    child: WebAppConfigTagType
}

export interface WebAppConfigTagType {
    elements: Tag[],
    groups: TagGroup[]
}

export interface WebAppConfigTagGroup {
    groupName: string;
    groupId: string;
    order: number;
}

export interface WebAppConfigFlows {
    parent: string[],
    child: string[]
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
    options?: MobileAppConfigComponent[] | MobileAppConfigOption[],
    subLevels?: MobileAppConfigComponent[];
}