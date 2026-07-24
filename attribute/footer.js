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
                        <div class="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-0.5">
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
                        <li><a href="faq.html" class="hover:text-white transition">Cara mulai</a></li>
                        <li><a href="login.html" class="hover:text-white transition">Cari penghasilan</a></li>
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
                            <a id="footer-ig-link" href="#" target="_blank" class="flex items-center gap-2.5 hover:text-white transition group">
                                <svg class="w-5 h-5 fill-current text-zinc-400 group-hover:text-white transition" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.88z"/>
                                </svg>
                                Instagram
                            </a>
                        </li>
                        <li>
                            <!-- Link TikTok dengan Icon SVG -->
                            <a id="footer-tiktok-link" href="#" target="_blank" class="flex items-center gap-2.5 hover:text-white transition group">
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

        // Jalankan penarikan data secara asynchronous
        this.fetchSocialLinks();
    }

    async fetchSocialLinks() {
        try {
            // Dynamic import untuk Supabase agar kompatibel dengan tag script biasa
            const { supabase } = await import('./authentication/auth.js');
            
            const { data, error } = await supabase
                .from('system_settings')
                .select('ig_link, tiktok_link')
                .limit(1)
                .single();

            if (!error && data) {
                const igLinkEl = this.querySelector('#footer-ig-link');
                const tiktokLinkEl = this.querySelector('#footer-tiktok-link');

                if (igLinkEl && data.ig_link) {
                    igLinkEl.href = data.ig_link;
                }
                if (tiktokLinkEl && data.tiktok_link) {
                    tiktokLinkEl.href = data.tiktok_link;
                }
            }
        } catch (err) {
            console.error('Gagal memuat link media sosial di footer:', err);
        }
    }
}

customElements.define('custom-footer', CustomFooter);
