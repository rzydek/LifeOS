import { Component } from '@angular/core';
import { NxWelcome } from './garage.component';

@Component({
    imports: [NxWelcome],
    selector: 'app-mfe-garage-entry',
    template: `<app-garage></app-garage>`,
})
export class RemoteEntry {}
