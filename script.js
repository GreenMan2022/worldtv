document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const channelsList = document.getElementById('channels-list');
    const videoPlayer = document.getElementById('videoPlayer');
    const searchInput = document.getElementById('search');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const retryBtn = document.getElementById('retry');
    const currentChannelNameEl = document.getElementById('current-channel-name');

    let allChannels = [];
    let currentPage = 1;
    const channelsPerPage = 20;

    // ====================
    // FETCH CHANNELS WITH MULTIPLE PROXY FALLBACKS
    // ====================
    async function fetchChannels() {
        const CACHE_KEY = 'iptv_channels';
        const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

        // Try cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_EXPIRY) {
                return data;
            }
        }

        // Proxy URLs - try in order
        const proxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url=',
            'https://thingproxy.freeboard.io/fetch/'
        ];

        const targetUrl = 'https://iptv-org.github.io/iptv/index.m3u8';

        for (let i = 0; i < proxies.length; i++) {
            try {
                console.log(`Trying proxy ${i + 1}: ${proxies[i]}`);
                
                let fetchUrl;
                if (proxies[i].includes('allorigins.win') || proxies[i].includes('freeboard.io')) {
                    fetchUrl = proxies[i] + encodeURIComponent(targetUrl);
                } else {
                    fetchUrl = proxies[i] + targetUrl;
                }

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const response = await fetch(fetchUrl, {
                    signal: controller.signal,
                    headers: {
                        'Accept': 'text/plain'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.text();
                const channels = parseM3U(data);

                if (channels.length > 0) {
                    // Cache successful result
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data: channels,
                        timestamp: Date.now()
                    }));
                    console.log(`✅ Successfully loaded ${channels.length} channels using proxy ${i + 1}`);
                    return channels;
                }
            } catch (err) {
                console.warn(`Proxy ${i + 1} failed:`, err.message);
                if (i === proxies.length - 1) {
                    throw err; // Only throw if all proxies failed
                }
                // Try next proxy
                continue;
            }
        }
    }

    // ====================
    // PARSE M3U FILE
    // ====================
    function parseM3U(data) {
        if (!data || typeof data !== 'string') {
            console.error('Invalid M3U data');
            return [];
        }

        const lines = data.split('\n');
        const channels = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF')) {
                const line = lines[i];
                const url = lines[i + 1]?.trim();

                if (!url || url.startsWith('#') || !url) continue;

                let group = 'unknown';
                let logo = '';
                
                // Extract group
                const groupMatch = line.match(/group-title="([^"]*)"/i);
                if (groupMatch && groupMatch[1]) {
                    group = groupMatch[1].toLowerCase();
                }

                // Extract logo (if available)
                const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
                if (logoMatch && logoMatch[1]) {
                    logo = logoMatch[1];
                }

                // Extract name (everything after last comma)
                const parts = line.split(',');
                const name = parts[parts.length - 1]?.trim() || 'Unknown Channel';

                if (name !== 'Unknown Channel') {
                    channels.push({ 
                        name, 
                        url, 
                        group,
                        logo
                    });
                }
                i++; // Skip URL line
            }
        }

        console.log(`Parsed ${channels.length} channels`);
        return channels;
    }

    // ====================
    // RENDER CHANNELS
    // ====================
    function renderChannelsPage(channels, page) {
        channelsList.innerHTML = '';
        
        if (!channels || channels.length === 0) {
            channelsList.innerHTML = '<li class="no-results">Каналы не найдены</li>';
            return;
        }

        const start = (page - 1) * channelsPerPage;
        const end = start + channelsPerPage;
        const pageChannels = channels.slice(start, end);

        pageChannels.forEach(channel => {
            const li = document.createElement('li');
            li.className = 'channel-item';
            li.textContent = channel.name;
            li.setAttribute("tabIndex", "0");
            li.setAttribute("title", channel.name);
            
            // Add logo if available
            if (channel.logo) {
                const img = document.createElement('img');
                img.src = channel.logo;
                img.alt = channel.name;
                img.className = 'channel-logo';
                img.onerror = () => img.remove(); // Remove if image fails to load
                li.appendChild(img);
            }

            li.addEventListener('click', () => playChannel(channel.url, channel.name));
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playChannel(channel.url, channel.name);
                }
            });

            channelsList.appendChild(li);
        });
    }

    // ====================
    // PLAY CHANNEL
    // ====================
    function playChannel(url, name) {
        if (!url) {
            alert('URL канала не указан');
            return;
        }

        currentChannelNameEl.textContent = name || 'Неизвестный канал';
        videoPlayer.innerHTML = ''; // Clear any previous sources
        videoPlayer.src = ''; // Clear source

        // Hide controls briefly during loading
        videoPlayer.controls = false;

        if (Hls.isSupported()) {
            const hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(url);
            hls.attachMedia(videoPlayer);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('HLS manifest loaded');
                videoPlayer.play().then(() => {
                    videoPlayer.controls = true; // Show controls after play starts
                }).catch(e => {
                    console.error('Play failed:', e);
                    videoPlayer.controls = true;
                    alert('Не удалось воспроизвести канал. Попробуйте другой.');
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data.type, data.details);
                if (data.fatal) {
                    switch(data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            alert('Ошибка сети. Проверьте подключение.');
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            alert('Ошибка медиа. Попробуйте другой канал.');
                            break;
                        default:
                            alert('Ошибка воспроизведения: ' + data.type);
                            break;
                    }
                    hls.destroy();
                }
            });
        } 
        // Fallback for Safari
        else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = url;
            videoPlayer.addEventListener('loadedmetadata', () => {
                videoPlayer.play().then(() => {
                    videoPlayer.controls = true;
                }).catch(e => {
                    console.error('Play failed:', e);
                    videoPlayer.controls = true;
                    alert('Не удалось воспроизвести канал. Попробуйте другой.');
                });
            });
            videoPlayer.addEventListener('error', () => {
                videoPlayer.controls = true;
                alert('Ошибка воспроизведения. Попробуйте другой канал.');
            });
        } 
        else {
            alert('Ваш браузер не поддерживает HLS-потоки. Попробуйте Chrome, Firefox или Edge.');
            videoPlayer.controls = true;
        }
    }

    // ====================
    // RENDER MAIN FUNCTION
    // ====================
    async function renderChannels() {
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        channelsList.innerHTML = '';

        try {
            allChannels = await fetchChannels();
            
            if (!allChannels || allChannels.length === 0) {
                throw new Error('No channels loaded');
            }

            renderChannelsPage(allChannels, currentPage);
            loadingEl.classList.add('hidden');
            
            // Focus first item for keyboard navigation
            setTimeout(() => {
                const firstItem = document.querySelector('.channel-item');
                if (firstItem) firstItem.focus();
            }, 100);

        } catch (err) {
            console.error('❌ Failed to load channels:', err);
            loadingEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
        }
    }

    // ====================
    // SEARCH FUNCTIONALITY
    // ====================
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            renderChannelsPage(allChannels, 1);
            currentPage = 1;
            return;
        }

        const filtered = allChannels.filter(channel => 
            channel.name.toLowerCase().includes(query)
        );
        
        currentPage = 1;
        renderChannelsPage(filtered, currentPage);
    });

    // ====================
    // KEYBOARD NAVIGATION
    // ====================
    document.addEventListener('keydown', (e) => {
        const items = Array.from(document.querySelectorAll('.channel-item'));
        if (items.length === 0) return;

        const currentIndex = items.findIndex(item => item === document.activeElement);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            items[prevIndex].focus();
        } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.classList.contains('channel-item')) {
            e.preventDefault();
            document.activeElement.click();
        }
    });

    // ====================
    // RETRY BUTTON
    // ====================
    retryBtn.addEventListener('click', renderChannels);

    // ====================
    // INITIALIZE APP
    // ====================
    renderChannels();

    // Add service worker for offline support (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.warn('Service Worker registration failed:', err);
        });
    }
});
