import { Route } from '@angular/router';
import { RemoteEntry } from './entry';
import { PartsSniperComponent } from '../parts-sniper/parts-sniper.component';

export const remoteRoutes: Route[] = [
    { path: '', component: RemoteEntry },
    { path: 'sniper', component: PartsSniperComponent },
];
