import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@lifeos-nexus/ui';

@Component({
    selector: 'app-nx-welcome',
    imports: [CommonModule, TranslatePipe],
    template: `{{ 'app.welcome' | translate }}`,
    styles: [],
    encapsulation: ViewEncapsulation.None,
})
export class NxWelcome {}
