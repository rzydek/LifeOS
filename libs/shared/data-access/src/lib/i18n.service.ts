import { Injectable, signal, computed } from '@angular/core';

export type Language = 'en' | 'pl';

const DICTIONARY: Record<Language, Record<string, string>> = {
    en: {
        // Common
        'app.title': 'LifeOS',
        'app.welcome': 'Welcome to your Life Operating System',
        'nav.dashboard': 'Dashboard',
        'nav.family': 'Family',
        'nav.finance': 'Finance',
        'nav.knowledge': 'Knowledge Base',
        'nav.tasks': 'Tasks',
        'nav.garage': 'Garage',
        'nav.personas': 'Personas',
        'nav.settings': 'Settings',

        // Header
        'header.account': 'My Account',
        'header.profile': 'Profile',
        'header.logout': 'Log out',
        'header.toggle_nav': 'Toggle navigation menu',
        'header.language': 'Change language',
        'header.theme': 'Toggle theme',

        // Family
        'family.title': 'Family Microfrontend',
        'family.welcome': 'Welcome to the Family microfrontend!',
        'knowledge.works': 'Knowledge works',

        // Actions
        'actions.save': 'Save',
        'actions.cancel': 'Cancel',
        'actions.delete': 'Delete',
        'actions.edit': 'Edit',
        'actions.add': 'Add',
        'actions.pause': 'Pause',
        'actions.resume': 'Resume',
        'actions.refresh': 'Refresh',
        'actions.close': 'Close',

        // Search / Parts Sniper (Garage)
        'search.title': 'Watchlist',
        'search.subtitle': 'Manage automated search queries',
        'search.noActive': 'No active searches',
        'search.every': 'Every',
        'search.hours': 'h',
        'results.title': 'Results',
        'results.subtitle': 'Found offers',
        'results.noResults': 'No results found matching your criteria.',
        'results.score': 'AI Score',
        'results.reasoning': 'Reasoning',
        'results.analysis': 'AI Analysis',
        'results.description': 'Offer description',
        'results.details': 'Details',
        'results.detected': 'Detected',
        'results.lastSeen': 'Last Seen',
        'results.offerId': 'Offer ID',
        'results.price': 'Price',
        'form.query': 'Search Query',
        'form.add': 'Add Search',
        // Parts Sniper
        'sniper.title': 'Parts Sniper',
        'sniper.results': 'Sniper Results',
        'sniper.description':
            'Automated OLX market monitoring and deal analysis.',
        'sniper.searchConfigs': 'Search Configs',
        'sniper.allConfigs': 'All Configs',
        'sniper.threshold': 'Great Deals Threshold',
        'sniper.minScore': 'Minimum AI Score',
        'sniper.scoreHelp':
            'Only show results with an AI confidence score above this value.',
        'config.comingSoon': 'Configuration for {{source}} is coming soon.',
        'config.manageLocations': 'Manage Locations...',
        'config.monitorQuery': 'Monitor Query',
        'config.aiSettings': 'AI Settings',
        'config.selectPersona': 'Select Persona (Default: General)',
        'config.defaultPersona': 'Default (General)',
        'config.intentPlaceholder': "Specific requirements/intent (e.g. 'Looking for a restoration project')",

        // Auth
        'auth.loginTitle': 'Login to your account',
        'auth.loginDesc': 'Enter your email below to login to your account',
        'auth.login': 'Login',
        'auth.forgotPassword': 'Forgot password?',
        'form.email': 'Email',
        'form.password': 'Password',
        'validation.emailRequired': 'Email is required.',
        'validation.emailInvalid': 'Enter a valid email address.',
        'validation.passwordRequired': 'Password is required.',
        'validation.passwordLength':
            'Password must be at least 8 characters long.',
        'dialog.addCategory': 'Add New Category',
        'dialog.addLocation': 'Add New Location',
        'dialog.categoryDesc': 'Enter the category details.',
        'dialog.locationDesc': 'Enter the location details.',
        'form.id': 'ID',
        'form.name': 'Name',
        'form.type': 'Type',
        'form.region': 'Region',
        'form.city': 'City',
        'form.none': 'None / Unknown',

        // Personas
        'personas.title': 'AI Personas',
        'personas.subtitle': 'Manage expert profiles for offer analysis',
        'personas.create': 'Create Persona',
        'personas.edit': 'Edit Persona',
        'personas.default': 'Default',
        'personas.noPersonas': 'No personas found.',
        'personas.form.name': 'Name',
        'personas.form.description': 'Description',
        'personas.form.instruction': 'System Instruction',
        'personas.form.isDefault': 'Set as Default',
        'personas.form.instructionHelp': 'Detailed instructions for the AI regarding personality, focus areas, and evaluation criteria.',
        'personas.form.placeholderName': 'e.g. Vintage Audio Expert',
        'personas.form.placeholderDesc': 'Brief description of expertise',
        'personas.form.placeholderInstr': 'You are an expert in...',

        // Languages
        'lang.en': 'English',
        'lang.pl': 'Polski',
    },
    pl: {
        // Common
        'app.title': 'LifeOS',
        'app.welcome': 'Witaj w swoim Systemie Operacyjnym Życia',
        'nav.dashboard': 'Pulpit',
        'nav.family': 'Rodzina',
        'nav.finance': 'Finanse',
        'nav.knowledge': 'Baza Wiedzy',
        'nav.tasks': 'Zadania',
        'nav.garage': 'Garaż',
        'nav.personas': 'Persony',
        'nav.settings': 'Ustawienia',

        // Header
        'header.account': 'Moje Konto',
        'header.profile': 'Profil',
        'header.logout': 'Wyloguj',
        'header.toggle_nav': 'Przełącz menu nawigacji',
        'header.language': 'Zmień język',
        'header.theme': 'Przełącz motyw',

        // Family
        'family.title': 'Mikrofrontend Rodziny',
        'family.welcome': 'Witaj w mikrofrontendzie rodziny!',
        'knowledge.works': 'Baza Wiedzy działa',

        // Actions
        'actions.save': 'Zapisz',
        'actions.cancel': 'Anuluj',
        'actions.delete': 'Usuń',
        'actions.edit': 'Edytuj',
        'actions.add': 'Dodaj',
        'actions.pause': 'Wstrzymaj',
        'actions.resume': 'Wznów',
        'actions.refresh': 'Odśwież',
        'actions.close': 'Zamknij',

        // Search / Parts Sniper (Garage)
        'search.title': 'Obserwowane',
        'search.subtitle': 'Zarządzaj automatycznym wyszukiwaniem',
        'search.noActive': 'Brak aktywnych wyszukiwań',
        'search.every': 'Co',
        'search.hours': 'godz.',
        'results.title': 'Wyniki',
        'results.subtitle': 'Znalezione oferty',
        'results.noResults': 'Brak wyników dla podanych kryteriów.',
        'results.score': 'Ocena AI',
        'results.reasoning': 'Uzasadnienie',
        'results.analysis': 'Analiza AI',
        'results.description': 'Opis oferty',
        'results.details': 'Szczegóły',
        'results.detected': 'Wykryto',
        'results.lastSeen': 'Ostatnio widziane',
        'results.offerId': 'ID Oferty',
        'results.price': 'Cena',
        'form.query': 'Zapytanie',
        'form.add': 'Dodaj wyszukiwanie',

        'sniper.title': 'Wyszukiwarka Części',
        'sniper.results': 'Wyniki wyszukiwarki',
        'sniper.description':
            'Automatyczne monitorowanie rynku OLX i analiza okazji.',
        'sniper.searchConfigs': 'Konfiguracje wyszukiwania',
        'sniper.allConfigs': 'Wszystkie',
        'sniper.threshold': 'Próg okazji',
        'sniper.minScore': 'Minimalna ocena AI',
        'sniper.scoreHelp':
            'Pokaż tylko wyniki z oceną pewności AI powyżej tej wartości.',
        'config.comingSoon': 'Konfiguracja dla {{source}} wkrótce.',
        'config.manageLocations': 'Zarządzaj Lokalizacjami...',
        'config.monitorQuery': 'Monitoruj Zapytanie',
        'config.aiSettings': 'Ustawienia AI',
        'config.selectPersona': 'Wybierz Personę (Domyślna: Ogólna)',
        'config.defaultPersona': 'Domyślna (Ogólna)',
        'config.intentPlaceholder': "Konkretne wymagania/cel (np. 'Szukam projektu do renowacji')",

        // Auth
        'auth.loginTitle': 'Zaloguj się na konto',
        'auth.loginDesc': 'Wprowadź email, aby się zalogować',
        'auth.login': 'Zaloguj',
        'auth.forgotPassword': 'Zapomniałeś hasła?',
        'form.email': 'Email',
        'form.password': 'Hasło',
        'validation.emailRequired': 'Email jest wymagany.',
        'validation.emailInvalid': 'Wprowadź poprawny email.',
        'validation.passwordRequired': 'Hasło jest wymagane.',
        'validation.passwordLength': 'Hasło musi mieć min. 8 znaków.',
        'dialog.addCategory': 'Dodaj nową kategorię',
        'dialog.addLocation': 'Dodaj nową lokalizację',
        'dialog.categoryDesc': 'Wprowadź szczegóły kategorii.',
        'dialog.locationDesc': 'Wprowadź szczegóły lokalizacji.',
        'form.id': 'ID',
        'form.name': 'Nazwa',
        'form.type': 'Typ',
        'form.region': 'Region',
        'form.city': 'Miasto',
        'form.none': 'Brak / Nieznany',

        // Personas
        'personas.title': 'Persony AI',
        'personas.subtitle': 'Zarządzaj profilami ekspertów do analizy ofert',
        'personas.create': 'Utwórz Personę',
        'personas.edit': 'Edytuj Personę',
        'personas.default': 'Domyślna',
        'personas.noPersonas': 'Nie znaleziono person.',
        'personas.form.name': 'Nazwa',
        'personas.form.description': 'Opis',
        'personas.form.instruction': 'Instrukcja Systemowa',
        'personas.form.isDefault': 'Ustaw jako domyślną',
        'personas.form.instructionHelp': 'Szczegółowe instrukcje dla AI dotyczące osobowości, obszarów zainteresowań i kryteriów oceny.',
        'personas.form.placeholderName': 'np. Ekspert Audio Vintage',
        'personas.form.placeholderDesc': 'Krótki opis ekspertyzy',
        'personas.form.placeholderInstr': 'Jesteś ekspertem w...',

        // Languages
        'lang.en': 'Angielski',
        'lang.pl': 'Polski',
    },
};

@Injectable({
    providedIn: 'root',
})
export class I18nService {
    currentLang = signal<Language>('en');

    dictionary = computed(() => DICTIONARY[this.currentLang()]);

    setLanguage(lang: Language) {
        this.currentLang.set(lang);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('lifeos-lang', lang);
        }
    }

    constructor() {
        if (typeof localStorage !== 'undefined') {
            const savedLang = localStorage.getItem('lifeos-lang') as Language;
            if (savedLang && (savedLang === 'en' || savedLang === 'pl')) {
                this.currentLang.set(savedLang);
            }
        }
    }

    translate(key: string, params?: Record<string, string | number>): string {
        let translation = this.dictionary()[key] || key;
        if (params) {
            Object.keys(params).forEach((param) => {
                translation = translation.replace(
                    `{{${param}}}`,
                    String(params[param]),
                );
            });
        }
        return translation;
    }
}
