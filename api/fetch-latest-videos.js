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
    const { accounts } = req.body; 

    // Karena frontend hanya mengirim [targetAccount], 
    // accounts.length pasti 1 (hanya platform yang dipilih user yang akan di-scan)
    if (!accounts || accounts.length === 0) {
      return res.status(200).json({ videos: [] });
    }

    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if(!APIFY_TOKEN) throw new Error('Token Apify belum disetting di Vercel.');

    let allVideos = [];
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const now = Date.now();

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

    // Jalankan pencarian video (Kenyataannya hanya run 1x sesuai akun yg dikirim frontend)
    const fetchPromises = accounts.map(async (acc) => {
        try {
            if (acc.platform.toLowerCase() === 'instagram') {
                const dataIG = await fetchFromApify('apify~instagram-profile-scraper', { usernames: [acc.username] });
                if (dataIG && dataIG.length > 0 && dataIG[0].latestPosts) {
                    dataIG[0].latestPosts.forEach(post => {
                        const postTime = new Date(post.timestamp).getTime();
                        if (now - postTime < TWENTY_FOUR_HOURS) {
                            const hoursAgo = Math.max(1, Math.round((now - postTime) / 3600000));
                            
                            // [FIX] Menangkap Views & Likes IG
                            const viewsCount = post.videoViewCount || post.viewCount || post.playCount || 0;
                            const likesCount = post.likesCount || 0;

                            allVideos.push({
                                id: post.id,
                                platform: 'Instagram',
                                url: post.url,
                                thumbnail: post.displayUrl,
                                upload_time: `${hoursAgo} Jam yang lalu`,
                                views: viewsCount,
                                likes: likesCount
                            });
                        }
                    });
                }
            } else if (acc.platform.toLowerCase() === 'tiktok') {
                const dataTT = await fetchFromApify('clockworks~tiktok-scraper', { profiles: [acc.username], resultsPerPage: 10, shouldDownloadVideos: false });
                if (dataTT && dataTT.length > 0) {
                    dataTT.forEach(post => {
                        const postTime = post.createTime * 1000; 
                        if (now - postTime < TWENTY_FOUR_HOURS) {
                            const hoursAgo = Math.max(1, Math.round((now - postTime) / 3600000));
                            
                            // [FIX] Menangkap Views & Likes TikTok
                            const viewsCount = post.playCount || post.stat?.playCount || 0;
                            const likesCount = post.diggCount || post.stat?.diggCount || 0;

                            allVideos.push({
                                id: post.id,
                                platform: 'TikTok',
                                url: post.webVideoUrl || post.videoWebUrl || `https://www.tiktok.com/@${acc.username}/video/${post.id}`,
                                thumbnail: post.covers?.[0] || post.videoMeta?.coverUrl || 'https://placehold.co/400x600/121214/27272a?text=TikTok+Video',
                                upload_time: `${hoursAgo} Jam yang lalu`,
                                views: viewsCount,
                                likes: likesCount
                            });
                        }
                    });
                }
            } else if (acc.platform.toLowerCase() === 'youtube') {
                const dataYT = await fetchFromApify('streamers~youtube-scraper', { 
                    startUrls: [{ url: `https://www.youtube.com/@${acc.username}/shorts` }],
                    maxResults: 5 
                });
                if (dataYT && dataYT.length > 0) {
                    dataYT.forEach(post => {
                        const postDateStr = post.date || post.uploadDate || post.publishedAt;
                        if (postDateStr) {
                            const postTime = new Date(postDateStr).getTime();
                            if (now - postTime < TWENTY_FOUR_HOURS) {
                                const hoursAgo = Math.max(1, Math.round((now - postTime) / 3600000));
                                
                                // [FIX] Menangkap Views & Likes YouTube
                                const viewsCount = post.viewCount || post.views || 0;
                                const likesCount = post.likeCount || post.likes || 0;

                                allVideos.push({
                                    id: post.id || post.videoId,
                                    platform: 'YouTube',
                                    url: post.url,
                                    thumbnail: post.thumbnailUrl || `https://img.youtube.com/vi/${post.id || post.videoId}/hqdefault.jpg`,
                                    upload_time: `${hoursAgo} Jam yang lalu`,
                                    views: viewsCount,
                                    likes: likesCount
                                });
                            }
                        }
                    });
                }
            }
        } catch (err) {
            console.error(`Gagal fetch ${acc.platform} - ${acc.username}:`, err);
        }
    });

    await Promise.all(fetchPromises);

    // Mengurutkan dari yang paling baru diupload (opsional tapi bagus untuk UX)
    allVideos.sort((a, b) => parseInt(a.upload_time) - parseInt(b.upload_time));

    return res.status(200).json({ videos: allVideos });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
