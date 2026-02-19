import { Component, input, inject, signal, effect, untracked, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartsSniperService } from '../data-access/parts-sniper.service';
import { ScrapedOffer } from '../data-access/parts-sniper.model';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSheet, HlmSheetImports } from '@spartan-ng/helm/sheet';
import { BrnSheetImports } from '@spartan-ng/brain/sheet';

@Component({
  selector: 'lifeos-results-grid',
  standalone: true,
  imports: [CommonModule, HlmTableImports, HlmButtonImports, HlmSheetImports, BrnSheetImports],
  templateUrl: './results-grid.component.html'
})
export class ResultsGridComponent {
  private service = inject(PartsSniperService);
  private sheetRef = viewChild<HlmSheet>('sheetRef');

  configId = input<string | undefined>();
  minScore = input<number>(0);

  offers = signal<ScrapedOffer[]>([]);
  selectedOffer = signal<ScrapedOffer | null>(null);


  constructor() {
    effect(() => {
      const id = this.configId();
      const score = this.minScore();
      untracked(() => this.refresh(id, score));
    });
  }

  openSheet(offer: ScrapedOffer) {
    this.selectedOffer.set(offer);
    this.sheetRef()?.open?.();
  }

  refresh(configId = this.configId(), minScore = this.minScore()) {
    this.service.getOffers(configId, minScore).subscribe((data) => {
      this.offers.set(data);
    });
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'bg-[oklch(0.43_0.09_167)] text-white border-transparent';
    if (score >= 50) return 'bg-secondary text-secondary-foreground border-secondary';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }
}
