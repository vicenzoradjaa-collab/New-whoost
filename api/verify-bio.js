export default async function handler(req, res) {
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

    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if(!APIFY_TOKEN) throw new Error('Token Apify belum disetting di Vercel.');

    let actorId = '';
    let runInput = {};

    // PENENTUAN SCRAPER SESUAI PLATFORM
    if (platform.toLowerCase() === 'instagram') {
        actorId = 'apify~instagram-profile-scraper'; 
        runInput = { usernames: [username] };
    } else if (platform.toLowerCase() === 'tiktok') {
        actorId = 'clockworks~tiktok-profile-scraper'; 
        runInput = { profiles: [username] };
    } else if (platform.toLowerCase() === 'youtube') {
        actorId = 'streamers~youtube-scraper'; 
        runInput = { startUrls: [{ url: `https://www.youtube.com/@${username}/about` }], maxResults: 1 };
    } else {
        throw new Error('Platform tidak didukung.');
    }

    const apifyUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
    
    const response = await fetch(apifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runInput)
    });

    if (!response.ok) {
        const errorDetail = await response.text();
        console.error("Apify Error Response:", errorDetail);
        throw new Error(`Gagal menghubungi server scraper (Apify). Status: ${response.status}.`);
    }

    let data = await response.json();
    
    // Normalisasi bentuk data (Jaga-jaga jika Apify mereturn { data: [] } atau { items: [] })
    let items = [];
    if (Array.isArray(data)) {
        items = data;
    } else if (data && Array.isArray(data.items)) {
        items = data.items;
    } else if (data && Array.isArray(data.data)) {
        items = data.data;
    } else {
        items = [data]; // Force array
    }
    
    if (!items || items.length === 0 || !items[0] || Object.keys(items[0]).length === 0) {
        throw new Error('Profil tidak ditemukan. Pastikan username benar dan akun Anda bersifat publik.');
    }

    const profileData = items[0];
    
    // Tarik Social ID secara dinamis dari berbagai kemungkinan nama variable
    let socialId = profileData.id || profileData.pk || profileData.userId || profileData.channelId || profileData?.userInfo?.user?.id || username;

    // TEKNIK SUPER AMAN: Ubah seluruh object JSON dari Apify menjadi String text.
    // Ini memastikan kode 6-digit tetap ketemu walau apify merubah-rubah letak data bio (signature/description/dll).
    const rawJsonString = JSON.stringify(profileData);

    // Cek apakah 6 digit kode ada di dalam text profil tersebut
    if (rawJsonString.includes(code.toString())) {
        return res.status(200).json({ 
            verified: true, 
            social_id: socialId, 
            message: 'Verifikasi Berhasil' 
        });
    } else {
        return res.status(200).json({ 
            verified: false, 
            message: 'Kode 6-digit belum terdeteksi. Sistem butuh waktu ±1 menit untuk sinkronisasi setelah Anda update Bio. Silakan tunggu sebentar lalu Coba Lagi.' 
        });
    }

  } catch (error) {
    return res.status(400).json({ error: error.message, verified: false });
  }
}
