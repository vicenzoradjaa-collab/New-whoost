class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- Footer -->
        <footer class="border-t border-zinc-800/60 bg-darkBg pt-20 pb-10">
            <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
                
                <!-- Kolom 1: Brand & Deskripsi -->
                <div class="col-span-2">
                    <a href="index.html" class="flex items-center gap-3 font-bold text-2xl text-white tracking-tight mb-6">
                        <!-- Kotak Putih dengan Sudut Membulat (rounded-xl) untuk Logo Hitam -->
                        <div class="w-15 h-15 bg-white rounded-xl flex items-center justify-center p-1.5">
                            <img src="asset/logob.webp" alt="Whoost Logo" class="w-full h-full object-contain">
                        </div>
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
                    <h4 class="font-bold text-white mb-6 uppercase tracking-wider text-sm">Ikuti Kami</h4>
                    <ul class="space-y-4 text-sm text-zinc-400">
                        <li>
                            <!-- Link Instagram dengan Icon SVG -->
                            <a href="#" target="_blank" class="flex items-center gap-2.5 hover:text-white transition group">
                                <svg class="w-5 h-5 fill-current text-zinc-400 group-hover:text-white transition" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                                </svg>
                                Instagram
                            </a>
                        </li>
                        <li>
                            <!-- Link TikTok dengan Icon SVG -->
                            <a href="#" target="_blank" class="flex items-center gap-2.5 hover:text-white transition group">
                                <svg class="w-5 h-5 fill-current text-zinc-400 group-hover:text-white transition" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z"/>
                                </svg>
                                TikTok
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            
            <!-- Bottom Footer: Copyright & Tagline -->
            <div class="max-w-7xl mx-auto px-6 border-t border-zinc-800/60 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500 gap-4">
                <p>&copy; 2026 Whoost. All rights reserved.</p>
                <p>
                    <span class="text-white font-semibold">Boost</span> Your Content, <span class="text-white font-semibold">Boost</span> Your Income!
                </p>
            </div>
        </footer>
        `;
    }
}

customElements.define('custom-footer', CustomFooter);
