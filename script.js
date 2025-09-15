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
    let previewPlayers = new Map();

    // ====================
    // FETCH CHANNELS — С УМНЫМ ФОЛЛБЭКОМ
    // ====================
    async function fetchChannels() {
        console.log('🔍 Начинаем загрузку каналов...');

        // Пробуем прокси 1: corsproxy.io
        try {
            const proxyUrl = 'https://corsproxy.io/?';
            const targetUrl = 'https://iptv-org.github.io/iptv/index.m3u8';
            const fullUrl = proxyUrl + encodeURIComponent(targetUrl);

            console.log('📡 Пробуем прокси 1 (corsproxy.io):', fullUrl);

            const response = await fetch(fullUrl, {
                headers: { 'Accept': 'text/plain' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.text();
            const channels = parseM3U(data);

            if (channels.length > 0) {
                console.log(`✅ Успешно загружено ${channels.length} каналов через corsproxy.io`);
                return channels;
            }
        } catch (err) {
            console.warn('⚠️ Прокси 1 не сработал:', err.message);
        }

        // Пробуем прокси 2: api.codetabs.com
        try {
            const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
            const targetUrl = 'https://iptv-org.github.io/iptv/index.m3u8';
            const fullUrl = proxyUrl + encodeURIComponent(targetUrl);

            console.log('📡 Пробуем прокси 2 (codetabs):', fullUrl);

            const response = await fetch(fullUrl, {
                headers: { 'Accept': 'text/plain' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.text();
            const channels = parseM3U(data);

            if (channels.length > 0) {
                console.log(`✅ Успешно загружено ${channels.length} каналов через codetabs`);
                return channels;
            }
        } catch (err) {
            console.warn('⚠️ Прокси 2 не сработал:', err.message);
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

            // Проверка: если это HTML — значит, GitHub отдал 404
            if (data.includes('<!DOCTYPE html>') || data.includes('<html')) {
                throw new Error('Файл содержит HTML — возможно, 404');
            }

            const channels = parseM3U(data);

            if (channels.length > 0) {
                console.log(`✅ Успешно загружено ${channels.length} каналов из локального файла`);
                return channels;
            } else {
                throw new Error('Локальный файл не содержит распознаваемых каналов');
            }

        } catch (err) {
            console.error('❌ Локальный файл не сработал:', err.message);
            throw new Error('Ни один источник не вернул каналы. Проверьте файл channels.m3u8.');
        }
    }

    // ====================
    // PARSE M3U — УСТОЙЧИВЫЙ ПАРСЕР
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

                // Пропускаем, если нет URL или он невалидный
                if (!url || url.startsWith('#') || url.length < 10) {
                    continue;
                }

                // Извлекаем название — всё после последней запятой
                const parts = line.split(',');
                const name = parts[parts.length - 1]?.trim();

                // Пропускаем, если название не определено
                if (!name || name.length < 2) {
                    continue;
                }

                // Извлекаем группу
                let group = 'unknown';
                const groupMatch = line.match(/group-title="([^"]*)"/i);
                if (groupMatch && groupMatch[1]) {
                    group = groupMatch[1].toLowerCase();
                }

                // Извлекаем логотип или используем placeholder
                let logo = '';
                const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
                if (logoMatch && logoMatch[1]) {
                    logo = logoMatch[1];
                } else {
                    // Генерируем placeholder с первыми буквами названия
                    const initials = name.substring(0, 2).toUpperCase();
                    logo = `https://placehold.co/200x120/1a1a2e/ffffff?text=${encodeURIComponent(initials)}`;
                }

                channels.push({ 
                    name, 
                    url, 
                    group,
                    logo
                });

                i++; // Пропускаем строку с URL
            }
        }

        console.log(`📊 Распарсено ${channels.length} каналов`);
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
                    <p>Проверьте файл <code>channels.m3u8</code> — он должен содержать список каналов в формате M3U.</p>
                    <p>Или попробуйте позже — возможно, временные проблемы с загрузкой.</p>
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
            video.muted = true; // 🔇 Важно! Без mute автовоспроизведение не сработает
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

            tile.addEventListener('click', () => playMainChannel(channel.url, channel.name));
            tile.addEventListener('focus', () => handleTileFocus(tile, channel));
            tile.addEventListener('blur', () => handleTileBlur(tile, channel));

            channelsGrid.appendChild(tile);
        });

        // Фокус на первую плитку
        setTimeout(() => {
            const firstTile = document.querySelector('.channel-tile');
            if (firstTile) firstTile.focus();
        }, 100);
    }

    // ====================
    // PREVIEW ON FOCUS
    // ====================
    function handleTileFocus(tile, channel) {
        if (focusedChannel === tile) return;
        
        // Очищаем предыдущий превью
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
                xhrSetup: function(xhr, url) {
                    xhr.withCredentials = false;
                    xhr.setRequestHeader('Origin', window.location.origin);
                }
            });

            hls.loadSource(channel.url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => {
                    console.warn('🔇 Превью: автовоспроизведение заблокировано — нормально');
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
                    console.warn('🔇 Превью: автовоспроизведение заблокировано — нормально');
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
    // PLAY MAIN CHANNEL — С КНОПКОЙ ВОСПРОИЗВЕДЕНИЯ
    // ====================
    function playMainChannel(url, name) {
        currentChannelNameEl.textContent = name || 'Неизвестный канал';
        videoPlayer.innerHTML = '';
        videoPlayer.src = '';
        videoPlayer.controls = true;
        videoPlayer.load();

        console.log('▶️ Попытка воспроизвести:', name, url);

        if (Hls.isSupported()) {
            // Уничтожаем предыдущий экземпляр
            if (window.mainHls) {
                window.mainHls.destroy();
            }

            const hls = new Hls({
                debug: true, // 🔍 Включаем отладку!
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30,
                xhrSetup: function(xhr, url) {
                    xhr.withCredentials = false;
                    xhr.setRequestHeader('Origin', window.location.origin);
                }
            });

            window.mainHls = hls;
            hls.loadSource(url);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                console.log('✅ Манифест загружен. Уровней:', data.levels.length);
                videoPlayer.play().catch(e => {
                    console.warn('🔇 Автовоспроизведение заблокировано. Показываем кнопку.');

                    // Создаём кнопку воспроизведения
                    const container = document.querySelector('#video-container');
                    const existingButton = container.querySelector('.play-button');
                    if (existingButton) existingButton.remove();

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
                    playButton.onclick = () => {
                        videoPlayer.play().then(() => {
                            playButton.remove();
                        }).catch(err => {
                            alert('Не удалось воспроизвести. Попробуйте другой канал.');
                        });
                    };
                    container.appendChild(playButton);
                });
            });

            hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
                console.log('📈 Уровень загружен. Сегментов:', data.details.fragments.length);
            });

            hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
                console.log('📥 Сегмент загружен');
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                console.error('❌ HLS Error:', data.type, data.details);
                if (data.fatal) {
                    alert('Критическая ошибка: ' + data.type + '\n' + (data.details || ''));
                    hls.destroy();
                }
            });

            hls.attachMedia(videoPlayer);

        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari / iOS
            console.log('🍏 Используем нативный HLS для Safari');
            videoPlayer.src = url;
            videoPlayer.addEventListener('loadedmetadata', () => {
                videoPlayer.play().catch(e => {
                    console.warn('🔇 Автовоспроизведение заблокировано в Safari');
                    alert('Нажмите на плеер, чтобы начать воспроизведение.');
                });
            });
            videoPlayer.addEventListener('error', () => {
                alert('Ошибка воспроизведения в Safari. Попробуйте другой браузер.');
            });
        } else {
            alert('Ваш браузер не поддерживает HLS-потоки. Попробуйте Chrome, Firefox или Edge.');
        }
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
            console.error('❌ Полный провал:', err);
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
    // RETRY BUTTON
    // ====================
    retryBtn.addEventListener('click', renderChannels);

    // ====================
    // INITIALIZE
    // ====================
    renderChannels();
});
