document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const channelsGrid = document.getElementById('channels-grid');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoContainer = document.getElementById('video-container');
    const closePlayerBtn = document.getElementById('close-player');
    const searchInput = document.getElementById('search');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const retryBtn = document.getElementById('retry');
    const currentChannelNameEl = document.getElementById('current-channel-name');

    let allChannels = [];
    let focusedChannel = null;
    let previewPlayers = new Map();
    let mainPlayer = null;

    // ====================
    // FETCH CHANNELS
    // ====================
    async function fetchChannels() {
        console.log('🔍 Начинаем загрузку каналов...');

        // Пробуем прокси 1
        try {
            const proxyUrl = 'https://corsproxy.io/?';
            const targetUrl = 'https://iptv-org.github.io/iptv/index.m3u8';
            const fullUrl = proxyUrl + encodeURIComponent(targetUrl);

            const response = await fetch(fullUrl, {
                headers: { 'Accept': 'text/plain' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.text();
            const channels = parseM3U(data);

            if (channels.length > 0) {
                console.log(`✅ Успешно загружено ${channels.length} каналов`);
                return channels;
            }
        } catch (err) {
            console.warn('⚠️ Прокси не сработал:', err.message);
        }

        // Пробуем локальный файл
        try {
            const response = await fetch('channels.m3u8');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.text();
            const channels = parseM3U(data);

            if (channels.length > 0) {
                console.log(`✅ Успешно загружено ${channels.length} каналов из локального файла`);
                return channels;
            }
        } catch (err) {
            console.error('❌ Локальный файл не сработал:', err.message);
        }

        throw new Error('Не удалось загрузить каналы');
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

                if (!url || url.startsWith('#') || url.length < 10) continue;

                const parts = line.split(',');
                const name = parts[parts.length - 1]?.trim();
                if (!name || name.length < 2) continue;

                let group = 'unknown';
                const groupMatch = line.match(/group-title="([^"]*)"/i);
                if (groupMatch && groupMatch[1]) {
                    group = groupMatch[1].toLowerCase();
                }

                let logo = '';
                const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
                if (logoMatch && logoMatch[1]) {
                    logo = logoMatch[1];
                } else {
                    const initials = name.substring(0, 2).toUpperCase();
                    logo = `https://placehold.co/200x120/1a1a2e/ffffff?text=${encodeURIComponent(initials)}`;
                }

                channels.push({ name, url, group, logo });
                i++;
            }
        }

        return channels;
    }

    // ====================
    // RENDER CHANNELS — ПЛИТКИ
    // ====================
    function renderChannelTiles(channels) {
        channelsGrid.innerHTML = '';

        if (!channels || channels.length === 0) {
            channelsGrid.innerHTML = `
                <div class="no-results">
                    <h3>📺 Каналы не найдены</h3>
                    <p>Проверьте файл <code>channels.m3u8</code></p>
                </div>`;
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

            // Видео для превью
            const video = document.createElement('video');
            video.className = 'tile-video';
            video.muted = true; // 🔇 Превью всегда без звука
            video.playsInline = true;
            video.loop = true;

            // Логотип
            const logo = document.createElement('img');
            logo.src = channel.logo;
            logo.alt = channel.name;
            logo.className = 'channel-logo';
            logo.onerror = () => {
                logo.src = `https://placehold.co/200x120/1a1a2e/ffffff?text=${encodeURIComponent(channel.name.substring(0, 2))}`;
            };

            // Название канала
            const name = document.createElement('div');
            name.className = 'channel-name';
            name.textContent = channel.name;

            content.appendChild(video);
            content.appendChild(logo);
            tile.appendChild(content);
            tile.appendChild(name);

            tile.addEventListener('click', () => playInMainPlayer(channel));
            tile.addEventListener('focus', () => handleTileFocus(tile, channel));
            tile.addEventListener('blur', () => handleTileBlur(tile, channel));

            channelsGrid.appendChild(tile);
        });

        setTimeout(() => {
            const firstTile = document.querySelector('.channel-tile');
            if (firstTile) firstTile.focus();
        }, 100);
    }

    // ====================
    // PLAY IN MAIN PLAYER — ГЛАВНАЯ ФУНКЦИЯ
    // ====================
    function playInMainPlayer(channel) {
        // Показываем полноэкранный плеер
        videoContainer.classList.add('fullscreen-player');
        document.body.classList.add('player-active');

        // Обновляем название
        currentChannelNameEl.textContent = channel.name;

        // Очищаем предыдущий HLS
        if (mainPlayer) {
            mainPlayer.destroy();
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                debug: false,
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30
            });

            mainPlayer = hls;
            hls.loadSource(channel.url);
            hls.attachMedia(videoPlayer);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                videoPlayer.play().catch(e => {
                    console.warn('🔇 Автовоспроизведение заблокировано — показываем кнопку');

                    const playButton = createPlayButton(() => {
                        videoPlayer.play().then(() => playButton.remove());
                    });

                    videoContainer.appendChild(playButton);
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    alert('Ошибка воспроизведения: ' + data.type);
                    hls.destroy();
                    mainPlayer = null;
                }
            });

        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = channel.url;
            videoPlayer.addEventListener('loadedmetadata', () => {
                videoPlayer.play().catch(e => {
                    const playButton = createPlayButton(() => {
                        videoPlayer.play().then(() => playButton.remove());
                    });
                    videoContainer.appendChild(playButton);
                });
            });
        }
    }

    // ====================
    // PREVIEW ON FOCUS
    // ====================
    function handleTileFocus(tile, channel) {
        if (focusedChannel === tile) return;

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
                maxBufferLength: 10
            });

            hls.loadSource(channel.url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => {
                    console.warn('🔇 Превью: автовоспроизведение заблокировано');
                });
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
                video.play().catch(e => {
                    console.warn('🔇 Превью: автовоспроизведение заблокировано');
                });
            });
        }
    }

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
    // CREATE PLAY BUTTON
    // ====================
    function createPlayButton(onClick) {
        const playButton = document.createElement('div');
        playButton.className = 'play-button';
        playButton.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 18px;
            z-index: 10;
            display: flex;
            align-items: center;
            gap: 10px;
            user-select: none;
        `;
        playButton.innerHTML = '▶️ Воспроизвести';
        playButton.onclick = onClick;
        return playButton;
    }

    // ====================
    // CLOSE PLAYER
    // ====================
    function closePlayer() {
        if (mainPlayer) {
            mainPlayer.destroy();
            mainPlayer = null;
        }
        videoPlayer.pause();
        videoPlayer.src = '';
        videoPlayer.load();

        videoContainer.classList.remove('fullscreen-player');
        document.body.classList.remove('player-active');
    }

    // ====================
    // MAIN RENDER FUNCTION
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
        const filtered = allChannels.filter(channel => 
            channel.name.toLowerCase().includes(query)
        );
        renderChannelTiles(filtered);
    });

    // ====================
    // KEYBOARD NAVIGATION
    // ====================
    document.addEventListener('keydown', (e) => {
        if (document.body.classList.contains('player-active')) {
            if (e.key === 'Escape') {
                closePlayer();
            }
            return;
        }

        const tiles = Array.from(document.querySelectorAll('.channel-tile'));
        if (tiles.length === 0) return;

        const currentIndex = tiles.findIndex(tile => tile === document.activeElement);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;

        if (e.key === 'ArrowRight') {
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
    // EVENT LISTENERS
    // ====================
    retryBtn.addEventListener('click', renderChannels);
    closePlayerBtn.addEventListener('click', closePlayer);

    // ====================
    // INITIALIZE
    // ====================
    renderChannels();
});
