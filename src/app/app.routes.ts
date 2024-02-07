import { Routes } from '@angular/router';
import { MapPageComponent } from './pages/map/page/map-page.component';
import { ManagementComponent } from './pages/management/management/management.component';

export const routes: Routes = [
    {
        path: '',
        title: 'MUST Airport - Segnalazioni',
        component: MapPageComponent
    },
    {
        path: 'gestione',
        title: 'MUST Airport - Gestione',
        component: ManagementComponent
    }
];