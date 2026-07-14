// authentication/auth.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Kredensial Supabase Anda
const supabaseUrl = 'https://cqbbejiwbghuntecvxtr.supabase.co'; 
const supabaseKey = 'sb_publishable_-u9Si0LbrRtiuWdiyqK8rA_XdqFEZoX'; 

export const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// FUNGSI UTAMA ALUR LOGIN & ROUTING
// ==========================================
export async function routeUserFlow() {
    // 1. Cek apakah user sudah login di browser ini
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        // JIKA BELUM LOGIN -> Arahkan ke halaman login.html
        window.location.href = 'login.html';
        return; 
    }

    // ==========================================
    // 2. JIKA SUDAH LOGIN -> Cek data profilnya
    // ==========================================
    const user = session.user;
    
    // Coba ambil data dari tabel 'profiles'
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Jika terjadi error karena data tidak ditemukan, berarti INI USER BARU
    if (!profile) {
        // Buatkan baris data kosong untuk user ini di tabel profiles
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, email: user.email }])
            .select()
            .single();
            
        if (insertError) {
            console.error("Gagal membuat profil baru:", insertError.message);
            return;
        }
        profile = newProfile;
    }

    // ==========================================
    // 3. LOGIKA ARAH HALAMAN (ROUTING)
    // ==========================================
    if (!profile.role) {
        // Kondisi A: Belum pilih role (User baru)
        window.location.href = 'role.html';
        
    } else if (profile.role === 'client' || profile.role === 'brand') {
        // Kondisi B: Role adalah Client/Brand
        if (profile.is_profile_complete === true) {
            window.location.href = 'client-dashboard.html';
        } else {
            window.location.href = 'client-completeprofile.html';
        }
        
    } else if (profile.role === 'clipper') {
        // Kondisi C: Role adalah Clipper/Kreator
        window.location.href = 'clipper-dashboard.html';
    }
}
