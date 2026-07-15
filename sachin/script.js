document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Header & Navigation Behavior
    // ==========================================
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Header Scroll State
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Hamburger Toggle
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars-staggered';
        }
    });

    // Close menu when clicking nav link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.querySelector('i').className = 'fa-solid fa-bars-staggered';
        });
    });

    // Active Navigation Highlighting on Scroll
    const sections = document.querySelectorAll('section');
    const navObserverOptions = {
        root: null,
        threshold: 0.3,
        rootMargin: "-10% 0px -70% 0px"
    };

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, navObserverOptions);

    sections.forEach(section => {
        navObserver.observe(section);
    });

    // ==========================================
    // 2. Typing Animation (Hero Section)
    // ==========================================
    const typingTextElement = document.getElementById('typing-text');
    const phrases = [
        "transformCareer(); // returns 'Success'",
        "fabricateECEProjectKit(); // loaded",
        "initializeWebDesign(); // html & css ready",
        "connectMySQLDatabase(); // php operational",
        "buildAndroidApplication(); // gradle build finished"
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingTextElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingTextElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            // Wait before starting deletion
            isDeleting = true;
            typingSpeed = 2000; 
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }
    // Start typing loop
    type();

    // ==========================================
    // 3. Tab Contents Switching (Services & Academic Categories)
    // ==========================================
    
    // Main Service Horizontal Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Deactivate former active states
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Set current tab active
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Vertical Academic Projects Category Tabs
    const vTabButtons = document.querySelectorAll('.v-tab-btn');
    const vTabContents = document.querySelectorAll('.v-tab-content');

    vTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetVTab = btn.getAttribute('data-vtab');

            vTabButtons.forEach(b => b.classList.remove('active'));
            vTabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetVTab).classList.add('active');
        });
    });

    // ==========================================
    // 4. Testimonials Slider
    // ==========================================
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    const sliderDots = document.querySelectorAll('.slider-dots .slider-dot');
    let currentSlide = 0;

    function showSlide(index) {
        // Wrap-around bounds checks
        if (index >= testimonialSlides.length) currentSlide = 0;
        else if (index < 0) currentSlide = testimonialSlides.length - 1;
        else currentSlide = index;

        // Reset and display active
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        sliderDots.forEach(dot => dot.classList.remove('active'));

        testimonialSlides[currentSlide].classList.add('active');
        sliderDots[currentSlide].classList.add('active');
    }

    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

    sliderDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.getAttribute('data-index'), 10);
            showSlide(idx);
        });
    });

    // Auto rotate testimonials
    let testimonialTimer = setInterval(() => showSlide(currentSlide + 1), 6000);

    // Reset timer on manual navigation click
    [prevBtn, nextBtn, ...sliderDots].forEach(el => {
        el.addEventListener('click', () => {
            clearInterval(testimonialTimer);
            testimonialTimer = setInterval(() => showSlide(currentSlide + 1), 8000);
        });
    });

    // ==========================================
    // 5. Scroll Reveals, Count Animation & Skills Filling
    // ==========================================
    
    // Skills Progress Bar animation
    const progressBars = document.querySelectorAll('.skill-progress-bar');
    const percentTexts = document.querySelectorAll('.skill-percentage');
    let skillsAnimated = false;

    function animateSkills() {
        if (skillsAnimated) return;
        skillsAnimated = true;

        progressBars.forEach((bar, index) => {
            const percentElement = percentTexts[index];
            const targetVal = parseInt(percentElement.getAttribute('data-val'), 10);
            bar.style.width = targetVal + '%';

            // Counting percent texts
            let curVal = 0;
            const stepTime = Math.abs(Math.floor(1500 / targetVal));
            const countInterval = setInterval(() => {
                curVal++;
                percentElement.textContent = curVal + '%';
                if (curVal >= targetVal) {
                    clearInterval(countInterval);
                }
            }, stepTime);
        });
    }

    // Performance Stats Count Animation
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;

        statNumbers.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // ~60fps
            let current = 0;

            const updateCount = () => {
                current += increment;
                if (current < target) {
                    num.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCount);
                } else {
                    num.textContent = target;
                }
            };
            requestAnimationFrame(updateCount);
        });
    }

    // Scroll Reveal & Intersection Observers
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it's the skills & stats section, trigger their respective animations
                if (entry.target.id === 'skills-section') {
                    animateSkills();
                    animateStats();
                }
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Handle viewport triggers if page loaded with skills section in view
    setTimeout(() => {
        const skillsSection = document.getElementById('skills-section');
        const rect = skillsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            animateSkills();
            animateStats();
        }
    }, 500);

    // ==========================================
    // 6. Contact Form API integration & Success Modal
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const submitBtn = document.getElementById('form-submit-btn');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Grab inputs
        const nameVal = document.getElementById('name').value;
        const emailVal = document.getElementById('email').value;
        const phoneVal = document.getElementById('phone').value;
        const messageVal = document.getElementById('message').value;

        // Visual indicator on submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin-pulse"></i>';

        // Actual network API request to backend server
        fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: nameVal,
                email: emailVal,
                phone: phoneVal,
                message: messageVal
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server response failed');
            }
            return response.json();
        })
        .then(data => {
            // Show modal on success
            successModal.classList.add('active');
            contactForm.reset();
        })
        .catch(err => {
            console.error('Contact Form submission failed:', err);
            alert('Failed to send message. Please verify the backend server is running and try again.');
        })
        .finally(() => {
            // Reset button to initial text
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';
        });
    });

    // Close modal triggers
    closeModalBtn.addEventListener('click', () => {
        successModal.classList.remove('active');
    });

    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.classList.remove('active');
        }
    });

});
