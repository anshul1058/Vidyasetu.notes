// book-widget.js - Book Widget Interaction + Cursor Tracking

document.addEventListener("DOMContentLoaded", () => {
    const wrapper = document.getElementById('book-widget-wrapper');
    const bookContainer = document.getElementById('book-container');
    const bubble = document.getElementById('ask-bubble');
    const pupils = document.querySelectorAll('.avatar-pupil');
    const eyes = document.querySelectorAll('.avatar-eye');

    if (!wrapper) return;

    // ═══════════════════════════════════════
    // Cursor Tracking for Pupils
    // ═══════════════════════════════════════
    document.addEventListener('mousemove', (e) => {
        if (!eyes || eyes.length === 0) return;

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        eyes.forEach((eye) => {
            const pupil = eye.querySelector('.avatar-pupil');
            if (!pupil) return;

            // Get eye position
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;

            // Calculate angle between eye and cursor
            const angle = Math.atan2(mouseY - eyeCenterY, mouseX - eyeCenterX);

            // Calculate pupil offset (max distance = 1.5px for the pupil movement)
            const pupilDistance = 1.5;
            const pupilX = Math.cos(angle) * pupilDistance;
            const pupilY = Math.sin(angle) * pupilDistance;

            // Apply transform with smooth transition
            pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
        });
    });

    // ═══════════════════════════════════════
    // Toggle Chatbot with State Management
    // ═══════════════════════════════════════
    const existingToggle = window.toggleChatbot;
    if (existingToggle) {
        window.toggleChatbot = function() {
            existingToggle();

            // Check chatbot panel visibility to determine state
            const panel = document.getElementById('chatbot-panel');
            if (!panel) return;

            const isOpen = !panel.classList.contains('hidden');

            if (isOpen) {
                // Panel opens → animate
                wrapper.classList.add('is-open');
                bookContainer.classList.add('was-open');
                if (bubble) bubble.textContent = 'Listening... 🎧';
            } else {
                // Panel closes → animate back
                wrapper.classList.remove('is-open');
                if (bubble) bubble.textContent = 'Ask me! ✨';
                // Remove was-open after animation completes
                setTimeout(() => {
                    bookContainer.classList.remove('was-open');
                }, 400);
            }
        };
    }
});
