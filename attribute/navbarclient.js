// File: attribute/navbarclient.js

document.addEventListener("DOMContentLoaded", function() {
    // Mengecek halaman aktif dari variabel global (didefinisikan di HTML)
    // Jika tidak didefinisikan, default ke 'beranda'
    const activeMenu = typeof ACTIVE_MENU !== 'undefined' ? ACTIVE_MENU : 'beranda';

    // Data menu navigasi
    const menuItems = [
        { 
            id: 'beranda', 
            label: 'Beranda', 
            url: 'client-dashboard.html', 
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>'
        },
        { 
            id: 'pengajuan', 
            label: 'Pengajuan', 
            url: 'client-pengajuan.html', 
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>'
        },
        { 
            id: 'dompet', 
            label: 'Dompet', 
            url: '#', 
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>'
        },
        { 
            id: 'analitik', 
            label: 'Analitik', 
            url: '#', 
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>'
        },
        { 
            id: 'profil', 
            label: 'Profil', 
            url: '#', 
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>'
        }
    ];

    // Generate HTML untuk item navigasi
    let navContent = '';
    menuItems.forEach(item => {
        const isActive = item.id === activeMenu;
        
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
    });

    // Generate Wrapper Floating Navbar (Pill Shape)
    const navbarHTML = `
        <nav class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#121214]/80 backdrop-blur-xl border border-zinc-800/80 rounded-[2rem] shadow-2xl shadow-black/50 px-2 py-2 flex items-center justify-between gap-1 sm:gap-2 w-[95%] max-w-[400px] sm:max-w-lg transition-all duration-300">
            ${navContent}
        </nav>
    `;

    // Suntikkan ke dalam bagian paling bawah di body HTML
    document.body.insertAdjacentHTML('beforeend', navbarHTML);
});
