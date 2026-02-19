import {
    Component,
    effect,
    inject,
    input,
    signal,
    viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrapedOffer } from '../../data-access/parts-sniper.model';
import { HlmSheet, HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideExternalLink } from '@ng-icons/lucide';
import { TranslatePipe } from '@lifeos-nexus/ui';
import { I18nService } from '@lifeos-nexus/data-access';

@Component({
    selector: 'lifeos-offer-details-sheet',
    standalone: true,
    imports: [
        CommonModule,
        HlmSheetImports,
        HlmButtonImports,
        HlmIconImports,
        TranslatePipe,
    ],
    providers: [provideIcons({ lucideExternalLink })],
    templateUrl: './offer-details-sheet.component.html',
})
export class OfferDetailsSheetComponent {
    offer = input<ScrapedOffer | null>(null);
    sheet = viewChild.required<HlmSheet>('sheetRef');
    aiReasoning = signal<string>('');

    private i18n = inject(I18nService);

    constructor() {
        effect(() => {
            console.log('current lang:', this.i18n.currentLang());
            this.aiReasoning.set(
                this.getReasoning(this.offer() || ({} as ScrapedOffer)),
            );
        });
    }

    public open() {
        this.sheet().open();
    }

    getReasoning(offer: ScrapedOffer): string {
        if (!offer.aiReasoning) return '';
        if (typeof offer.aiReasoning === 'string') return offer.aiReasoning;
        return (
            offer.aiReasoning[this.i18n.currentLang()] ||
            offer.aiReasoning['en'] ||
            ''
        );
    }

    getScoreClass(score: number): string {
        if (score >= 80)
            return 'bg-[oklch(0.43_0.09_167)] text-white border-transparent';
        if (score >= 50)
            return 'bg-secondary text-secondary-foreground border-secondary';
        return 'bg-destructive/10 text-destructive border-destructive/20';
    }
}
