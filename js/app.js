// ==============================================
// Fayl: js/app.js
// Təsvir: Əsas tətbiq məntiqi - Naviqasiya, Tema,
//         Bütün hadisə bağlamaları.
// ==============================================

import { initAcademicPage } from './ai-handler.js';
import { initProfessionalPage } from './cv-logic.js';
import { initBusinessPage } from './ai-handler.js';

class NexusApp {
    constructor() {
        this.currentPage = 'home';
        this.sidebar = document.getElementById('sidebar');
        this.mobileToggle = document.getElementById('mobile-menu-toggle');
        
        this.init();
    }

    init() {
        this.initTheme();
        this.initNavigation();
        this.initMobileMenu();
        this.initPageModules();
    }

    // ===== TEMA =====
    initTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        const htmlElement = document.documentElement;
        const icon = themeToggle.querySelector('i');
        
        // Saxlanmış tema
        const savedTheme = localStorage.getItem('nexus-theme') || 'dark';
        htmlElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(icon, savedTheme);

        themeToggle.addEventListener('click', () => {
            const current = htmlElement.getAttribute('data-theme');
            const newTheme = current === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('nexus-theme', newTheme);
            this.updateThemeIcon(icon, newTheme);
        });
    }

    updateThemeIcon(icon, theme) {
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            icon.parentElement.setAttribute('aria-label', 'İşıq temaya keç');
        } else {
            icon.className = 'fas fa-moon';
            icon.parentElement.setAttribute('aria-label', 'Qaranlıq temaya keç');
        }
    }

    // ===== NAVİQASİYA =====
    initNavigation() {
        // Bütün naviqasiya edilə bilən elementlər
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-page]');
            if (!trigger) return;
            
            e.preventDefault();
            const page = trigger.getAttribute('data-page');
            if (page) this.navigateTo(page);
        });
    }

    navigateTo(page) {
        if (this.currentPage === page) return;
        this.currentPage = page;

        // Bütün səhifələri gizlət
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });

        // Hədəf səhifəni göstər
        const target = document.getElementById(`page-${page}`);
        if (target) {
            target.classList.add('active');
        }

        // Aktiv naviqasiya linkini yenilə
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });

        // Scroll yuxarı
        document.getElementById('main-content').scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Mobil menyunu bağla
        if (this.sidebar.classList.contains('open')) {
            this.sidebar.classList.remove('open');
        }

        // Səhifə modullarını yenidən init et (lazım olsa)
        this.initPageModules();
    }

    // ===== MOBİL MENYU =====
    initMobileMenu() {
        if (!this.mobileToggle) return;

        this.mobileToggle.addEventListener('click', () => {
            this.sidebar.classList.toggle('open');
        });

        // Sidebar xaricinə klikləyəndə bağla
        document.addEventListener('click', (e) => {
            const isClickInside = this.sidebar.contains(e.target) || 
                                  this.mobileToggle.contains(e.target);
            if (!isClickInside && this.sidebar.classList.contains('open')) {
                this.sidebar.classList.remove('open');
            }
        });
    }

    // ===== SƏHİFƏ MODULLARI =====
    initPageModules() {
        // Akademik
        if (document.getElementById('btn-process-academic')) {
            initAcademicPage();
        }
        // Professional
        if (document.getElementById('tab-cv-generator')) {
            initProfessionalPage();
        }
        // Biznes
        if (document.getElementById('btn-review-reply')) {
            initBusinessPage();
        }
    }
}

// ===== TƏTBİQİ BAŞLAT =====
document.addEventListener('DOMContentLoaded', () => {
    window.nexusApp = new NexusApp();
});