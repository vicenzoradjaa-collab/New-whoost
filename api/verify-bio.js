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

    if (platform.toLowerCase() === 'instagram') {
        actorId = 'apify~instagram-profile-scraper'; 
        runInput = { usernames: [username] };
    } else if (platform.toLowerCase() === 'tiktok') {
        actorId = 'clockworks~tiktok-profile-scraper'; 
        runInput = { profiles: [username] };
    } else if (platform.toLowerCase() === 'youtube') {
        // [FIX] Menggunakan actor khusus Channel Scraper agar mengambil profil/bio channel,
        // BUKAN mengambil data video. Hapus juga maxResults: 1 karena tidak diperlukan untuk profil.
        actorId = 'streamers~youtube-channel-scraper'; 
        runInput = { startUrls: [{ url: `https://www.youtube.com/@${username}` }] };
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
        throw new Error(`Gagal menghubungi server scraper (Apify). Status: ${response.status}.`);
    }

    let data = await response.json();
    let items = Array.isArray(data) ? data : (data?.items || data?.data || [data]);
    
    if (!items || items.length === 0 || !items[0] || Object.keys(items[0]).length === 0) {
        throw new Error('Profil tidak ditemukan. Pastikan username benar dan akun Anda bersifat publik.');
    }

    const profileData = items[0];
    
    let socialId = profileData.id || profileData.pk || profileData.userId || profileData.channelId || profileData?.userInfo?.user?.id || username;

    // --- MENARIK JUMLAH FOLLOWERS SESUAI STRUKTUR APIFY BARU ---
    let followersCount = 0;
    if (platform.toLowerCase() === 'tiktok') {
        followersCount = profileData.followerCount || profileData?.authorMeta?.fans || profileData?.userInfo?.stats?.followerCount || profileData?.stats?.followerCount || 0;
    } else if (platform.toLowerCase() === 'instagram') {
        followersCount = profileData.followersCount || profileData.edge_followed_by?.count || 0;
    } else if (platform.toLowerCase() === 'youtube') {
        // [FIX] Tambahkan field channelSubscriberCount untuk format dari actor channel scraper
        followersCount = profileData.subscriberCount || profileData.channelSubscriberCount || profileData.subscribersCount || 0;
    }

    // --- MODE REFRESH STATS (Tombol Refresh di Web) ---
    // Jika frontend mengirimkan kode "REFRESH", kita bypass pengecekan Bio
    if (code === 'REFRESH') {
        return res.status(200).json({ 
            verified: true, 
            social_id: socialId, 
            followers: followersCount,
            message: 'Refresh Berhasil' 
        });
    }

    // --- MODE VERIFIKASI BIO ---
    const rawJsonString = JSON.stringify(profileData);
    if (rawJsonString.includes(code.toString())) {
        return res.status(200).json({ 
            verified: true, 
            social_id: socialId, 
            followers: followersCount, 
            message: 'Verifikasi Berhasil' 
        });
    } else {
        return res.status(200).json({ 
            verified: false, 
            message: 'Kode 6-digit tidak terdeteksi di Profil/Bio Anda. Silakan periksa kembali dan coba lagi.' 
        });
    }

  } catch (error) {
    return res.status(400).json({ error: error.message, verified: false });
  }
}
