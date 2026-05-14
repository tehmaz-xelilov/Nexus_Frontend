// ==============================================
// Fayl: js/ai-handler.js
// Təsvir: Nexus AI Backend API ilə əlaqə.
//         Akademik, Biznes (Rəy + SMM) emalı.
//         Mock API əvəzinə canlı fetch sorğuları.
// ==============================================

// ===== BACKEND API BAZA URL =====
// Render.com-da deploy etdikdən sonra bu URL-i öz URL-inizlə əvəz edin.
// Məsələn: 'https://nexus-ai-backend.onrender.com/api'
const API_BASE_URL = 'https://nexus-ai-backend.onrender.com/api';

// ===== TYPING EFFECT (Mətnin hərf-hərf yazılması) =====
/**
 * Mətni hərf-hərf yazaraq göstərir.
 * @param {HTMLElement} element - Mətnin yazılacağı DOM elementi
 * @param {string} text - Yazılacaq mətn
 * @param {number} speed - Hər hərf arası millisaniyə (default: 20)
 * @param {Function|null} onComplete - Tamamlananda çağırılacaq funksiya
 * @returns {number} setInterval ID (lazım olsa dayandırmaq üçün)
 */
function typeWriter(element, text, speed = 20, onComplete = null) {
    let i = 0;
    element.innerHTML = '';
    element.classList.add('typing-effect');
    
    const timer = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            // Avtomatik scroll
            element.scrollTop = element.scrollHeight;
        } else {
            clearInterval(timer);
            element.classList.remove('typing-effect');
            if (onComplete) onComplete();
        }
    }, speed);
    
    return timer;
}

// ===== YÜKLƏMƏ GÖSTƏR/GİZLƏT =====
/**
 * Yükləmə panelini göstərir.
 * @param {string} panelId - Panel elementinin ID-si (məs: 'academic-output-panel')
 * @param {string} indicatorId - Typing indikatorunun ID-si
 * @param {string} outputId - Nəticə div-inin ID-si
 */
function showLoading(panelId, indicatorId, outputId) {
    const panel = document.getElementById(panelId);
    const indicator = document.getElementById(indicatorId);
    const output = document.getElementById(outputId);
    
    if (panel) panel.classList.remove('hidden');
    if (indicator) indicator.classList.remove('hidden');
    if (output) output.innerHTML = '';
}

/**
 * Typing indikatorunu gizlədir.
 * @param {string} indicatorId - Indikatorun ID-si
 */
function hideLoading(indicatorId) {
    const indicator = document.getElementById(indicatorId);
    if (indicator) indicator.classList.add('hidden');
}

// ===== ÜMUMİ API ÇAĞIRIŞ FUNKSİYASI =====
/**
 * Backend API-yə POST sorğusu göndərir.
 * @param {string} endpoint - API endpoint (məs: '/academic/summarize')
 * @param {Object} payload - Göndəriləcək data
 * @returns {Promise<Object>} API cavabı
 */
async function apiPost(endpoint, payload) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            // API-dən gələn xəta mesajını istifadəçiyə göstər
            throw new Error(data.message || `Server xətası: ${response.status}`);
        }

        return data;

    } catch (error) {
        console.error(`[API Xətası] ${endpoint}:`, error.message);
        
        // İnternet bağlantısı yoxdursa
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            throw new Error('Serverə qoşulmaq mümkün olmadı. İnternet bağlantınızı yoxlayın.');
        }
        
        // Digər xətaları qaytar
        throw error;
    }
}

// ============================================================
//                   AKADEMİK SƏHİFƏ
// ============================================================

/**
 * Akademik səhifəni inisializasiya edir.
 * Bütün hadisə bağlamalarını qurur.
 */
export function initAcademicPage() {
    const btnProcess = document.getElementById('btn-process-academic');
    const btnCopy = document.getElementById('btn-copy-academic');
    const btnDownload = document.getElementById('btn-download-academic');
    
    if (!btnProcess) return; // Səhifədə deyilik

    // ===== EMAL ET =====
    btnProcess.addEventListener('click', async () => {
        const typeSelect = document.getElementById('academic-type');
        const inputField = document.getElementById('academic-input');
        
        const type = typeSelect?.value || 'summarize';
        const text = inputField?.value?.trim() || '';
        
        // Validasiya
        if (!text) {
            alert('Zəhmət olmasa mətn daxil edin.');
            inputField?.focus();
            return;
        }
        
        if (text.length < 50) {
            alert('Zəhmət olmasa ən azı 50 simvoldan ibarət mətn daxil edin.');
            inputField?.focus();
            return;
        }

        // Yükləmə göstər
        showLoading('academic-output-panel', 'academic-typing-indicator', 'academic-output');
        btnProcess.disabled = true;
        btnCopy.disabled = true;
        btnDownload.disabled = true;

        try {
            // Backend API-yə sorğu
            const response = await apiPost('/academic/summarize', { text, type });

            if (response.success && response.data) {
                const output = document.getElementById('academic-output');
                
                // Typing effect ilə göstər
                typeWriter(output, response.data.result, 20, () => {
                    // Tamamlandı, düymələri aktivləşdir
                    btnProcess.disabled = false;
                    btnCopy.disabled = false;
                    btnDownload.disabled = false;
                });
            } else {
                throw new Error(response.message || 'Naməlum xəta baş verdi.');
            }

        } catch (error) {
            document.getElementById('academic-output').innerHTML = 
                `<p style="color: #FF375F;">❌ ${error.message}</p>`;
            btnProcess.disabled = false;
        } finally {
            hideLoading('academic-typing-indicator');
        }
    });

    // ===== KOPYALA =====
    if (btnCopy) {
        btnCopy.addEventListener('click', async () => {
            const output = document.getElementById('academic-output');
            const text = output?.innerText || '';
            
            if (!text.trim() || text.includes('Hazırlanmış mətn')) {
                alert('Kopyalamaq üçün əvvəlcə mətn emal edin.');
                return;
            }

            try {
                await navigator.clipboard.writeText(text);
                
                // Vizual geribildirim
                const originalHTML = btnCopy.innerHTML;
                btnCopy.innerHTML = '<i class="fas fa-check"></i> Kopyalandı!';
                btnCopy.style.background = '#34C759';
                btnCopy.style.color = '#FFFFFF';
                
                setTimeout(() => {
                    btnCopy.innerHTML = originalHTML;
                    btnCopy.style.background = '';
                    btnCopy.style.color = '';
                }, 2000);
            } catch {
                alert('Kopyalamaq mümkün olmadı. Manual seçib kopyalayın.');
            }
        });
    }

    // ===== YÜKLƏ =====
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            const output = document.getElementById('academic-output');
            const text = output?.innerText || '';
            
            if (!text.trim() || text.includes('Hazırlanmış mətn')) {
                alert('Yükləmək üçün əvvəlcə mətn emal edin.');
                return;
            }

            // Fayl yarat və yüklə
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nexus-ai-konspekt-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Vizual geribildirim
            const originalHTML = btnDownload.innerHTML;
            btnDownload.innerHTML = '<i class="fas fa-check"></i> Yükləndi!';
            btnDownload.style.background = '#34C759';
            btnDownload.style.color = '#FFFFFF';
            
            setTimeout(() => {
                btnDownload.innerHTML = originalHTML;
                btnDownload.style.background = '';
                btnDownload.style.color = '';
            }, 2000);
        });
    }
}

// ============================================================
//                   BİZNES SƏHİFƏ
// ============================================================

/**
 * Biznes səhifəsini inisializasiya edir.
 * Rəy Cavablayıcı və SMM İdeyalar üçün hadisələr.
 */
export function initBusinessPage() {
    initReviewReply();
    initSmmIdeas();
}

// --- RƏY CAVABLAYICI ---
function initReviewReply() {
    const btnReview = document.getElementById('btn-review-reply');
    if (!btnReview) return;

    btnReview.addEventListener('click', async () => {
        const inputField = document.getElementById('review-input');
        const review = inputField?.value?.trim() || '';
        
        if (!review) {
            alert('Zəhmət olmasa müştəri rəyini daxil edin.');
            inputField?.focus();
            return;
        }

        if (review.length < 10) {
            alert('Zəhmət olmasa ən azı 10 simvoldan ibarət rəy daxil edin.');
            inputField?.focus();
            return;
        }

        showLoading('review-output-panel', 'review-typing-indicator', 'review-output');
        btnReview.disabled = true;

        try {
            const response = await apiPost('/business/review-reply', { review });

            if (response.success && response.data) {
                const output = document.getElementById('review-output');
                typeWriter(output, response.data.reply, 25, () => {
                    btnReview.disabled = false;
                });
            } else {
                throw new Error(response.message || 'Cavab hazırlanarkən xəta baş verdi.');
            }

        } catch (error) {
            document.getElementById('review-output').innerHTML = 
                `<p style="color: #FF375F;">❌ ${error.message}</p>`;
            btnReview.disabled = false;
        } finally {
            hideLoading('review-typing-indicator');
        }
    });
}

// --- SMM İDEYALAR ---
function initSmmIdeas() {
    const btnSmm = document.getElementById('btn-smm-ideas');
    if (!btnSmm) return;

    btnSmm.addEventListener('click', async () => {
        const nicheSelect = document.getElementById('business-niche');
        const niche = nicheSelect?.value || 'restoran';
        
        showLoading('smm-output-panel', 'smm-typing-indicator', 'smm-output');
        btnSmm.disabled = true;

        try {
            const response = await apiPost('/business/smm-ideas', { niche });

            if (response.success && response.data) {
                const output = document.getElementById('smm-output');
                typeWriter(output, response.data.ideas, 20, () => {
                    btnSmm.disabled = false;
                });
            } else {
                throw new Error(response.message || 'İdeyalar hazırlanarkən xəta baş verdi.');
            }

        } catch (error) {
            document.getElementById('smm-output').innerHTML = 
                `<p style="color: #FF375F;">❌ ${error.message}</p>`;
            btnSmm.disabled = false;
        } finally {
            hideLoading('smm-typing-indicator');
        }
    });
}

// ============================================================
//          KÖHNƏ FUNKSİYALAR (Geri uyğunluq üçün)
// ============================================================

/**
 * @deprecated Artıq fetch API istifadə olunur.
 * Yalnız test üçün saxlanılıb.
 */
async function mockApiCall(endpoint, payload) {
    console.warn('[Deprecated] mockApiCall artıq istifadə olunmur. Canlı API istifadə edin.');
    // Təcili halda işlək mock cavablar
    return new Promise((resolve) => {
        setTimeout(() => {
            switch (endpoint) {
                case 'academic/summarize':
                    resolve({
                        success: true,
                        data: {
                            result: `📝 **Mühazirə Konspekti**\n\nBu test cavabıdır. Backend-i deploy etdikdən sonra canlı nəticələr gələcək.\n\n- Maddə 1\n- Maddə 2`,
                            type: 'summarize'
                        }
                    });
                    break;
                case 'business/review-reply':
                    resolve({
                        success: true,
                        data: {
                            reply: 'Hörmətli müştəri, dəyərli rəyiniz üçün təşəkkür edirik. (Test cavabı)',
                            sentiment: 'positive'
                        }
                    });
                    break;
                default:
                    resolve({ success: false, message: 'Backend-ə qoşulmayıb.' });
            }
        }, 1000);
    });
}

// ============================================================
//          QLOBAL SCOPE (HTML-dən birbaşa çağırış üçün)
// ============================================================

// Əgər HTML-də onclick ilə çağırılırsa, window-a əlavə et
if (typeof window !== 'undefined') {
    window.initAcademicPage = initAcademicPage;
    window.initBusinessPage = initBusinessPage;
}

// ============================================================
//          KONSOL MƏLUMATI (Development üçün)
// ============================================================

console.log(`
╔══════════════════════════════════════╗
║     Nexus AI - AI Handler v2.0      ║
║   Status:  🟢 Canlı API rejimi      ║
║   Backend: ${API_BASE_URL} ║
╚══════════════════════════════════════╝
`);