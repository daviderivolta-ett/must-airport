export interface SettingsAssets {
    logoUrl: string;
}

export interface SettingsStyles {
    accent: string;
}

export class AppSettings {
    name: string;
    assets: SettingsAssets;
    styles: SettingsStyles;

    constructor(
        name: string,
        assets: SettingsAssets,
        styles: SettingsStyles
    ) {
        this.name = name;
        this.assets = assets;
        this.styles = styles;
    }

    static createEmpty(): AppSettings {
        return new AppSettings(
            '',
            {
                logoUrl: ''
            },
            {
                accent: ''
            }
        )
    }
}