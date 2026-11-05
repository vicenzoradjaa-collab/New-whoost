// api/refresh-views.js
// Mengambil views TERBARU dari daftar URL video (TikTok / Instagram / YouTube) lewat Apify.
// HANYA membaca & mengembalikan angka views. Penulisan ke database dilakukan di browser admin.
// Hanya bisa dipanggil oleh admin (token Supabase diverifikasi), supaya kuota Apify tidak disalahgunakan.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cqbbejiwbghuntecvxtr.supabase.co';
// Publishable (anon) key memang publik & sudah ada di authentication/auth.js
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-u9Si0LbrRtiuWdiyqK8rA_XdqFEZoX';

const MAX_URLS_PER_REQUEST = 20;

const VIEW_FIELDS = [
  'videoViewCount', 'videoPlayCount', 'playCount', 'viewCount', 'viewsCount', 'views',
  'stats.playCount', 'stat.playCount', 'videoMeta.playCount', 'statistics.viewCount',
  'metrics.viewCount', 'metrics.playCount', 'edge_media_to_view_count.count'
];

export function detectPlatform(url) {
  const u = String(url || '').toLowerCase();
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  return null;
}

// Kunci unik per video, dipakai untuk mencocokkan hasil Apify dengan URL yang diminta
export function videoKey(platform, url) {
  const s = String(url || '');
  let m;
  if (platform === 'tiktok') {
    m = s.match(/video\/(\d+)/);
    return m ? m[1] : null;
  }
  if (platform === 'instagram') {
    m = s.match(/instagram\.com\/(?:[^/]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
    return m ? m[1] : null;
  }
  if (platform === 'youtube') {
    m = s.match(/(?:shorts\/|[?&]v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }
  return null;
}

export function parseCount(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    let mult = 1;
    const c = val.toUpperCase().trim();
    if (c.endsWith('K')) mult = 1e3; else if (c.endsWith('M')) mult = 1e6; else if (c.endsWith('B')) mult = 1e9;
    const p = parseFloat(c.replace(/[^0-9.]/g, ''));
    return isNaN(p) ? 0 : Math.floor(p * mult);
  }
  return 0;
}

export function extractMaxViews(post) {
  let max = 0;
  for (const field of VIEW_FIELDS) {
    let cur = post;
    for (const part of field.split('.')) {
      if (cur === null || cur === undefined) { cur = undefined; break; }
      cur = cur[part];
    }
    const n = parseCount(cur);
    if (n > max) max = n;
  }
  return max;
}

// Ambil semua kandidat URL/ID dari satu item hasil Apify
function itemKeys(platform, item) {
  const keys = new Set();
  const cands = [item.webVideoUrl, item.videoWebUrl, item.url, item.inputUrl, item.postUrl, item.shortCodeUrl];
  for (const c of cands) { const k = videoKey(platform, c); if (k) keys.add(k); }
  if (platform === 'tiktok' && item.id) keys.add(String(item.id));
  if (platform === 'instagram' && item.shortCode) keys.add(String(item.shortCode));
  if (platform === 'youtube' && (item.id || item.videoId)) keys.add(String(item.id || item.videoId));
  return keys;
}

async function runApify(token, actorId, input) {
  const res = await fetch(`https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error(`Apify ${actorId} gagal (HTTP ${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

const APIFY_BY_PLATFORM = {
  tiktok: (urls) => ['clockworks~tiktok-scraper', { postURLs: urls, resultsPerPage: 1, shouldDownloadVideos: false }],
  instagram: (urls) => ['apify~instagram-reel-scraper', { username: urls, resultsLimit: 1 }],
  youtube: (urls) => ['streamers~youtube-scraper', { startUrls: urls.map(u => ({ url: u })), maxResults: 0, maxResultsShorts: 0 }]
};

export async function fetchViewsForPlatform(token, platform, urls) {
  const [actorId, input] = APIFY_BY_PLATFORM[platform](urls);
  const items = await runApify(token, actorId, input);
  const out = {};
  for (const url of urls) {
    const key = videoKey(platform, url);
    let best = null;
    if (key) {
      for (const item of items) {
        if (!item || item.error) continue;
        if (itemKeys(platform, item).has(key)) {
          const v = extractMaxViews(item);
          if (best === null || v > best) best = v;
        }
      }
    }
    out[url] = best; // null = tidak ditemukan / gagal, JANGAN diperlakukan sebagai 0
  }
  return out;
}

async function assertAdmin(accessToken) {
  const h = { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` };
  const uRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: h });
  if (!uRes.ok) return false;
  const user = await uRes.json();
  if (!user || !user.id) return false;
  const pRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role,status`, { headers: h });
  if (!pRes.ok) return false;
  const rows = await pRes.json();
  const p = Array.isArray(rows) ? rows[0] : null;
  return !!p && p.role === 'admin' && p.status !== 'banned';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Hanya menerima method POST' });
  }

  try {
    const auth = req.headers.authorization || '';
    const accessToken = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!accessToken || !(await assertAdmin(accessToken))) {
      return res.status(403).json({ error: 'Akses ditolak. Hanya admin yang boleh refresh views.' });
    }

    const APIFY_TOKEN = process.env.APIFY_TOKEN;
    if (!APIFY_TOKEN) throw new Error('Token Apify belum disetting di Vercel.');

    const urls = Array.isArray(req.body && req.body.urls) ? [...new Set(req.body.urls.map(String))] : [];
    if (urls.length === 0) return res.status(200).json({ results: {} });
    if (urls.length > MAX_URLS_PER_REQUEST) {
      return res.status(400).json({ error: `Maksimal ${MAX_URLS_PER_REQUEST} URL per request.` });
    }

    const byPlatform = { tiktok: [], instagram: [], youtube: [] };
    const results = {};
    for (const url of urls) {
      const p = detectPlatform(url);
      if (!p || !/^https?:\/\//i.test(url)) { results[url] = null; continue; }
      byPlatform[p].push(url);
    }

    const errors = [];
    await Promise.all(Object.entries(byPlatform).map(async ([platform, list]) => {
      if (list.length === 0) return;
      try {
        Object.assign(results, await fetchViewsForPlatform(APIFY_TOKEN, platform, list));
      } catch (e) {
        console.error(`refresh-views ${platform}:`, e.message);
        errors.push(`${platform}: ${e.message}`);
        list.forEach(u => { results[u] = null; });
      }
    }));

    return res.status(200).json({ results, errors });
  } catch (err) {
    console.error('refresh-views error:', err);
    return res.status(500).json({ error: err.message || 'Terjadi kesalahan server.' });
  }
}
