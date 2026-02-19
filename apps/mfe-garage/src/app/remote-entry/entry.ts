import { Component } from '@angular/core';
import { GarageWelcomeComponent } from './garage.component';

@Component({
  imports: [GarageWelcomeComponent],
  selector: 'lifeos-mfe-garage-entry',
  template: `<lifeos-garage></lifeos-garage>`,
})
export class RemoteEntry {}
