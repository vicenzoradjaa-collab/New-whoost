class CustomHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- Interactive Floating Navbar -->
        <header id="navbar-wrapper" class="fixed top-0 left-0 w-full z-50 transition-all duration-500 pt-0 px-0">
            <nav id="navbar-inner" class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between transition-all duration-500 border border-transparent bg-transparent rounded-none">
                <!-- Logo Group -->
                <a href="#" class="flex items-center gap-3 font-bold text-2xl tracking-tight text-white group">
                    <div class="relative flex items-center w-10 h-6">
                        <div class="absolute left-0 w-6 h-6 bg-white rounded-full group-hover:-translate-x-1 transition-transform"></div>
                        <!-- Fake border match to blend overlapping -->
                        <div class="absolute left-3 w-6 h-6 border-[3px] border-[#0a0a0c] rounded-full z-10 group-hover:translate-x-1 transition-transform" id="logo-border-hack"></div>
                        <div class="absolute left-3 w-6 h-6 border-[3px] border-white bg-transparent rounded-full z-20 group-hover:translate-x-1 transition-transform"></div>
                    </div>
                    Whoost<sup class="text-[10px] font-normal text-zinc-400 mt-1">&reg;</sup>
                </a>

                <!-- Nav Links -->
                <div class="hidden lg:flex items-center gap-8 text-sm font-medium text-zinc-300">
                    <a href="#" class="hover:text-white transition">For Creators</a>
                    <a href="#" class="hover:text-white transition">Explore</a>
                    <a href="#" class="hover:text-white transition">Agencies</a>
                    <a href="#" class="hover:text-white transition">FAQ</a>
                    <a href="#" class="hover:text-white transition">Contact</a>
                </div>

                <!-- CTA Button -->
                <button class="bg-white text-black px-7 py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition transform hover:scale-105 duration-300 shadow-md hidden sm:block">
                    Launch Campaign
                </button>
            </nav>
        </header>
        `;

        // Pindahkan Script Navbar Interaktif ke sini agar langsung berjalan setelah Header dimuat
        const headerWrapper = document.getElementById('navbar-wrapper');
        const navbarInner = document.getElementById('navbar-inner');
        const borderHack = document.getElementById('logo-border-hack');

        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                headerWrapper.classList.add('pt-4', 'px-4', 'md:px-6');
                navbarInner.classList.add('bg-[#0a0a0c]/80', 'backdrop-blur-xl', 'border-zinc-800', 'rounded-[2rem]', 'shadow-2xl', 'px-6', 'md:px-10');
                navbarInner.classList.remove('bg-transparent', 'border-transparent', 'rounded-none');
                if(borderHack) borderHack.classList.replace('border-[#0a0a0c]', 'border-[#121214]'); 
            } else {
                headerWrapper.classList.remove('pt-4', 'px-4', 'md:px-6');
                navbarInner.classList.remove('bg-[#0a0a0c]/80', 'backdrop-blur-xl', 'border-zinc-800', 'rounded-[2rem]', 'shadow-2xl', 'px-6', 'md:px-10');
                navbarInner.classList.add('bg-transparent', 'border-transparent', 'rounded-none');
                if(borderHack) borderHack.classList.replace('border-[#121214]', 'border-[#0a0a0c]');
            }
        });
    }
}

customElements.define('custom-header', CustomHeader);
