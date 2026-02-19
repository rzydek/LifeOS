import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../data-access/parts-sniper.model';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { BrnDialogContent, BrnDialogImports } from '@spartan-ng/brain/dialog';
import { TranslatePipe } from '@lifeos-nexus/ui';

@Component({
  selector: 'lifeos-add-category-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, HlmInputImports, HlmButtonImports, HlmLabelImports, HlmDialogImports, BrnDialogContent, BrnDialogImports, TranslatePipe],
  templateUrl: './add-category-dialog.component.html'
})
export class AddCategoryDialogComponent {
  categoryAdded = output<Partial<Category>>();
  
  state = signal<'open' | 'closed'>('closed');
  newCategory = signal<Partial<Category>>({ id: '', name: '' });

  open() {
    this.state.set('open');
  }

  closeDialog() {
    this.state.set('closed');
    this.newCategory.set({ id: '', name: '' });
  }

  save() {
    const cat = this.newCategory();
    if (!cat.id || !cat.name) return;
    this.categoryAdded.emit(cat);
    this.closeDialog();
  }

  setNewCategoryId(id: string) {
    this.newCategory.update(c => ({...c, id}));
  }

  setNewCategoryName(name: string) {
    this.newCategory.update(c => ({...c, name}));
  }
}
