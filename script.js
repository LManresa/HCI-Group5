document.addEventListener('DOMContentLoaded', () => {
    const gallerySection = document.querySelector('.gallery-section');
    const galleryImgs = document.querySelectorAll('.gallery-img');
    let rafId = null;

    if (gallerySection && galleryImgs.length) {
        const spacing = Math.round(window.innerHeight * 0.65);
        const baseOffset = Math.round(window.innerHeight * 0.28);

        function layoutImages() {
            galleryImgs.forEach((img, i) => {
                const top = baseOffset + i * spacing;
                img.style.top = `${top}px`;
                img.style.left = '50%';
                img.style.transform = 'translateX(-50%) scale(1)';
                img.style.transition = 'transform 0.45s cubic-bezier(.22,1,.36,1), filter 0.35s ease, opacity 0.35s ease';
                img.style.willChange = 'transform, opacity, filter';
            });
            const neededHeight = baseOffset + (galleryImgs.length - 1) * spacing + window.innerHeight * 1.0;
            gallerySection.style.minHeight = `${neededHeight}px`;
            gallerySection.style.paddingBottom = '12rem';
        }

        function updateGallery() {
            const scrollY = window.scrollY || window.pageYOffset;
            const winH = window.innerHeight;
            const viewportCenter = scrollY + winH / 2;
            const secRect = gallerySection.getBoundingClientRect();
            const secTop = scrollY + secRect.top;

            galleryImgs.forEach((img, i) => {
                const imgTop = secTop + parseFloat(img.style.top || 0);
                const imgCenter = imgTop + img.offsetHeight / 2;
                const dist = imgCenter - viewportCenter; 

                const maxDist = winH * 0.9;
                const t = Math.max(-1, Math.min(1, dist / maxDist));

                const translateY = -t * 80; // px

                const scale = 1 - Math.abs(t) * 0.18;

                const opacity = Math.max(0.12, 1 - Math.abs(t) * 0.9);

                const blurThreshold = 0.18;
                const rawBlur = Math.max(0, Math.abs(t) - blurThreshold) / (1 - blurThreshold);
                const blur = Math.min(6, rawBlur * 6); // px

                const brightness = 1 + (1 - Math.abs(t)) * 0.05;

                const parallaxX = -t * 20;
                const xOffset = parallaxX;

                img.style.transform = `translateX(calc(-50% + ${xOffset}px)) translateY(${translateY}px) scale(${scale})`;
                img.style.opacity = `${opacity}`;
                img.style.filter = `blur(${blur}px) brightness(${brightness})`;

                if (Math.abs(t) < 0.12) {
                    img.classList.add('active');
                    img.classList.add('floating');
                } else if (Math.abs(t) < 0.4) {
                    img.classList.add('active');
                    img.classList.remove('floating');
                } else {
                    img.classList.remove('active');
                    img.classList.remove('floating');
                }
            });
        }

        // Use requestAnimationFrame for smooth updates
        let needsUpdate = true;
        function onScrollOrResize() {
            needsUpdate = true;
            if (!rafId) rafId = requestAnimationFrame(tick);
        }

        function tick() {
            rafId = null;
            if (needsUpdate) {
                updateGallery();
                needsUpdate = false;
            }
        }

        layoutImages();
        updateGallery();
        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', () => { layoutImages(); onScrollOrResize(); });
    }
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.style.color = '#e5e5e5';
                });
                
                const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.style.color = '#10b981';
                }
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });

    const fadeElements = document.querySelectorAll('.text-card, .method-card, .protocol-step, .interview-card, .survey-card, .req-row, .conclusion-card');
    
    const updateElementOpacity = () => {
        const viewportTop = window.scrollY;
        const viewportBottom = viewportTop + window.innerHeight;
        const fadeZone = window.innerHeight * 0.2;
        
        fadeElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + viewportTop;
            const elementBottom = elementTop + rect.height;
            const elementCenter = elementTop + rect.height / 2;
            
            let opacity = 1;
            let blur = 0;
            
            if (elementCenter < viewportTop + fadeZone) {
                const distanceFromTop = elementCenter - viewportTop;
                opacity = Math.max(0, distanceFromTop / fadeZone);
                blur = (1 - opacity) * 8;
            }
            else if (elementCenter > viewportBottom - fadeZone) {
                const distanceFromBottom = viewportBottom - elementCenter;
                opacity = Math.max(0, distanceFromBottom / fadeZone);
                blur = (1 - opacity) * 8;
            }
            else {
                opacity = 1;
                blur = 0;
            }
            
            const scale = 0.95 + (opacity * 0.05);
            
            element.style.opacity = opacity;
            element.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
            element.style.transform = `scale(${scale})`;
            element.style.transition = 'opacity 0.3s ease-out, filter 0.3s ease-out, transform 0.3s ease-out';
        });
    };
    
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateElementOpacity, 10);
    });
    
    updateElementOpacity();

    const hero = document.querySelector('.hero-section');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (hero && scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.4}px)`;
            hero.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    });

    const glowElements = document.querySelectorAll('.method-card, .protocol-step, .interview-card, .survey-card');
    
    glowElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            element.style.setProperty('--mouse-x', `${x}px`);
            element.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const currentSection = [...sections].find(section => {
                const rect = section.getBoundingClientRect();
                return rect.top >= 0 && rect.top < window.innerHeight / 2;
            });
            
            if (currentSection) {
                const currentIndex = [...sections].indexOf(currentSection);
                let targetIndex;
                
                if (e.key === 'ArrowDown') {
                    targetIndex = Math.min(currentIndex + 1, sections.length - 1);
                } else {
                    targetIndex = Math.max(currentIndex - 1, 0);
                }
                
                sections[targetIndex].scrollIntoView({ behavior: 'smooth' });
            }
        }
    });

    window.addEventListener('load', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });

    console.log('%c🚀 Furniture Exchange Platform', 'color: #10b981; font-size: 24px; font-weight: bold;');
    console.log('%cResearch-backed requirements summary', 'color: #06b6d4; font-size: 14px;');
    console.log('%cNavigate with: Arrow Keys Up/Down | Click Navigation Links', 'color: #a0a0a0; font-size: 12px;');
});
