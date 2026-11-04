export default async function handler(req, res) {
  // 1. Izinkan CORS (Agar bisa diakses oleh frontend)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Hanya menerima method POST' });
  }

  try {
    const { platform, username, code } = req.body;

    if (!platform || !username || !code) {
      throw new Error('Platform, username, dan kode wajib dikirim.');
    }

    // Ambil Token Apify dari pengaturan rahasia Vercel
    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if(!APIFY_TOKEN) throw new Error('Token Apify belum disetting di Vercel.');

    // 2. Tentukan Robot Apify yang dipakai
    let actorId = '';
    let runInput = {};

    if (platform.toLowerCase() === 'instagram') {
        actorId = 'apify/instagram-profile-scraper'; 
        runInput = { usernames: [username] };
    } else if (platform.toLowerCase() === 'tiktok') {
        actorId = 'clockworks/tiktok-profile-scraper'; 
        runInput = { profiles: [username] };
    } else {
        throw new Error('Platform tidak didukung.');
    }

    // 3. Tembak API Apify (Jalankan Robot & Tunggu Hasilnya)
    const apifyUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
    
    const response = await fetch(apifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runInput)
    });

    if (!response.ok) {
        throw new Error('Gagal memanggil robot Scraper Apify. Pastikan Token valid.');
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
        throw new Error('Profil tidak ditemukan. Pastikan username benar dan akun tidak di-private.');
    }

    // 4. Periksa Bio
    const profileData = data[0];
    const bio = profileData.biography || profileData.signature || profileData.bio || '';
    const socialId = profileData.id || profileData.pk || profileData.userId || '';

    // 5. Kembalikan Jawaban ke Website (Frontend)
    if (bio.includes(code)) {
        return res.status(200).json({ verified: true, social_id: socialId, message: 'Verifikasi Berhasil' });
    } else {
        return res.status(200).json({ verified: false, message: 'Kode 6-digit tidak ditemukan di Bio Anda. Silakan periksa kembali.' });
    }

  } catch (error) {
    return res.status(400).json({ error: error.message, verified: false });
  }
}
