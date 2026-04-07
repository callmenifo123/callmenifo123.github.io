// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    cursor: {
        speed: 0.55,
        labels: {
            'project-card': 'VIEW',
            'contact-email': 'EMAIL',
            'contact-phone': 'CALL',
            'process-step': 'PROCESS',
            'capability-item': 'SKILL',
            'default': 'OPEN'
        }
    },
    magnetic: {
        strength: 0.25,
        cardTiltStrength: 3
    },
    parallax: {
        speed: 0.035,
        depth: 10
    },
    animations: {
        intro: {
            welcomeDelay: 500,
            worldDelay: 2000,
            elementsDelay: 2800,
            exitDelay: 4200,
            removeDelay: 5600
        },
        stagger: 80,
        pulseMin: 1000,
        pulseMax: 3000
    }
};

const STATE = {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
};

// ==========================================
// INTRO ANIMATION SEQUENCE
// ==========================================

function initIntroSequence() {
    const introOverlay = document.querySelector('.intro-overlay');
    const introWelcome = document.querySelector('.intro-welcome');
    const introWorld = document.querySelector('.intro-world');
    const abstractElements = document.querySelectorAll('.abstract-element');
    const heroContent = document.querySelector('.hero-content');
    const logo = document.querySelector('.logo-container');
    const scrollProgress = document.querySelector('.scroll-progress');
    
    const { welcomeDelay, worldDelay, elementsDelay, exitDelay, removeDelay } = CONFIG.animations.intro;
    
    setTimeout(() => introWelcome?.classList.add('animate'), welcomeDelay);
    
    setTimeout(() => {
        introWelcome?.classList.add('move-up');
        introWorld?.classList.add('animate');
    }, worldDelay);
    
    setTimeout(() => {
        abstractElements.forEach((el, i) => {
            setTimeout(() => el.classList.add('wake'), i * 200);
        });
    }, elementsDelay);
    
    setTimeout(() => {
        introOverlay?.classList.add('exit');
        heroContent?.classList.add('visible');
        logo?.classList.add('visible');
        scrollProgress?.classList.add('visible');
    }, exitDelay);
    
    setTimeout(() => {
        introOverlay?.classList.add('hidden');
    }, removeDelay);
}

// ==========================================
// CUSTOM CURSOR SYSTEM
// ==========================================

const cursor = {
    dot: null,
    ring: null,
    label: null,
    container: null,
    pos: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    
    init() {
        if (STATE.isTouchDevice) return;
        
        this.dot = document.querySelector('.cursor-dot');
        this.ring = document.querySelector('.cursor-ring');
        this.label = document.querySelector('.cursor-label');
        this.container = document.querySelector('.cursor');
        
        if (!this.dot || !this.ring) return;
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            this.dot.style.left = this.mouse.x + 'px';
            this.dot.style.top = this.mouse.y + 'px';
        });
        
        this.render();
        this.addHoverEffects();
    },
    
    render() {
        this.pos.x += (this.mouse.x - this.pos.x) * CONFIG.cursor.speed;
        this.pos.y += (this.mouse.y - this.pos.y) * CONFIG.cursor.speed;
        
        this.ring.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0) translate(-50%, -50%)`;
        this.label.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y - 50}px, 0) translate(-50%, -50%)`;
        
        requestAnimationFrame(() => this.render());
    },
    
    addHoverEffects() {
        const hoverTargets = document.querySelectorAll('a, .project-card, .process-step, .capability-item, [data-magnetic]');
        
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                this.container.classList.add('hover');
                const label = this.getLabel(target);
                if (label) {
                    this.label.textContent = label;
                    this.container.classList.add('show-label');
                }
            });
            
            target.addEventListener('mouseleave', () => {
                this.container.classList.remove('hover', 'show-label');
            });
        });
    },
    
    getLabel(element) {
        for (const [className, label] of Object.entries(CONFIG.cursor.labels)) {
            if (className === 'default') continue;
            if (element.classList.contains(className)) return label;
        }
        return element.tagName === 'A' ? CONFIG.cursor.labels.default : '';
    }
};

// ==========================================
// MAGNETIC EFFECT - FIXED FOR ALL CARDS
// ==========================================

function initMagneticEffect() {
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    
    magneticElements.forEach(el => {
        // CRITICAL FIX: Store original transition and temporarily disable it
        const originalTransition = window.getComputedStyle(el).transition;
        
        el.addEventListener('mouseenter', () => {
            // Disable CSS transitions during magnetic interaction
            el.style.transition = 'none';
        });
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const moveX = x * CONFIG.magnetic.strength;
            const moveY = y * CONFIG.magnetic.strength;
            
            // Special handling for project cards with 3D tilt
            if (el.classList.contains('project-card')) {
                const tiltX = ((e.clientX - rect.left) / rect.width - 0.5) * CONFIG.magnetic.cardTiltStrength;
                const tiltY = ((e.clientY - rect.top) / rect.height - 0.5) * CONFIG.magnetic.cardTiltStrength;
                
                el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) rotateY(${tiltX}deg) rotateX(${-tiltY}deg)`;
            } else {
                el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
            }
        });
        
        el.addEventListener('mouseleave', () => {
            // Re-enable transitions for smooth return
            el.style.transition = originalTransition;
            el.style.transform = '';
            
            // Clear inline transition after animation completes
            setTimeout(() => {
                el.style.transition = '';
            }, 600);
        });
    });
}

// ==========================================
// PARALLAX LAYERS
// ==========================================

function initParallax() {
    if (STATE.prefersReducedMotion) return;
    
    const layers = document.querySelectorAll('.parallax-layer');
    if (layers.length === 0) return;
    
    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    });
    
    function animate() {
        currentX += (mouseX - currentX) * CONFIG.parallax.speed;
        currentY += (mouseY - currentY) * CONFIG.parallax.speed;
        
        layers.forEach((layer, i) => {
            const depth = (i + 1) * CONFIG.parallax.depth;
            const moveX = currentX * depth;
            const moveY = currentY * depth;
            layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ==========================================
// SCROLL PROGRESS
// ==========================================

let scrollRAF = null;

function updateScrollProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const currentSection = document.querySelector('.current-section');
    
    if (!progressFill || !currentSection) return;
    
    const isMobileLayout = window.innerWidth < 768;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const maxScroll = documentHeight - windowHeight;
    const progress = Math.min((scrollTop / maxScroll) * 100, 100);
    
    if (isMobileLayout) {
        progressFill.style.width = progress + '%';
        progressFill.style.height = '100%';
    } else {
        progressFill.style.height = progress + '%';
        progressFill.style.width = '';
    }
    
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            currentSection.textContent = String(i + 1).padStart(2, '0');
        }
    });
}

function handleScroll() {
    if (scrollRAF) return;
    scrollRAF = requestAnimationFrame(() => {
        updateScrollProgress();
        scrollRAF = null;
    });
}

// ==========================================
// SCROLL REVEAL
// ==========================================

function initScrollReveal() {
    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -120px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('[data-reveal]').forEach(el => {
        observer.observe(el);
    });
}

// ==========================================
// FLOATING STICKS PULSE
// ==========================================

function initSticksPulse() {
    if (STATE.prefersReducedMotion) return;
    
    const sticks = document.querySelectorAll('.stick');
    if (sticks.length === 0) return;
    
    function randomPulse() {
        const randomStick = sticks[Math.floor(Math.random() * sticks.length)];
        randomStick.classList.add('pulse');
        
        setTimeout(() => {
            randomStick.classList.remove('pulse');
        }, 1000);
        
        const nextDelay = CONFIG.animations.pulseMin + Math.random() * (CONFIG.animations.pulseMax - CONFIG.animations.pulseMin);
        setTimeout(randomPulse, nextDelay);
    }
    
    setTimeout(randomPulse, 3000);
}

// ==========================================
// CLICK FEEDBACK
// ==========================================

function initClickFeedback() {
    document.addEventListener('mousedown', (e) => {
        const target = e.target.closest('.project-card, .process-step, .capability-item, .glass, .glass-soft');
        if (!target) return;
        
        target.style.transition = 'transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)';
        const currentTransform = target.style.transform || '';
        
        if (currentTransform) {
            target.style.transform = currentTransform + ' scale(0.97)';
        } else {
            target.style.transform = 'scale(0.97)';
        }
        
        setTimeout(() => {
            target.style.transform = currentTransform;
            setTimeout(() => {
                target.style.transition = '';
            }, 150);
        }, 150);
    });
}

// ==========================================
// TOUCH CARD ACCORDION
// ==========================================

function initTouchCards() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const wasExpanded = card.classList.contains('expanded');
            
            // Close all cards (accordion behavior)
            cards.forEach(c => c.classList.remove('expanded'));
            
            // Toggle clicked card
            if (!wasExpanded) {
                card.classList.add('expanded');
                // Scroll expanded card into better view
                setTimeout(() => {
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 350);
            }
        });
    });
    
    // Tap outside cards to close
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.project-card')) {
            cards.forEach(c => c.classList.remove('expanded'));
        }
    });
}

// ==========================================
// COPY ON CLICK (email / phone)
// ==========================================

function initCopyOnClick() {
    document.querySelectorAll('[data-copy]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const text = el.getAttribute('data-copy');
            navigator.clipboard.writeText(text).then(() => {
                showCopyToast(text);
            });
        });
    });
}

function showCopyToast(text) {
    const existing = document.querySelector('.copy-toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'copy-toast';
    toast.textContent = 'Copied!';
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    }, 1600);
}

// ==========================================
// PREVENT UNWANTED INTERACTIONS
// ==========================================

function preventUnwantedInteractions() {
    // Context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (['s', 'p', 'f'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        }
    });
}

// ==========================================
// PERFORMANCE OPTIMIZATIONS
// ==========================================

function optimizePerformance() {
    // Add will-change to animated elements
    const animatedElements = document.querySelectorAll('[data-magnetic], .parallax-layer, .cursor-ring');
    animatedElements.forEach(el => {
        el.style.willChange = 'transform';
    });
    
    // Remove will-change after animations settle
    setTimeout(() => {
        animatedElements.forEach(el => {
            el.style.willChange = 'auto';
        });
    }, 10000);
}

// ==========================================
// INITIALIZE EVERYTHING
// ==========================================

function init() {
    try {
        const isDesktopWidth = window.innerWidth >= 1200;
        const isMobile = window.innerWidth < 768;
        const isDesktop = isDesktopWidth && !STATE.isTouchDevice;
        
        // Adjust intro timing for mobile (shorter: 5.6s → 3.2s)
        if (isMobile) {
            CONFIG.animations.intro.worldDelay = 1000;
            CONFIG.animations.intro.elementsDelay = 1500;
            CONFIG.animations.intro.exitDelay = 2200;
            CONFIG.animations.intro.removeDelay = 3200;
        }
        
        // Core animations
        initIntroSequence();
        
        // Desktop-only interactions
        if (isDesktop) {
            cursor.init();
            setTimeout(() => initMagneticEffect(), 100);
            initClickFeedback();
        }
        
        // Parallax + sticks only on desktop
        if (!STATE.prefersReducedMotion && isDesktop) {
            initParallax();
            initSticksPulse();
        }
        
        // Touch interactions for tablet/mobile
        if (!isDesktop) {
            initTouchCards();
        }
        
        // Scroll interactions (all devices)
        window.addEventListener('scroll', handleScroll, { passive: true });
        updateScrollProgress();
        initScrollReveal();
        initCopyOnClick();
        
        // Prevent interactions
        preventUnwantedInteractions();
        
        // Performance (desktop only)
        if (isDesktop) {
            optimizePerformance();
        }
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Handle visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy animations when tab is hidden
        document.body.style.setProperty('--reduced-motion', '1');
    } else {
        document.body.style.removeProperty('--reduced-motion');
    }
});