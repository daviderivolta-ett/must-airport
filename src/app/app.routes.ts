import { Routes } from '@angular/router';
import { MapFailuresComponent } from './pages/map/page/map-failures.component';
import { ManagementComponent } from './pages/management/management/management.component';

export const routes: Routes = [
    {
        path: '',
        title: 'MUST Airport - Segnalazioni',
        component: MapFailuresComponent
    },
    {
        path: 'gestione',
        title: 'MUST Airport - Gestione',
        component: ManagementComponent
    }
];