export enum VERTICAL {
    Default = 'generic',
    Airport = 'genovaAirport',
    DSH2030 = 'dsh2030',
    Demo = 'demo'
}

export const verticalLabels: Map<VERTICAL, string> = new Map([
    [VERTICAL.Default, 'Pubblica'],
    [VERTICAL.Airport, 'Aeroporto di Genova'],
    [VERTICAL.DSH2030, 'DSH 2030'],
    [VERTICAL.Demo, 'Demo']
]);