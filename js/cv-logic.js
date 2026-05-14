// ==============================================
// Fayl: js/cv-logic.js
// Təsvir: CV Generator - Stepper idarəsi,
//         real-vaxt önizləmə, LinkedIn analiz.
// ==============================================

class CvGenerator {
    constructor() {
        this.currentStep = 1;
        this.cvData = {};
        this.init();
    }

    init() {
        this.bindStepperClicks();
        this.bindStepperButtons();
        this.bindTabSwitching();
        this.bindLinkedInAnalyzer();
        this.bindDownloadButton();
        this.bindRealTimePreview();
    }

    // Stepper üzərinə kliklə keçid
    bindStepperClicks() {
        document.querySelectorAll('.step').forEach(stepEl => {
            stepEl.addEventListener('click', () => {
                const step = parseInt(stepEl.getAttribute('data-step'));
                // Yalnız tamamlanmış və ya aktiv addımlara keçməyə icazə ver
                if (step <= this.currentStep + 1) {
                    this.goToStep(step);
                }
            });
        });
    }

    // İrəli / Geri düymələri
    bindStepperButtons() {
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const next = parseInt(e.target.closest('.next-step').getAttribute('data-next'));
                if (next) this.goToStep(next);
            });
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prev = parseInt(e.target.closest('.prev-step').getAttribute('data-prev'));
                if (prev) this.goToStep(prev);
            });
        });
    }

    goToStep(step) {
        if (step < 1 || step > 4) return;

        // Əgər irəli gedirsə, cari addımın məlumatlarını topla
        if (step > this.currentStep) {
            if (!this.validateCurrentStep()) return;
            this.collectStepData();
        }

        this.currentStep = step;

        // Formları dəyiş
        document.querySelectorAll('.step-form').forEach(f => f.classList.remove('active'));
        const activeForm = document.querySelector(`[data-step-form="${step}"]`);
        if (activeForm) activeForm.classList.add('active');

        // Stepper vizuallarını yenilə
        document.querySelectorAll('.step').forEach(s => {
            const sNum = parseInt(s.getAttribute('data-step'));
            s.classList.remove('active', 'completed');
            if (sNum === step) s.classList.add('active');
            else if (sNum < step) s.classList.add('completed');
        });

        // Son addımda önizləməni göstər
        if (step === 4) {
            this.collectAllData();
            this.renderPreview();
        }
    }

    validateCurrentStep() {
        if (this.currentStep === 1) {
            const firstName = document.getElementById('cv-first-name')?.value.trim();
            const email = document.getElementById('cv-email')?.value.trim();
            if (!firstName || !email) {
                alert('Zəhmət olmasa ən azı Ad və Email sahələrini doldurun.');
                return false;
            }
            if (!email.includes('@')) {
                alert('Zəhmət olmasa düzgün email ünvanı daxil edin.');
                return false;
            }
        }
        return true;
    }

    collectStepData() {
        // Addım 1
        if (this.currentStep === 1) {
            this.cvData.firstName = document.getElementById('cv-first-name')?.value || '';
            this.cvData.lastName = document.getElementById('cv-last-name')?.value || '';
            this.cvData.email = document.getElementById('cv-email')?.value || '';
            this.cvData.phone = document.getElementById('cv-phone')?.value || '';
        }
        // Addım 2
        if (this.currentStep === 2) {
            this.cvData.experience = document.getElementById('cv-experience')?.value || '';
            this.cvData.education = document.getElementById('cv-education')?.value || '';
        }
        // Addım 3
        if (this.currentStep === 3) {
            this.cvData.skills = document.getElementById('cv-skills')?.value || '';
            this.cvData.languages = document.getElementById('cv-languages')?.value || '';
        }
    }

    collectAllData() {
        this.cvData.firstName = document.getElementById('cv-first-name')?.value || this.cvData.firstName || '';
        this.cvData.lastName = document.getElementById('cv-last-name')?.value || this.cvData.lastName || '';
        this.cvData.email = document.getElementById('cv-email')?.value || this.cvData.email || '';
        this.cvData.phone = document.getElementById('cv-phone')?.value || this.cvData.phone || '';
        this.cvData.experience = document.getElementById('cv-experience')?.value || this.cvData.experience || '';
        this.cvData.education = document.getElementById('cv-education')?.value || this.cvData.education || '';
        this.cvData.skills = document.getElementById('cv-skills')?.value || this.cvData.skills || '';
        this.cvData.languages = document.getElementById('cv-languages')?.value || this.cvData.languages || '';
    }

    renderPreview() {
        const fullName = `${this.cvData.firstName || ''} ${this.cvData.lastName || ''}`.trim() || 'Ad Soyad';
        const contact = [this.cvData.email, this.cvData.phone].filter(Boolean).join(' | ') || 'email@example.com';

        document.getElementById('preview-full-name').innerText = fullName;
        document.getElementById('preview-contact').innerText = contact;
        document.getElementById('preview-experience').innerText = this.cvData.experience || '—';
        document.getElementById('preview-education').innerText = this.cvData.education || '—';
        document.getElementById('preview-skills').innerText = this.cvData.skills || '—';
        document.getElementById('preview-languages').innerText = this.cvData.languages || '—';

        // AI Xülasə (Mock)
        const summaryEl = document.getElementById('preview-summary');
        if (summaryEl) {
            summaryEl.innerHTML = '<span class="typing-indicator"><span></span><span></span><span></span></span>';
            setTimeout(() => {
                summaryEl.innerHTML = `${fullName} – ${this.cvData.skills ? this.cvData.skills.split(',')[0].trim() + ' sahəsində' : 'peşəkar'} təcrübəyə malik, nəticəyönümlü mütəxəssis. ` +
                    `Komanda ilə effektiv işləmə və problem həll etmə bacarıqlarına sahibdir. ` +
                    `${this.cvData.languages ? this.cvData.languages : 'Çoxdilli'} ünsiyyət qabiliyyəti ilə seçilir.`;
            }, 1200);
        }
    }

    // Real-vaxt önizləmə (son addımda manual redaktə üçün)
    bindRealTimePreview() {
        const inputIds = ['cv-first-name', 'cv-last-name', 'cv-email', 'cv-phone', 
                         'cv-experience', 'cv-education', 'cv-skills', 'cv-languages'];
        
        inputIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => {
                    if (this.currentStep === 4) {
                        this.collectAllData();
                        this.renderPreview();
                    }
                });
            }
        });
    }

    // Tab keçidi
    bindTabSwitching() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.getAttribute('data-tab');
                
                // Aktiv tab
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Aktiv məzmun
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${target}`)?.classList.add('active');
            });
        });
    }

    // LinkedIn Analizator
    bindLinkedInAnalyzer() {
        const btn = document.getElementById('btn-analyze-linkedin');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            const url = document.getElementById('linkedin-url')?.value || '';
            if (!url.trim() || !url.includes('linkedin.com')) {
                alert('Zəhmət olmasa düzgün LinkedIn profil linki daxil edin.');
                return;
            }

            const panel = document.getElementById('linkedin-result-panel');
            const indicator = document.getElementById('linkedin-typing-indicator');
            const output = document.getElementById('linkedin-result');

            panel.classList.remove('hidden');
            indicator.classList.remove('hidden');
            output.innerHTML = '';
            btn.disabled = true;

            // Mock analiz
            setTimeout(() => {
                indicator.classList.add('hidden');
                output.innerHTML = 
                    '**Professional Xülasə:**\n\n' +
                    '✅ Profil tamlığı: 85%\n' +
                    '✅ Açar sözlər optimallaşdırılıb\n' +
                    '⚠️ Təcrübə bölməsində daha çox kəmiyyət məlumatı əlavə edin\n' +
                    '⚠️ "Haqqında" bölməsi daha təsirli ola bilər\n\n' +
                    '**Tövsiyələr:**\n' +
                    '1. Profil şəklinizi peşəkar foto ilə yeniləyin\n' +
                    '2. Hər iş təcrübəsinə ən azı 2 nailiyyət əlavə edin\n' +
                    '3. Bacarıqlar siyahısına "Süni İntellekt" əlavə edin';
                btn.disabled = false;
            }, 2000);
        });
    }

    // CV Yükləmə
    bindDownloadButton() {
        const btn = document.getElementById('btn-download-cv');
        if (!btn) return;

        btn.addEventListener('click', () => {
            this.collectAllData();
            
            const fullName = `${this.cvData.firstName || ''} ${this.cvData.lastName || ''}`.trim();
            const cvText = `
CV | ${fullName}
====================================
📧 ${this.cvData.email || '—'}
📞 ${this.cvData.phone || '—'}

🎯 Peşəkar Xülasə:
${document.getElementById('preview-summary')?.innerText || '—'}

💼 İş Təcrübəsi:
${this.cvData.experience || '—'}

🎓 Təhsil:
${this.cvData.education || '—'}

⚡ Bacarıqlar:
${this.cvData.skills || '—'}

🌐 Dillər:
${this.cvData.languages || '—'}
====================================
Nexus AI tərəfindən hazırlanmışdır.
            `.trim();

            const blob = new Blob([cvText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CV_${fullName.replace(/\s/g, '_')}.txt`;
            a.click();
            URL.revokeObjectURL(url);

            // İstifadəçiyə bildiriş
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Yükləndi!';
            btn.style.background = '#34C759';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.background = '';
            }, 2000);
        });
    }
}

// ===== PROFESSIONAL SƏHİFƏ İNİT =====
let cvGeneratorInstance = null;

export function initProfessionalPage() {
    if (document.getElementById('tab-cv-generator') && !cvGeneratorInstance) {
        cvGeneratorInstance = new CvGenerator();
    }
}