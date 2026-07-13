class CustomHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- Interactive Floating Navbar (Bagian Atas) -->
        <header id="navbar-wrapper" class="fixed top-0 left-0 w-full z-50 transition-all duration-500 pt-0 px-0">
            <nav id="navbar-inner" class="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between transition-all duration-500 border border-transparent bg-transparent rounded-none">
                
                <!-- Logo Group -->
                <a href="index.html" class="flex items-center gap-2 md:gap-3 font-bold text-xl md:text-2xl tracking-tight text-white group">
                    <!-- Ganti path src dibawah ini dengan gambar logo Anda sendiri -->
                    <img src="asset/logow.webp" alt="Logo" class="w-14 h-14 md:w-16 md:h-16 object-contain group-hover:scale-105 transition-transform -mt-1" onerror="this.src='https://via.placeholder.com/32x32.png?text=W'">
                    Whoost.id
                </a>

                <!-- Nav Links (Desktop Saja) -->
                <div class="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-300">
                    <a href="index.html" class="hover:text-white transition">Home</a>
                    <a href="explore.html" class="hover:text-white transition">Explore</a>
                    <a href="faq.html" class="hover:text-white transition">FAQ</a>
                    <a href="contact.html" class="hover:text-white transition">Contact</a>
                </div>

                <!-- CTA Button (Tampil di Desktop maupun Mobile) -->
                <a href="login.html">
                    <button class="bg-white text-black px-4 py-2 md:px-7 md:py-3 rounded-lg md:rounded-xl font-bold text-xs md:text-sm hover:bg-zinc-200 transition transform hover:scale-105 duration-300 shadow-md">
                        Boost Income
                    </button>
                </a>
            </nav>
        </header>

        <!-- Floating Bottom Navigation (Khusus Mobile) -->
        <!-- Penggunaan left-0 right-0 dan flex justify-center untuk centering proporsional -->
        <div class="fixed bottom-5 left-0 right-0 z-50 lg:hidden px-4 flex justify-center">
            
            <!-- max-w-[420px] agar lebih panjang/lebar ke samping dan tidak sempit -->
            <div class="bg-[#121214]/95 backdrop-blur-lg border border-zinc-800 rounded-[2.5rem] px-5 py-2.5 w-full max-w-[420px] flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                
                <!-- Menu 1: Home -->
                <a href="index.html" class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition group w-14">
                    <svg class="w-6 h-6 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    <span class="text-[10px] font-medium tracking-wide">Home</span>
                </a>

                <!-- Menu 2: Explore -->
                <a href="explore.html" class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition group w-14">
                    <svg class="w-6 h-6 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <span class="text-[10px] font-medium tracking-wide">Explore</span>
                </a>
                
                <!-- Menu 3: Boost Income (Berada di DALAM tapi dibikin Paling Menonjol) -->
                <a href="login.html" class="flex flex-col items-center gap-1 group w-[72px]">
                    <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-300">
                        <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <span class="text-[10px] font-bold text-white tracking-wide">Boost</span>
                </a>

                <!-- Menu 4: FAQ -->
                <a href="faq.html" class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition group w-14">
                    <svg class="w-6 h-6 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span class="text-[10px] font-medium tracking-wide">FAQ</span>
                </a>

                <!-- Menu 5: Contact -->
                <a href="contact.html" class="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition group w-14">
                    <svg class="w-6 h-6 group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span class="text-[10px] font-medium tracking-wide">Contact</span>
                </a>

            </div>
        </div>
        `;

        // Pindahkan Script Navbar Interaktif ke sini agar langsung berjalan setelah Header dimuat
        const headerWrapper = document.getElementById('navbar-wrapper');
        const navbarInner = document.getElementById('navbar-inner');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                headerWrapper.classList.add('pt-4', 'px-4', 'md:px-6');
                navbarInner.classList.add('bg-[#0a0a0c]/80', 'backdrop-blur-xl', 'border-zinc-800', 'rounded-[2rem]', 'shadow-2xl', 'px-6', 'md:px-10');
                navbarInner.classList.remove('bg-transparent', 'border-transparent', 'rounded-none');
            } else {
                headerWrapper.classList.remove('pt-4', 'px-4', 'md:px-6');
                navbarInner.classList.remove('bg-[#0a0a0c]/80', 'backdrop-blur-xl', 'border-zinc-800', 'rounded-[2rem]', 'shadow-2xl', 'px-6', 'md:px-10');
                navbarInner.classList.add('bg-transparent', 'border-transparent', 'rounded-none');
            }
        });
    }
}

customElements.define('custom-header', CustomHeader);
