import { Routes } from '@angular/router';
import { MapPageComponent } from './pages/map/page/map-page.component';
import { ManagementComponent } from './pages/management/page/management.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/segnalazioni',
        pathMatch: 'full'
    },
    {
        path: 'segnalazioni',
        title: 'MUST Airport - Segnalazioni',
        component: MapPageComponent
    },
    {
        path: 'gestione',
        redirectTo: '/segnalazioni',
        pathMatch: 'full'
    },
    {
        path: 'gestione/:id',
        title: 'MUST Airport - Gestione',
        component: ManagementComponent
    }
];