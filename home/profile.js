// ═══════════ Profile Page Scripts ═══════════

let currentUser = null;
let userMaterials = [];

// ───── Initialize ─────
document.addEventListener('DOMContentLoaded', async () => {
    // Check auth
    if (!window.supabase) {
        window.location.href = '../login/login.html';
        return;
    }

    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
        window.location.href = '../login/login.html';
        return;
    }

    currentUser = user;
    await loadUserProfile();
    await loadUserMaterials();
    setupDarkMode();
});

// ───── Load User Profile ─────
async function loadUserProfile() {
    try {
        const { data: profile } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (profile) {
            document.getElementById('user-name').textContent = profile.full_name || profile.name || currentUser.email;
            const displayEmail = document.getElementById('user-email-display');
            if (displayEmail) displayEmail.textContent = currentUser.email;
            
            const dropdownEmail = document.getElementById('user-email');
            if (dropdownEmail) dropdownEmail.textContent = currentUser.email;

            if (profile.avatar_url) {
                document.getElementById('user-avatar-large').innerHTML = `<img src="${profile.avatar_url}" class="w-full h-full object-cover relative z-10" alt="Avatar">`;
                document.getElementById('user-avatar').innerHTML = `<img src="${profile.avatar_url}" class="w-full h-full object-cover rounded-full" alt="Avatar">`;
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// ───── Load User Materials ─────
async function loadUserMaterials() {
    try {
        const { data: materials } = await window.supabase
            .from('materials')
            .select(`
                *,
                reviews (rating)
            `)
            .eq('uploader_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (materials) {
            userMaterials = materials;

            // Calculate stats
            const totalDownloads = userMaterials.reduce((sum, m) => sum + (m.downloads || 0), 0);
            const reputationScore = (materials.length * 10) + (totalDownloads * 2);
            
            document.getElementById('stat-uploads').textContent = materials.length;
            document.getElementById('stat-downloads').textContent = totalDownloads;
            document.getElementById('stat-reputation').textContent = reputationScore;

            // Render grid
            if (materials.length === 0) {
                document.getElementById('no-materials').style.display = 'flex';
                document.getElementById('my-materials-grid').style.display = 'none';
            } else {
                document.getElementById('no-materials').style.display = 'none';
                document.getElementById('my-materials-grid').style.display = 'grid';
                document.getElementById('my-materials-grid').innerHTML = materials.map(m => `
                    <div class="material-card glass-panel group p-5 flex flex-col h-full rounded-[20px] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                        onclick="alert('Editing not yet implemented. Material: ${m.title}')">
                        <div class="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div class="flex items-start justify-between mb-4 pb-4 border-b border-white/[0.04] relative z-10">
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold tracking-wide uppercase">
                                <span class="material-symbols-outlined text-[14px]">category</span>
                                ${m.category || 'General'}
                            </span>
                        </div>
                        
                        <h3 class="font-bold text-[16px] text-white group-hover:text-primary transition-colors mb-2 leading-tight relative z-10">${m.title}</h3>
                        <p class="text-[13px] text-slate-400 line-clamp-2 mb-4 flex-1 relative z-10">${m.description || 'No description provided.'}</p>
                        
                        <div class="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.04] relative z-10">
                            <div class="flex items-center gap-4">
                                <span class="flex items-center gap-1.5 text-[12px] font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">
                                    <span class="material-symbols-outlined text-[16px]">download</span>
                                    ${m.downloads || 0}
                                </span>
                                <span class="flex items-center gap-1.5 text-[12px] font-medium text-slate-400">
                                    <span class="material-symbols-outlined text-[16px]">visibility</span>
                                    ${m.view_count || 0}
                                </span>
                            </div>
                            <button class="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-primary/20 border border-white/[0.05] hover:border-primary/30 flex items-center justify-center text-slate-300 hover:text-primary transition-all">
                                <span class="material-symbols-outlined" style="font-size:18px;">edit</span>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading materials:', error);
    }
}

// ───── Dark Mode ─────
function setupDarkMode() {
    const themeIcon = document.getElementById('theme-icon');
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
        document.body.classList.add('dark');
        themeIcon.textContent = 'light_mode';
    }

    window.toggleDarkMode = () => {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
    };
}

// ───── Logout ─────
window.handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return;

    try {
        await window.supabase.auth.signOut();
        window.location.href = '../login/login.html';
    } catch (error) {
        alert('Logout failed: ' + error.message);
    }
};
