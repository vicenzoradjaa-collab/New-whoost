// authentication/auth.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Kredensial Supabase
const supabaseUrl = 'https://cqbbejiwbghuntecvxtr.supabase.co'; 
const supabaseKey = 'sb_publishable_-u9Si0LbrRtiuWdiyqK8rA_XdqFEZoX'; 

export const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// 1. FUNGSI AMBIL ATAU BUAT PROFIL
// ==========================================
export async function getUserProfile(userId, email) {
    // Coba ambil data dari tabel 'profiles'
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    // Jika terjadi error karena data tidak ditemukan (user baru)
    if (!profile) {
        console.log("Profil tidak ditemukan, membuat profil baru...");
        // Buatkan baris data kosong (hanya id dan email) untuk user ini di tabel profiles
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: userId, email: email }])
            .select()
            .single();
            
        if (insertError) {
            console.error("Gagal membuat profil baru:", insertError.message);
            return null;
        }
        profile = newProfile;
    }
    return profile;
}

// ==========================================
// 2. FUNGSI LOGIKA ARAH HALAMAN (ROUTING)
// ==========================================
export function routeBasedOnProfile(profile) {
    if (!profile || !profile.role) {
        // Kondisi A: Belum pilih role (User baru)
        window.location.replace('role.html');
        
    } else if (profile.role === 'client' || profile.role === 'brand') {
        // Kondisi B: Role adalah Client/Brand
        if (profile.is_profile_complete === true) {
            window.location.replace('client-dashboard.html');
        } else {
            window.location.replace('client-completeprofile.html');
        }
        
    } else if (profile.role === 'clipper' || profile.role === 'kreator') {
        // Kondisi C: Role adalah Clipper/Kreator
        // Untuk saat ini langsung ke dashboard, nanti update profil ada di dalam dashboard
        window.location.replace('clipper-dashboard.html');
    }
}
