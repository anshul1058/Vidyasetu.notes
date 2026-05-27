// ───── Global Theme Manager ─────

const THEMES = {
    yellow: { primary: '#f2b90d', dark: '#c9990a', label: 'Yellow' },
    purple: { primary: '#a855f7', dark: '#9333ea', label: 'Purple' },
    white: { primary: '#f8fafc', dark: '#cbd5e1', label: 'White' },
    blue: { primary: '#3b82f6', dark: '#2563eb', label: 'Blue' },
    green: { primary: '#10b981', dark: '#059669', label: 'Green' },
    pink: { primary: '#ec4899', dark: '#db2777', label: 'Pink' },
    red: { primary: '#ef4444', dark: '#dc2626', label: 'Red' },
    orange: { primary: '#f97316', dark: '#ea580c', label: 'Orange' },
};

// 1. Get saved theme or default to yellow
const savedTheme = localStorage.getItem('vidyasetu_notes_theme') || 'yellow';
const savedDarkMode = localStorage.getItem('vidyasetu_notes_dark_mode') !== 'false'; // Default to dark

// Utility to convert Hex to RGB string for Tailwind
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r} ${g} ${b}`;
}

// 2. Set Tailwind Config dynamically using CSS Variables
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "rgb(var(--primary-color-rgb) / <alpha-value>)",
                "primary-dark": "rgb(var(--primary-dark-rgb) / <alpha-value>)",
                "bg-dark": "#0e1015",
                "bg-dark-elevated": "#161a21",
                "bg-card": "#1a1e27",
                "surface": "#21262f",
            },
            fontFamily: {
                "display": ["Lexend", "sans-serif"]
            },
        },
    },
};

// 3. Apply Theme CSS Variables
function applyTheme(themeName) {
    const theme = THEMES[themeName] || THEMES.yellow;

    // Set standard hex for custom CSS that uses color-mix()
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--primary-dark-color', theme.dark);

    // Set RGB channels for Tailwind opacity modifiers (e.g. bg-primary/80)
    document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(theme.primary));
    document.documentElement.style.setProperty('--primary-dark-rgb', hexToRgb(theme.dark));

    localStorage.setItem('vidyasetu_notes_theme', themeName);

    // Update active state in switcher UI
    document.querySelectorAll('.theme-option').forEach(btn => {
        if (btn.dataset.theme === themeName) {
            btn.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-bg-dark');
        } else {
            btn.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-bg-dark');
        }
    });
}

// Ensure first apply happens immediately before page renders
applyTheme(savedTheme);

// Shared responsive rules for the static app pages.
(function injectResponsiveStyles() {
    if (document.getElementById('vidyasetu-responsive-styles')) return;

    const style = document.createElement('style');
    style.id = 'vidyasetu-responsive-styles';
    style.textContent = `
        *, *::before, *::after {
            min-width: 0;
        }

        html {
            overflow-x: hidden;
        }

        body {
            overflow-x: hidden;
        }

        img,
        iframe,
        canvas,
        video {
            max-width: 100%;
        }

        .mobile-app-nav {
            display: none;
        }

        @media (max-width: 767px) {
            body.has-mobile-app-nav {
                padding-bottom: calc(78px + env(safe-area-inset-bottom));
            }

            header {
                min-height: 64px;
                padding: 0.75rem 1rem !important;
                gap: 0.75rem !important;
            }

            header > div:first-child {
                min-width: 0;
                gap: 0.625rem !important;
            }

            header > div:last-child {
                min-width: 0;
                gap: 0.5rem !important;
            }

            header h1,
            header h2,
            header a.text-lg {
                max-width: 52vw;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                font-size: 1rem !important;
            }

            header .w-8.h-8,
            header .w-9.h-9,
            header .w-10.h-10 {
                width: 2rem !important;
                height: 2rem !important;
                flex: 0 0 auto;
            }

            main,
            section,
            footer > div {
                max-width: 100% !important;
            }

            input,
            select,
            textarea {
                font-size: 16px !important;
            }

            button,
            a,
            input,
            select,
            textarea {
                -webkit-tap-highlight-color: transparent;
            }

            button,
            a,
            [role="button"] {
                touch-action: manipulation;
            }

            .mobile-app-nav {
                position: fixed;
                left: 0.75rem;
                right: 0.75rem;
                bottom: calc(0.75rem + env(safe-area-inset-bottom));
                z-index: 9998;
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
                gap: 0.25rem;
                padding: 0.45rem;
                border-radius: 1rem;
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(14, 16, 21, 0.9);
                box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06);
                backdrop-filter: blur(22px);
                -webkit-backdrop-filter: blur(22px);
            }

            .mobile-app-nav a {
                min-height: 3.25rem;
                border-radius: 0.75rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.125rem;
                color: #94a3b8;
                font-size: 10px;
                font-weight: 700;
                line-height: 1;
                text-decoration: none;
            }

            .mobile-app-nav .material-symbols-outlined {
                font-size: 20px;
                line-height: 1;
            }

            .mobile-app-nav a.is-active {
                color: var(--primary-color);
                background: color-mix(in srgb, var(--primary-color) 13%, transparent);
                border: 1px solid color-mix(in srgb, var(--primary-color) 22%, transparent);
            }

            #user-menu {
                position: fixed !important;
                top: 4.25rem !important;
                right: 1rem !important;
                width: min(18rem, calc(100vw - 2rem)) !important;
                max-width: calc(100vw - 2rem);
            }

            #toast-container {
                left: 1rem !important;
                right: 1rem !important;
                top: 1rem !important;
                align-items: stretch;
            }

            #toast-container .toast,
            .toast {
                min-width: 0 !important;
                max-width: 100% !important;
                width: 100%;
            }

            #vidyasetu-theme-switcher {
                left: 0.75rem !important;
                bottom: calc(5.75rem + env(safe-area-inset-bottom)) !important;
            }

            .glass-panel-hover:hover,
            .material-card:hover,
            .recommendation-card:hover,
            .group-card:hover,
            .peer-card:hover,
            .action-card:hover,
            .social-btn:hover {
                transform: none !important;
            }
        }

        @media (max-width: 640px) {
            body > main,
            body > div > main,
            main.flex-1 {
                padding-left: 1rem !important;
                padding-right: 1rem !important;
            }

            .grid-cols-2 {
                grid-template-columns: minmax(0, 1fr) !important;
            }

            #hero-search,
            #home-search {
                padding: 0.95rem 1rem 0.95rem 3rem !important;
                font-size: 16px !important;
            }

            #hero-search ~ button,
            #home-search ~ button {
                position: static !important;
                transform: none !important;
                width: 100%;
                margin-top: 0.75rem;
                padding: 0.875rem 1rem !important;
            }

            div:has(> #hero-search) > .material-symbols-outlined,
            div:has(> #home-search) > .material-symbols-outlined {
                top: 1.9rem !important;
                transform: translateY(-50%) !important;
            }

            #chatbot-panel {
                left: 0.75rem !important;
                right: 0.75rem !important;
                bottom: calc(5.75rem + env(safe-area-inset-bottom)) !important;
                width: auto !important;
                max-height: min(70vh, 560px) !important;
            }

            #book-widget-wrapper {
                right: 1rem !important;
                bottom: calc(5.75rem + env(safe-area-inset-bottom)) !important;
            }

            #ask-bubble {
                display: none !important;
            }

            .filter-select {
                flex: 1 1 calc(50% - 0.375rem);
                min-width: 0;
            }

            .stats-row,
            .recommendation-card-footer {
                flex-wrap: wrap;
                gap: 0.625rem;
            }

            .material-card,
            .recommendation-card,
            .glass-panel,
            .action-card {
                border-radius: 1rem !important;
            }

            .leaderboard-stat {
                flex: 1 1 calc(33.333% - 0.75rem) !important;
                flex-basis: calc(33.333% - 0.75rem) !important;
                flex-shrink: 1 !important;
            }

            .leaderboard-entry {
                display: grid !important;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                align-items: stretch !important;
            }

            .leaderboard-rank {
                grid-column: 1 / 2;
                grid-row: 1;
            }

            .leaderboard-person {
                grid-column: 2 / 4;
                grid-row: 1;
                min-width: 0;
            }

            .leaderboard-stat {
                grid-row: 2;
                width: auto !important;
            }
        }

        @media (max-width: 360px) {
            .filter-select {
                flex-basis: 100%;
                width: 100%;
            }

            .leaderboard-stat {
                flex-basis: 100% !important;
                grid-column: 1 / -1;
            }

            .mobile-app-nav a span:last-child {
                font-size: 9px;
            }
        }
    `;

    const appendResponsiveStyle = () => {
        if (!style.isConnected) {
            document.head.appendChild(style);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', appendResponsiveStyle, { once: true });
    } else {
        appendResponsiveStyle();
    }
})();

// Mobile app navigation for authenticated app pages.
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isHomeArea = path.includes('/home/');
    const excludedPages = ['group-chat.html', 'study-room.html'];
    const shouldShowNav = isHomeArea && !excludedPages.some(page => path.endsWith(page));

    if (!shouldShowNav || document.querySelector('.mobile-app-nav')) return;

    const items = [
        { href: 'home.html', icon: 'home', label: 'Home', page: 'home.html' },
        { href: 'browse.html', icon: 'search', label: 'Browse', page: 'browse.html' },
        { href: 'upload.html', icon: 'add_circle', label: 'Upload', page: 'upload.html' },
        { href: 'groups.html', icon: 'groups', label: 'Groups', page: 'groups.html' },
        { href: 'leaderboard.html', icon: 'trophy', label: 'Ranks', page: 'leaderboard.html' },
    ];

    const nav = document.createElement('nav');
    nav.className = 'mobile-app-nav';
    nav.setAttribute('aria-label', 'Mobile app navigation');
    nav.innerHTML = items.map(item => {
        const active = path.endsWith(item.page) || (item.page === 'home.html' && path.endsWith('/home/'));
        return `
            <a href="${item.href}" class="${active ? 'is-active' : ''}" aria-label="${item.label}">
                <span class="material-symbols-outlined">${item.icon}</span>
                <span>${item.label}</span>
            </a>
        `;
    }).join('');

    document.body.classList.add('has-mobile-app-nav');
    document.body.appendChild(nav);
});

// ═════════════════ DARK MODE TOGGLE ═════════════════
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('vidyasetu_notes_dark_mode', isDark);
    
    // Update theme icon if present
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    }
}

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved dark mode preference
    if (savedDarkMode) {
        document.body.classList.add('dark');
    }

    // Update theme icon
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedDarkMode ? 'light_mode' : 'dark_mode';
    }
});

// 4. Inject Theme Switcher UI after DOM load — ONLY on homepage
document.addEventListener('DOMContentLoaded', () => {
    // Only show theme switcher on the homepage
    if (!window.location.pathname.includes('home.html') && !window.location.pathname.endsWith('/home/')) return;

    const switcher = document.createElement('div');
    switcher.id = 'vidyasetu-theme-switcher';
    switcher.className = 'fixed left-5 bottom-6 z-[9999] group';

    // The toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'w-12 h-12 rounded-full bg-bg-card border border-white/10 flex items-center justify-center shadow-lg hover:border-primary transition-all cursor-pointer';
    toggleBtn.innerHTML = `<span class="material-symbols-outlined text-slate-300 pointer-events-none group-hover:text-primary transition-colors">palette</span>`;

    // The palette menu wrapper (hidden by default, expands upward on hover)
    const menuWrapper = document.createElement('div');
    // Using pb-3 (padding base) to bridge the 12px gap so hover doesn't drop
    menuWrapper.className = 'absolute bottom-full left-0 pb-3 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 w-[180px] origin-bottom-left';

    // The actual visible card
    const menuCard = document.createElement('div');
    menuCard.className = 'bg-bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl';

    let menuHTML = `<div class="text-[12px] font-bold text-slate-400 mb-3 px-1 uppercase tracking-wider">Theme Color</div><div class="grid grid-cols-4 gap-2">`;

    Object.keys(THEMES).forEach(key => {
        const t = THEMES[key];
        const isActive = key === savedTheme;
        const ringClasses = isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-dark' : '';
        menuHTML += `
            <button 
                data-theme="${key}"
                class="theme-option w-7 h-7 rounded-full cursor-pointer transition-transform hover:scale-110 ${ringClasses}"
                style="background-color: ${t.primary}"
                title="${t.label}"
                onclick="applyTheme('${key}')"
            ></button>
        `;
    });

    menuHTML += `</div>`;
    menuCard.innerHTML = menuHTML;
    menuWrapper.appendChild(menuCard);

    switcher.appendChild(menuWrapper);
    switcher.appendChild(toggleBtn);
    document.body.appendChild(switcher);
});
