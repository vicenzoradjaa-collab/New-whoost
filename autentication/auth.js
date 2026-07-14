// File: autentication/auth.js

const SUPABASE_URL = 'https://cqbbejiwbghuntecvxtr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-u9Si0LbrRtiuWdiyqK8rA_XdqFEZoX'; // Ingat, ganti dengan key aslimu

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 1. Fungsi Login Google
async function loginWithGoogle() {
    const btnText = document.getElementById('login-btn-text');
    if (btnText) btnText.innerText = "Memproses...";

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Setelah login Google selesai, KEMBALI LAGI KE HALAMAN LOGIN
            // Kenapa? Supaya script pengecekan role di bawah bisa berjalan
            redirectTo: window.location.href 
        }
    });

    if (error) {
        alert("Gagal Login: " + error.message);
        if (btnText) btnText.innerText = "Lanjutkan dengan Google";
    }
}

// 2. Fungsi Pengecekan Status & Arah Halaman (Routing)
async function checkLoginStatus() {
    // Ambil sesi user saat ini
    const { data: { session } } = await supabase.auth.getSession();

    const currentPage = window.location.pathname.split('/').pop();

    if (session) {
        // JIKA USER SUDAH LOGIN
        // Ambil data role dari akun user
        const userRole = session.user.user_metadata?.role;

        // Cek Role dan arahkan ke dashboard masing-masing
        if (userRole === 'clipper') {
            if (currentPage !== 'clipper-dashboard.html') window.location.replace('clipper-dashboard.html');
        } else if (userRole === 'brand') {
            if (currentPage !== 'client-dashboard.html') window.location.replace('client-dashboard.html');
        } else {
            // Jika belum punya role, paksa ke halaman role.html
            if (currentPage !== 'role.html') window.location.replace('role.html');
        }
    } else {
        // JIKA USER BELUM LOGIN
        // Jika mereka mencoba masuk ke halaman terlarang (dashboard/role), tendang balik ke login
        const restrictedPages = ['role.html', 'clipper-dashboard.html', 'client-dashboard.html'];
        if (restrictedPages.includes(currentPage)) {
            window.location.replace('login.html');
        }
    }
}

// 3. Fungsi Menyimpan Role Permanen (dipanggil di role.html)
async function saveRoleAndRedirect(selectedRole) {
    const btnText = document.getElementById('modalSubmitText');
    if(btnText) btnText.innerText = "Menyimpan...";

    // Simpan role ke metadata akun Supabase
    const { data, error } = await supabase.auth.updateUser({
        data: { role: selectedRole }
    });

    if (error) {
        alert("Gagal menyimpan peran: " + error.message);
        if(btnText) btnText.innerText = "Ya, Lanjutkan";
        return;
    }

    // Jika berhasil simpan, jalankan ulang pengecekan agar langsung diarahkan ke dashboard
    checkLoginStatus();
}
