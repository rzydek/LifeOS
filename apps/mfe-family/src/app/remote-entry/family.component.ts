import { Component } from '@angular/core';
import { TranslatePipe } from '@lifeos-nexus/ui';

@Component({
    selector: 'app-family',
    template: `
        <h1 class="m-3">{{ 'family.title' | translate }}</h1>
        <p>{{ 'family.welcome' | translate }}</p>
    `,
    imports: [TranslatePipe],
})
export class FamilyComponent {}
