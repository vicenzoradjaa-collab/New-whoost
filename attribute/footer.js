class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- Footer -->
        <footer class="border-t border-zinc-800/60 bg-darkBg pt-20 pb-10">
            <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
                
                <!-- Kolom 1: Brand & Deskripsi -->
                <div class="col-span-2">
                    <a href="#" class="flex items-center gap-2 font-bold text-2xl text-white tracking-tight mb-6">
                        <div class="w-8 h-8 bg-white rounded flex items-center justify-center text-black text-sm font-black">W</div>
                        Whoost
                    </a>
                    <p class="text-zinc-500 text-sm leading-relaxed max-w-sm">
                        Platform Komunitas & Edukasi Content Clipper.<br>
                        Menghubungkan brand dengan ribuan clipper aktif untuk meningkatkan awareness secara nyata.
                    </p>
                </div>
                
                <!-- Kolom 2: Navigasi -->
                <div>
                    <h4 class="font-bold text-white mb-6">Navigasi</h4>
                    <ul class="space-y-4 text-sm text-zinc-400">
                        <li><a href="cara-mulai.html" class="hover:text-white transition">Cara mulai</a></li>
                        <li><a href="dashboard-boost.html" class="hover:text-white transition">Cari penghasilan</a></li>
                    </ul>
                </div>
                
                <!-- Kolom 3: Legal -->
                <div>
                    <h4 class="font-bold text-white mb-6">Legal</h4>
                    <ul class="space-y-4 text-sm text-zinc-400">
                        <li><a href="privacy.html" class="hover:text-white transition">Kebijakan Privasi</a></li>
                        <li><a href="terms-of-service.html" class="hover:text-white transition">Syarat & Ketentuan</a></li>
                    </ul>
                </div>

                <!-- Kolom 4: Ikuti Kami -->
                <div class="col-span-2 md:col-span-2 lg:col-span-2">
                    <h4 class="font-bold text-white mb-6">Ikuti Kami</h4>
                    <ul class="space-y-4 text-sm text-zinc-400">
                        <li>
                            <!-- Ganti tanda '#' pada href dengan link Instagram nantinya -->
                            <a href="#" target="_blank" class="flex items-center hover:text-white transition">
                                <i class="fab fa-instagram text-base w-6 text-left"></i> Instagram
                            </a>
                        </li>
                        <li>
                            <!-- Ganti tanda '#' pada href dengan link Komunitas nantinya -->
                            <a href="#" target="_blank" class="flex items-center hover:text-white transition">
                                <i class="fas fa-users text-base w-6 text-left"></i> Komunitas
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Bottom Footer: Copyright & Tagline -->
            <div class="max-w-7xl mx-auto px-6 border-t border-zinc-800/60 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500 gap-4">
                <p>&copy; 2026 Whoost. All rights reserved.</p>
                <p>
                    <span class="text-[#98d4ff]">Boost</span> Your Content, <span class="text-[#98d4ff]">Boost</span> Your Income!
                </p>
            </div>
        </footer>
        `;
    }
}

customElements.define('custom-footer', CustomFooter);
