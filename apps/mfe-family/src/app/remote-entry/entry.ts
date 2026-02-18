import { Component } from '@angular/core';
import { FamilyComponent } from './family.component';

@Component({
    imports: [FamilyComponent],
    selector: 'app-mfe-family-entry',
    template: `<app-family></app-family>`,
})
export class RemoteEntry {}
