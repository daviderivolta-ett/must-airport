import { Tag, TagGroup } from './tag.model';
import { VERTICAL } from './vertical.model';

export class WebAppConfig {
    name: string;
    id: VERTICAL;
    assets: WebAppConfigAssets;
    style: WebAppConfigStyle;
    labels: WebAppConfigLabels;
    components: WebAppConfigComponentsType[];
    tags: WebAppConfigTags;

    constructor(
        name: string,
        id: VERTICAL,
        assets: WebAppConfigAssets,
        style: WebAppConfigStyle,
        labels: WebAppConfigLabels,
        components: WebAppConfigComponentsType[],
        tags: WebAppConfigTags
    ) {
        this.name = name;
        this.id = id;
        this.assets = assets;
        this.style = style;
        this.labels = labels;
        this.components = components;
        this.tags = tags;
    }

    static createDefault(): WebAppConfig {
        return new WebAppConfig(
            'MUST',
            VERTICAL.Default,
            {
                logoUrl: '/assets/images/logo.png'
            },
            {
                accentColor: 'rgb(31, 111, 235)'
            },
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
            },
            [],
            {
                parent: { elements: [], groups: [] },
                child: { elements: [], groups: [] }
            }
        );
    }
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
        high: string,
        medium: string,
        low: string
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

// export class WebAppAppSettings {
//     app: {
//         id: string,
//         name: string
//     };
//     assets: {
//         logoUrl: string
//     };
//     styles: {
//         accent: string
//     };
//     components: string[];
//     labels: {
//         operations: {
//             inspection: string,
//             maintenance: string
//         },
//         priority: {
//             high: string,
//             medium: string,
//             low: string
//         }
//     }

//     constructor() 
// }

// export interface WebAppSettingsAssets {
//     logoUrl: string;
// }

// export interface WebAppSettingsStyles {
//     accent: string;
// }

// export class WebAppAppSettings {
//     id: string;
//     name: string;
//     assets: WebAppSettingsAssets;
//     styles: WebAppSettingsStyles;
//     components: WebAppConfigComponentsType[];

//     constructor(
//         id: string,
//         name: string,
//         assets: WebAppSettingsAssets,
//         styles: WebAppSettingsStyles,
//         components: WebAppConfigComponentsType[]
//     ) {
//         this.id = id;
//         this.name = name;
//         this.assets = assets;
//         this.styles = styles;
//         this.components = components;
//     }

//     static createEmpty(): WebAppAppSettings {
//         return new WebAppAppSettings(
//             '',
//             '',
//             {
//                 logoUrl: ''
//             },
//             {
//                 accent: ''
//             },
//             []
//         )
//     }
// }

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