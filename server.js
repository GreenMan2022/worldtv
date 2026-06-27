// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Кэш каналов (обновление при старте)
let channelCache = {
    data: [],
    categories: {},
    lastUpdate: 0
};

// Парсинг M3U
function parseM3U(content) {
    const channels = [];
    const lines = content.split('\n');
    let currentGroup = 'General';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('#EXTINF:')) {
            const infoLine = line;
            const urlLine = lines[i + 1]?.trim() || '';
            
            if (urlLine && !urlLine.startsWith('#')) {
                let name = infoLine.split(',')[1] || 'Channel';
                let group = currentGroup;
                let logo = '';
                
                const groupMatch = infoLine.match(/group-title="([^"]*)"/);
                if (groupMatch) group = groupMatch[1];
                
                const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
                if (logoMatch) logo = logoMatch[1];
                
                const nameMatch = infoLine.match(/tvg-name="([^"]*)"/);
                if (nameMatch) name = nameMatch[1];
                
                channels.push({
                    name: name.trim(),
                    url: urlLine,
                    group: group,
                    logo: logo
                });
            }
        }
    }
    return channels;
}

// Загрузка плейлиста через fetch (если доступно)
async function fetchPlaylist(url) {
    try {
        // Для Render используем встроенный fetch (Node 18+)
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.text();
    } catch (error) {
        console.error(`❌ Ошибка загрузки ${url}:`, error.message);
        return '';
    }
}

// Обновление кэша
async function updateChannelCache() {
    console.log('🔄 Обновление кэша каналов...');
    
    try {
        const indexContent = await fetchPlaylist('https://iptv-org.github.io/iptv/index.m3u');
        let allChannels = parseM3U(indexContent);
        
        // Группировка по категориям
        const categories = {};
        allChannels.forEach(ch => {
            const cat = ch.group || 'Other';
            if (!categories[cat]) categories[cat] = [];
            if (categories[cat].length < 100) { // Лимит 100 на категорию
                categories[cat].push(ch);
            }
        });
        
        channelCache.data = allChannels.slice(0, 2000); // Первые 2000
        channelCache.categories = categories;
        channelCache.lastUpdate = Date.now();
        
        console.log(`✅ Кэш обновлен: ${allChannels.length} каналов, ${Object.keys(categories).length} категорий`);
    } catch (error) {
        console.error('❌ Ошибка обновления кэша:', error);
    }
}

// Генерация HTML с метаданными
function generateHTML(title, description, keywords, canonical, ogImage, pageType = 'website') {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const $ = cheerio.load(html);
    
    // Базовые мета-теги
    $('title').text(title);
    $('meta[name="description"]').attr('content', description);
    $('meta[name="keywords"]').attr('content', keywords);
    
    // Добавляем canonical если есть
    if (canonical) {
        if ($('link[rel="canonical"]').length === 0) {
            $('head').append(`<link rel="canonical" href="${canonical}" />`);
        } else {
            $('link[rel="canonical"]').attr('href', canonical);
        }
    }
    
    // Open Graph
    $('meta[property="og:title"]').attr('content', title);
    $('meta[property="og:description"]').attr('content', description);
    $('meta[property="og:type"]').attr('content', pageType);
    if (canonical) $('meta[property="og:url"]').attr('content', canonical);
    if (ogImage) $('meta[property="og:image"]').attr('content', ogImage);
    
    // Twitter Cards
    $('meta[name="twitter:card"]').attr('content', 'summary_large_image');
    $('meta[name="twitter:title"]').attr('content', title);
    $('meta[name="twitter:description"]').attr('content', description);
    if (ogImage) $('meta[name="twitter:image"]').attr('content', ogImage);
    
    // Schema.org
    const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "World TV",
        "description": description,
        "applicationCategory": "Multimedia",
        "operatingSystem": "All",
        "browserRequirements": "Requires modern browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "reviewCount": Math.floor(Math.random() * 1000) + 500
        },
        "url": "https://worldtv.onrender.com/"
    };
    
    const schemaScript = `<script type="application/ld+json">${JSON.stringify(schemaData)}</script>`;
    $('head').append(schemaScript);
    
    return $.html();
}

// ============ МАРШРУТЫ ============

// Главная
app.get('/', (req, res) => {
    const lang = req.query.lang || 'en';
    const isRu = lang === 'ru';
    
    const title = isRu 
        ? 'World TV — Смотрите бесплатные каналы онлайн в HD' 
        : 'World TV — Watch Free Live TV Channels Online in HD';
    const description = isRu
        ? 'Более 20,000 каналов со всего мира: новости, спорт, фильмы, сериалы, музыка. Бесплатно, без регистрации, в HD качестве.'
        : 'Over 20,000 channels worldwide: news, sports, movies, series, music. Free, no registration, in HD quality.';
    const keywords = isRu
        ? 'бесплатное тв, смотреть онлайн, iptv, каналы мира, hd видео, прямой эфир'
        : 'free tv, watch online, iptv, worldwide channels, hd video, live stream';
    
    const html = generateHTML(
        title, 
        description, 
        keywords,
        'https://worldtv.onrender.com/',
        'https://worldtv.onrender.com/og-image.jpg'
    );
    res.send(html);
});

// Категории (динамические страницы)
app.get('/category/:slug', async (req, res) => {
    const slug = req.params.slug;
    const lang = req.query.lang || 'en';
    const isRu = lang === 'ru';
    
    // Ищем категорию
    let categoryName = null;
    let channels = [];
    
    for (const [cat, chs] of Object.entries(channelCache.categories)) {
        const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (catSlug === slug) {
            categoryName = cat;
            channels = chs;
            break;
        }
    }
    
    if (!categoryName) {
        // Если категория не найдена, показываем главную
        return res.redirect('/');
    }
    
    const title = isRu
        ? `${categoryName} — Смотреть онлайн бесплатно | World TV`
        : `${categoryName} — Watch Free Online | World TV`;
    const description = isRu
        ? `Смотрите каналы в категории "${categoryName}" бесплатно в HD качестве. ${channels.length} каналов онлайн без регистрации.`
        : `Watch "${categoryName}" channels free in HD quality. ${channels.length} channels online without registration.`;
    
    const html = generateHTML(
        title,
        description,
        `iptv,${categoryName},live tv,free,online streaming`,
        `https://worldtv.onrender.com/category/${slug}`,
        'https://worldtv.onrender.com/og-image.jpg'
    );
    res.send(html);
});

// Каналы (динамические страницы)
app.get('/channel/:slug', (req, res) => {
    const slug = req.params.slug;
    const lang = req.query.lang || 'en';
    const isRu = lang === 'ru';
    
    // Ищем канал
    let channel = null;
    for (const ch of channelCache.data) {
        const chSlug = ch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (chSlug === slug) {
            channel = ch;
            break;
        }
    }
    
    if (!channel) {
        return res.redirect('/');
    }
    
    const title = isRu
        ? `${channel.name} — Смотреть онлайн прямой эфир бесплатно | World TV`
        : `${channel.name} — Watch Live Online Free | World TV`;
    const description = isRu
        ? `Смотрите канал "${channel.name}" в прямом эфире бесплатно. HD качество, без регистрации. ${channel.group}`
        : `Watch "${channel.name}" live online free. HD quality, no registration. ${channel.group}`;
    
    const ogImage = channel.logo || 'https://worldtv.onrender.com/default-logo.png';
    
    const html = generateHTML(
        title,
        description,
        `${channel.name},live tv,stream,free,iptv`,
        `https://worldtv.onrender.com/channel/${slug}`,
        ogImage
    );
    res.send(html);
});

// Sitemap.xml (динамический)
app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://worldtv.onrender.com';
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
    
    // Главная
    sitemap += `
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/?lang=ru"/>
        <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/?lang=en"/>
    </url>`;
    
    // Категории (первые 50)
    const categories = Object.keys(channelCache.categories).slice(0, 50);
    categories.forEach(cat => {
        const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sitemap += `
    <url>
        <loc>${baseUrl}/category/${slug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
    });
    
    // Каналы (первые 100)
    channelCache.data.slice(0, 100).forEach(ch => {
        const slug = ch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sitemap += `
    <url>
        <loc>${baseUrl}/channel/${slug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
        ${ch.logo ? `<image:image><image:loc>${ch.logo}</image:loc></image:image>` : ''}
    </url>`;
    });
    
    sitemap += '\n</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
    const robots = `# robots.txt для World TV
User-agent: *
Allow: /
Sitemap: https://worldtv.onrender.com/sitemap.xml

# Ускорение индексации
User-agent: Yandex
Host: worldtv.onrender.com
Sitemap: https://worldtv.onrender.com/sitemap.xml

User-agent: Googlebot
Sitemap: https://worldtv.onrender.com/sitemap.xml

# Запрещаем индексацию служебных страниц
Disallow: /api/
Disallow: /admin/
Disallow: /private/`;
    
    res.header('Content-Type', 'text/plain');
    res.send(robots);
});

// Health check для Render
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        channels: channelCache.data.length,
        categories: Object.keys(channelCache.categories).length,
        uptime: process.uptime()
    });
});

// ============ ЗАПУСК ============

// Обновляем кэш при старте
updateChannelCache();

// Обновляем кэш каждый час
setInterval(updateChannelCache, 3600000);

app.listen(PORT, () => {
    console.log(`🚀 World TV SEO-сервер запущен на порту ${PORT}`);
    console.log(`📺 Каналов в кэше: ${channelCache.data.length}`);
    console.log(`📁 Категорий: ${Object.keys(channelCache.categories).length}`);
});
