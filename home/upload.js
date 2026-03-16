// ═══════════ Upload Material Page Scripts ═══════════

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

let selectedFile = null;

// ───── Toast Notification System ─────
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info',
        warning: 'warning',
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
        }, duration);
    } else {
        setTimeout(() => toast.remove(), duration);
    }
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:12px;pointer-events:none;';
    document.body.appendChild(container);
    return container;
}

// ───── Initialize ─────
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    setupDragDrop();
    setupFormSubmit();
    
    // Check authentication
    if (window.supabase) {
        window.supabase.auth.getUser().then(({ data: { user }, error }) => {
            if (error || !user) {
                showToast('Please log in to upload materials', 'warning');
                setTimeout(() => {
                    window.location.href = '../login/login.html';
                }, 1000);
            }
        });
    }

    setupDynamicFields();
});

// ───── Dynamic Form Fields ─────
function setupDynamicFields() {
    const streamInput = document.getElementById('stream-input');
    const branchContainer = document.getElementById('branch-container');
    const branchInput = document.getElementById('branch-input');
    
    const autonomousContainer = document.getElementById('autonomous-container');
    const autonomousRadios = document.getElementsByName('autonomous_status');
    
    const institutionSearchContainer = document.getElementById('institution-search-container');
    const collegeSearchContainer = document.getElementById('college-search-container');
    const collegeInput = document.getElementById('college-input');
    const universitySearchContainer = document.getElementById('university-search-container');
    const universityInput = document.getElementById('university-input');

    if (!streamInput) return;

    // Handle Stream change
    streamInput.addEventListener('change', (e) => {
        const stream = e.target.value;
        
        // Reset sub-fields
        branchContainer.classList.add('hidden');
        branchInput.required = false;
        branchInput.value = '';

        autonomousContainer.classList.add('hidden');
        autonomousRadios.forEach(r => { r.checked = false; r.required = false; });
        
        institutionSearchContainer.classList.add('hidden');
        collegeSearchContainer.style.display = 'none';
        collegeInput.required = false;
        collegeInput.value = '';
        universitySearchContainer.style.display = 'none';
        universityInput.required = false;
        universityInput.value = '';

        // Show relevant fields
        if (stream === 'btech') {
            branchContainer.classList.remove('hidden');
            branchContainer.classList.add('flex');
            branchInput.required = true;

            autonomousContainer.classList.remove('hidden');
            autonomousContainer.classList.add('flex');
            autonomousRadios.forEach(r => r.required = true);
        } else if (stream === '11th' || stream === '10th' || stream === 'jee' || stream === 'upsc' || stream === 'neet') {
            // No branch or autonomous fields for these
        }
    });

    // Handle Autonomous Radio change
    autonomousRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isAutonomous = e.target.value === 'autonomous';
            
            institutionSearchContainer.classList.remove('hidden');
            institutionSearchContainer.classList.add('grid');

            if (isAutonomous) {
                collegeSearchContainer.style.display = 'flex';
                collegeInput.required = true;
                
                universitySearchContainer.style.display = 'none';
                universityInput.required = false;
                universityInput.value = '';
            } else {
                universitySearchContainer.style.display = 'flex';
                universityInput.required = true;
                
                collegeSearchContainer.style.display = 'none';
                collegeInput.required = false;
                collegeInput.value = '';
            }
        });
    });
}

// ───── File Handling ─────
function setupDragDrop() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    dropZone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
        fileInput.value = '';
    });
}

// ───── Handle File Selection ─────
function handleFile(file) {
    const allowedTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|ppt|pptx|doc|docx)$/i)) {
        showToast('Please upload a PDF, PPT, or DOCX file.', 'error');
        return;
    }

    if (file.size > maxSize) {
        showToast('File size exceeds 50MB limit.', 'error');
        return;
    }

    selectedFile = file;
    document.getElementById('file-info').classList.remove('hidden');
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = `${(file.size / 1024 / 1024).toFixed(1)}MB`;
}

window.clearFile = () => {
    selectedFile = null;
    document.getElementById('file-input').value = '';
    document.getElementById('file-info').classList.add('hidden');
};

// ───── Setup Form Submit ─────
function setupFormSubmit() {
    const uploadForm = document.getElementById('upload-form');
    if (!uploadForm) return;

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            showToast('Please select a file to upload', 'error');
            return;
        }

        // Get form values
        const title = document.getElementById('title-input').value.trim();
        const description = document.getElementById('description-input').value.trim();
        const stream = document.getElementById('stream-input').value;
        const branchInput = document.getElementById('branch-input');
        const branch = branchInput && !branchInput.parentElement.classList.contains('hidden') ? branchInput.value : null;
        
        let autonomous_status = null;
        let college = null;
        let university = null;
        
        if (stream === 'btech') {
            const selectedRadio = document.querySelector('input[name="autonomous_status"]:checked');
            if (selectedRadio) {
                autonomous_status = selectedRadio.value;
                if (autonomous_status === 'autonomous') {
                    college = document.getElementById('college-input').value.trim();
                } else if (autonomous_status === 'non_autonomous') {
                    university = document.getElementById('university-input').value.trim();
                }
            }
        }

        const semester = document.getElementById('semester-input').value;
        const subject = document.getElementById('subject-input').value.trim();
        const category = document.getElementById('category-input').value;

        // Validate
        if (!title || !stream || !subject || !category) {
            showToast('Please fill in all required base fields', 'error');
            return;
        }

        if (stream === 'btech') {
            if (!branch || !autonomous_status) {
                showToast('Please fill in B.Tech specific fields', 'error');
                return;
            }
            if (autonomous_status === 'autonomous' && !college) {
                showToast('Please enter the College name', 'error');
                return;
            }
            if (autonomous_status === 'non_autonomous' && !university) {
                showToast('Please enter the University name', 'error');
                return;
            }
        }

        if (!window.supabase) {
            showToast('Supabase not initialized', 'error');
            return;
        }

        // Get current user
        const { data: { user }, error: authError } = await window.supabase.auth.getUser();
        if (authError || !user) {
            showToast('Please log in to upload', 'error');
            window.location.href = '../login/login.html';
            return;
        }

        // Ensure profile exists (auto-create if missing)
        const { data: existingProfile } = await window.supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!existingProfile) {
            const { error: profileError } = await window.supabase
                .from('profiles')
                .insert([{
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email.split('@')[0],
                    avatar_url: user.user_metadata?.avatar_url || null
                }]);
            if (profileError) {
                console.error('Profile creation error:', profileError);
                showToast('Failed to create user profile', 'error');
                return;
            }
        }

        // Show loading state
        const btn = document.getElementById('upload-btn');
        const btnText = document.getElementById('btn-text');
        const loader = document.getElementById('btn-loader');

        btnText.textContent = 'Uploading...';
        loader.classList.remove('hidden');
        btn.disabled = true;
        btn.style.opacity = '0.8';

        try {
            // Upload file to Supabase Storage
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `materials/${user.id}/${fileName}`;

            const { data: uploadData, error: uploadError } = await window.supabase.storage
                .from('materials')
                .upload(filePath, selectedFile);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = window.supabase.storage
                .from('materials')
                .getPublicUrl(filePath);

            // Create metadata entry in database
            const { data: material, error: dbError } = await window.supabase
                .from('materials')
                .insert([{
                    uploader_id: user.id,
                    title,
                    description,
                    file_url: publicUrl,
                    file_size: selectedFile.size,
                    file_type: selectedFile.type,
                    stream,
                    branch,
                    autonomous_status,
                    university,
                    college,
                    semester: semester ? parseInt(semester) : null,
                    subject,
                    category,
                    is_approved: true,
                    created_at: new Date().toISOString(),
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            // Show success message
            showToast(`Material "${title}" uploaded successfully! 🎉`, 'success', 4000);

            // Update UI
            btnText.textContent = '✓ uploading complete';
            btn.classList.add('btn-success');

            // Clear form after delay and redirect
            setTimeout(() => {
                uploadForm.reset();
                clearFile();
                window.location.href = 'browse.html';
            }, 2000);

        } catch (error) {
            console.error('Upload error:', error);
            showToast(error.message || 'Upload failed. Please try again.', 'error');
            
            btnText.textContent = 'Upload Material';
            loader.classList.add('hidden');
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    });
}
