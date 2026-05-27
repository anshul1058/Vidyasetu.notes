// Shared guard for pages inside /home.
// Redirects visitors to login unless Supabase confirms a signed-in user.
(function () {
    const LOGIN_PATH = '../login/login.html';
    const style = document.createElement('style');
    style.textContent = 'html.auth-checking body{visibility:hidden;}';
    document.head.appendChild(style);
    document.documentElement.classList.add('auth-checking');

    function getLoginUrl() {
        const loginUrl = new URL(LOGIN_PATH, window.location.href);
        const currentTarget = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        loginUrl.searchParams.set('redirect', currentTarget);
        return loginUrl.href;
    }

    async function requireAuth() {
        if (!window.supabase) {
            window.location.replace(getLoginUrl());
            return null;
        }

        try {
            const { data: { user }, error } = await window.supabase.auth.getUser();
            if (error || !user) {
                window.location.replace(getLoginUrl());
                return null;
            }

            document.documentElement.classList.remove('auth-checking');
            return user;
        } catch (error) {
            console.error('Auth guard error:', error);
            window.location.replace(getLoginUrl());
            return null;
        }
    }

    window.requireAuth = requireAuth;
    window.authReady = requireAuth();
})();
