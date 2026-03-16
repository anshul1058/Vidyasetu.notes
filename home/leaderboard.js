// ═══════════ Leaderboard Page Scripts ═══════════

// ═══════════ Authentication & User Menu ═══════════
window.toggleUserMenu = () => {
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('invisible');
    }
};

window.handleLogout = async () => {
    if (!window.supabase) {
        window.location.href = '../login/login.html';
        return;
    }

    try {
        const { error } = await window.supabase.auth.signOut();
        if (error) throw error;
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Redirect to login page
    window.location.href = '../login/login.html';
};

// Load user email into menu
function loadUserInfo() {
    if (!window.supabase) return;
    
    window.supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            const emailElement = document.getElementById('user-email');
            if (emailElement) {
                emailElement.textContent = user.email || 'User';
            }
        }
    }).catch(error => {
        console.error('Error loading user:', error);
        // Redirect to login if not authenticated
        window.location.href = '../login/login.html';
    });
}

// ───── Initialize ─────
document.addEventListener('DOMContentLoaded', async () => {
    loadUserInfo();
    if (!window.supabase) {
        document.getElementById('empty-state').classList.remove('hidden');
        return;
    }

    await loadLeaderboard();
});

// ───── Load Leaderboard ─────
async function loadLeaderboard() {
    try {
        // Get all contributors with their materials to calculate stats
        const { data: profiles, error } = await window.supabase
            .from('profiles')
            .select(`
                id,
                full_name,
                email,
                avatar_url,
                materials (
                    id,
                    downloads,
                    view_count
                )
            `);

        if (error) throw error;

        if (!profiles || profiles.length === 0) {
            document.getElementById('leaderboard-body').innerHTML = `
                <div class="px-6 py-12 text-center text-slate-500 glass-panel rounded-[16px]">
                    No contributors yet. Be the first!
                </div>
            `;
            return;
        }

        // Calculate stats for each profile
        const rankedProfiles = profiles.map(profile => {
            const materialsCount = profile.materials?.length || 0;
            const totalDownloads = profile.materials?.reduce((sum, m) => sum + (m.downloads || 0), 0) || 0;
            
            // Calculate a dynamic reputation score since we don't have a column for it
            // Base points for uploading materials + bonus for downloads
            const reputationScore = (materialsCount * 10) + (totalDownloads * 2);

            return {
                ...profile,
                name: profile.full_name || 'Anonymous',
                materialsCount,
                totalDownloads,
                reputationScore
            };
        });

        // Sort by most materials uploaded (primary), then by downloads (secondary)
        rankedProfiles.sort((a, b) => {
            if (b.materialsCount !== a.materialsCount) {
                return b.materialsCount - a.materialsCount;
            }
            return b.totalDownloads - a.totalDownloads;
        });

        // Take top 50
        const topContributors = rankedProfiles.slice(0, 50);

        // Render leaderboard
        const html = topContributors.map((profile, index) => {
            const rank = index + 1;
            let medal = '';
            if (rank === 1) medal = '🥇';
            else if (rank === 2) medal = '🥈';
            else if (rank === 3) medal = '🥉';

            const badgeColor = rank <= 3 
                ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_15px_color-mix(in_srgb,var(--primary-color)_30%,transparent)]' 
                : 'bg-white/[0.05] border-white/[0.1] text-white';

            const avatarUrl = profile.avatar_url || '';
            const avatarContent = avatarUrl 
                ? `<img src="${avatarUrl}" alt="Avatar" class="w-12 h-12 rounded-full object-cover relative z-10 border border-white/10">`
                : `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-yellow-500 flex items-center justify-center relative z-10 border border-white/10">
                       <span class="material-symbols-outlined text-gray-900" style="font-size:22px;">person</span>
                   </div>`;

            return `
                <div class="glass-panel glass-panel-hover rounded-[16px] p-4 flex items-center group relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div class="w-20 shrink-0 flex items-center justify-center gap-2 relative z-10">
                        <span class="text-2xl w-8 text-center drop-shadow-md">${medal}</span>
                        <span class="text-[14px] font-bold text-slate-500 group-hover:text-white transition-colors w-6 text-right">#${rank}</span>
                    </div>
                    
                    <div class="flex-1 flex items-center gap-4 relative z-10">
                        <div class="relative">
                            <div class="absolute inset-0 bg-primary/30 rounded-full blur-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-150"></div>
                            ${avatarContent}
                        </div>
                        <div>
                            <p class="text-[15px] font-bold text-white group-hover:text-primary transition-colors">${profile.name}</p>
                            <p class="text-[13px] text-slate-500 mt-0.5">${profile.email || 'No email'}</p>
                        </div>
                    </div>
                    
                    <div class="w-32 shrink-0 text-center relative z-10">
                        <span class="text-[15px] font-bold text-white block">${profile.materialsCount}</span>
                        <span class="text-[12px] text-slate-500">Material${profile.materialsCount === 1 ? '' : 's'}</span>
                    </div>
                    
                    <div class="w-32 shrink-0 text-center flex justify-center relative z-10">
                        <span class="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[13px] font-bold border flex-nowrap whitespace-nowrap ${badgeColor} transition-all duration-300">
                            ${profile.reputationScore} PTS
                        </span>
                    </div>
                    
                    <div class="w-32 shrink-0 text-center relative z-10">
                        <span class="flex items-center justify-center gap-1.5 text-[14px] font-bold text-emerald-400">
                            <span class="material-symbols-outlined" style="font-size: 16px;">download</span>
                            ${profile.totalDownloads}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('leaderboard-body').innerHTML = html;
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('flex');
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        document.getElementById('leaderboard-body').innerHTML = `
            <div class="px-6 py-12 text-center text-red-400 glass-panel rounded-[16px]">
                Failed to load leaderboard. Please try again later.
            </div>
        `;
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('flex');
    }
}
