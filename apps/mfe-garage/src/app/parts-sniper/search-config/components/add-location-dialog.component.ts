import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '../../data-access/parts-sniper.model';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnDialogContent, BrnDialogImports } from '@spartan-ng/brain/dialog';
import { TranslatePipe } from '@lifeos-nexus/ui';

@Component({
  selector: 'lifeos-add-location-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmInputImports, HlmButtonImports, HlmLabelImports, HlmDialogImports, BrnDialogContent, BrnDialogImports, TranslatePipe],
  templateUrl: './add-location-dialog.component.html'
})
export class AddLocationDialogComponent {
  regions = input.required<Location[]>();
  locationAdded = output<Partial<Location>>();
  
  state = signal<'open' | 'closed'>('closed');
  newLocation = signal<Partial<Location>>({ id: '', name: '', type: 'city', parentId: '' });

  open() {
    this.state.set('open');
  }

  closeDialog() {
    this.state.set('closed');
    this.newLocation.set({ id: '', name: '', type: 'city', parentId: '' });
  }

  save() {
    const loc = this.newLocation();
    if (!loc.id || !loc.name) return;
    this.locationAdded.emit(loc);
    this.closeDialog();
  }

  setNewLocationId(id: string) {
    this.newLocation.update(l => ({...l, id}));
  }

  setNewLocationName(name: string) {
    this.newLocation.update(l => ({...l, name}));
  }
  
  setNewLocationType(type: string) { // type coming from select event is string
    this.newLocation.update(l => ({...l, type: type as 'city' | 'region'}));
  }

  setNewLocationParent(parentId: string) {
    this.newLocation.update(l => ({...l, parentId}));
  }
}
