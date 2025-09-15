* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: #0a0a14;
    color: #e0e0e0;
    font-family: 'Segoe UI', system-ui, sans-serif;
    line-height: 1.6;
    overflow-x: hidden;
}

#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(135deg, #0f0f23, #1a1a3a);
    padding: 20px;
    position: relative;
}

/* Заголовок */
header h1 {
    font-size: 2.4rem;
    margin-bottom: 16px;
    background: linear-gradient(90deg, #ff6b6b, #ffa500);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-weight: 800;
    text-shadow: 0 2px 10px rgba(255, 107, 107, 0.2);
    text-align: center;
}

/* Поиск */
#search-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto 24px;
}

#search {
    width: 100%;
    padding: 14px 20px;
    border: none;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    color: white;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

#search:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.12);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.4);
}

/* Категории */
#categories {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 30px;
}

#categories button {
    padding: 10px 20px;
    border: none;
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.08);
    color: #e0e0e0;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    backdrop-filter: blur(8px);
}

#categories button.active,
#categories button:hover {
    background: rgba(255, 107, 107, 0.25);
    color: white;
    border-color: rgba(255, 107, 107, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

/* Состояния */
#loading,
#error {
    text-align: center;
    padding: 24px;
    font-size: 1.2rem;
    color: #aaa;
    margin: 30px auto;
    max-width: 600px;
    background: rgba(30, 30, 40, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

#error {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    border-color: rgba(255, 107, 107, 0.3);
}

#error button {
    margin-top: 12px;
    padding: 10px 24px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
}

#error button:hover {
    background: #ff5252;
    transform: scale(1.05);
}

/* Сетка каналов — КЛЮЧЕВОЙ БЛОК */
.channels-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
    min-height: 50vh;
}

.channel-tile {
    position: relative;
    aspect-ratio: 16/9;
    border-radius: 16px;
    overflow: hidden;
    background: rgba(30, 30, 40, 0.8);
    border: 2px solid transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    cursor: pointer;
}

.channel-tile:focus,
.channel-tile:hover {
    outline: none;
    transform: scale(1.03);
    border-color: #ff6b6b;
    box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
    z-index: 2;
}

/* Контейнер для видео или логотипа */
.tile-content {
    width: 100%;
    height: 100%;
    position: relative;
}

/* Логотип канала */
.channel-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 80%;
    max-height: 60%;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8));
    transition: all 0.3s ease;
    opacity: 0.9;
}

.channel-tile:focus .channel-logo,
.channel-tile:hover .channel-logo {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
}

/* Видео в плитке */
.tile-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.channel-tile:focus .tile-video,
.channel-tile:hover .tile-video {
    opacity: 1;
}

/* Название канала */
.channel-name {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
    color: white;
    padding: 8px 12px;
    font-size: 0.85rem;
    font-weight: 500;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    transform: translateY(100%);
    transition: transform 0.3s ease;
}

.channel-tile:focus .channel-name,
.channel-tile:hover .channel-name {
    transform: translateY(0);
}

/* Сейчас играет */
#now-playing {
    text-align: center;
    margin: 24px 0 12px;
    font-size: 1.2rem;
    color: #ff6b6b;
    font-weight: 700;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

#current-channel-name {
    color: #fff;
    font-weight: 500;
}

/* Основной видеоплеер */
#video-container {
    width: 100%;
    max-width: 1000px;
    margin: 30px auto 0;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    background: #000;
    position: relative;
}

#videoPlayer {
    width: 100%;
    aspect-ratio: 16 / 9;
    display: block;
    background: #000;
    border: none;
}

/* Адаптивность */
@media (max-width: 768px) {
    .channels-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 10px;
    }

    header h1 {
        font-size: 1.8rem;
    }

    #search {
        font-size: 1rem;
        padding: 12px 16px;
    }

    .channel-name {
        font-size: 0.8rem;
        padding: 6px 10px;
    }
}

@media (max-width: 480px) {
    .channels-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
    }

    header h1 {
        font-size: 1.5rem;
    }

    #search {
        font-size: 0.95rem;
        padding: 10px 14px;
    }
}

.hidden {
    display: none !important;
}
