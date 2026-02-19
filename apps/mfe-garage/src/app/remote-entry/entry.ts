import { Component } from '@angular/core';
import { GarageWelcomeComponent } from './garage.component';

@Component({
  imports: [GarageWelcomeComponent],
  selector: 'app-mfe-garage-entry',
  template: `<app-garage></app-garage>`,
})
export class RemoteEntry {}
