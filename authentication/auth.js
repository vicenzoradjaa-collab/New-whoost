// Menggunakan CDN Supabase khusus untuk Vanilla JS (HTML murni)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ==========================================
// TODO: GANTI 2 BARIS DI BAWAH INI DENGAN DATA PROJECT SUPABASE ANDA
// (Bisa diambil di dashboard Supabase -> Settings -> API)
// ==========================================
const supabaseUrl = 'https://cqbbejiwbghuntecvxtr.supabase.co'; 
const supabaseKey = 'sb_publishable_-u9Si0LbrRtiuWdiyqK8rA_XdqFEZoX'; 

// Inisialisasi mesin Supabase agar bisa dipakai di file lain
export const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// FUNGSI BANTUAN UNTUK MENGECEK PROFIL & ROLE USER
// ==========================================
export async function getUserProfile(userId) {
    try {
        // Minta Supabase mencarikan data role di tabel 'profiles' berdasarkan ID user
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single(); // Kita pakai .single() karena 1 user = 1 profil
        
        if (error) {
            console.error("Gagal mengambil data profil:", error.message);
            return null;
        }
        
        // Akan mengembalikan object, contoh: { role: 'clipper' } atau { role: null }
        return data; 
    } catch (error) {
        console.error("Sistem error saat cek profil:", error.message);
        return null;
    }
}
