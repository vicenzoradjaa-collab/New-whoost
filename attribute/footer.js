class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- Footer -->
        <footer class="border-t border-zinc-800/60 bg-darkBg pt-20 pb-10">
            <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10 mb-20">
                <div class="col-span-2">
                    <a href="#" class="flex items-center gap-2 font-bold text-2xl tracking-tight mb-6">
                        <div class="w-8 h-8 bg-white rounded flex items-center justify-center text-black text-sm font-black">W</div>
                        Whoost
                    </a>
                    <p class="text-zinc-500 text-sm leading-relaxed max-w-xs">Platform jejaring no.1 untuk clipper menghasilkan uang dengan membuat konten video pendek viral.</p>
                </div>
                <div>
                    <h4 class="font-bold text-white mb-6">Produk</h4>
                    <ul class="space-y-4 text-sm text-zinc-400">
                        <li><a href="#" class="hover:text-white transition">Dapat Bayaran</a></li>
                        <li><a href="#" class="hover:text-white transition">Untuk Brand</a></li>
                        <li><a href="#" class="hover:text-white transition">Daftar Campaign</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-white mb-6">Panduan</h4>
                    <ul class="space-y-4 text-sm text-zinc-400">
                        <li><a href="#" class="hover:text-white transition">Cara Jadi Clipper</a></li>
                        <li><a href="#" class="hover:text-white transition">Estimasi Penghasilan</a></li>
                        <li><a href="#" class="hover:text-white transition">Pusat Bantuan</a></li>
                    </ul>
                </div>
            </div>
            <div class="max-w-7xl mx-auto px-6 border-t border-zinc-800/60 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500 gap-4">
                <p>© 2026 Whoost. Hak Cipta Dilindungi.</p>
                <div class="flex gap-6">
                    <a href="#" class="hover:text-white transition">Syarat & Ketentuan</a>
                    <a href="#" class="hover:text-white transition">Kebijakan Privasi</a>
                </div>
            </div>
        </footer>
        `;
    }
}

customElements.define('custom-footer', CustomFooter);
