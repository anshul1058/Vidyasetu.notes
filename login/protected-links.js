// Keeps protected navbar links behind login from auth pages.
(function () {
    function createFallbackToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast toast-info';
        toast.innerHTML = `
            <span class="material-symbols-outlined toast-icon" style="font-size:20px;">info</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function showLoginRequiredMessage() {
        if (typeof window.showToast === 'function') {
            window.showToast('Please log in to continue.', 'info', 3000);
        } else {
            createFallbackToast('Please log in to continue.');
        }
    }

    function setRedirectTarget(targetUrl) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('redirect', targetUrl);
        window.history.replaceState({}, '', currentUrl.href);
    }

    document.addEventListener('click', async (event) => {
        const link = event.target.closest('a[data-requires-auth="true"]');
        if (!link) return;

        event.preventDefault();

        const targetUrl = new URL(link.getAttribute('href'), window.location.href).href;
        if (!window.supabase) {
            setRedirectTarget(targetUrl);
            showLoginRequiredMessage();
            return;
        }

        try {
            const { data: { user }, error } = await window.supabase.auth.getUser();
            if (error || !user) {
                setRedirectTarget(targetUrl);
                showLoginRequiredMessage();
                return;
            }

            window.location.href = targetUrl;
        } catch (error) {
            console.error('Protected link auth check failed:', error);
            setRedirectTarget(targetUrl);
            showLoginRequiredMessage();
        }
    });
})();
