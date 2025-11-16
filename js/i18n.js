// Internationalization module
let currentLanguage = 'en';
let translations = {};

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'fr', 'zh'];
const DEFAULT_LANGUAGE = 'en';

// Detect browser language
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.toLowerCase().split('-')[0];
    
    // Return the language if it's supported, otherwise default to English
    return SUPPORTED_LANGUAGES.includes(langCode) ? langCode : DEFAULT_LANGUAGE;
}

// Load translations from JSON file
async function loadTranslations() {
    try {
        const response = await fetch('translations/translation-strings.json');
        translations = await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        translations = { en: {}, fr: {}, zh: {} };
    }
}

// Get translation for a key
function translate(key) {
    return translations[currentLanguage]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
}

// Update all elements with data-i18n attribute
function updatePageTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translate(key);
        
        // Update text content or placeholder based on element type
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // Update document title if it has data-i18n
    const titleElement = document.querySelector('title[data-i18n]');
    if (titleElement) {
        const key = titleElement.getAttribute('data-i18n');
        document.title = translate(key);
    }
}

// Set language and update page
async function setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
        lang = DEFAULT_LANGUAGE;
    }
    
    currentLanguage = lang;
    
    // Store language preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Update page translations
    updatePageTranslations();
    
    // Update language toggle buttons
    updateLanguageToggle();
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Trigger custom event for language change (used by cv.js to reload milestones)
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Update language toggle button states
function updateLanguageToggle() {
    const toggleButtons = document.querySelectorAll('.lang-btn');
    toggleButtons.forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === currentLanguage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Create language toggle UI
function createLanguageToggle() {
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'language-toggle';
    
    SUPPORTED_LANGUAGES.forEach(lang => {
        const button = document.createElement('button');
        button.className = 'lang-btn';
        button.setAttribute('data-lang', lang);
        button.textContent = lang.toUpperCase();
        button.addEventListener('click', () => setLanguage(lang));
        toggleContainer.appendChild(button);
    });
    
    return toggleContainer;
}

// Initialize language toggle in header
function initLanguageToggle() {
    const header = document.querySelector('header');
    if (header) {
        const toggle = createLanguageToggle();
        header.insertBefore(toggle, header.firstChild);
    }
}

// Initialize i18n
async function initI18n() {
    // Load translations
    await loadTranslations();
    
    // Get language preference (from localStorage or browser)
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const initialLanguage = savedLanguage || detectBrowserLanguage();
    
    // Set initial language
    await setLanguage(initialLanguage);
    
    // Create language toggle UI
    initLanguageToggle();
}

// Get current language (useful for cv.js to load correct milestone file)
function getCurrentLanguage() {
    return currentLanguage;
}

// Export functions for use in other scripts
window.i18n = {
    init: initI18n,
    setLanguage,
    translate,
    getCurrentLanguage
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}
