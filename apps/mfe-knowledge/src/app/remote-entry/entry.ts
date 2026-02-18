import { Component } from '@angular/core';
import { NxWelcome } from './knowledge.component';

@Component({
    imports: [NxWelcome],
    selector: 'app-mfe-knowledge-entry',
    template: `<app-knowledge></app-knowledge>`,
})
export class RemoteEntry {}
