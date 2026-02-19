// apps/shell/src/app/pages/personas/personas.component.ts
import { Component, inject, signal, viewChild, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonasService, Persona } from './personas.service';
import { HlmSheet, HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucidePlus, lucidePencil, lucideTrash } from '@ng-icons/lucide';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { TranslatePipe } from '@lifeos-nexus/ui';

@Component({
  selector: 'lifeos-personas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    HlmSheetImports, 
    HlmButtonImports, 
    HlmIconImports,
    HlmInputImports,
    HlmLabelImports,
    TranslatePipe
  ],
  providers: [provideIcons({ lucidePlus, lucidePencil, lucideTrash })],
  templateUrl: './personas.component.html'
})
export class PersonasComponent {
  private service = inject(PersonasService);
  
  personas = signal<Persona[]>([]);
  sheet = viewChild.required<HlmSheet>('sheetRef');
  
  isEditing = signal(false);
  
  currentPersona: Partial<Persona> = {
    name: '',
    description: '',
    instruction: '',
    isDefault: false
  };

  currentId: string | null = null;
  
  ngOnInit() {
    this.refresh();
  }
  
  refresh() {
    this.service.getPersonas().subscribe(data => this.personas.set(data));
  }
  
  openCreateDialog() {
    this.isEditing.set(false);
    this.currentId = null;
    this.currentPersona = {
        name: '',
        description: '',
        instruction: '',
        isDefault: false
    };
    this.sheet().open();
  }
  

  editPersona(persona: Persona) {
    this.isEditing.set(true);
    this.currentId = persona.id;
    this.currentPersona = { ...persona };
    this.sheet().open();
  }

  deletePersona(persona: Persona) {
    if (confirm(`Are you sure you want to delete ${persona.name}?`)) {
      this.service.deletePersona(persona.id).subscribe(() => this.refresh());
    }
  }

  savePersona() {
    if (this.isEditing() && this.currentId) {
      this.service.updatePersona(this.currentId, this.currentPersona).subscribe(() => {
        this.sheet().close();
        this.refresh();
      });
    } else {
      this.service.createPersona(this.currentPersona).subscribe(() => {
        this.sheet().close();
        this.refresh();
      });
    }
  }

  isValid() {
    return this.currentPersona.name && this.currentPersona.instruction;
  }
}
