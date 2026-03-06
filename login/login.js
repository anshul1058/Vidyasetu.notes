// ═══════════ StudyPlatform Login Page Scripts ═══════════

// ───── State ─────
let isLampOn = false;
let particles = [];
let fireflies = [];

// ───── DOM References ─────
const body = document.body;
const chainContainer = document.getElementById('pull-chain-container');
const header = document.getElementById('main-header');
const loginCard = document.getElementById('login-card');
const lampStatusText = document.getElementById('lamp-status-text');

// ───── Create floating particles ─────
function createParticles() {
    const container = document.getElementById('particles-container');
    const count = 35;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 3 + 1;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.left = Math.random() * 45 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.backgroundColor = `rgba(242, 185, 13, ${Math.random() * 0.4 + 0.1})`;
        container.appendChild(p);
        particles.push(p);

        // Animate each particle
        animateParticle(p);
    }
}

function animateParticle(p) {
    const duration = Math.random() * 5 + 4;
    const delay = Math.random() * 3;
    gsap.to(p, {
        y: -(Math.random() * 200 + 80),
        x: (Math.random() - 0.5) * 60,
        opacity: Math.random() * 0.5 + 0.1,
        duration: duration,
        delay: delay,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
    });
}

// ───── Lamp Toggle ─────
function toggleLamp() {
    // Chain pull animation
    chainContainer.classList.remove('chain-pull');
    void chainContainer.offsetWidth;
    chainContainer.classList.add('chain-pull');

    isLampOn = !isLampOn;

    if (isLampOn) {
        // Turn ON
        body.classList.remove('lamp-off');

        // Instant card reveal — no heavy filters
        gsap.to(loginCard, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            clearProps: "filter"
        });

        gsap.to(header, { opacity: 1, duration: 0.2, ease: "power2.out" });

        // Show particles
        particles.forEach((p) => {
            gsap.to(p, {
                opacity: Math.random() * 0.5 + 0.1,
                duration: 0.3,
            });
        });

        // Show fireflies
        fireflies.forEach((f) => {
            gsap.to(f, { opacity: 1, duration: 0.4 });
        });

    } else {
        // Turn OFF
        body.classList.add('lamp-off');

        // Hide the card with GSAP (overrides any inline styles from ON animation)
        gsap.to(loginCard, {
            opacity: 0,
            y: 6,
            scale: 0.99,
            duration: 0.25,
            ease: "power2.in"
        });

        gsap.to(header, { opacity: 0.25, duration: 0.2, ease: "power2.in" });

        // Hide particles
        particles.forEach((p, i) => {
            gsap.to(p, { opacity: 0, duration: 0.25, delay: i * 0.005 });
        });

        // Hide fireflies
        fireflies.forEach((f) => {
            gsap.to(f, { opacity: 0, duration: 0.25 });
        });
    }
}

// ───── Password Toggle ─────
function togglePasswordVisibility() {
    const input = document.getElementById('input-password');
    const icon = document.getElementById('pw-icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
    } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
    }
}

// ───── Login Handler (demo) ─────
function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('signin-btn');
    const btnText = document.getElementById('btn-text');
    const loader = document.getElementById('btn-loader');

    btnText.textContent = 'Signing in...';
    loader.classList.remove('hidden');
    btn.disabled = true;
    btn.style.opacity = '0.8';

    setTimeout(() => {
        btnText.textContent = 'Sign In to Platform';
        loader.classList.add('hidden');
        btn.disabled = false;
        btn.style.opacity = '1';
    }, 2000);
}

// ───── Entrance Animations ─────
function playEntrance() {
    // Stagger in the card children
    gsap.from('#login-card > *', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.3,
    });

    // Lamp entrance
    gsap.from('#lamp-shade', {
        y: -40,
        opacity: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.6)",
        delay: 0.1,
    });

    gsap.from('#lamp-glow', {
        scale: 0,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3,
    });

    // Header
    gsap.from('#main-header', {
        y: -20,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
    });
}

// ───── Fireflies ─────
function createFireflySVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 30 28');
    svg.innerHTML = `
        <!-- Left Wing -->
        <ellipse class="wing-left" cx="9" cy="10" rx="7" ry="4"
            fill="rgba(200,200,255,0.15)" stroke="rgba(200,200,255,0.25)" stroke-width="0.5"/>
        <!-- Right Wing -->
        <ellipse class="wing-right" cx="21" cy="10" rx="7" ry="4"
            fill="rgba(200,200,255,0.15)" stroke="rgba(200,200,255,0.25)" stroke-width="0.5"/>
        <!-- Antennae -->
        <line x1="13" y1="8" x2="9" y2="3" stroke="rgba(200,200,200,0.4)" stroke-width="0.6" stroke-linecap="round"/>
        <line x1="17" y1="8" x2="21" y2="3" stroke="rgba(200,200,200,0.4)" stroke-width="0.6" stroke-linecap="round"/>
        <circle cx="9" cy="2.5" r="0.8" fill="rgba(200,200,200,0.35)"/>
        <circle cx="21" cy="2.5" r="0.8" fill="rgba(200,200,200,0.35)"/>
        <!-- Head -->
        <ellipse cx="15" cy="9" rx="2.5" ry="2" fill="#2a2520"/>
        <!-- Thorax -->
        <ellipse cx="15" cy="13" rx="2.8" ry="2.5" fill="#332d25"/>
        <!-- Abdomen (glowing) -->
        <g class="glow-abdomen">
            <ellipse cx="15" cy="19" rx="3" ry="4.5" fill="#f2b90d"/>
            <ellipse cx="15" cy="19" rx="2" ry="3" fill="#ffe066" opacity="0.6"/>
        </g>
        <!-- Legs -->
        <line x1="13" y1="12" x2="9" y2="16" stroke="rgba(150,130,100,0.4)" stroke-width="0.5"/>
        <line x1="17" y1="12" x2="21" y2="16" stroke="rgba(150,130,100,0.4)" stroke-width="0.5"/>
        <line x1="12.5" y1="14" x2="8.5" y2="18" stroke="rgba(150,130,100,0.4)" stroke-width="0.5"/>
        <line x1="17.5" y1="14" x2="21.5" y2="18" stroke="rgba(150,130,100,0.4)" stroke-width="0.5"/>
    `;
    return svg;
}

function createFireflies() {
    const container = document.getElementById('particles-container');
    const count = 10;

    for (let i = 0; i < count; i++) {
        const fly = document.createElement('div');
        fly.classList.add('firefly');

        // Randomize animation speeds per firefly
        const flapSpeed = (0.1 + Math.random() * 0.12).toFixed(2) + 's';
        const glowSpeed = (1.2 + Math.random() * 2).toFixed(1) + 's';
        fly.style.setProperty('--flap-speed', flapSpeed);
        fly.style.setProperty('--glow-speed', glowSpeed);

        // Random size variation
        const scale = 0.7 + Math.random() * 0.8;
        fly.style.transform = `scale(${scale})`;

        const svg = createFireflySVG();
        fly.appendChild(svg);

        // Random starting position
        fly.style.left = (Math.random() * 80 + 5) + '%';
        fly.style.top = (Math.random() * 70 + 10) + '%';

        container.appendChild(fly);
        fireflies.push(fly);

        animateFirefly(fly, scale);
    }
}

function animateFirefly(fly, scale) {
    let lastX = 0;

    function wander() {
        const xMove = (Math.random() - 0.5) * 220;
        const yMove = (Math.random() - 0.5) * 160;
        const duration = 3 + Math.random() * 4;

        // Rotate to face movement direction
        const angle = Math.atan2(yMove, xMove) * (180 / Math.PI) + 90;
        // Flip horizontally based on direction
        const flipX = xMove < 0 ? -1 : 1;

        gsap.to(fly, {
            x: '+=' + xMove,
            y: '+=' + yMove,
            rotation: angle,
            scaleX: scale * flipX,
            scaleY: scale,
            duration: duration,
            ease: "sine.inOut",
            onComplete: wander
        });

        lastX = xMove;
    }

    gsap.delayedCall(Math.random() * 2, wander);
}

// ───── Init ─────
document.addEventListener('DOMContentLoaded', () => {
    // Start with lamp OFF
    document.body.classList.add('lamp-off');
    if (loginCard) {
        loginCard.style.opacity = '0';
        loginCard.style.transform = 'translateY(6px) scale(0.99)';
    }
    if (header) header.style.opacity = '0.25';

    createParticles();
    createFireflies();
    initCursorRepulsion();
});

// ───── Cursor Repulsion for Fireflies ─────
let mouseX = -1000;
let mouseY = -1000;
const REPEL_RADIUS = 120;  // How close the cursor needs to be
const REPEL_FORCE = 80;    // How far they flee

function initCursorRepulsion() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Reset when mouse leaves the window
    document.addEventListener('mouseleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    // Check proximity every frame
    function checkProximity() {
        if (!isLampOn) {
            requestAnimationFrame(checkProximity);
            return;
        }

        fireflies.forEach((fly) => {
            const rect = fly.getBoundingClientRect();
            const flyX = rect.left + rect.width / 2;
            const flyY = rect.top + rect.height / 2;

            const dx = flyX - mouseX;
            const dy = flyY - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < REPEL_RADIUS && dist > 0) {
                // Calculate repulsion direction (away from cursor)
                const angle = Math.atan2(dy, dx);
                const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
                const pushX = Math.cos(angle) * force;
                const pushY = Math.sin(angle) * force;

                // Quick flee animation
                gsap.to(fly, {
                    x: '+=' + pushX,
                    y: '+=' + pushY,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            }
        });

        requestAnimationFrame(checkProximity);
    }

    requestAnimationFrame(checkProximity);
}
