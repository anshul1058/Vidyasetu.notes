// home.js - Recreated automatically based on home.html structure

// ==========================================
// Rotating Study Tips Typewriter
// ==========================================
(function () {
    const el = document.getElementById('tip-text');
    const cursor = document.getElementById('tip-cursor');
    if (!el) return;

    const tips = [
        'Tip: Use spaced repetition to retain information longer.',
        'Tip: Take a 5-min break every 25 mins — try the Pomodoro technique!',
        'Tip: Teaching a concept to someone else is the best way to learn it.',
        'Tip: Handwriting notes improves memory retention over typing.',
        'Tip: Sleep consolidates memory — study before bed for better recall.',
        'Tip: Active recall beats re-reading every time.',
        'Tip: Break big topics into smaller chunks to avoid overwhelm.',
        'Tip: Mind maps help connect concepts visually for deeper understanding.',
        'Tip: Stay hydrated — even mild dehydration affects concentration.',
        'Tip: Review your notes within 24 hours to boost long-term retention.',
    ];

    let tipIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function shuffle() {
        tipIndex = Math.floor(Math.random() * tips.length);
    }

    function typeTip() {
        const current = tips[tipIndex];

        if (!isDeleting) {
            el.textContent = current.slice(0, charIndex + 1);
            charIndex++;
            if (charIndex === current.length) {
                setTimeout(() => { isDeleting = true; typeTip(); }, 2800);
                return;
            }
        } else {
            el.textContent = current.slice(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                shuffle();
                setTimeout(typeTip, 400);
                return;
            }
        }

        setTimeout(typeTip, isDeleting ? 25 : 45);
    }

    // Start after heading animation finishes
    setTimeout(() => { shuffle(); typeTip(); }, tips[0].length * 60 + 1500);
})();

// ==========================================
// Typewriter Heading Animation
// ==========================================
(function () {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    const plainText = 'Welcome to ';
    const brandText = 'StudyPlatform';
    const full = plainText + brandText;
    let i = 0;

    function type() {
        if (i <= full.length) {
            const plain = full.slice(0, Math.min(i, plainText.length));
            const brand = i > plainText.length ? full.slice(plainText.length, i) : '';
            el.innerHTML = plain + (brand ? `<span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">${brand}</span>` : '');
            i++;
            setTimeout(type, 60);
        } else {
            // hide cursor after done
            setTimeout(() => {
                const cursor = document.getElementById('typewriter-cursor');
                if (cursor) cursor.style.display = 'none';
            }, 1200);
        }
    }

    type();
})();

// Global state
let currentPdfFile = null;
let isChatbotOpen = false;

// DOM Elements
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotPanel = document.getElementById('chatbot-panel');
const iconOpen = document.getElementById('chatbot-icon-open');
const iconClose = document.getElementById('chatbot-icon-close');
const dropZone = document.getElementById('drop-zone');
const pdfInput = document.getElementById('pdf-input');
const uploadZone = document.getElementById('upload-zone');
const pdfLoadedSection = document.getElementById('pdf-loaded');
const pdfFilename = document.getElementById('pdf-filename');
const resultsArea = document.getElementById('results-area');
const toastContainer = document.getElementById('toast-container');
const mindmapModal = document.getElementById('mindmap-modal');
const mindmapContainer = document.getElementById('mindmap-fullscreen-container');

// Initialize Mermaid if available
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
}

// ==========================================
// Chatbot Toggle Logic
// ==========================================
window.toggleChatbot = () => {
    isChatbotOpen = !isChatbotOpen;
    
    if (isChatbotOpen) {
        chatbotPanel.classList.remove('hidden');
        chatbotPanel.classList.add('flex');
        iconOpen.classList.add('hidden');
        iconClose.classList.remove('hidden');
        
        // GSAP animate in
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(chatbotPanel, 
                { autoAlpha: 0, y: 20, scale: 0.95 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
            );
        }
    } else {
        // GSAP animate out
        if (typeof gsap !== 'undefined') {
            gsap.to(chatbotPanel, {
                autoAlpha: 0, y: 20, scale: 0.95, duration: 0.3, ease: "power2.inOut",
                onComplete: () => {
                    chatbotPanel.classList.add('hidden');
                    chatbotPanel.classList.remove('flex');
                    iconOpen.classList.remove('hidden');
                    iconClose.classList.add('hidden');
                }
            });
        } else {
            chatbotPanel.classList.add('hidden');
            chatbotPanel.classList.remove('flex');
            iconOpen.classList.remove('hidden');
            iconClose.classList.add('hidden');
        }
    }
};

// ==========================================
// Drag & Drop & File Selection
// ==========================================
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    if (dropZone) dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    if (dropZone) dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('border-primary', 'bg-primary/[0.05]');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    if (dropZone) dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('border-primary', 'bg-primary/[0.05]');
    }, false);
});

if (dropZone) {
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            pdfInput.files = files;
            handleFile(files[0]);
        }
    }, false);
}

window.handleFileSelect = (event) => {
    if (event.target.files.length) {
        handleFile(event.target.files[0]);
    }
};

function handleFile(file) {
    if (file.type !== 'application/pdf') {
        showToast('Please upload a valid PDF file.', 'error');
        return;
    }
    
    currentPdfFile = file;
    pdfFilename.textContent = file.name;
    
    // Switch views
    uploadZone.classList.add('hidden');
    pdfLoadedSection.classList.remove('hidden');
    pdfLoadedSection.classList.add('flex');
    
    showToast('PDF loaded successfully! You can now generate AI insights.', 'success');
}

// ==========================================
// Reset State
// ==========================================
window.resetChatbot = () => {
    currentPdfFile = null;
    if (pdfInput) pdfInput.value = '';
    
    uploadZone.classList.remove('hidden');
    uploadZone.classList.add('flex');
    pdfLoadedSection.classList.add('hidden');
    pdfLoadedSection.classList.remove('flex');
    
    if (resultsArea) resultsArea.innerHTML = '';
};

// ==========================================
// AI Generation Simulation
// ==========================================
window.generateAI = async (type) => {
    if (!currentPdfFile) return;
    
    const resultId = 'result-' + Date.now();
    
    // Add loading placeholder
    const loadingHtml = `
        <div id="${resultId}" class="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div class="flex items-center gap-3 mb-2">
                <span class="material-symbols-outlined text-primary animate-spin" style="font-size:18px;">sync</span>
                <span class="text-[12px] font-medium text-slate-300">Generating ${type}...</span>
            </div>
            <div class="space-y-2 mt-3 cursor-wait">
                <div class="h-2 bg-white/5 rounded w-3/4 animate-pulse"></div>
                <div class="h-2 bg-white/5 rounded w-full animate-pulse"></div>
                <div class="h-2 bg-white/5 rounded w-5/6 animate-pulse"></div>
            </div>
        </div>
    `;
    
    resultsArea.insertAdjacentHTML('afterbegin', loadingHtml);
    resultsArea.scrollTop = 0;
    
    // Simulate API Processing Time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const resultEl = document.getElementById(resultId);
    if (!resultEl) return;
    
    let content = '';
    
    // Demo Content Generation based on Type
    if (type === 'summary') {
        content = typeof marked !== 'undefined' ? marked.parse(`**Summary:** The uploaded document provides a comprehensive overview of fundamental study principles. It emphasizes the importance of structured notes, regular revisions, and utilizing AI-powered tools to optimize your exam preparation and concept retention.`) : 'Summary generated successfully.';
    } else if (type === 'notes') {
        content = typeof marked !== 'undefined' ? marked.parse(`**Key Notes & Highlights:**
- **Active Recall**: The most efficient method for moving facts from short-term to long-term memory.
- **Spaced Repetition**: Reviewing material at increasing intervals.
- **Visual Learning**: Diagramming complex concepts through Mind Maps increases spatial memory.
- **Collaboration**: Sharing insights with peers reinforces individual understanding.`) : 'Notes generated successfully.';
    } else if (type === 'quiz') {
        content = typeof marked !== 'undefined' ? marked.parse(`**Quick Knowledge Check:**
1. What is the main benefit of Active Recall?
*(Answer: It efficiently moves facts to long-term memory)*

2. True or False: Spaced Repetition involves reviewing material daily without breaks.
*(Answer: False. It involves increasing intervals over time.)*`) : 'Quiz generated successfully.';
    } else if (type === 'mindmap') {
        const diagramId = 'mermaid-' + Date.now();
        content = `
            <div class="mermaid-wrap bg-white/[0.03] p-3 rounded-lg flex flex-col items-center justify-center cursor-zoom-in hover:bg-white/[0.05] border border-white/5 transition-colors" onclick="openMindMapFullscreen()">
                <div class="mermaid text-center" id="${diagramId}">
                graph TD;
                    A[Study Platform]-->B[AI Assistant];
                    A-->C[Collaborative Groups];
                    B-->D[Smart Summaries];
                    B-->E[Interactive Quizzes];
                    B-->F[Visual MindMaps];
                </div>
                <div class="text-[10px] text-slate-500 mt-2 text-center w-full block">Click to expand into fullscreen</div>
            </div>
        `;
    }
    
    // Replace the loading skeleton with the final content
    resultEl.innerHTML = `
        <div class="flex items-center gap-2 mb-3">
            <span class="material-symbols-outlined text-green-400" style="font-size:16px;">check_circle</span>
            <span class="text-[12px] font-bold text-white capitalize">${type} Generated</span>
        </div>
        <div class="prose text-[13px] text-slate-300">
            ${content}
        </div>
    `;
    
    // Initialize Mermaid diagrams if applicable
    if (type === 'mindmap' && typeof mermaid !== 'undefined') {
        try {
            mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        } catch (e) {
            console.error("Mermaid parsing error", e);
        }
    }
};

// ==========================================
// Fullscreen Mindmap Logic
// ==========================================
window.openMindMapFullscreen = () => {
    if (!mindmapModal || !mindmapContainer) return;
    
    mindmapModal.classList.remove('hidden');
    mindmapModal.classList.add('flex');
    setTimeout(() => mindmapModal.classList.remove('opacity-0'), 10);
    
    // Copy the latest generated mermaid SVG into the modal
    const svgs = resultsArea.querySelectorAll('.mermaid svg');
    if (svgs.length > 0) {
        mindmapContainer.innerHTML = '';
        const clone = svgs[svgs.length - 1].cloneNode(true);
        // Style it for fullscreen viewing
        clone.style.width = '100%';
        clone.style.height = '100%';
        clone.style.maxWidth = '900px';
        mindmapContainer.appendChild(clone);
    }
};

window.closeMindMapModal = () => {
    if (!mindmapModal) return;
    
    mindmapModal.classList.add('opacity-0');
    setTimeout(() => {
        mindmapModal.classList.add('hidden');
        mindmapModal.classList.remove('flex');
    }, 300);
};

// ==========================================
// Toast Notification System
// ==========================================
function showToast(message, type = 'info') {
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    
    // Define styles based on toast type
    let colorClasses = 'bg-white/10 border-white/20 text-white';
    let iconName = 'info';
    
    if (type === 'error') {
        colorClasses = 'bg-red-500/10 border-red-500/20 text-red-200';
        iconName = 'error';
    } else if (type === 'success') {
        colorClasses = 'bg-green-500/10 border-green-500/20 text-green-200';
        iconName = 'check_circle';
    }
    
    toast.className = `toast-enter flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border border-solid shadow-lg ${colorClasses}`;
    
    toast.innerHTML = `
        <span class="material-symbols-outlined" style="font-size: 20px;">${iconName}</span>
        <span class="text-[13px] font-medium leading-tight">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Automatically remove the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
