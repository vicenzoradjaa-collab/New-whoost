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

    // [FIX] Fungsi pembersih angka yang lebih kebal error
    const parseCount = (val) => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
            const cleaned = val.replace(/[^0-9]/g, ''); 
            return parseInt(cleaned, 10) || 0;
        }
        return 0;
    };

    // Jalankan pencarian video
    const fetchPromises = accounts.map(async (acc) => {
        try {
            if (acc.platform.toLowerCase() === 'instagram') {
                const dataIG = await fetchFromApify('apify~instagram-profile-scraper', { usernames: [acc.username] });
                if (dataIG && dataIG.length > 0 && dataIG[0].latestPosts) {
                    dataIG[0].latestPosts.forEach(post => {
                        const postTime = new Date(post.timestamp).getTime();
                        if (now - postTime < TWENTY_FOUR_HOURS) {
                            const hoursAgo = Math.max(1, Math.round((now - postTime) / 3600000));
                            
                            // [FIX] Gunakan Math.max untuk memastikan field mana pun yang terisi angka (bukan 0) akan terambil
                            const viewsCount = Math.max(
                                parseCount(post.videoPlayCount),
                                parseCount(post.videoViewCount),
                                parseCount(post.playCount),
                                parseCount(post.viewCount),
                                parseCount(post.viewsCount)
                            );
                            const likesCount = Math.max(
                                parseCount(post.likesCount),
                                parseCount(post.likeCount),
                                parseCount(post.likes)
                            );

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
                            
                            const viewsCount = Math.max(
                                parseCount(post.playCount),
                                parseCount(post.stats?.playCount),
                                parseCount(post.stat?.playCount)
                            );
                            const likesCount = Math.max(
                                parseCount(post.diggCount),
                                parseCount(post.stats?.diggCount),
                                parseCount(post.stat?.diggCount)
                            );

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
                                
                                const viewsCount = Math.max(
                                    parseCount(post.viewCount),
                                    parseCount(post.views),
                                    parseCount(post.statistics?.viewCount)
                                );
                                const likesCount = Math.max(
                                    parseCount(post.likeCount),
                                    parseCount(post.likes),
                                    parseCount(post.statistics?.likeCount)
                                );

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

    // Mengurutkan dari yang paling baru diupload
    allVideos.sort((a, b) => parseInt(a.upload_time) - parseInt(b.upload_time));

    return res.status(200).json({ videos: allVideos });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
