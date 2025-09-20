DOM элементы
                if (buttons[currentMainCategoryIndex]) {
                    buttons[currentMainCategoryIndex].focus();
                }
            }, 100);
            break;
        case 'ArrowDown':
            navigationState = 'channels';
            mainCategoriesPanel.style.display = 'flex';
            subCategoriesPanel.style.display = 'none';
            setTimeout(() => {
                const firstChannel = document.querySelector('.channel-card');
                if (firstChannel) firstChannel.focus();
            }, 100);
            break;
        case 'Enter':
            if (navigationState === 'mainCategories') {
                navigationState = 'subCategories';
                subCategoriesPanel.style.display = 'flex';
                setTimeout(() => {
                    const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                    if (buttons.length > 0) {
                        buttons[0].focus();
                        currentSubCategoryIndex = 0;
                        currentSubcategory = buttons[0].textContent;
                        updateSubCategoryActive();
                    }
                }, 100);
            } else if (navigationState === 'subCategories') {
                const buttons = subCategoriesPanel.querySelectorAll('.subcategory-btn');
                if (buttons[currentSubCategoryIndex]) {
                    selectSubcategory(buttons[currentSubCategoryIndex].textContent, currentSubCategoryIndex);
                }
            } else if (navigationState === 'channels' && document.activeElement.classList.contains('channel-card')) {
                const card = document.activeElement;
                const index = parseInt(card.dataset.index);
                const categoryTree = getCategoryTree(); // 👈 Получаем актуальное дерево
                const list = currentMainCategory === t('watched')
                    ? JSON.parse(localStorage.getItem('watchedChannels') || '[]')
                    : loadedPlaylists[categoryTree[currentMainCategory][currentSubcategory]] || [];
                if (index >= 0 && index < list.length) {
                    const channel = list[index];
                    openFullScreenPlayer(channel.name, channel.url, channel.group, channel.logo);
                }
            }
            break;
        case 'Escape':
            if (navigationState === 'subCategories') {
                navigationState = 'mainCategories';
                setTimeout(() => {
                    const buttons = mainCategoriesPanel.querySelectorAll('.category-btn');
                    if (buttons[currentMainCategoryIndex]) {
                        buttons[currentMainCategoryIndex].focus();
                    }
                }, 100);
            } else if (navigationState === 'mainCategories') {
                navigationState = 'channels';
                setTimeout(() => {
                    const firstChannel = document.querySelector('.channel-card');
                    if (firstChannel) firstChannel.focus();
                }, 100);
            }
            break;
    }
});

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
