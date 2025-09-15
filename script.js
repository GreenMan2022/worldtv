document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const channelsGrid = document.getElementById('channels-grid');
    const videoPlayer = document.getElementById('videoPlayer');
    const searchInput = document.getElementById('search');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const retryBtn = document.getElementById('retry');
    const currentChannelNameEl = document.getElementById('current-channel-name');

    let allChannels = [];
    let focusedChannel = null;
    let previewPlayers = new Map(); // HLS instances for previews

    // ====================
    // FETCH CHANNELS
    // ====================
    async function fetchChannels() {
        const CACHE_KEY = 'iptv_channels';
        const CACHE_EXPIRY = 1000 * 60 * 60 * 24;

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_EXPIRY) {
                console.log('✅ Загружено из кэша');
                return data;
            }
        }

        try {
            const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
            const targetUrl = 'https://iptv-org.github.io/iptv/index.m3u8';
            const fullUrl = proxyUrl + encodeURIComponent(targetUrl);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(fullUrl, {
                signal: controller.signal,
                headers: { 'Accept': 'text/plain' }
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.text();
            const channels = parseM3U(data);

            if (channels.length === 0) throw new Error('Нет каналов');

            localStorage.setItem(CACHE_KEY, JSON.stringify({
                 channels,
                timestamp: Date.now()
            }));

            console.log(`✅ Загружено ${channels.length} каналов`);
            return channels;

        } catch (err) {
            console.warn('⚠️ Прокси не сработал:', err.message);
            console.log('🔄 Переключаемся на локальный файл...');

            try {
                const response = await fetch('channels.m3u8');
                if (!response.ok) throw new Error('Локальный файл не найден');

                const data = await response.text();
                const channels = parseM3U(data);

                if (channels.length === 0) throw new Error('Нет каналов в локальном файле');

                localStorage.setItem(CACHE_KEY, JSON.stringify({
                     channels,
                    timestamp: Date.now()
                }));

                console.log(`✅ Загружено ${channels.length} каналов из локального файла`);
                return channels;

            } catch (localErr) {
                console.error('❌ Локальный файл тоже не доступен:', localErr.message);
                throw new Error('Ни прокси, ни локальный файл не сработали');
            }
        }
    }

    // ====================
    // PARSE M3U
    // ====================
    function parseM3U(data) {
        if (!data || typeof data !== 'string') return [];

        const lines = data.split('\n');
        const channels = [];

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('#EXTINF')) {
                const line = lines[i];
                const url = lines[i + 1]?.trim();

                if (!url || url.startsWith('#') || !url) continue;

                let group = 'unknown';
                let logo = '';
                
                const groupMatch = line.match(/group-title="([^"]*)"/i);
                if (groupMatch && groupMatch[1]) {
                    group = groupMatch[1].toLowerCase();
                }

                const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
                if (logoMatch && logoMatch[1]) {
                    logo = logoMatch[1];
                }

                const parts = line.split(',');
                const name = parts[parts.length - 1]?.trim() || 'Неизвестный канал';

                if (name !== 'Неизвестный канал') {
                    channels.push({ 
                        name, 
                        url, 
                        group,
                        logo: logo || 'https://placehold.co/200x120/1a1a2e/ffffff?text=' + encodeURIComponent(name.substring(0, 2))
                    });
                }
                i++;
            }
        }

        return channels;
    }

    // ====================
    // RENDER CHANNELS AS TILES
    // ====================
    function renderChannelTiles(channels) {
        channelsGrid.innerHTML = '';

        if (!channels || channels.length === 0) {
            channelsGrid.innerHTML = '<div class="no-results">Каналы не найдены</div>';
            return;
        }

        channels.forEach(channel => {
            const tile = document.createElement('div');
            tile.className = 'channel-tile';
            tile.setAttribute('tabIndex', '0');
            tile.setAttribute('title', channel.name);
            tile.dataset.url = channel.url;
            tile.dataset.name = channel.name;

            const content = document.createElement('div');
            content.className = 'tile-content';

            // Video element for preview
            const video = document.createElement('video');
            video.className = 'tile-video';
            video.muted = true;
            video.playsInline = true;
            video.loop = true;

            // Logo
            const logo = document.createElement('img');
            logo.src = channel.logo;
            logo.alt = channel.name;
            logo.className = 'channel-logo';
            logo.onerror = () => {
                logo.src = 'https://placehold.co/200x120/1a1a2e/ffffff?text=' + encodeURIComponent(channel.name.substring(0, 2));
            };

            // Channel name overlay
            const name = document.createElement('div');
            name.className = 'channel-name';
            name.textContent = channel.name;

            content.appendChild(video);
            content.appendChild(logo);
            tile.appendChild(content);
            tile.appendChild(name);

            tile.addEventListener('click', () => playMainChannel(channel.url, channel.name));
            
            tile.addEventListener('focus', () => handleTileFocus(tile, channel));
            tile.addEventListener('blur', () => handleTileBlur(tile, channel));

            channelsGrid.appendChild(tile);
        });

        // Focus first tile
        setTimeout(() => {
            const firstTile = document.querySelector('.channel-tile');
            if (firstTile) firstTile.focus();
        }, 100);
    }

    // ====================
    // HANDLE TILE FOCUS (PREVIEW)
    // ====================
    function handleTileFocus(tile, channel) {
        if (focusedChannel === tile) return;
        
        // Stop previous preview
        if (focusedChannel) {
            const prevVideo = focusedChannel.querySelector('.tile-video');
            const prevHls = previewPlayers.get(focusedChannel);
            if (prevHls) {
                prevHls.destroy();
                previewPlayers.delete(focusedChannel);
            }
            if (prevVideo) {
                prevVideo.src = '';
                prevVideo.load();
            }
        }

        focusedChannel = tile;

        const video = tile.querySelector('.tile-video');
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 10,
                maxMaxBufferLength: 20
            });

            hls.loadSource(channel.url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.warn('Preview play failed:', e));
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    hls.destroy();
                    previewPlayers.delete(tile);
                }
            });

            previewPlayers.set(tile, hls);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = channel.url;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => console.warn('Preview play failed:', e));
            });
        }
    }

    // ====================
    // HANDLE TILE BLUR
    // ====================
    function handleTileBlur(tile, channel) {
        const hls = previewPlayers.get(tile);
        if (hls) {
            hls.destroy();
            previewPlayers.delete(tile);
        }

        const video = tile.querySelector('.tile-video');
        if (video) {
            video.src = '';
            video.load();
        }
    }

    // ====================
    // PLAY MAIN CHANNEL
    // ====================
    function playMainChannel(url, name) {
        currentChannelNameEl.textContent = name || 'Неизвестный канал';
        videoPlayer.innerHTML = '';
        videoPlayer.src = '';
        videoPlayer.controls = true;

        if (Hls.isSupported()) {
            // Destroy any existing HLS instance
            if (window.mainHls) {
                window.mainHls.destroy();
            }

            const hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            window.mainHls = hls;
            hls.loadSource(url);
            hls.attachMedia(videoPlayer);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoPlayer.play().catch(e => {
                    console.error('Play failed:', e);
                    alert('Не удалось воспроизвести канал. Попробуйте другой.');
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('HLS Error:', data.type, data.details);
                if (data.fatal) {
                    alert('Ошибка воспроизведения: ' + data.type);
                    hls.destroy();
                }
            });
        } 
        else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = url;
            videoPlayer.addEventListener('loadedmetadata', () => {
                videoPlayer.play().catch(e => {
                    console.error('Play failed:', e);
                    alert('Не удалось воспроизвести канал. Попробуйте другой.');
                });
            });
        } 
        else {
            alert('Ваш браузер не поддерживает HLS-потоки. Попробуйте Chrome, Firefox или Edge.');
        }
    }

    // ====================
    // RENDER MAIN FUNCTION
    // ====================
    async function renderChannels() {
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        channelsGrid.innerHTML = '';

        try {
            allChannels = await fetchChannels();
            renderChannelTiles(allChannels);
            loadingEl.classList.add('hidden');
        } catch (err) {
            console.error('❌ Не удалось загрузить каналы:', err);
            loadingEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
        }
    }

    // ====================
    // SEARCH
    // ====================
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (query === '') {
            renderChannelTiles(allChannels);
            return;
        }

        const filtered = allChannels.filter(channel => 
            channel.name.toLowerCase().includes(query)
        );
        
        renderChannelTiles(filtered);
    });

    // ====================
    // KEYBOARD NAVIGATION
    // ====================
    document.addEventListener('keydown', (e) => {
        const tiles = Array.from(document.querySelectorAll('.channel-tile'));
        if (tiles.length === 0) return;

        const currentIndex = tiles.findIndex(tile => tile === document.activeElement);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;

        if (e.key === 'ArrowRight') {
            const rowLength = Math.floor(document.querySelector('.channels-grid').clientWidth / 180);
            nextIndex = (currentIndex + 1) % tiles.length;
        } else if (e.key === 'ArrowLeft') {
            nextIndex = (currentIndex - 1 + tiles.length) % tiles.length;
        } else if (e.key === 'ArrowDown') {
            const rowLength = Math.floor(document.querySelector('.channels-grid').clientWidth / 180) || 1;
            nextIndex = (currentIndex + rowLength) % tiles.length;
        } else if (e.key === 'ArrowUp') {
            const rowLength = Math.floor(document.querySelector('.channels-grid').clientWidth / 180) || 1;
            nextIndex = (currentIndex - rowLength + tiles.length) % tiles.length;
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (document.activeElement.classList.contains('channel-tile')) {
                document.activeElement.click();
            }
        }

        if (nextIndex !== currentIndex) {
            e.preventDefault();
            tiles[nextIndex].focus();
        }
    });

    // ====================
    // RETRY BUTTON
    // ====================
    retryBtn.addEventListener('click', renderChannels);

    // ====================
    // INITIALIZE
    // ====================
    renderChannels();
});
