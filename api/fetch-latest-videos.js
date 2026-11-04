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
    const { accounts } = req.body; // Berisi array: [{ platform: 'TikTok', username: 'user1' }, ...]

    if (!accounts || accounts.length === 0) {
      return res.status(200).json({ videos: [] });
    }

    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if(!APIFY_TOKEN) throw new Error('Token Apify belum disetting di Vercel.');

    let allVideos = [];
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Fungsi bantuan untuk menembak Apify
    const fetchFromApify = async (actorId, runInput) => {
        const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(runInput)
        });
        if (!response.ok) throw new Error(`Error Apify ${response.status}`);
        return await response.json();
    };

    // Jalankan pencarian video untuk SEMUA akun secara bersamaan (Paralel agar cepat)
    const fetchPromises = accounts.map(async (acc) => {
        try {
            if (acc.platform.toLowerCase() === 'instagram') {
                // Gunakan scraper profil IG karena dia juga mengembalikan "latestPosts"
                const dataIG = await fetchFromApify('apify~instagram-profile-scraper', { usernames: [acc.username] });
                if (dataIG && dataIG.length > 0 && dataIG[0].latestPosts) {
                    dataIG[0].latestPosts.forEach(post => {
                        const postTime = new Date(post.timestamp).getTime();
                        // FILTER: Jika waktu post kurang dari 24 jam
                        if (now - postTime < TWENTY_FOUR_HOURS) {
                            const hoursAgo = Math.max(1, Math.round((now - postTime) / 3600000));
                            allVideos.push({
                                id: post.id,
                                platform: 'Instagram',
                                url: post.url,
                                thumbnail: post.displayUrl,
                                upload_time: `${hoursAgo} Jam yang lalu`
                            });
                        }
                    });
                }
            } else if (acc.platform.toLowerCase() === 'tiktok') {
                // Gunakan scraper TikTok khusus post (limit 10 post terbaru agar cepat)
                const dataTT = await fetchFromApify('clockworks~tiktok-scraper', { profiles: [acc.username], resultsPerPage: 10, shouldDownloadVideos: false });
                if (dataTT && dataTT.length > 0) {
                    dataTT.forEach(post => {
                        // Waktu TikTok berupa detik, kalikan 1000 jadi milidetik
                        const postTime = post.createTime * 1000; 
                        if (now - postTime < TWENTY_FOUR_HOURS) {
                            const hoursAgo = Math.max(1, Math.round((now - postTime) / 3600000));
                            allVideos.push({
                                id: post.id,
                                platform: 'TikTok',
                                url: post.webVideoUrl || post.videoWebUrl || `https://www.tiktok.com/@${acc.username}/video/${post.id}`,
                                thumbnail: post.covers?.[0] || post.videoMeta?.coverUrl || 'https://placehold.co/400x600/121214/27272a?text=TikTok+Video',
                                upload_time: `${hoursAgo} Jam yang lalu`
                            });
                        }
                    });
                }
            }
        } catch (err) {
            console.error(`Gagal fetch ${acc.platform} - ${acc.username}:`, err);
        }
    });

    // Tunggu semua proses selesai
    await Promise.all(fetchPromises);

    // Kembalikan video yang lolos filter ke frontend
    return res.status(200).json({ videos: allVideos });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
