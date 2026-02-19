import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@lifeos-nexus/ui';

@Component({
    selector: 'app-knowledge',
    imports: [CommonModule, TranslatePipe],
    template: `{{ 'knowledge.works' | translate }}`,
})
export class NxWelcome {}
