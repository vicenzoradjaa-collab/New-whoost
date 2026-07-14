// File: autentication/auth.js

// 1. Masukkan Kunci API Supabase milikmu di sini
const SUPABASE_URL = 'https://cqbbejiwbghuntecvxtr.supabase.co'; // URL Project-mu
const SUPABASE_KEY = 'PASTE_PUBLISHABLE_KEY_KAMU_DI_SINI'; // Ganti dengan sb_publishable_... milikmu

// 2. Inisialisasi Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Fungsi Login Google
async function loginWithGoogle() {
    const btnText = document.getElementById('login-btn-text');
    if (btnText) btnText.innerText = "Memproses...";

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Setelah login Google selesai, arahkan kembali ke halaman ini
            // agar fungsi checkLoginStatus() bisa bekerja dan menentukan arah selanjutnya
            redirectTo: window.location.href 
        }
    });

    if (error) {
        alert("Gagal Login: " + error.message);
        if (btnText) btnText.innerText = "Lanjutkan dengan Google";
    }
}

// 4. Fungsi Pengecekan Status Login & Routing Cerdas
async function checkLoginStatus() {
    // Ambil sesi user saat ini
    const { data: { session } } = await supabase.auth.getSession();
    
    // Dapatkan nama file halaman saat ini (misal: "login.html")
    const currentPage = window.location.pathname.split('/').pop() || '';

    if (session) {
        // JIKA USER SUDAH LOGIN: Cek Role-nya
        const userRole = session.user.user_metadata?.role;

        if (userRole === 'clipper') {
            // Jika role Clipper, paksa ke clipper-dashboard.html
            if (currentPage !== 'clipper-dashboard.html') window.location.replace('clipper-dashboard.html');
        } else if (userRole === 'brand') {
            // Jika role Brand, paksa ke client-dashboard.html (sesuaikan nama file dashboard client-mu)
            if (currentPage !== 'client-dashboard.html') window.location.replace('client-dashboard.html');
        } else {
            // Jika belum punya role sama sekali, paksa ke role.html
            if (currentPage !== 'role.html') window.location.replace('role.html');
        }
    } else {
        // JIKA USER BELUM LOGIN: Lindungi halaman tertentu
        const restrictedPages = ['role.html', 'clipper-dashboard.html', 'client-dashboard.html'];
        if (restrictedPages.includes(currentPage)) {
            // Tendang kembali ke login
            window.location.replace('login.html');
        }
    }
}

// 5. Fungsi Menyimpan Role (Digunakan di role.html)
async function saveRoleAndRedirect(selectedRole) {
    const btnText = document.getElementById('modalSubmitText');
    if(btnText) btnText.innerText = "Menyimpan...";

    // Simpan data role ke metadata akun user di Supabase
    const { data, error } = await supabase.auth.updateUser({
        data: { role: selectedRole }
    });

    if (error) {
        alert("Gagal menyimpan peran: " + error.message);
        if(btnText) btnText.innerText = "Ya, Lanjutkan";
        return;
    }

    // Jika berhasil simpan, panggil checkLoginStatus agar langsung diarahkan ke dashboard
    checkLoginStatus();
}
