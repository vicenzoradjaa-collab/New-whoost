// File: autentication/auth.js

// 1. Konfigurasi Kunci API Supabase
const SUPABASE_URL = 'https://cqbbejiwbghuntecvxtr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-u9Si0LbrRtiuWdiyqK8rA_XdqFEZoX'; // Ganti dengan kunci "sb_publishable_..." milikmu

// 2. Inisialisasi Supabase Client
// (Pastikan CDN Supabase sudah dipanggil di HTML sebelum file ini)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. Fungsi untuk Login dengan Google
async function loginWithGoogle() {
    // Ubah teks tombol jadi loading
    const btnText = document.getElementById('login-btn-text');
    if (btnText) btnText.innerText = "Memproses...";

    // Jalankan fitur login Google dari Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            // Setelah berhasil login, arahkan user ke halaman pilih role
            redirectTo: window.location.origin + '/role.html'
        }
    });

    // Jika terjadi error (misal internet putus atau user batal memilih akun)
    if (error) {
        alert("Gagal Login: " + error.message);
        // Kembalikan teks tombol
        if (btnText) btnText.innerText = "Lanjutkan dengan Google";
    }
}

// (Nanti ke depannya, fungsi Logout atau Cek User Login bisa kita tambahkan di file ini juga!)
