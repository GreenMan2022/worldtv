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
    let displayedChannels = [];
    let startIndex = 0;
    const batchSize = 24;
    let isLoading = false;
    let hasMore = true;

    let focusedChannel = null;
    let previewPlayers = new Map();
    let mainPlayer = null;

    // ====================
    // BLACKLIST MANAGEMENT
    // ====================
    const BLACKLIST_KEY = 'iptv_blacklist';

    function getBlacklist() {
        try {
            const data = localStorage.getItem(BLACKLIST_KEY);
            return data ? new Set(JSON.parse(data)) : new Set();
        } catch (e) {
            console.warn('⚠️ Ошибка чтения чёрного списка:', e);
            return new Set();
        }
    }

    function addToBlacklist(url) {
        if (!url) return;
        const blacklist = getBlacklist();
        blacklist.add(url);
        try {
            localStorage.setItem(BLACKLIST_KEY, JSON.stringify([...blacklist]));
            console.log('🚫 Добавлено в чёрный список:', url);
        } catch (e) {
            console.warn('⚠️ Не удалось сохранить чёрный список:', e);
        }
    }

    function isBlacklisted(url) {
        return getBlacklist().has(url);
    }

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
            const blacklist = getBlacklist();
            const filtered = channels.filter(channel => !isBlacklisted(channel.url));

            console.log(`✅ Успешно загружено ${channels.length} каналов, после фильтрации: ${filtered.length}`);
            return filtered;

        } catch (err) {
            console.warn('⚠️ Прокси не сработал:', err.message);
        }

        // Пробуем локальный файл
        try {
            console.log('📂 Пробуем локальный файл channels.m3u8');

            const response = await fetch('channels.m3u8');
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

            const data = await response.text();
            console.log('📄 Размер файла:', data.length, 'символов');

            if (!data || data.trim().length === 0) {
                throw new Error('Файл пустой');
            }

            if (data.includes('<!DOCTYPE html>') || data.includes('<html')) {
                throw new Error('Файл содержит HTML — возможно, 404');
            }

            const channels = parseM3U(data);
            const blacklist = getBlacklist();
            const filtered = channels.filter(channel => !isBlacklisted(channel.url));

            console.log(`✅ Успешно загружено ${channels.length} каналов из локального файла, после фильтрации: ${filtered.length}`);
            return filtered;

        } catch (err) {
            console.error('❌ Локальный файл не сработал:', err.message);
            throw new Error('Ни прокси, ни локальный файл не вернули каналы. Проверьте файл channels.m3u8.');
        }
    }

    // ====================
    // PARSE M3U
    // ====================
    function parseM3U(data) {
        if (!data || typeof data !== 'string') {
            console.error('❌ Некорректные входные данные');
            return [];
        }

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

        console.log(`📊 Распарсено ${channels.length} каналов`);
        return channels;
    }

    // ====================
    // RENDER CHANNEL BATCH
    // ====================
    function renderChannelBatch() {
        if (isLoading || !hasMore) return;

        isLoading = true;
        loadingEl.classList.remove('hidden');

        setTimeout(() => {
            const endIndex = Math.min(startIndex + batchSize, allChannels.length);
            const batch = allChannels.slice(startIndex, endIndex);

            batch.forEach(channel => {
                const tile = document.createElement('div');
                tile.className = 'channel-tile';
                tile.setAttribute('tabIndex', '0');
                tile.setAttribute('title', channel.name);
                tile.dataset.url = channel.url;
                tile.dataset.name = channel.name;

                const content = document.createElement('div');
                content.className = 'tile-content';

                const video = document.createElement('video');
                video.className = 'tile-video';
                video.muted = true;
                video.playsInline = true;
                video.loop = true;

                const logo = document.createElement('img');
                logo.src = channel.logo;
                logo.alt = channel.name;
                logo.className = 'channel-logo';
                logo.onerror = () => {
                    logo.src = `https://placehold.co/200x120/1a1a2e/ffffff?text=${encodeURIComponent(channel.name.substring(0, 2))}`;
                };

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
                displayedChannels.push(channel);
            });

            startIndex = endIndex;
            hasMore = endIndex < allChannels.length;

            isLoading = false;
            loadingEl.classList.add('hidden');

            if (endIndex === batchSize) {
                setTimeout(() => {
                    const firstTile = document.querySelector('.channel-tile');
                    if (firstTile) firstTile.focus();
                }, 100);
            }
        }, 300);
    }

    // ====================
    // INFINITE SCROLL
    // ====================
    function setupInfiniteScroll() {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
                renderChannelBatch();
            }
        });

        const trigger = document.createElement('div');
        trigger.id = 'load-trigger';
        trigger.style.height = '50px';
        channelsGrid.appendChild(trigger);
        observer.observe(trigger);
    }

    // ====================
    // ENTER FULLSCREEN MODE
    // ====================
    function enterFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // Safari
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE11
            element.msRequestFullscreen();
        }
    }

    // ====================
    // EXIT FULLSCREEN MODE
    // ====================
    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    // ====================
    // PLAY IN MAIN PLAYER — С ПОЛНОЭКРАННЫМ РЕЖИМОМ
    // ====================
    function playInMainPlayer(channel) {
        // Показываем плеер
        videoContainer.style.display = 'block';
        videoContainer.classList.add('fullscreen-player');
        document.body.classList.add('player-active');
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
                videoPlayer.play().then(() => {
                    // 🔥 ВХОДИМ В ПОЛНОЭКРАННЫЙ РЕЖИМ
                    enterFullscreen(videoContainer);
                }).catch(e => {
                    const playButton = createPlayButton(() => {
                        videoPlayer.play().then(() => {
                            enterFullscreen(videoContainer);
                        });
                    });
                    videoContainer.appendChild(playButton);
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('❌ HLS Error:', data.type, data.details);
                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        addToBlacklist(channel.url);
                        alert('Канал недоступен и добавлен в чёрный список.');
                    } else {
                        alert('Ошибка воспроизведения: ' + data.type);
                    }
                    hls.destroy();
                    mainPlayer = null;
                    closePlayer();
                }
            });
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            videoPlayer.src = channel.url;
            videoPlayer.addEventListener('loadedmetadata', () => {
                videoPlayer.play().then(() => {
                    enterFullscreen(videoContainer);
                }).catch(e => {
                    const playButton = createPlayButton(() => {
                        videoPlayer.play().then(() => {
                            enterFullscreen(videoContainer);
                        });
                    });
                    videoContainer.appendChild(playButton);
                });
            });
            videoPlayer.addEventListener('error', () => {
                addToBlacklist(channel.url);
                alert('Канал недоступен и добавлен в чёрный список.');
                closePlayer();
            });
        } else {
            alert('Ваш браузер не поддерживает HLS-потоки. Попробуйте Chrome, Firefox или Edge.');
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
                    console.warn('🔇 Превью канала недоступно');
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
    // CLOSE PLAYER — ВЫХОД ИЗ ПОЛНОЭКРАННОГО РЕЖИМА
    // ====================
    function closePlayer() {
        // Выходим из полноэкранного режима
        exitFullscreen();

        if (mainPlayer) {
            mainPlayer.destroy();
            mainPlayer = null;
        }
        videoPlayer.pause();
        videoPlayer.src = '';
        videoPlayer.load();

        videoContainer.classList.remove('fullscreen-player');
        document.body.classList.remove('player-active');
        videoContainer.style.display = 'none'; // Скрываем плеер полностью
    }

    // ====================
    // SEARCH
    // ====================
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        startIndex = 0;
        hasMore = true;
        displayedChannels = [];
        channelsGrid.innerHTML = '';

        if (query === '') {
            renderChannelBatch();
            return;
        }

        const filtered = allChannels.filter(channel => 
            channel.name.toLowerCase().includes(query)
        );

        const originalChannels = allChannels;
        allChannels = filtered;
        renderChannelBatch();

        if (query === '') {
            allChannels = originalChannels;
        }
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

            if (nextIndex > tiles.length - 5 && hasMore && !isLoading) {
                renderChannelBatch();
            }
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
    async function renderChannels() {
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        channelsGrid.innerHTML = '';

        try {
            allChannels = await fetchChannels();
            startIndex = 0;
            hasMore = true;
            displayedChannels = [];
            renderChannelBatch();
            setupInfiniteScroll();
        } catch (err) {
            console.error('❌ Не удалось загрузить каналы:', err);
            loadingEl.classList.add('hidden');
            errorEl.classList.remove('hidden');
        }
    }

    renderChannels();
});
