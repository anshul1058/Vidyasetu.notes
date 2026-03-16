// ═══════════ Study Groups Page Scripts ═══════════

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

let currentUser = null;
let allGroups = [];

// ───── Initialize ─────
document.addEventListener('DOMContentLoaded', async () => {
    loadUserInfo();
    if (!window.supabase) {
        document.getElementById('empty-state').classList.remove('hidden');
        return;
    }

    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
        window.location.href = '../login/login.html';
        return;
    }

    currentUser = user;
    await loadGroups();
});

// ───── Load Groups ─────
async function loadGroups() {
    try {
        const { data: groups } = await window.supabase
            .from('study_groups')
            .select(`
                *,
                group_members (id),
                created_by_profile:created_by (name)
            `)
            .order('created_at', { ascending: false });

        if (!groups || groups.length === 0) {
            document.getElementById('empty-state').classList.remove('hidden');
            document.getElementById('groups-grid').innerHTML = '';
            return;
        }

        allGroups = groups;
        document.getElementById('empty-state').classList.add('hidden');

        document.getElementById('groups-grid').innerHTML = groups.map(group => `
            <div class="bg-[#0e1015]/40 border border-white/[0.08] rounded-[16px] p-5 hover:border-primary/30 transition-all cursor-pointer"
                onclick="joinGroup('${group.id}')">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <h3 class="text-[15px] font-bold text-white mb-1">${group.name}</h3>
                        <p class="text-[12px] text-slate-500">Created by ${group.created_by_profile?.name || 'Anonymous'}</p>
                    </div>
                    <span class="px-2 py-1 text-[11px] font-semibold rounded-full bg-primary/20 border border-primary/30 text-primary">
                        ${group.is_public ? 'Public' : 'Private'}
                    </span>
                </div>

                <p class="text-[13px] text-slate-400 mb-3">
                    ${group.subject ? group.subject : (group.branch ? `Branch: ${group.branch}` : 'No topic')}
                </p>

                <div class="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <span class="text-[12px] text-slate-500">
                        <span class="material-symbols-outlined align-middle" style="font-size:14px;">people</span>
                        ${group.member_count || 1} members
                    </span>
                    <span class="text-primary text-[12px] font-semibold">Join →</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading groups:', error);
        document.getElementById('groups-grid').innerHTML = `
            <div class="col-span-full text-center py-8 text-red-400">
                Failed to load groups
            </div>
        `;
    }
}

// ───── Create Group Modal ─────
window.openCreateGroupModal = () => {
    document.getElementById('create-group-modal').classList.remove('hidden');
};

window.closeCreateGroupModal = () => {
    document.getElementById('create-group-modal').classList.add('hidden');
    document.getElementById('create-group-form').reset();
};

// ───── Handle Create Group ─────
window.handleCreateGroup = async (e) => {
    e.preventDefault();

    const name = document.getElementById('group-name').value.trim();
    const branch = document.getElementById('group-branch').value || null;
    const subject = document.getElementById('group-subject').value.trim() || null;

    if (!name) {
        showToast('Group name is required', 'error');
        return;
    }

    try {
        // Create group
        const { data: group, error } = await window.supabase
            .from('study_groups')
            .insert([{
                name,
                branch,
                subject,
                created_by: currentUser.id,
                member_count: 1
            }])
            .select()
            .single();

        if (error) throw error;

        // Add creator as member
        await window.supabase.from('group_members').insert({
            group_id: group.id,
            user_id: currentUser.id,
            role: 'admin'
        });

        showToast(`Group "${name}" created successfully! 🎉`, 'success');
        closeCreateGroupModal();
        await loadGroups();

    } catch (error) {
        console.error('Error creating group:', error);
        showToast(error.message || 'Failed to create group', 'error');
    }
};

// ───── Join Group ─────
window.joinGroup = async (groupId) => {
    try {
        // Check if already a member
        const { data: existing } = await window.supabase
            .from('group_members')
            .select('id')
            .eq('group_id', groupId)
            .eq('user_id', currentUser.id)
            .single();

        if (existing) {
            showToast('You are already a member of this group', 'info');
            return;
        }

        // Add as member
        await window.supabase.from('group_members').insert({
            group_id: groupId,
            user_id: currentUser.id
        });

        // Increment member count
        const group = allGroups.find(g => g.id === groupId);
        await window.supabase
            .from('study_groups')
            .update({ member_count: (group.member_count || 1) + 1 })
            .eq('id', groupId);

        showToast('Joined group successfully! 👋', 'success');
        await loadGroups();

    } catch (error) {
        console.error('Error joining group:', error);
        showToast(error.message || 'Failed to join group', 'error');
    }
};

// ───── Toast Notification ─────
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
    };

    toast.innerHTML = `
        <span class="material-symbols-outlined toast-icon" style="font-size:20px;">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(toast,
            { opacity: 0, x: 40, scale: 0.95 },
            { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
        );

        setTimeout(() => {
            gsap.to(toast, {
                opacity: 0, x: 40, scale: 0.9,
                duration: 0.3, ease: "power2.in",
                onComplete: () => toast.remove()
            });
        }, 4000);
    } else {
        setTimeout(() => toast.remove(), 4000);
    }
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:12px;pointer-events:none;';
    document.body.appendChild(container);
    return container;
}
