import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

class AppFooter extends HTMLElement {
    connectedCallback() {
        // Render HTML Footer
        this.innerHTML = `
            <footer class="border-t border-gray-800/60 bg-[#0A0A0A] mt-auto pb-24 md:pb-0 w-full text-gray-400 font-sans">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-10">
                        <div class="lg:col-span-5">
                            <h2 class="font-bold text-xl text-white tracking-tight mb-4 leading-none">Whoost</h2>
                            <p class="text-[13px] text-gray-400 leading-relaxed max-w-sm">
                                Platform Komunitas & Edukasi Content Clipper.<br>
                                Menghubungkan brand dengan ribuan clipper aktif untuk meningkatkan awareness secara nyata.
                            </p>
                        </div>
                        <div class="lg:col-span-2">
                            <h4 class="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 mt-1">Navigasi</h4>
                            <ul class="space-y-3">
                                <li><a href="cara-mulai.html" class="text-[13px] text-gray-300 hover:text-white transition-colors">Cara mulai</a></li>
                                <li><a href="dashboard-boost.html" class="text-[13px] text-gray-300 hover:text-white transition-colors">Cari penghasilan</a></li>
                            </ul>
                        </div>
                        <div class="lg:col-span-2">
                            <h4 class="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 mt-1">Legal</h4>
                            <ul class="space-y-3">
                                <li><a href="privacy.html" class="text-[13px] text-gray-300 hover:text-white transition-colors">Kebijakan Privasi</a></li>
                                <li><a href="terms-of-service.html" class="text-[13px] text-gray-300 hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                            </ul>
                        </div>
                        <div class="lg:col-span-3">
                            <h4 class="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 mt-1">Ikuti Kami</h4>
                            <ul class="space-y-3">
                                <li>
                                    <a id="footer-instagram-link" href="#" target="_blank" class="flex items-center text-[13px] text-gray-300 hover:text-white transition-colors">
                                        <i class="fab fa-instagram text-base w-6 text-left"></i> Instagram
                                    </a>
                                </li>
                                <li>
                                    <a id="footer-community-link" href="#" target="_blank" class="flex items-center text-[13px] text-gray-300 hover:text-white transition-colors">
                                        <i class="fas fa-users text-base w-6 text-left"></i> Komunitas
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="border-t border-gray-800/80 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px]">
                        <p class="text-gray-500">&copy; 2026 Whoost. All rights reserved.</p>
                        <p class="text-gray-500">
                            <span class="text-[#98d4ff]">Boost</span> Your Content, <span class="text-[#98d4ff]">Boost</span> Your Income!
                        </p>
                    </div>
                </div>
            </footer>
        `;

        // Panggil fungsi penarik data dari Database Admin
        this.loadAdminLinks();
    }

    // Fungsi menarik data dari Firebase Firestore
    async loadAdminLinks() {
        try {
            const db = getFirestore();
            
            // SESUAI GAMBAR: Collection = "admin_settings", Document = "contact"
            const docRef = doc(db, "admin_settings", "contact"); 
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                const igLink = document.getElementById('footer-instagram-link');
                const comLink = document.getElementById('footer-community-link');

                // SESUAI GAMBAR ANDA: Field = "instagram_link"
                if (igLink && data.instagram_link) {
                    igLink.href = data.instagram_link;
                }
                
                // SESUAI GAMBAR : Field = "community_link"
                if (comLink && data.community_link) {
                    comLink.href = data.community_link;
                }
            } else {
                console.log("Document admin_settings/contact tidak ditemukan di database.");
            }
        } catch (error) {
            console.error("Gagal mengambil link footer dari Admin:", error);
        }
    }
}

// Daftarkan tag kustom ke browser
customElements.define('app-footer', AppFooter);
