/**
 * Sebastian Gerken Portfolio - Main JavaScript
 * Vanilla JS, no dependencies
 */

(function() {
  'use strict';

  // ==================== CONFIGURATION ====================
  const CONFIG = {
    roles: [
      {
        title: 'Traffic Engineer',
        tags: ['Traffic Flow', 'Signal Timing', 'Safety Analysis', 'Simulation']
      },
      {
        title: 'Computer Vision Specialist',
        tags: ['OpenCV', 'YOLO', 'Object Tracking', 'Calibration']
      },
      {
        title: 'GeoSpatial Data Scientist',
        tags: ['QGIS', 'Spatial Analysis', 'Mapping', 'GeoPandas']
      },
      {
        title: 'Software Developer',
        tags: ['Python', 'R', 'Agentic Coding', 'Data Pipelines']
      }
    ],
    typeSpeed: 70,
    deleteSpeed: 35,
    pauseBetweenRoles: 2500,
    scrollThreshold: 0.15,
    parallaxStrength: 0.3
  };

  // Obfuscated contact data (Base64 encoded)
  const CONTACT = {
    name: 'U2ViYXN0aWFuIEdlcmtlbg==',
    street: 'TmV1ZXIgV2VnIDI5',
    city: 'Njk0MTIgRWJlcmJhY2g=',
    country: 'RGV1dHNjaGxhbmQ=',
    email: 'c2ViYXN0aWFuLWdlcmtlbkBob3RtYWlsLmNvbQ==',
    phone: 'KzQ5IDE3NiAzNDIwODgyMw=='
  };

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Decode Base64 string
   */
  function decode(str) {
    try {
      return atob(str);
    } catch (e) {
      return str;
    }
  }

  /**
   * Throttle function for scroll events
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Debounce function
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Check if reduced motion is preferred
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ==================== DOM ELEMENTS ====================
  const DOM = {};

  function initDOM() {
    DOM.header = document.querySelector('.header');
    DOM.menuToggle = document.querySelector('.menu-toggle');
    DOM.nav = document.querySelector('.nav');
    DOM.roleText = document.querySelector('.hero__role-text');
    DOM.tagsContainer = document.querySelector('.hero__tags');
    DOM.reveals = document.querySelectorAll('.reveal');
    DOM.timelineItems = document.querySelectorAll('.timeline__item');
    DOM.timelineLineFill = document.querySelector('.timeline__line-fill');
    DOM.parallaxElements = document.querySelectorAll('[data-parallax]');
    DOM.projectsGrid = document.querySelector('.projects__grid');
    DOM.timelineContainer = document.querySelector('.timeline__items');
    DOM.contactElements = document.querySelectorAll('[data-contact]');
    DOM.addressElements = document.querySelectorAll('[data-address]');
    DOM.langToggle = document.querySelectorAll('.lang-toggle__btn');
    DOM.pageLoader = document.querySelector('.page-loader');
  }

  // ==================== STATE ====================
  const state = {
    currentRoleIndex: 0,
    isTyping: false,
    lastScrollY: 0,
    headerVisible: true,
    roleAnimationId: null
  };

  // ==================== ROLE ROTATION ====================
  const RoleRotation = {
    init() {
      if (!DOM.roleText || !DOM.tagsContainer) return;
      if (prefersReducedMotion()) {
        this.showStaticRole();
        return;
      }
      this.typeRole();
    },

    showStaticRole() {
      const role = CONFIG.roles[0];
      DOM.roleText.textContent = role.title;
      this.showTags(role.tags);
    },

    async typeRole() {
      const role = CONFIG.roles[state.currentRoleIndex];

      // Clear existing tags
      this.clearTags();

      // Type the role title
      await this.typeText(role.title);

      // Show tags with stagger
      await this.showTags(role.tags);

      // Wait before deleting
      await this.wait(CONFIG.pauseBetweenRoles);

      // Delete the text
      await this.deleteText();

      // Move to next role
      state.currentRoleIndex = (state.currentRoleIndex + 1) % CONFIG.roles.length;

      // Continue the loop
      state.roleAnimationId = requestAnimationFrame(() => this.typeRole());
    },

    typeText(text) {
      return new Promise(resolve => {
        let i = 0;
        DOM.roleText.textContent = '';

        const type = () => {
          if (i < text.length) {
            DOM.roleText.textContent += text.charAt(i);
            i++;
            setTimeout(type, CONFIG.typeSpeed);
          } else {
            resolve();
          }
        };
        type();
      });
    },

    deleteText() {
      return new Promise(resolve => {
        const deleteChar = () => {
          const text = DOM.roleText.textContent;
          if (text.length > 0) {
            DOM.roleText.textContent = text.slice(0, -1);
            setTimeout(deleteChar, CONFIG.deleteSpeed);
          } else {
            resolve();
          }
        };
        deleteChar();
      });
    },

    showTags(tags) {
      return new Promise(resolve => {
        DOM.tagsContainer.innerHTML = '';

        if (tags.length === 0) {
          resolve();
          return;
        }

        tags.forEach((tag, index) => {
          setTimeout(() => {
            const span = document.createElement('span');
            span.className = 'tag';
            span.textContent = tag;

            if (index === 0) {
              span.classList.add('tag--highlight');
            }

            DOM.tagsContainer.appendChild(span);

            if (index === tags.length - 1) {
              resolve();
            }
          }, index * 100);
        });
      });
    },

    clearTags() {
      const tags = DOM.tagsContainer.querySelectorAll('.tag');
      tags.forEach(tag => {
        tag.style.opacity = '0';
        tag.style.transform = 'scale(0.8)';
      });
    },

    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    destroy() {
      if (state.roleAnimationId) {
        cancelAnimationFrame(state.roleAnimationId);
      }
    }
  };

  // ==================== SCROLL ANIMATIONS ====================
  const ScrollAnimations = {
    observer: null,

    init() {
      if (prefersReducedMotion()) {
        this.showAll();
        return;
      }

      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          root: null,
          rootMargin: '0px 0px -50px 0px',
          threshold: CONFIG.scrollThreshold
        }
      );

      // Observe reveal elements
      DOM.reveals.forEach(el => this.observer.observe(el));

      // Observe timeline items
      DOM.timelineItems.forEach(el => this.observer.observe(el));
    },

    showAll() {
      DOM.reveals.forEach(el => el.classList.add('is-visible'));
      DOM.timelineItems.forEach(el => el.classList.add('is-visible'));
    },

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          // Update timeline line fill
          if (entry.target.classList.contains('timeline__item')) {
            this.updateTimelineFill();
          }
        }
      });
    },

    updateTimelineFill() {
      if (!DOM.timelineLineFill) return;

      const items = document.querySelectorAll('.timeline__item');
      const visibleItems = document.querySelectorAll('.timeline__item.is-visible');

      if (items.length === 0) return;

      const percentage = (visibleItems.length / items.length) * 100;
      DOM.timelineLineFill.style.height = `${percentage}%`;
    },

    observe(element) {
      if (this.observer) {
        this.observer.observe(element);
      }
    }
  };

  // ==================== HEADER BEHAVIOR ====================
  const Header = {
    init() {
      window.addEventListener('scroll', throttle(this.handleScroll.bind(this), 100));
    },

    handleScroll() {
      const currentScrollY = window.scrollY;

      // Add scrolled class for background change
      if (currentScrollY > 50) {
        DOM.header.classList.add('header--scrolled');
      } else {
        DOM.header.classList.remove('header--scrolled');
      }

      // Hide/show header on scroll
      if (currentScrollY > state.lastScrollY && currentScrollY > 100) {
        if (state.headerVisible) {
          DOM.header.classList.add('header--hidden');
          state.headerVisible = false;
        }
      } else {
        if (!state.headerVisible) {
          DOM.header.classList.remove('header--hidden');
          state.headerVisible = true;
        }
      }

      state.lastScrollY = currentScrollY;
    }
  };

  // ==================== MOBILE NAVIGATION ====================
  const MobileNav = {
    init() {
      if (!DOM.menuToggle || !DOM.nav) return;

      DOM.menuToggle.addEventListener('click', this.toggle.bind(this));

      // Close on nav link click
      DOM.nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', this.close.bind(this));
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') this.close();
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (DOM.nav.classList.contains('is-open') &&
            !DOM.header.contains(e.target)) {
          this.close();
        }
      });
    },

    toggle() {
      const isOpen = DOM.nav.classList.toggle('is-open');
      DOM.menuToggle.classList.toggle('is-active');
      DOM.menuToggle.setAttribute('aria-expanded', isOpen);

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    },

    close() {
      DOM.nav.classList.remove('is-open');
      DOM.menuToggle.classList.remove('is-active');
      DOM.menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };

  // ==================== SMOOTH SCROLL ====================
  const SmoothScroll = {
    init() {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', this.handleClick.bind(this));
      });
    },

    handleClick(e) {
      const href = e.currentTarget.getAttribute('href');
      if (href === '#' || href === '') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });

      // Update URL without scrolling
      history.pushState(null, '', href);
    }
  };

  // ==================== PARALLAX ====================
  const Parallax = {
    init() {
      if (prefersReducedMotion()) return;
      if (!DOM.parallaxElements.length) return;

      window.addEventListener('scroll', throttle(this.update.bind(this), 16));
    },

    update() {
      const scrollY = window.scrollY;

      DOM.parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || CONFIG.parallaxStrength;
        const yPos = -(scrollY * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    }
  };

  // ==================== CONTACT OBFUSCATION ====================
  const ContactProtection = {
    init() {
      this.decodeContactLinks();
      this.decodeAddressElements();
    },

    decodeContactLinks() {
      DOM.contactElements.forEach(el => {
        const type = el.dataset.contact;

        if (type === 'email') {
          const email = decode(CONTACT.email);
          el.href = `mailto:${email}`;
          if (el.dataset.showText !== 'false') {
            el.textContent = el.dataset.text || email;
          }
        } else if (type === 'phone') {
          const phone = decode(CONTACT.phone);
          el.href = `tel:${phone.replace(/\s/g, '')}`;
          if (el.dataset.showText !== 'false') {
            el.textContent = el.dataset.text || phone;
          }
        }
      });
    },

    decodeAddressElements() {
      DOM.addressElements.forEach(el => {
        const format = el.dataset.address;

        if (format === 'full') {
          el.innerHTML = `
            ${decode(CONTACT.name)}<br>
            ${decode(CONTACT.street)}<br>
            ${decode(CONTACT.city)}<br>
            ${decode(CONTACT.country)}
          `;
        } else if (format === 'inline') {
          el.textContent = `${decode(CONTACT.name)}, ${decode(CONTACT.street)}, ${decode(CONTACT.city)}, ${decode(CONTACT.country)}`;
        } else if (format === 'name') {
          el.textContent = decode(CONTACT.name);
        }
      });
    },

    getDecodedContact() {
      return {
        name: decode(CONTACT.name),
        street: decode(CONTACT.street),
        city: decode(CONTACT.city),
        country: decode(CONTACT.country),
        email: decode(CONTACT.email),
        phone: decode(CONTACT.phone)
      };
    }
  };

  // ==================== DATA LOADING ====================
  const DataLoader = {
    async loadProjects() {
      if (!DOM.projectsGrid) return;

      try {
        const response = await fetch('content/projects.json');
        if (!response.ok) throw new Error('Failed to load projects');
        const data = await response.json();
        this.renderProjects(data.projects.filter(p => p.featured));
      } catch (error) {
        console.warn('Projects data not available:', error.message);
        this.renderProjectsFallback();
      }
    },

    renderProjects(projects) {
      DOM.projectsGrid.innerHTML = projects.map(project => {
        const isComingSoon = project.status === 'coming-soon';
        const cardClass = isComingSoon ? 'card project-card project-card--coming-soon' : 'card project-card';

        return `
          <article class="${cardClass} reveal">
            <div class="project-card__image">
              ${project.image
                ? `<img src="${project.image}" alt="${project.title}" loading="lazy" width="400" height="225">`
                : `<div class="project-card__placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>`
              }
            </div>
            <div class="project-card__body">
              <h3 class="project-card__title">${project.title}</h3>
              <p class="project-card__description">${project.description}</p>
              ${project.tags.length > 0
                ? `<div class="project-card__tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                  </div>`
                : ''
              }
              ${!isComingSoon && (project.links.github || project.links.demo)
                ? `<div class="project-card__links">
                    ${project.links.demo
                      ? `<a href="${project.links.demo}" class="project-card__link" target="_blank" rel="noopener noreferrer">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                          Demo
                        </a>`
                      : ''
                    }
                    ${project.links.github
                      ? `<a href="${project.links.github}" class="project-card__link" target="_blank" rel="noopener noreferrer">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                          Code
                        </a>`
                      : ''
                    }
                  </div>`
                : ''
              }
            </div>
          </article>
        `;
      }).join('');

      // Observe new elements for scroll animations
      DOM.projectsGrid.querySelectorAll('.reveal').forEach(el => {
        ScrollAnimations.observe(el);
      });
    },

    renderProjectsFallback() {
      DOM.projectsGrid.innerHTML = `
        <article class="card project-card reveal">
          <div class="project-card__image">
            <div class="project-card__placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          </div>
          <div class="project-card__body">
            <h3 class="project-card__title">Multi-Camera Trajectory Fusion</h3>
            <p class="project-card__description">Diploma thesis project developing algorithms to merge vehicle trajectories from multiple overlapping camera views into unified traffic flow representations.</p>
            <div class="project-card__tags">
              <span class="tag">Python</span>
              <span class="tag">OpenCV</span>
              <span class="tag">YOLO</span>
              <span class="tag">Tracking</span>
            </div>
          </div>
        </article>
        <article class="card project-card project-card--coming-soon reveal">
          <div class="project-card__image">
            <div class="project-card__placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div class="project-card__body">
            <h3 class="project-card__title">More Projects Coming Soon</h3>
            <p class="project-card__description">Additional projects showcasing traffic engineering, computer vision, and software development work will be added here.</p>
          </div>
        </article>
      `;
    },

    async loadTimeline() {
      if (!DOM.timelineContainer) return;

      try {
        const response = await fetch('content/timeline.json');
        if (!response.ok) throw new Error('Failed to load timeline');
        const data = await response.json();
        this.renderTimeline(data.timeline);
      } catch (error) {
        console.warn('Timeline data not available:', error.message);
      }
    },

    renderTimeline(items) {
      // Reverse to show newest first
      const sortedItems = [...items].reverse();

      DOM.timelineContainer.innerHTML = sortedItems.map((item, index) => {
        const isCurrentClass = item.current ? 'timeline__item--current' : '';
        const typeClass = item.type === 'education' ? 'tag--education' : 'tag--work';
        const typeLabel = item.type === 'education' ? 'Education' : 'Work';

        return `
          <div class="timeline__item ${isCurrentClass}">
            <div class="timeline__dot"></div>
            <div class="timeline__content">
              <div class="timeline__header">
                <span class="timeline__period">${item.period}</span>
                <span class="tag timeline__type ${typeClass}">${typeLabel}</span>
                ${item.current ? '<span class="tag tag--highlight">Current</span>' : ''}
              </div>
              <h3 class="timeline__title">${item.title}</h3>
              <p class="timeline__org">${item.organization}</p>
              <p class="timeline__location">${item.location}</p>
              ${item.description ? `<p class="timeline__description">${item.description}</p>` : ''}
              ${item.highlights && item.highlights.length > 0
                ? `<div class="timeline__highlights">
                    ${item.highlights.map(h => `<span class="tag">${h}</span>`).join('')}
                  </div>`
                : ''
              }
            </div>
          </div>
        `;
      }).join('');

      // Update DOM references and observe new elements
      const timelineItems = document.querySelectorAll('.timeline__item');
      timelineItems.forEach(el => {
        ScrollAnimations.observe(el);
      });
    }
  };

  // ==================== LANGUAGE TOGGLE ====================
  const LanguageToggle = {
    init() {
      DOM.langToggle.forEach(btn => {
        btn.addEventListener('click', this.handleToggle.bind(this));
      });

      // Check for stored preference
      const stored = localStorage.getItem('preferredLanguage');
      if (stored) {
        this.setLanguage(stored);
      }
    },

    handleToggle(e) {
      const lang = e.currentTarget.dataset.lang;
      this.setLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
    },

    setLanguage(lang) {
      DOM.langToggle.forEach(btn => {
        btn.classList.toggle('lang-toggle__btn--active', btn.dataset.lang === lang);
      });

      // Future: Redirect to localized version or swap content
      document.documentElement.lang = lang;
    }
  };

  // ==================== PAGE LOADER ====================
  const PageLoader = {
    init() {
      if (!DOM.pageLoader) return;

      window.addEventListener('load', () => {
        setTimeout(() => {
          DOM.pageLoader.classList.add('is-hidden');
        }, 300);
      });

      // Fallback: hide loader after 3 seconds regardless
      setTimeout(() => {
        if (DOM.pageLoader) {
          DOM.pageLoader.classList.add('is-hidden');
        }
      }, 3000);
    }
  };

  // ==================== ACTIVE NAV LINK ====================
  const ActiveNavLink = {
    init() {
      const sections = document.querySelectorAll('section[id]');
      if (sections.length === 0) return;

      window.addEventListener('scroll', throttle(() => {
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;
          const sectionId = section.getAttribute('id');

          if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav__link').forEach(link => {
              link.classList.remove('nav__link--active');
              if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('nav__link--active');
              }
            });
          }
        });
      }, 100));
    }
  };

  // ==================== INITIALIZATION ====================
  function init() {
    initDOM();

    PageLoader.init();
    Header.init();
    MobileNav.init();
    RoleRotation.init();
    ScrollAnimations.init();
    SmoothScroll.init();
    Parallax.init();
    ContactProtection.init();
    LanguageToggle.init();
    ActiveNavLink.init();

    // Load dynamic content
    DataLoader.loadProjects();
    DataLoader.loadTimeline();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    RoleRotation.destroy();
  });

})();
