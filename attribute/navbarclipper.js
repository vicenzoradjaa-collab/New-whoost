// File: js/navbarclipper.js (atau attribute/navbarclipper.js)

document.addEventListener("DOMContentLoaded", function() {
    // Mengecek halaman aktif dari variabel global (didefinisikan di HTML)
    // Jika tidak didefinisikan, default ke 'beranda'
    const activeMenu = typeof ACTIVE_MENU !== 'undefined' ? ACTIVE_MENU : 'beranda';

    // Data menu navigasi khusus untuk Clipper / Creator
    const menuItems = [
        { 
            id: 'beranda', 
            label: 'Beranda', 
            url: 'clipper-dashboard.html', 
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>'
        },
        { 
            id: 'klaim_views', 
            label: 'Klaim Views', 
            url: 'clipper-claim.html', 
            // Menggunakan ikon koin/uang untuk representasi Klaim Views
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>'
        },
        { 
            id: 'campaign', 
            label: 'Campaign', 
            url: 'clipper-campaign.html', 
            // Menggunakan ikon megaphone (Toa) representasi Campaign (Di-Highlight)
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>'
        },
        { 
            id: 'submit_konten', 
            label: 'Submit', 
            url: 'clipper-submit.html', 
            // Menggunakan ikon Upload/Kirim file untuk Submit Konten
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>'
        },
        { 
            id: 'profil', 
            label: 'Profil', 
            url: 'clipper-profile.html', 
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>'
        }
    ];

    // Generate HTML untuk item navigasi
    let navContent = '';
    menuItems.forEach(item => {
        const isActive = item.id === activeMenu;

        // Custom Styling Khusus Menu CAMPAIGN (Di Tengah & Menonjol)
        if (item.id === 'campaign') {
            const glowRing = isActive ? 'ring-4 ring-white/20' : '';
            navContent += `
                <a href="${item.url}" class="flex flex-col items-center justify-center w-[4.5rem] h-14 sm:w-20 sm:h-16 group relative transition-all duration-300">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-300 ${glowRing}">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            ${item.icon}
                        </svg>
                    </div>
                    <span class="text-[10px] sm:text-[11px] font-bold text-white tracking-wide mt-1">${item.label}</span>
                </a>
            `;
        } 
        // Styling untuk menu standar lainnya
        else {
            // Style jika aktif: Background Putih, Teks Hitam
            // Style jika tidak aktif: Background transparan, teks abu-abu, ada efek hover
            const activeClass = isActive 
                ? 'bg-white text-black shadow-md' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60';
            
            // Efek animasi icon zoom hanya untuk yang tidak aktif saat di-hover
            const iconAnimClass = !isActive ? 'group-hover:scale-110 group-active:scale-95 transition-transform' : '';

            navContent += `
                <a href="${item.url}" class="flex flex-col items-center justify-center w-[4.5rem] h-14 sm:w-20 sm:h-16 rounded-2xl transition-all duration-300 group ${activeClass}">
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 mb-1 ${iconAnimClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${item.icon}
                    </svg>
                    <span class="text-[10px] sm:text-[11px] font-medium tracking-wide">${item.label}</span>
                </a>
            `;
        }
    });

    // Generate Wrapper Floating Navbar (Pill Shape)
    const navbarHTML = `
        <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121214]/90 backdrop-blur-xl border border-zinc-800/80 rounded-[2rem] shadow-2xl shadow-black/50 px-2 py-2 flex items-center justify-between gap-1 sm:gap-2 w-[95%] max-w-[420px] sm:max-w-lg transition-all duration-300">
            ${navContent}
        </nav>
    `;

    // Suntikkan ke dalam bagian paling bawah di body HTML
    document.body.insertAdjacentHTML('beforeend', navbarHTML);
});
