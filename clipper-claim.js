import { supabase, enforceRoleProtection } from './authentication/auth.js';

let sessionUser = null;
let sessionFullName = 'Pengguna'; 
let submissionsData = [];
let joinedActiveCampaigns = []; 
let userVerifiedAccounts = []; 

let realEarnings = 0;
let realWithdrawable = 0;
let isSensorActive = false;

function escapeHTML(str) {
    if (!str) return '';
    return str.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// SISTEM CUSTOM MODAL POP-UP
// ==========================================
window.showAlert = function(msg, type = 'info') {
    const m = document.getElementById('customAlertModal');
    const c = document.getElementById('customAlertContent');
    const icon = document.getElementById('alertIcon');
    const title = document.getElementById('alertTitle');
    document.getElementById('alertMessage').innerText = msg;

    if (type === 'success') {
        icon.className = 'w-16 h-16 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center justify-center mb-4';
        icon.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
        title.innerText = 'Berhasil';
    } else if (type === 'error') {
        icon.className = 'w-16 h-16 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full flex items-center justify-center mb-4';
        icon.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
        title.innerText = 'Gagal';
    } else {
        icon.className = 'w-16 h-16 bg-white/10 text-white border border-white/20 rounded-full flex items-center justify-center mb-4';
        icon.innerHTML = `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
        title.innerText = 'Informasi';
    }

    m.classList.remove('hidden'); m.classList.add('flex');
    setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); }, 10);
};

window.closeAlert = function() {
    const m = document.getElementById('customAlertModal');
    const c = document.getElementById('customAlertContent');
    m.classList.add('opacity-0'); c.classList.add('scale-95');
    setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
};

let confirmCallback = null;
window.showConfirm = function(msg, callback) {
    const m = document.getElementById('customConfirmModal');
    const c = document.getElementById('customConfirmContent');
    document.getElementById('confirmMessage').innerText = msg;
    confirmCallback = callback;

    m.classList.remove('hidden'); m.classList.add('flex');
    setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); }, 10);
};

window.closeConfirm = function() {
    const m = document.getElementById('customConfirmModal');
    const c = document.getElementById('customConfirmContent');
    m.classList.add('opacity-0'); c.classList.add('scale-95');
    setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    confirmCallback = null; 
};

document.getElementById('confirmYesBtn').addEventListener('click', () => {
    const cb = confirmCallback;
    window.closeConfirm();
    if (cb) cb();
});

// ==========================================
// FITUR MODAL MULTIPLE SUBMIT VIDEO
// ==========================================
let submitState = { step: 0, campaign: null, platform: null, account: null, videoUrls: [] };
window.refreshCooldown = 0;
let cooldownInterval = null;

window.toggleSubmitCampaignSelect = function() {
    const dropdown = document.getElementById('submit-campaign-options');
    dropdown.classList.toggle('hidden');
};

window.selectSubmitCampaign = function(id, title) {
    document.getElementById('submitCampaignValue').value = id;
    
    const textEl = document.getElementById('submit-campaign-selected-text');
    textEl.innerText = title;
    textEl.classList.remove('text-zinc-400');
    textEl.classList.add('text-white');
    
    document.getElementById('submit-campaign-options').classList.add('hidden');

    const camp = joinedActiveCampaigns.find(c => c.id === id);
    let infoText = "Campaign ini menerima video dari: ";
    if (camp && camp.platforms && camp.platforms.length > 0) {
        const platNames = [];
        if(camp.platforms.includes('tiktok')) platNames.push('TikTok');
        if(camp.platforms.includes('instagram')) platNames.push('Instagram Reels');
        if(camp.platforms.includes('youtube')) platNames.push('YouTube Shorts');
        infoText += platNames.join(', ');
    } else {
        infoText += "TikTok, Instagram Reels, dan YouTube Shorts";
    }
    infoText += ". Pastikan video bersifat publik.";
    document.getElementById('submitPlatformInfoText').innerText = infoText;

    window.fetchVideos(false);
};

window.openSubmitModal = function() {
    const container = document.getElementById('submit-campaign-options');
    const textEl = document.getElementById('submit-campaign-selected-text');
    const infoText = document.getElementById('submitPlatformInfoText');
    
    document.getElementById('submitCampaignValue').value = '';
    textEl.innerText = 'Pilih campaign kamu...';
    textEl.classList.add('text-zinc-400');
    textEl.classList.remove('text-white');
    infoText.innerText = "Pilih campaign terlebih dahulu untuk melihat platform yang diizinkan.";

    if (joinedActiveCampaigns.length === 0) {
        container.innerHTML = '<div class="px-4 py-3 text-sm text-zinc-500 text-center">Belum ada campaign aktif</div>';
    } else {
        let html = '';
        joinedActiveCampaigns.forEach(camp => {
            const safeTitle = escapeHTML(camp.title);
            html += `<div onclick="window.selectSubmitCampaign('${camp.id}', '${safeTitle.replace(/'/g, "\\'")}')" class="px-4 py-3 hover:bg-zinc-700 cursor-pointer text-sm text-white truncate border-b border-zinc-700/50 last:border-0">${safeTitle}</div>`;
        });
        container.innerHTML = html;
    }

    window.fetchVideos(false);

    const m = document.getElementById('submitVideoModal');
    const c = document.getElementById('submitVideoContent');
    m.classList.remove('hidden'); m.classList.add('flex');
    setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); }, 10);
};

window.closeSubmitModal = function() {
    const m = document.getElementById('submitVideoModal');
    const c = document.getElementById('submitVideoContent');
    m.classList.add('opacity-0'); c.classList.add('scale-95');
    setTimeout(() => { 
        m.classList.add('hidden'); 
        m.classList.remove('flex'); 
        
        submitState.videoUrls = []; 
        document.querySelectorAll('.video-card').forEach(el => el.classList.remove('selected'));
        document.getElementById('urlError').classList.add('hidden');
        
        const submitBtn = document.getElementById('btnSubmitVideo');
        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `Kirim Konten`;
        }
    }, 300);
};

function startRefreshCooldown() {
    window.refreshCooldown = 60;
    updateRefreshButtons();
    
    if (cooldownInterval) clearInterval(cooldownInterval);
    cooldownInterval = setInterval(() => {
        window.refreshCooldown--;
        updateRefreshButtons();
        if (window.refreshCooldown <= 0) {
            clearInterval(cooldownInterval);
        }
    }, 1000);
}

function updateRefreshButtons() {
    const btns = document.querySelectorAll('.btn-refresh-video');
    btns.forEach(btn => {
        if (window.refreshCooldown > 0) {
            btn.disabled = true;
            btn.innerHTML = `<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Tunggu ${window.refreshCooldown}s`;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            btn.disabled = false;
            if (btn.classList.contains('bg-white')) {
                btn.innerHTML = `Coba Lagi`; 
            } else {
                btn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> Refresh`;
            }
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    });
}

// ===============================================
// AUTO-FETCH VIDEO (HASHTAG & ANTI-DUPLIKAT)
// ===============================================
async function fetchUserAccounts() {
    try {
        const { data: profile } = await supabase.from('profiles').select('social_media').eq('id', sessionUser.id).single();
        if (profile && profile.social_media && Array.isArray(profile.social_media)) {
            userVerifiedAccounts = profile.social_media.filter(soc => soc.is_verified === true);
        }
    } catch(e) {}
}

window.fetchVideos = async function(forceRefresh = false) {
    if (forceRefresh && window.refreshCooldown > 0) return;

    const loader = document.getElementById('videoFetchLoaderNew');
    const grid = document.getElementById('videoGridNew');
    const emptyState = document.getElementById('noVideoStateNew');
    
    loader.classList.remove('hidden');
    grid.classList.add('hidden');
    emptyState.classList.add('hidden');
    submitState.videoUrls = []; 
    document.getElementById('urlError').classList.add('hidden');
    document.getElementById('btnSubmitVideo').disabled = true;

    if (userVerifiedAccounts.length === 0) {
        loader.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        document.getElementById('noVideoTitle').innerText = "Belum Ada Akun Terverifikasi";
        document.getElementById('noVideoDesc').innerText = "Silakan tautkan dan verifikasi akun TikTok/IG Anda di halaman profil untuk bisa submit video.";
        return;
    }

    const cacheKey = `whoost_raw_videos_v3_${sessionUser.id}`;
    const now = new Date().getTime();
    let rawVideos = [];
    
    if (!forceRefresh) {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                if ((now - parsed.timestamp) < 900000) { 
                    rawVideos = parsed.videos;
                }
            } catch(e) {}
        }
    } else {
        startRefreshCooldown();
    }

    if (rawVideos.length === 0) {
        try {
            const response = await fetch('/api/fetch-latest-videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accounts: userVerifiedAccounts })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Gagal menarik video.");

            rawVideos = data.videos || [];
            sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, videos: rawVideos }));

        } catch (err) {
            console.error("Gagal menarik data video:", err);
            loader.classList.add('hidden');
            emptyState.classList.remove('hidden');
            emptyState.classList.add('flex');
            return; 
        }
    }

    let finalVideos = [...rawVideos];

    if (finalVideos.length > 0) {
        // FILTER HASHTAG
        const selectedCampId = document.getElementById('submitCampaignValue').value;
        if (selectedCampId) {
            const selectedCamp = joinedActiveCampaigns.find(c => c.id === selectedCampId);
            if (selectedCamp && selectedCamp.hashtags) {
                const requiredHashtags = selectedCamp.hashtags.split(' ').filter(h => h.trim() !== '');
                if (requiredHashtags.length > 0) {
                    finalVideos = finalVideos.filter(vid => {
                        const caption = (vid.caption || '').toLowerCase();
                        return requiredHashtags.some(tag => caption.includes(tag.toLowerCase()));
                    });
                }
            }
        }

        // FILTER DUPLIKAT DI DATABASE
        if (finalVideos.length > 0) {
            const urlsToCheck = finalVideos.map(v => escapeHTML(v.url));
            try {
                const { data: existingSubs } = await supabase
                    .from('submissions')
                    .select('video_link')
                    .in('video_link', urlsToCheck);
                
                if (existingSubs && existingSubs.length > 0) {
                    const existingUrls = existingSubs.map(s => s.video_link);
                    finalVideos = finalVideos.filter(vid => !existingUrls.includes(escapeHTML(vid.url)));
                }
            } catch (err) { }
        }
    }

    renderVideoGrid(finalVideos);
};

function renderVideoGrid(videosArray) {
    const loader = document.getElementById('videoFetchLoaderNew');
    const grid = document.getElementById('videoGridNew');
    const emptyState = document.getElementById('noVideoStateNew');

    loader.classList.add('hidden');

    if (!videosArray || videosArray.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
    }

    grid.innerHTML = '';
    const formatShort = (num) => {
        const n = parseInt(num) || 0;
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return n.toString();
    };

    videosArray.forEach((vid) => {
        const isSel = submitState.videoUrls.includes(vid.url);
        const views = vid.views || vid.viewCount || vid.playCount || 0;
        const likes = vid.likes || vid.likeCount || vid.diggCount || 0;
        
        let iconHtml = '';
        if(vid.platform === 'TikTok') {
            iconHtml = `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>`;
        } else if (vid.platform === 'Instagram') {
            iconHtml = `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.88z"/></svg>`;
        } else {
            iconHtml = `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
        }
        
        grid.innerHTML += `
            <div onclick="window.selectVideo('${escapeHTML(vid.url)}')" class="video-card relative cursor-pointer group ${isSel ? 'selected' : ''}" data-url="${escapeHTML(vid.url)}">
                <div class="relative aspect-[9/16] rounded-xl border-[2.5px] ${isSel ? 'border-white' : 'border-zinc-800'} overflow-hidden transition-colors bg-zinc-900 card-border-target">
                    <img src="${escapeHTML(vid.thumbnail)}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                    
                    <div class="absolute top-2 left-2 bg-black/60 backdrop-blur-md border border-white/20 p-1.5 rounded-lg flex items-center shadow-sm">
                        ${iconHtml}
                    </div>
                    
                    <div class="check-icon-target absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full ${isSel ? 'opacity-100 scale-100' : 'opacity-0 scale-50'} transition-all shadow-md">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    
                    <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-zinc-300 font-medium z-10">
                        <span class="flex items-center gap-1"><svg class="w-3 h-3 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg> ${formatShort(views)}</span>
                        <span class="flex items-center gap-1"><svg class="w-3 h-3 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> ${formatShort(likes)}</span>
                    </div>
                </div>
            </div>
        `;
    });

    grid.classList.remove('hidden');
}

window.selectVideo = function(url) {
    const cardElement = document.querySelector(`.video-card[data-url="${url}"]`);
    if (!cardElement) return;

    const border = cardElement.querySelector('.card-border-target');
    const icon = cardElement.querySelector('.check-icon-target');
    const submitBtn = document.getElementById('btnSubmitVideo');

    const index = submitState.videoUrls.indexOf(url);

    if (index > -1) {
        submitState.videoUrls.splice(index, 1);
        cardElement.classList.remove('selected');
        border.classList.replace('border-white', 'border-zinc-800');
        icon.classList.remove('opacity-100', 'scale-100');
        icon.classList.add('opacity-0', 'scale-50');
    } else {
        submitState.videoUrls.push(url);
        cardElement.classList.add('selected');
        border.classList.replace('border-zinc-800', 'border-white');
        icon.classList.remove('opacity-0', 'scale-50');
        icon.classList.add('opacity-100', 'scale-100');
    }

    document.getElementById('urlError').classList.add('hidden');
    submitBtn.disabled = submitState.videoUrls.length === 0;

    if (submitState.videoUrls.length > 0) {
        submitBtn.innerHTML = `Kirim ${submitState.videoUrls.length} Konten`;
    } else {
        submitBtn.innerHTML = `Kirim Konten`;
    }
};

window.processSubmit = async function(e) {
    e.preventDefault();
    const campaignId = document.getElementById('submitCampaignValue').value;
    const errorMsg = document.getElementById('urlError');
    const submitBtn = document.getElementById('btnSubmitVideo');
    
    if(!campaignId) {
        showAlert("Silakan pilih campaign terlebih dahulu.", "error");
        return;
    }

    if (submitState.videoUrls.length === 0) {
        errorMsg.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Silakan pilih minimal satu video di atas terlebih dahulu.`;
        errorMsg.classList.remove('hidden');
        return;
    }

    const selectedCamp = joinedActiveCampaigns.find(c => c.id === campaignId);
    const campPlatforms = selectedCamp ? selectedCamp.platforms : [];

    let isPlatformValid = true;
    if (campPlatforms && campPlatforms.length > 0) {
        for (let url of submitState.videoUrls) {
            let videoPlat = url.includes('tiktok') ? 'tiktok' : (url.includes('instagram') ? 'instagram' : 'youtube');
            if (!campPlatforms.includes(videoPlat)) {
                isPlatformValid = false;
                break;
            }
        }
    }

    if (!isPlatformValid) {
        errorMsg.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Ada video yang platform-nya tidak diizinkan di Campaign ini.`;
        errorMsg.classList.remove('hidden');
        return;
    }

    errorMsg.classList.add('hidden');
    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg class="w-5 h-5 animate-spin mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;

    try {
        const sanitizedUrls = submitState.videoUrls.map(url => escapeHTML(url));

        const { data: existingSubs, error: dbErr } = await supabase
            .from('submissions')
            .select('video_link')
            .in('video_link', sanitizedUrls);
            
        if (dbErr) throw dbErr;

        if (existingSubs && existingSubs.length > 0) {
            throw new Error("Satu atau beberapa video ini sudah pernah diajukan sebelumnya.");
        }

        const insertPayload = sanitizedUrls.map(url => ({
            campaign_id: campaignId,
            user_id: sessionUser.id,
            video_link: url,
            status: 'PENDING',
            views_claimed: 0,
            views_paid: 0,
            earned: 0
        }));

        const { error: insertError } = await supabase.from('submissions').insert(insertPayload);
        if(insertError) throw insertError;

        window.closeSubmitModal();
        setTimeout(() => {
            showAlert(`Berhasil mengirim ${insertPayload.length} video. Status saat ini PENDING menunggu Review Admin.`, "success");
        }, 300);
        
        await Promise.all([ loadUserStats(), loadSubmissions() ]);
    } catch(err) {
        showAlert("Gagal mengirim video: " + err.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtn;
    }
};

// ==========================================
// FUNGSI VIDEO PLAYER MODAL
// ==========================================
window.openVideoModal = async function(url) {
    const m = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    const nativeVideo = document.getElementById('videoNative');
    const directLink = document.getElementById('videoDirectLink');
    const loader = document.getElementById('videoLoader');
    
    loader.style.display = 'flex'; 
    iframe.src = '';
    nativeVideo.src = '';
    iframe.classList.add('hidden');
    nativeVideo.classList.add('hidden');
    directLink.href = url;

    m.classList.remove('hidden'); 
    m.classList.add('flex');
    setTimeout(() => { m.classList.remove('opacity-0'); }, 10);

    try {
        if (url.match(/(?:youtu\.be\/|youtube\.com\/)/)) {
            let ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
            if (ytMatch && ytMatch[1]) {
                iframe.src = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
                iframe.classList.remove('hidden');
            } else { throw new Error("No YouTube match"); }
        } else if (url.includes('tiktok.com')) {
            let cleanTkUrl = url.split('?')[0];
            const res = await fetch(`https://www.tikwm.com/api/?url=${cleanTkUrl}`);
            const json = await res.json();
            if (json.data && json.data.play) {
                nativeVideo.src = json.data.play;
                nativeVideo.classList.remove('hidden');
            } else { throw new Error("TikTok API Error"); }
        } else if (url.includes('instagram.com')) {
            let cleanIgUrl = url.split('?')[0];
            const encodedUrl = encodeURIComponent(cleanIgUrl);
            let igVideoUrl = null;

            const igApis = [
                `https://api.siputzx.my.id/api/d/igdl?url=${encodedUrl}`,
                `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodedUrl}`,
                `https://api.agatz.xyz/api/instagram?url=${encodedUrl}`
            ];

            for (let api of igApis) {
                if (igVideoUrl) break; 
                try {
                    const res = await fetch(api);
                    const json = await res.json();
                    if (json.data && Array.isArray(json.data) && json.data.length > 0) igVideoUrl = json.data[0].url || json.data[0];
                    else if (json.data && json.data.url) igVideoUrl = json.data.url;
                    else if (json.url) igVideoUrl = json.url;
                    else if (json.result && Array.isArray(json.result) && json.result.length > 0) igVideoUrl = json.result[0].url || json.result[0];
                } catch(e) { }
            }

            if (igVideoUrl) {
                nativeVideo.src = igVideoUrl;
                nativeVideo.classList.remove('hidden');
            } else { throw new Error("Semua API IG gagal mendapatkan direktori file MP4"); }
        } else {
            iframe.src = url;
            iframe.classList.remove('hidden');
        }
    } catch (e) {
        if (url.includes('tiktok.com')) {
            let tkMatch = url.match(/video\/(\d+)/);
            if (tkMatch && tkMatch[1]) iframe.src = `https://www.tiktok.com/embed/v2/${tkMatch[1]}`;
            else iframe.src = url;
        } else if (url.includes('instagram.com')) {
            let igMatch = url.match(/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
            if (igMatch && igMatch[1]) iframe.src = `https://www.instagram.com/p/${igMatch[1]}/embed`;
            else iframe.src = url;
        } else {
            iframe.src = url;
        }
        iframe.classList.remove('hidden');
    }

    setTimeout(() => { loader.style.display = 'none'; }, 6000);
};

window.closeVideoModal = function() {
    const m = document.getElementById('videoModal');
    const iframe = document.getElementById('videoIframe');
    const nativeVideo = document.getElementById('videoNative');
    
    m.classList.add('opacity-0'); 
    setTimeout(() => { 
        m.classList.add('hidden'); 
        m.classList.remove('flex'); 
        iframe.src = ''; 
        nativeVideo.pause();
        nativeVideo.removeAttribute('src');
        nativeVideo.load();
    }, 300);
};

// ===============================================
// INISIALISASI & LOAD DATA (MENAMPILKAN CARD)
// ===============================================

function getCols() {
    const w = window.innerWidth;
    if (w >= 1280) return 6; 
    if (w >= 1024) return 5; 
    if (w >= 768)  return 4; 
    if (w >= 640)  return 3; 
    return 2;                
}

let currentFilter = { status: 'all', campaign_id: 'all', sort: 'newest' };
let currentLimit = getCols() * 2;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await enforceRoleProtection();

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) { window.location.replace('login.html'); return; }
        sessionUser = session.user;

        try {
            const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', sessionUser.id).single();
            if (profile && profile.full_name) {
                sessionFullName = profile.full_name;
            } else if (sessionUser.user_metadata?.full_name) {
                sessionFullName = sessionUser.user_metadata.full_name;
            }
        } catch(e) {}

        await Promise.all([
            fetchUserAccounts(),
            loadActiveCampaigns(),
            loadUserStats(),
            loadSubmissions()
        ]);

    } catch(e) {}
});

async function loadActiveCampaigns() {
    try {
        const { data, error } = await supabase
            .from('user_campaigns')
            .select(`campaigns ( id, title, status, budget_remaining, platforms, hashtags )`)
            .eq('user_id', sessionUser.id);

        if (!error && data) {
            const uniqueCampsMap = new Map();
            data.forEach(item => {
                const camp = item.campaigns;
                if (camp && camp.status !== 'CLOSED') { uniqueCampsMap.set(camp.id, camp); }
            });
            joinedActiveCampaigns = Array.from(uniqueCampsMap.values());
        }
    } catch (e) {}
}

async function loadUserStats() {
    try {
        const { data: allSubs } = await supabase.from('submissions').select('status, earned, views_paid, views_claimed').eq('user_id', sessionUser.id);
        let calcEarnings = 0; let calcViews = 0; let calcVideos = 0; let p = 0, a = 0, r = 0;

        if (allSubs) {
            calcVideos = allSubs.length; 
            allSubs.forEach(sub => {
                calcEarnings += (sub.earned || 0);
                if (sub.status === 'PENDING') { p++; calcViews += (sub.views_paid || 0); } 
                else if (sub.status === 'APPROVED') { a++; calcViews += Math.max(sub.views_claimed || 0, sub.views_paid || 0); } 
                else if (sub.status === 'REJECTED') { r++; calcViews += (sub.views_paid || 0); }
            });
        }

        const { data: withdrawals } = await supabase.from('withdrawals').select('amount, status').eq('user_id', sessionUser.id);
        let totalWithdrawn = 0;
        if (withdrawals) { withdrawals.forEach(w => { if (w.status !== 'REJECTED' && w.status !== 'FAILED') { totalWithdrawn += (w.amount || 0); } }); }

        let calcWithdrawable = calcEarnings - totalWithdrawn;
        if (calcWithdrawable < 0) calcWithdrawable = 0;

        await supabase.from('clipper_stats').upsert({
            user_id: sessionUser.id, total_earnings: calcEarnings, withdrawable: calcWithdrawable, total_views: calcViews, total_videos: calcVideos
        }, { onConflict: 'user_id' });

        realEarnings = calcEarnings;
        realWithdrawable = calcWithdrawable;

        // UI Updates if elements exist
        const ePending = document.getElementById('pending-detail');
        const eApprove = document.getElementById('disetujui-detail');
        const eReject = document.getElementById('ditolak-detail');

        if(ePending) ePending.innerText = p;
        if(eApprove) eApprove.innerText = a;
        if(eReject) eReject.innerText = r;

    } catch(e) {}
    
    // Panggil setelah semua kalkulasi selesai
    if (typeof window.toggleSensor === 'function') {
        window.toggleSensor(true); 
    }
}

async function loadSubmissions() {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select(`id, user_id, video_link, views_claimed, views_paid, earned, est_payout, status, reject_reason, created_at, campaigns ( id, title, brand_name, budget_remaining, reward_per_1k, min_views, max_claim, payment_type, status, platforms, niche, type, banner_url, price_per_video, is_private )`)
            .eq('user_id', sessionUser.id);

        if (error) return;
        submissionsData = data || [];
        
        const campSet = new Set();
        let campOptionsHTML = `<div onclick="window.selectCampaign('all', 'Semua Campaign')" class="px-3 py-2 hover:bg-zinc-700 cursor-pointer text-xs text-white">Semua Campaign</div>`;
        
        submissionsData.forEach(sub => {
            if(sub.campaigns && !campSet.has(sub.campaigns.id)) {
                campSet.add(sub.campaigns.id);
                const safeTitle = escapeHTML(sub.campaigns.title || 'Tanpa Judul');
                campOptionsHTML += `<div onclick="window.selectCampaign('${sub.campaigns.id}', '${safeTitle.replace(/'/g, "\\'")}')" class="px-3 py-2 hover:bg-zinc-700 cursor-pointer text-xs text-white truncate border-t border-zinc-700/50" title="${safeTitle}">${safeTitle}</div>`;
            }
        });

        const campOptEl = document.getElementById('campaign-options');
        if(campOptEl) campOptEl.innerHTML = campOptionsHTML;

        applyFilters();

    } catch(err) { }
}

function getVideoMeta(url) {
    url = url || '';
    let platHTML = `<svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`;
    let thumbUrl = 'https://placehold.co/400x600/121214/27272a?text=Memuat+Video...';
    
    if (url.includes('tiktok.com')) {
        platHTML = `<svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z"/></svg>`;
        thumbUrl = 'https://placehold.co/400x600/121214/27272a?text=Memuat+TikTok...';
    } else if (url.includes('instagram.com')) {
        platHTML = `<svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.88z"/></svg>`;
        thumbUrl = 'https://placehold.co/400x600/121214/27272a?text=Memuat+Reels...';
    } else if (url.match(/(?:youtu\.be\/|youtube\.com\/)/)) {
        platHTML = `<svg class="w-3 h-3 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
        let ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
        if (ytMatch && ytMatch[1]) thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    return { platHTML, thumbUrl };
}

// =======================================================
// TAMPILAN CARD MENJADI RINGKAS (SATU TOMBOL)
// =======================================================
function generateCard(sub, index) {
    const camp = sub.campaigns || { id: '', title: 'Campaign Dihapus', brand_name: '-', status: 'CLOSED', budget_remaining: 0, niche: '-', payment_type: 'views', reward_per_1k: 0, price_per_video: 0, is_private: false };
    const isPrivate = camp.is_private === true;
    
    const meta = getVideoMeta(sub.video_link);
    const dateStr = new Date(sub.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
    
    const safeTitle = escapeHTML(camp.title);
    const safeSessionName = escapeHTML(sessionFullName);
    const safeUrl = encodeURI(sub.video_link || '');

    const currentViews = sub.views_claimed || 0;
    const uiViews = currentViews > 0 ? currentViews.toLocaleString('id-ID') : '0';
    
    let realStatus = sub.status || 'PENDING';
    
    // --- PENGHITUNGAN ESTIMASI TERBARU (DISIMPAN DI MODAL NANTINYA) ---
    let estimatedNewMoney = 0;
    const cpm = camp.reward_per_1k || 0;
    const minViews = camp.min_views || 10000;
    const maxClaim = camp.max_claim || 250000;
    const budgetRemaining = camp.budget_remaining || 0;
    const isCampClosed = camp.status === 'CLOSED' || budgetRemaining <= 0;

    if (!isCampClosed) {
        if (camp.payment_type === 'video') {
            if ((sub.earned || 0) > 0) {
                estimatedNewMoney = 0; 
            } else {
                estimatedNewMoney = camp.price_per_video || 0;
                if (estimatedNewMoney > budgetRemaining) estimatedNewMoney = budgetRemaining;
            }
        } else {
            let effectiveViews = currentViews > maxClaim ? maxClaim : currentViews;
            let rate = cpm;
            if (effectiveViews > 0 && effectiveViews < minViews) {
                rate = cpm * 0.25; 
            }
            let totalExpected = Math.floor((effectiveViews / 1000) * rate);
            estimatedNewMoney = totalExpected - (sub.earned || 0);

            if (estimatedNewMoney < 0) estimatedNewMoney = 0;
            if (estimatedNewMoney > budgetRemaining) estimatedNewMoney = budgetRemaining;
        }
    }
    
    let isBrandReview   = (realStatus === 'PENDING' && currentViews === 0);
    let isBrandRejected = (realStatus === 'REJECTED' && currentViews === 0);
    let isClaimReview   = (realStatus === 'PENDING' && currentViews > 0);
    let isClaimApproved = (realStatus === 'APPROVED');
    let isClaimRejected = (realStatus === 'REJECTED' && currentViews > 0);

    let badgeHTML = '';
    let cardOpacityClass = 'opacity-100';

    if (isBrandReview) {
        badgeHTML = `<div class="absolute top-2 right-2 z-20 bg-amber-500/90 text-white text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-bl-lg rounded-tr-lg backdrop-blur shadow-sm">Review Brand</div>`;
    } 
    else if (isBrandRejected) {
        cardOpacityClass = 'opacity-70 border-red-900/30';
        badgeHTML = `<div class="absolute top-2 right-2 z-20 bg-red-500/90 text-white text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-bl-lg rounded-tr-lg backdrop-blur shadow-sm">Ditolak Brand</div>`;
    }
    else if (isClaimReview) {
        badgeHTML = `<div class="absolute top-2 right-2 z-20 bg-amber-500/90 text-white text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-bl-lg rounded-tr-lg backdrop-blur shadow-sm">Review Admin</div>`;
    } 
    else if (isClaimRejected) {
        cardOpacityClass = 'opacity-80 border-red-900/50';
        badgeHTML = `<div class="absolute top-2 right-2 z-20 bg-red-500/90 text-white text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-bl-lg rounded-tr-lg backdrop-blur shadow-sm">Klaim Ditolak</div>`;
    }
    else if (isClaimApproved) {
        if(isCampClosed) {
            badgeHTML = `<div class="absolute top-2 right-2 z-20 bg-red-500/90 text-white text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-bl-lg rounded-tr-lg backdrop-blur shadow-sm">Closed</div>`;
        } else {
            badgeHTML = `<div class="absolute top-2 right-2 z-20 bg-blue-500/90 text-white text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-bl-lg rounded-tr-lg backdrop-blur flex items-center gap-1 shadow-sm"><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg> Cair</div>`;
        }
    }

    let cardBaseClass = `p-1.5 sm:p-2 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col group h-full ${cardOpacityClass} `;
    if (isPrivate) {
        cardBaseClass += "bg-gradient-to-br from-zinc-900/90 to-[#0a0a0c] border border-yellow-900/40 hover:border-yellow-700/60";
    } else {
        cardBaseClass += "bg-cardBg border border-zinc-800 hover:border-zinc-500";
    }

    let topLeftBadges = `
        <div class="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5 items-start z-20 pointer-events-none">
            <div class="bg-white/10 backdrop-blur-md border border-white/20 p-1 sm:p-1.5 rounded-lg">
                ${meta.platHTML}
            </div>
        </div>`;

    // Tombol Lihat Detail (Aksi Pindah Ke Modal)
    const actionBtnHTML = `<button onclick="window.openDetailModal('${sub.id}')" class="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 rounded-lg text-[10px] sm:text-[11px] transition-colors focus:outline-none shadow-sm active:scale-95">Lihat Detail</button>`;

    return `
    <div class="${cardBaseClass}">
        <div class="relative w-full aspect-[3/4] bg-zinc-900 rounded-xl overflow-hidden shrink-0 group cursor-pointer border border-zinc-800/50" onclick="window.openVideoModal('${safeUrl}')">
            ${badgeHTML}${topLeftBadges}
            <img id="thumb-${sub.id}" src="${meta.thumbUrl}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-0 pointer-events-none"></div>
            <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 group-hover:bg-white/30 transition-colors">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
            </div>
            <div class="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 overflow-hidden z-10 pointer-events-none">
                <h4 class="text-[11px] sm:text-sm font-bold text-white truncate" title="${safeTitle}">${safeTitle}</h4>
                <p class="text-[8px] sm:text-[9px] text-zinc-400 mt-0.5 truncate w-full" title="By ${safeSessionName}">${dateStr} • By ${safeSessionName}</p>
            </div>
        </div>
        
        <div class="flex-1 flex flex-col justify-between mt-2 sm:mt-3">
            <div class="flex justify-between items-center mb-2.5 bg-black/40 rounded-lg p-1.5 sm:p-2.5 border border-zinc-800/50">
                <div>
                    <p class="text-[7px] sm:text-[8px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Views Valid</p>
                    <p class="text-[10px] sm:text-xs font-bold text-white">${uiViews}</p>
                </div>
                <div class="text-right">
                    <p class="text-[7px] sm:text-[8px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Telah Cair</p>
                    <p class="text-[10px] sm:text-xs font-bold ${sub.earned > 0 ? 'text-emerald-400' : 'text-zinc-500'}">Rp ${(sub.earned || 0).toLocaleString('id-ID')}</p>
                </div>
            </div>
            <div class="mt-auto">
                ${actionBtnHTML}
            </div>
        </div>
    </div>`;
}

// ========================================================
// MODAL DETAIL KLAM LOGIC (MENAMPILKAN PERHITUNGAN)
// ========================================================
window.openDetailModal = function(subId) {
    const sub = submissionsData.find(s => s.id === subId);
    if(!sub) return;

    const camp = sub.campaigns;
    const isPerVideo = camp.payment_type === 'video';
    const cpm = camp.reward_per_1k || 0;
    const minViews = camp.min_views || 10000;
    const maxClaim = camp.max_claim || 250000;
    const currentViews = sub.views_claimed || 0;
    const isCampClosed = camp.status === 'CLOSED' || (camp.budget_remaining || 0) <= 0;

    let realStatus = sub.status || 'PENDING';
    
    // Status Badge Logic
    const badgeEl = document.getElementById('detail-badge-status');
    if (realStatus === 'PENDING' && currentViews === 0) {
        badgeEl.innerHTML = `<span class="px-2 py-1 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-bold uppercase">Review Brand</span>`;
    } else if (realStatus === 'REJECTED' && currentViews === 0) {
        badgeEl.innerHTML = `<span class="px-2 py-1 rounded bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-bold uppercase">Ditolak Brand</span>`;
    } else if (realStatus === 'PENDING' && currentViews > 0) {
        badgeEl.innerHTML = `<span class="px-2 py-1 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-bold uppercase">Diproses Admin</span>`;
    } else if (realStatus === 'REJECTED' && currentViews > 0) {
        badgeEl.innerHTML = `<span class="px-2 py-1 rounded bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-bold uppercase">Klaim Ditolak</span>`;
    } else {
        badgeEl.innerHTML = `<span class="px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">Disetujui / Selesai</span>`;
    }

    document.getElementById('detail-title').innerText = escapeHTML(camp.title);
    document.getElementById('detail-brand').innerText = escapeHTML(camp.brand_name);

    // Tampilkan Reject Reason Jika ada
    const rejectBox = document.getElementById('detail-reject-box');
    if (realStatus === 'REJECTED' && sub.reject_reason) {
        rejectBox.classList.remove('hidden');
        document.getElementById('detail-reject-reason').innerText = escapeHTML(sub.reject_reason);
    } else {
        rejectBox.classList.add('hidden');
    }

    // Peringatan Budget Habis
    const closedBox = document.getElementById('detail-closed-box');
    if (isCampClosed && realStatus !== 'APPROVED') {
        closedBox.classList.remove('hidden');
    } else {
        closedBox.classList.add('hidden');
    }

    // Kalkulasi
    let calcHTML = '';
    if (isPerVideo) {
        calcHTML = `
            <div class="flex justify-between text-xs mb-1.5"><span class="text-zinc-400">Sistem Bayar</span><span class="text-white font-bold">Per Video</span></div>
            <div class="flex justify-between text-xs mb-1.5"><span class="text-zinc-400">Rate Fixed</span><span class="text-white font-bold">Rp ${camp.price_per_video.toLocaleString('id-ID')}</span></div>
        `;
    } else {
        let effectiveViews = currentViews > maxClaim ? maxClaim : currentViews;
        let currentCpm = cpm;
        let isPenalty = false;
        
        if (effectiveViews < minViews && effectiveViews > 0) {
            currentCpm = cpm * 0.25;
            isPenalty = true;
        }

        calcHTML = `
            <div class="flex justify-between text-xs mb-1.5"><span class="text-zinc-400">Sistem Bayar</span><span class="text-white font-bold">Per Views</span></div>
            <div class="flex justify-between text-xs mb-1.5"><span class="text-zinc-400">Views Diakui Sistem</span><span class="text-white font-bold">${effectiveViews.toLocaleString('id-ID')} Views</span></div>
            <div class="flex justify-between text-xs mb-1.5"><span class="text-zinc-400">Min. Views Target</span><span class="text-zinc-300">${minViews.toLocaleString('id-ID')} Views</span></div>
            <div class="flex justify-between text-xs mb-1.5"><span class="text-zinc-400">CPM Dasar</span><span class="text-zinc-300">Rp ${cpm.toLocaleString('id-ID')}</span></div>
            <div class="flex justify-between text-xs"><span class="text-zinc-400">Rate Diterapkan</span><span class="${isPenalty ? 'text-red-400' : 'text-green-400'} font-bold">Rp ${currentCpm.toLocaleString('id-ID')} ${isPenalty ? '(Early CPM 25%)' : '(Full CPM)'}</span></div>
        `;
    }
    
    document.getElementById('detail-calc-box').innerHTML = calcHTML;
    document.getElementById('detail-earned').innerText = `Rp ${(sub.earned || 0).toLocaleString('id-ID')}`;

    const m = document.getElementById('detailClaimModal');
    const c = document.getElementById('detailClaimContent');
    m.classList.remove('hidden'); m.classList.add('flex');
    setTimeout(() => { m.classList.remove('opacity-0'); c.classList.remove('scale-95'); }, 10);
};

window.closeDetailModal = function() {
    const m = document.getElementById('detailClaimModal');
    const c = document.getElementById('detailClaimContent');
    m.classList.add('opacity-0'); c.classList.add('scale-95');
    setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
};

// ===================================================
// PENGATURAN FILTER DAN LOAD MORE
// ===================================================
function applyFilters() {
    const grid = document.getElementById('cards-container');
    const alertBox = document.getElementById('no-data-alert');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    grid.innerHTML = '';
    let filtered = submissionsData.filter(sub => {
        let realStatus = sub.status || 'PENDING';
        const campId = sub.campaigns ? sub.campaigns.id : null;
        const matchCamp = currentFilter.campaign_id === 'all' || campId === currentFilter.campaign_id;
        const matchStatus = currentFilter.status === 'all' || realStatus === currentFilter.status;
        return matchCamp && matchStatus;
    });

    if (currentFilter.sort === 'oldest') filtered.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    else filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    if (filtered.length === 0) {
        alertBox.classList.remove('hidden'); loadMoreContainer.classList.add('hidden'); return;
    } else { alertBox.classList.add('hidden'); }

    let html = '';
    const toRender = filtered.slice(0, currentLimit);
    toRender.forEach((sub, i) => { html += generateCard(sub, i); });
    grid.innerHTML = html;

    if (filtered.length > currentLimit) loadMoreContainer.classList.remove('hidden');
    else loadMoreContainer.classList.add('hidden');

    window.loadThumbnails(toRender);
}

window.loadThumbnails = async function(items) {
    for (let sub of items) {
        const imgEl = document.getElementById(`thumb-${sub.id}`);
        if (!imgEl || imgEl.getAttribute('data-loaded') === 'true') continue;
        const url = sub.video_link; if (!url) continue;

        if (url.match(/(?:youtu\.be\/|youtube\.com\/)/)) { imgEl.setAttribute('data-loaded', 'true'); continue; }

        try {
            const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
            const json = await res.json();
            
            if (json.status === 'success' && json.data && json.data.image && json.data.image.url) {
                imgEl.src = json.data.image.url; imgEl.setAttribute('data-loaded', 'true');
            } else if (url.includes('tiktok.com')) {
                const tkRes = await fetch(`https://www.tikwm.com/api/?url=${url}`);
                const tkJson = await tkRes.json();
                if (tkJson.data && tkJson.data.cover) { imgEl.src = tkJson.data.cover; imgEl.setAttribute('data-loaded', 'true'); }
            }
        } catch(e) { }
    }
};

window.toggleSelect = function(id) {
    document.querySelectorAll('.custom-select-options').forEach(el => { if(el.id !== id) el.classList.add('hidden'); });
    document.getElementById(id).classList.toggle('hidden');
};

window.toggleFilter = function() {
    document.getElementById('filter-dropdown').classList.toggle('hidden');
    document.getElementById('filter-dropdown').classList.toggle('flex');
};

window.applyFilter = function(type, value) {
    currentFilter[type] = value;
    document.querySelectorAll(`.filter-btn[class*="${type}-"]`).forEach(btn => {
        if (btn.classList.contains(`${type}-${value}`)) {
            btn.classList.add('bg-zinc-800', 'text-white');
            btn.classList.remove('text-zinc-400', 'hover:bg-zinc-800/50', 'text-amber-400', 'text-blue-400', 'text-red-400');
        } else {
            btn.classList.remove('bg-zinc-800', 'text-white');
            btn.classList.add('text-zinc-400', 'hover:bg-zinc-800/50');
            if(btn.classList.contains('status-PENDING')) btn.classList.add('text-amber-400');
            if(btn.classList.contains('status-APPROVED')) btn.classList.add('text-white');
            if(btn.classList.contains('status-REJECTED')) btn.classList.add('text-red-400');
        }
    });
    document.getElementById('filter-dropdown').classList.add('hidden');
    document.getElementById('filter-dropdown').classList.remove('flex');
    
    currentLimit = 20;
    applyFilters();
};

window.loadMore = function() { 
    currentLimit += 20; 
    applyFilters(); 
};

window.toggleSensor = function(silent = false) {
    if(!silent) isSensorActive = !isSensorActive;
    const totalElement = document.getElementById('total-pendapatan');
    const saldoElement = document.getElementById('saldo-detail');
    const iconElement = document.getElementById('eye-icon');

    if (totalElement && saldoElement && iconElement) {
        if (isSensorActive) {
            totalElement.innerText = 'Rp ••••••'; saldoElement.innerText = 'Rp ••••';
            iconElement.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>`;
        } else {
            totalElement.innerText = 'Rp ' + realEarnings.toLocaleString('id-ID'); 
            saldoElement.innerText = 'Rp ' + realWithdrawable.toLocaleString('id-ID');
            iconElement.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`;
        }
    }
};

document.addEventListener('click', (e) => {
    const selContainer = document.querySelector('.custom-select-container');
    const filtContainer = document.getElementById('filter-container');
    const submitSelContainer = document.querySelector('.submit-select-container');
    
    if (selContainer && !selContainer.contains(e.target)) document.querySelectorAll('.custom-select-options').forEach(el => el.classList.add('hidden'));
    if (filtContainer && !filtContainer.contains(e.target)) {
        const fd = document.getElementById('filter-dropdown');
        if(fd) { fd.classList.add('hidden'); fd.classList.remove('flex'); }
    }
    if (submitSelContainer && !submitSelContainer.contains(e.target)) {
        const sOpts = document.getElementById('submit-campaign-options');
        if (sOpts) { sOpts.classList.add('hidden'); }
    }
});
