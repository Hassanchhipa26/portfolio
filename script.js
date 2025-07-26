// ===== Global Variables =====
let isScrolling = false;
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

// ===== Loading Screen =====
class LoadingScreen {
  constructor() {
    this.loadingScreen = document.getElementById('loading');
    this.init();
  }

  init() {
    // Simulate loading time
    setTimeout(() => {
      this.hide();
    }, 2500);
  }

  hide() {
    this.loadingScreen.classList.add('hidden');
    // Remove from DOM after transition
    setTimeout(() => {
      this.loadingScreen.remove();
    }, 500);
  }
}

// ===== Typewriter Effect =====
class TypeWriter {
  constructor(element, texts, speed = 100, deleteSpeed = 50, pauseTime = 2000) {
    this.element = element;
    this.texts = texts;
    this.speed = speed;
    this.deleteSpeed = deleteSpeed;
    this.pauseTime = pauseTime;
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.init();
  }

  init() {
    this.type();
  }

  type() {
    const currentText = this.texts[this.textIndex];
    
    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.charIndex + 1);
      this.charIndex++;
    }

    let typeSpeed = this.isDeleting ? this.deleteSpeed : this.speed;

    if (!this.isDeleting && this.charIndex === currentText.length) {
      typeSpeed = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// ===== Smooth Scrolling Navigation ===== [FIXED]
class SmoothNavigation {
  constructor() {
    this.header = document.getElementById('header');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.sections = document.querySelectorAll('section');
    this.menuIcon = document.getElementById('menu-icon');
    this.navbar = document.getElementById('navbar');
    this.init();
  }

  init() {
    this.bindEvents();
    this.createScrollSpy();
    this.handleHeaderScroll();
  }

  bindEvents() {
    // Mobile menu toggle - FIXED VERSION
    this.menuIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.menuIcon.classList.toggle('active');
      this.navbar.classList.toggle('active');
      
      // Prevent body scroll when menu is open
      if (this.navbar.classList.contains('active')) {
        document.body.classList.add('menu-open');
      } else {
        document.body.classList.remove('menu-open');
      }
    });

    // Close mobile menu on link click - IMPROVED
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          this.scrollToSection(targetSection);
          this.closeMobileMenu();
        }
      });
    });

    // IMPROVED outside click detection
    document.addEventListener('click', (e) => {
      if (!this.navbar.contains(e.target) && 
          !this.menuIcon.contains(e.target) && 
          this.navbar.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });

    // ADD escape key to close menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.navbar.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });
  }

  scrollToSection(target) {
    const headerHeight = this.header.offsetHeight;
    const targetPosition = target.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

  closeMobileMenu() {
    this.menuIcon.classList.remove('active');
    this.navbar.classList.remove('active');
    document.body.classList.remove('menu-open'); // Remove body scroll lock
  }

  createScrollSpy() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeLink = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
          if (activeLink) {
            this.navLinks.forEach(link => link.classList.remove('active'));
            activeLink.classList.add('active');
          }
        }
      });
    }, observerOptions);

    this.sections.forEach(section => {
      observer.observe(section);
    });
  }

  handleHeaderScroll() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Add scrolled class for styling
      if (scrollTop > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, false);
  }
}

// ===== Scroll Animations =====
class ScrollAnimations {
  constructor() {
    this.animateElements = document.querySelectorAll('[data-animate]');
    this.init();
  }

  init() {
    this.createObserver();
    this.animateOnScroll();
  }

  createObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          this.triggerSpecialAnimations(entry.target);
        }
      });
    }, observerOptions);

    this.animateElements.forEach(element => {
      observer.observe(element);
    });
  }

  triggerSpecialAnimations(element) {
    // Animate skill progress bars
    if (element.classList.contains('skill-card')) {
      const progressBar = element.querySelector('.skill-progress');
      const level = progressBar.getAttribute('data-level');
      setTimeout(() => {
        progressBar.style.width = level + '%';
      }, 300);
    }

    // Animate education score bars
    if (element.classList.contains('edu-card')) {
      const scoreFill = element.querySelector('.score-fill');
      if (scoreFill) {
        const percentage = scoreFill.getAttribute('data-percentage');
        setTimeout(() => {
          scoreFill.style.width = percentage + '%';
        }, 500);
      }
    }

    // Animate stats numbers
    if (element.classList.contains('stat-item')) {
      const numberElement = element.querySelector('.stat-number');
      const finalNumber = numberElement.textContent.replace(/[^\d]/g, '');
      if (finalNumber) {
        this.animateNumber(numberElement, 0, parseInt(finalNumber), 2000);
      }
    }
  }

  animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    const original = element.textContent;

    const timer = setInterval(() => {
      current += increment;
      const suffix = original.replace(/\d+/g, '');
      element.textContent = current + suffix;
      
      if (current === end) {
        clearInterval(timer);
      }
    }, stepTime);
  }

  animateOnScroll() {
    // Add custom scroll animations
    window.addEventListener('scroll', () => {
      if (isScrolling) return;
      
      isScrolling = true;
      requestAnimationFrame(() => {
        this.parallaxEffect();
        isScrolling = false;
      });
    });
  }

  parallaxEffect() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-shapes .shape');
    
    parallaxElements.forEach((element, index) => {
      const speed = 0.5 + (index * 0.1);
      const yPos = -(scrolled * speed);
      element.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }
}

// ===== Interactive Elements =====
class InteractiveElements {
  constructor() {
    this.init();
  }

  init() {
    this.createMouseFollower();
    this.addHoverEffects();
    this.handleFormInteractions();
    this.createParticleEffect();
  }

  createMouseFollower() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * 0.1;
      cursorY += (mouseY - cursorY) * 0.1;
      
      cursor.style.left = cursorX + 'px';
      cursor.style.top = cursorY + 'px';
      
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Add cursor styles
    const cursorStyles = `
      .custom-cursor {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
      }
      .cursor-dot {
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
      }
      .cursor-ring {
        width: 30px;
        height: 30px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        position: absolute;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
      }
      .custom-cursor.hover .cursor-ring {
        width: 50px;
        height: 50px;
        border-color: rgba(99, 102, 241, 0.8);
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = cursorStyles;
    document.head.appendChild(styleSheet);
  }

  addHoverEffects() {
    const hoverElements = document.querySelectorAll('a, button, .skill-card, .edu-card, .hobby-item, .gallery-item');
    const cursor = document.querySelector('.custom-cursor');

    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        if (cursor) cursor.classList.add('hover');
        element.style.transform = 'translateY(-5px)';
      });

      element.addEventListener('mouseleave', () => {
        if (cursor) cursor.classList.remove('hover');
        element.style.transform = 'translateY(0)';
      });
    });
  }

  handleFormInteractions() {
    const form = document.getElementById('contactForm');
    const inputs = form.querySelectorAll('input, textarea');

    // Enhanced form validation and interactions
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement.classList.remove('focused');
        }
      });

      input.addEventListener('input', () => {
        this.validateField(input);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit(form);
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldContainer = field.parentElement;
    
    // Remove existing validation classes
    fieldContainer.classList.remove('valid', 'invalid');
    
    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && emailRegex.test(value)) {
        fieldContainer.classList.add('valid');
      } else if (value) {
        fieldContainer.classList.add('invalid');
      }
    }
    
    // Required field validation
    if (field.hasAttribute('required')) {
      if (value) {
        fieldContainer.classList.add('valid');
      } else {
        fieldContainer.classList.add('invalid');
      }
    }
  }

  handleFormSubmit(form) {
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    
    // Animate submit button
    submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission
    setTimeout(() => {
      this.showNotification('Message sent successfully!', 'success');
      form.reset();
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
      // Remove focused classes
      form.querySelectorAll('.input-field').forEach(field => {
        field.classList.remove('focused', 'valid', 'invalid');
      });
    }, 2000);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="bx ${type === 'success' ? 'bx-check-circle' : 'bx-info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Add notification styles
    const notificationStyles = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 4px solid var(--primary-color);
        border-radius: 10px;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
      }
      .notification.show {
        transform: translateX(0);
      }
      .notification-success {
        border-left-color: #10b981;
      }
      .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: white;
      }
      .notification-content i {
        font-size: 1.2rem;
      }
    `;

    if (!document.querySelector('#notification-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'notification-styles';
      styleSheet.textContent = notificationStyles;
      document.head.appendChild(styleSheet);
    }

    // Animate notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove notification
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  createParticleEffect() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: 0.3;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2
    });

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 50; i++) {
        particles.push(createParticle());
      }
    };

    const updateParticles = () => {
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) +
            Math.pow(particle.y - otherParticle.y, 2)
          );

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - distance / 100)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    initParticles();
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
  }
}

// ===== Performance Optimization =====
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.optimizeImages();
    this.preloadCriticalResources();
    this.implementLazyLoading();
  }

  optimizeImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" for better performance
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add error handling
      img.addEventListener('error', () => {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Im0xNSA5LTYgNi02LTYiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
      });
    });
  }

  preloadCriticalResources() {
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'style';
      document.head.appendChild(link);
    });
  }

  implementLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    
    const lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const src = element.getAttribute('data-lazy');
          
          if (src) {
            element.src = src;
            element.removeAttribute('data-lazy');
            lazyObserver.unobserve(element);
          }
        }
      });
    });

    lazyElements.forEach(element => {
      lazyObserver.observe(element);
    });
  }
}

// ===== Theme System =====
class ThemeSystem {
  constructor() {
    this.currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
    this.init();
  }

  init() {
    this.applyTheme();
    this.createThemeToggle();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  createThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="bx bx-moon"></i>';
    themeToggle.setAttribute('aria-label', 'Toggle Theme');
    
    // Add theme toggle styles
    const toggleStyles = `
      .theme-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: var(--bg-glass);
        backdrop-filter: blur(10px);
        border: 1px solid var(--border-glass);
        border-radius: 50%;
        color: var(--text-primary);
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .theme-toggle:hover {
        transform: scale(1.1);
        border-color: var(--primary-color);
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = toggleStyles;
    document.head.appendChild(styleSheet);
    
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', () => this.toggleTheme());
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    localStorage.setItem('portfolio-theme', this.currentTheme);
    
    const themeToggle = document.querySelector('.theme-toggle i');
    themeToggle.className = this.currentTheme === 'dark' ? 'bx bx-moon' : 'bx bx-sun';
  }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize loading screen
  new LoadingScreen();
  
  // Initialize navigation
  new SmoothNavigation();
  
  // Initialize typewriter effect
  const typewriter = document.getElementById('typewriter');
  if (typewriter) {
    new TypeWriter(typewriter, [
      'BCA Student',
      'Web Developer',
      'UI/UX Designer',
      'Problem Solver',
      'Creative Thinker'
    ], 100, 50, 2000);
  }
  
  // Initialize scroll animations
  new ScrollAnimations();
  
  // Initialize interactive elements
  new InteractiveElements();
  
  // Initialize performance optimization
  new PerformanceOptimizer();
  
  // Initialize theme system
  new ThemeSystem();
  
  // Add smooth scroll polyfill for older browsers
  if (!('scrollBehavior' in document.documentElement.style)) {
    import('https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js')
      .then(module => {
        module.polyfill();
      });
  }
});

// ===== Additional Utility Functions =====

// Debounce function for performance
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Pause animations when tab is not visible
    document.body.style.animationPlayState = 'paused';
  } else {
    // Resume animations when tab becomes visible
    document.body.style.animationPlayState = 'running';
  }
});

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
  console.error('Portfolio Error:', e.error);
  // Could send error to analytics service
});

console.log('🚀 Portfolio loaded successfully!');
console.log('Built with modern web technologies and best practices.');
console.log('© 2025 Mohammed Hassan - All rights reserved.');