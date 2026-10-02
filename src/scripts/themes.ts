// A hidden theme switcher that mirrors the app's themes.
// Click the header icon (or press T) to cycle; the theme cards in the Plus
// section pick one directly. The choice is remembered in this browser.

export const THEMES = [
    { id: 'midnight', name: 'Midnight', night: '#05060F' },
    { id: 'dusk', name: 'Dusk', night: '#14112E' },
    { id: 'ember', name: 'Ember', night: '#1A0708' },
    { id: 'aurora', name: 'Aurora', night: '#04121F' },
    { id: 'tidepool', name: 'Tidepool', night: '#061A26' },
    { id: 'bloom', name: 'Bloom', night: '#2A1638' },
    { id: 'graphite', name: 'Graphite', night: '#0B0B0D' },
] as const;

const STORAGE_KEY = 'stepglow-theme';

function currentTheme(): string {
    return document.documentElement.dataset.theme ?? 'midnight';
}

function remember(id: string) {
    try {
        localStorage.setItem(STORAGE_KEY, id);
    } catch {
        // Private browsing or blocked storage: the theme just won't stick.
    }
}

let toastTimer: number | undefined;

function announce(name: string) {
    const toast = document.querySelector<HTMLElement>('[data-theme-toast]');
    if (!toast) return;
    toast.textContent = `Theme: ${name} ✦`;
    toast.classList.remove('opacity-0', 'translate-y-2');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.add('opacity-0', 'translate-y-2'), 1600);
}

function apply(id: string, { announceIt = true } = {}) {
    const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
    if (theme.id === 'midnight') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme.id;

    document.querySelectorAll<HTMLImageElement>('[data-theme-icon]').forEach((img) => {
        img.src = `/icons/${theme.id}.png`;
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.night);
    document.querySelectorAll<HTMLElement>('[data-theme-pick]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.themePick === theme.id));
    });

    remember(theme.id);
    if (announceIt) announce(theme.name);
}

function cycle() {
    const index = THEMES.findIndex((t) => t.id === currentTheme());
    apply(THEMES[(index + 1) % THEMES.length].id);
}

export function setupThemeSwitcher() {
    // Sync the icon and cards with whatever the early head script applied.
    apply(currentTheme(), { announceIt: false });

    document.querySelectorAll('[data-theme-cycle]').forEach((button) => button.addEventListener('click', cycle));

    document.querySelectorAll<HTMLElement>('[data-theme-pick]').forEach((button) =>
        button.addEventListener('click', () => apply(button.dataset.themePick ?? 'midnight')),
    );

    document.addEventListener('keydown', (event) => {
        const target = event.target as HTMLElement | null;
        const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
        if (event.key.toLowerCase() === 't' && !event.metaKey && !event.ctrlKey && !event.altKey && !typing) {
            cycle();
        }
    });
}
