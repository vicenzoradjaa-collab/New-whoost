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

    const parseCount = (val) => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return isNaN(val) ? 0 : val; 
        if (typeof val === 'string') {
            let multiplier = 1;
            let cleanStr = val.toUpperCase().trim();
            if (cleanStr.endsWith('K')) multiplier = 1000;
            else if (cleanStr.endsWith('M')) multiplier = 1000000;
            else if (cleanStr.endsWith('B')) multiplier = 1000000000;
            
            const cleaned = cleanStr.replace(/[^0-9.]/g, ''); 
            const parsed = parseFloat(cleaned);
            if (isNaN(parsed)) return 0;
            return Math.floor(parsed * multiplier);
        }
        return 0;
    };

    const extractMaxCount = (post, fieldList) => {
        let max = 0;
        for (const field of fieldList) {
            const parts = field.split('.');
            let current = post;
            for (const part of parts) {
                if (current === null || current === undefined) {
                    current = undefined;
                    break;
                }
                current = current[part];
            }
            const count = parseCount(current);
            if (count > max) max = count;
        }
        return max;
    };

    const viewFields = [
        'videoViewCount', 'videoPlayCount', 'playCount', 'viewCount', 'viewsCount', 'views', 
        'stats.playCount', 'stat.playCount', 'videoMeta.playCount', 'statistics.viewCount', 
        'metrics.viewCount', 'metrics.playCount', 'edge_media_to_view_count.count'
    ];

    const likeFields = [
        'likesCount', 'likeCount', 'likes', 'diggCount', 'stats.diggCount', 'stat.diggCount', 
        'statistics.likeCount', 'metrics.likeCount', 'edge_media_preview_like.count', 'edge_liked_by.count'
    ];

    const fetchPromises = accounts.map(async (acc) => {
        try {
            if (acc.platform.toLowerCase() === 'instagram') {
                let igPosts = [];
                try {
                    const dataReels = await fetchFromApify('apify~instagram-reel-scraper', {
                        username: [acc.username],
                        resultsLimit: 10,
                        onlyPostsNewerThan: '1 day'
                    });
                    if (Array.isArray(dataReels)) igPosts = dataReels.filter(p => p && p.timestamp && !p.error);
                } catch (e) {
                    console.error(`Reel scraper gagal untuk ${acc.username}, fallback ke profile scraper:`, e.message);
                }

                if (igPosts.length === 0) {
                    const dataIG = await fetchFromApify('apify~instagram-profile-scraper', { usernames: [acc.username] });
                    if (dataIG && dataIG.length > 0 && dataIG[0].latestPosts) igPosts = dataIG[0].latestPosts;
                }

                if (igPosts.length > 0) {
                    igPosts.forEach(post => {
                        const postTime = new Date(post.timestamp).getTime();
                        if (now - postTime < TWENTY_FOUR_HOURS) {
                            const hoursAgo = Math.max(1, Math.round((now - postTime) / 3600000));
                            const viewsCount = parseCount(post.videoViewCount) || extractMaxCount(post, viewFields);
                            const likesCount = extractMaxCount(post, likeFields);
                            
                            // Ambil teks caption
                            const captionText = post.caption || post.text || '';

                            allVideos.push({
                                id: post.id,
                                platform: 'Instagram',
                                url: post.url,
                                thumbnail: post.displayUrl || post.videoUrl || 'https://placehold.co/400x600/121214/27272a?text=Instagram+Video',
                                caption: captionText, // [BARU]
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
                            const viewsCount = extractMaxCount(post, viewFields);
                            const likesCount = extractMaxCount(post, likeFields);
                            
                            // Ambil teks caption
                            const captionText = post.text || post.desc || '';

                            allVideos.push({
                                id: post.id,
                                platform: 'TikTok',
                                url: post.webVideoUrl || post.videoWebUrl || `https://www.tiktok.com/@${acc.username}/video/${post.id}`,
                                thumbnail: post.covers?.[0] || post.videoMeta?.coverUrl || 'https://placehold.co/400x600/121214/27272a?text=TikTok+Video',
                                caption: captionText, // [BARU]
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
                                const viewsCount = extractMaxCount(post, viewFields);
                                const likesCount = extractMaxCount(post, likeFields);
                                
                                // Ambil teks caption
                                const captionText = post.title || post.description || '';

                                allVideos.push({
                                    id: post.id || post.videoId,
                                    platform: 'YouTube',
                                    url: post.url,
                                    thumbnail: post.thumbnailUrl || `https://img.youtube.com/vi/${post.id || post.videoId}/hqdefault.jpg`,
                                    caption: captionText, // [BARU]
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
    allVideos.sort((a, b) => parseInt(a.upload_time) - parseInt(b.upload_time));

    return res.status(200).json({ videos: allVideos });

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
