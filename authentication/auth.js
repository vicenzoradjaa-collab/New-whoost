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

// ==========================================
// 3. FUNGSI PROTEKSI HALAMAN BERDASARKAN ROLE
// ==========================================
export async function enforceRoleProtection() {
    // Abaikan pengecekan jika di halaman login, halaman depan/index, atau pemilihan role
    const path = window.location.pathname.toLowerCase();
    
    // Validasi tambahan agar root path ('/') tidak error
    if (path.includes('login.html') || path.includes('index.html') || path.includes('role.html') || path === '/' || path.endsWith('/')) {
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    // Jika tidak ada sesi (belum login), lempar ke login
    if (!session) {
        window.location.replace('login.html');
        return;
    }

    // Ambil role user dari tabel profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    const role = profile?.role ? profile.role.toLowerCase() : '';

    // Jika user sudah login tapi belum punya role, lempar ke halaman pilih role
    if (!role) {
        window.location.replace('role.html');
        return;
    }

    // --- LOGIKA PROTEKSI HALAMAN ---
    let isAllowed = true;

    if (path.includes('admin-') && role !== 'admin') {
        isAllowed = false;
    } else if (path.includes('client-') && (role !== 'client' && role !== 'brand')) {
        isAllowed = false;
    } else if (path.includes('clipper-') && (role !== 'clipper' && role !== 'kreator')) {
        isAllowed = false;
    }

    // Jika user mengakses halaman yang bukan rolenya, kembalikan ke dashboardnya sendiri
    if (!isAllowed) {
        if (role === 'admin') {
            window.location.replace('admin-dashboard.html');
        } else if (role === 'client' || role === 'brand') {
            window.location.replace('client-dashboard.html');
        } else if (role === 'clipper' || role === 'kreator') {
            window.location.replace('clipper-dashboard.html');
        }
    }
}
