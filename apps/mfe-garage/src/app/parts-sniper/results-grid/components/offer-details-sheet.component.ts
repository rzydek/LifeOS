import { Component, input, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrapedOffer } from '../../data-access/parts-sniper.model';
import { HlmSheet, HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideExternalLink } from '@ng-icons/lucide';

@Component({
  selector: 'lifeos-offer-details-sheet',
  standalone: true,
  imports: [CommonModule, HlmSheetImports, HlmButtonImports, HlmIconImports],
  providers: [provideIcons({ lucideExternalLink })],
  templateUrl: './offer-details-sheet.component.html',
})
export class OfferDetailsSheetComponent {
  offer = input<ScrapedOffer | null>(null);
  
  sheet = viewChild.required<HlmSheet>('sheetRef');

  public open() {
    this.sheet().open();
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'bg-[oklch(0.43_0.09_167)] text-white border-transparent';
    if (score >= 50) return 'bg-secondary text-secondary-foreground border-secondary';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  }
}
