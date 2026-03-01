document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('jokes-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const randomBtn = document.getElementById('random-btn');
    const modal = document.getElementById('random-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');
    const randomJokeText = document.getElementById('random-joke-text');
    const anotherRandomBtn = document.getElementById('another-random-btn');

    // Favorites state
    let favorites = JSON.parse(localStorage.getItem('anekdot_favorites')) || [];
    let currentCategory = 'Все';

    // Initialize background emojis
    createBackgroundEmojis();

    // Render all jokes initially
    renderJokes(jokes);

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button styling
            filterBtns.forEach(b => {
                b.classList.remove('bg-purple-600', 'text-white');
                b.classList.add('bg-gray-800', 'text-gray-300');
            });
            btn.classList.remove('bg-gray-800', 'text-gray-300');
            btn.classList.add('bg-purple-600', 'text-white');

            currentCategory = btn.getAttribute('data-category');
            
            if (currentCategory === 'Все') {
                renderJokes(jokes);
            } else if (currentCategory === 'Избранное') {
                const filtered = jokes.filter(j => favorites.includes(j.id));
                renderJokes(filtered);
            } else {
                const filtered = jokes.filter(j => j.category === currentCategory);
                renderJokes(filtered);
            }
        });
    });

    // Random Joke Modal Logic
    randomBtn.addEventListener('click', showRandomJoke);
    anotherRandomBtn.addEventListener('click', showRandomJoke);
    
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    function renderJokes(jokesArray) {
        grid.innerHTML = '';
        
        if (jokesArray.length === 0) {
            grid.innerHTML = '<p class="text-center text-gray-400 col-span-full text-2xl">Тут пока пусто, но скоро будет смешно!</p>';
            return;
        }

        jokesArray.forEach((joke, index) => {
            const card = document.createElement('div');
            card.className = 'joke-card bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(168,85,247,0.2)] flex flex-col justify-between';
            
            // Reset animation delay if there are many items so they don't wait forever
            card.style.animationDelay = `${(index % 10) * 0.1}s`;

            card.innerHTML = `
                <div>
                    <span class="inline-block px-3 py-1 bg-gray-700 text-purple-400 text-xs font-bold rounded-full mb-4 uppercase tracking-wider">${joke.category}</span>
                    <p class="text-lg text-gray-200 leading-relaxed font-medium mb-6">${joke.text}</p>
                </div>
                <div class="flex justify-between items-center pt-4 border-t border-gray-700 mt-auto relative">
                    <div class="flex gap-4">
                        <button class="like-btn flex items-center gap-2 text-gray-400 hover:text-red-500 transition group" data-id="${joke.id}">
                            <i class="fa-solid fa-heart text-xl group-hover:scale-110 transition-transform"></i>
                            <span class="font-bold text-lg like-count">${joke.likes}</span>
                        </button>
                        <button class="dislike-btn flex items-center gap-2 text-gray-400 hover:text-orange-500 transition group" title="КГ/АМ (Кинуть помидор)">
                            <i class="fa-solid fa-poop text-xl group-hover:scale-110 transition-transform"></i>
                        </button>
                    </div>
                    <div class="flex gap-4">
                        <button class="fav-btn text-gray-500 hover:text-yellow-400 transition ${favorites.includes(joke.id) ? 'text-yellow-400' : ''}" data-id="${joke.id}" title="В избранное">
                            <i class="${favorites.includes(joke.id) ? 'fa-solid' : 'fa-regular'} fa-star text-xl"></i>
                        </button>
                        <button class="share-btn text-gray-500 hover:text-blue-400 transition" title="Поделиться">
                            <i class="fa-solid fa-share-nodes text-xl"></i>
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Attach like button events
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const icon = this.querySelector('i');
                const countSpan = this.querySelector('.like-count');
                
                if (!this.classList.contains('liked')) {
                    this.classList.add('liked');
                    icon.classList.add('like-anim');
                    this.classList.replace('text-gray-400', 'text-red-500');
                    countSpan.innerText = parseInt(countSpan.innerText) + 1;
                    
                    // Add a little screen shake for very funny jokes (likes > 500)
                    const currentLikes = parseInt(countSpan.innerText);
                    if (currentLikes > 500) {
                        document.body.classList.add('shake-screen');
                        setTimeout(() => document.body.classList.remove('shake-screen'), 500);
                    }
                }
            });
        });

        // Attach dislike button events (Tomato splat)
        document.querySelectorAll('.dislike-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const card = this.closest('.joke-card');
                const splat = document.createElement('div');
                splat.className = 'tomato-splat';
                
                // Randomly choose between tomato, poop, or egg
                const emojis = ['🍅', '💩', '🥚'];
                splat.innerText = emojis[Math.floor(Math.random() * emojis.length)];
                
                // Position relative to click inside the card
                const rect = card.getBoundingClientRect();
                splat.style.left = `${e.clientX - rect.left - 24}px`; // Center the 3rem emoji
                splat.style.top = `${e.clientY - rect.top - 24}px`;
                
                card.appendChild(splat);
                
                // Remove after animation
                setTimeout(() => splat.remove(), 600);
            });
        });

        // Attach favorite button events
        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const icon = this.querySelector('i');
                
                if (favorites.includes(id)) {
                    favorites = favorites.filter(favId => favId !== id);
                    icon.classList.replace('fa-solid', 'fa-regular');
                    this.classList.remove('text-yellow-400');
                    
                    // If we are currently in the "Favorites" tab, re-render to remove it
                    if (currentCategory === 'Избранное') {
                        const filtered = jokes.filter(j => favorites.includes(j.id));
                        renderJokes(filtered);
                    }
                } else {
                    favorites.push(id);
                    icon.classList.replace('fa-regular', 'fa-solid');
                    this.classList.add('text-yellow-400');
                    
                    // Add a little pop animation
                    icon.classList.add('like-anim');
                    setTimeout(() => icon.classList.remove('like-anim'), 400);
                }
                
                localStorage.setItem('anekdot_favorites', JSON.stringify(favorites));
            });
        });
    }

    function showRandomJoke() {
        const randomIndex = Math.floor(Math.random() * jokes.length);
        const joke = jokes[randomIndex];
        
        randomJokeText.innerHTML = joke.text;
        
        modal.classList.remove('hidden');
        // Small delay to allow display:block to apply before animating opacity
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            modalContent.classList.remove('scale-90');
            modalContent.classList.add('scale-100');
        }, 10);

        // Extreme laugh effect
        document.body.classList.add('shake-screen');
        setTimeout(() => document.body.classList.remove('shake-screen'), 500);
    }

    function closeModal() {
        modal.classList.add('opacity-0');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-90');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); // Match transition duration
    }

    function createBackgroundEmojis() {
        const bg = document.getElementById('emoji-bg');
        const emojis = ['😂', '🤣', '😆', '😹', '💀', '🤡', '🤪'];
        const numEmojis = 20;

        for (let i = 0; i < numEmojis; i++) {
            const el = document.createElement('div');
            el.className = 'floating-emoji';
            el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
            
            // Randomize position, size, and animation duration
            el.style.left = `${Math.random() * 100}vw`;
            el.style.fontSize = `${Math.random() * 2 + 1}rem`;
            el.style.animationDuration = `${Math.random() * 10 + 10}s`;
            el.style.animationDelay = `${Math.random() * 10}s`;
            
            bg.appendChild(el);
        }
    }

    // --- NEW FUNNY FEATURES ---

    // 1. Runaway Button
    const runawayBtn = document.getElementById('runaway-btn');
    runawayBtn.addEventListener('mouseover', () => {
        // Calculate random position within viewport, keeping button fully visible
        const maxX = window.innerWidth - runawayBtn.offsetWidth - 20;
        const maxY = window.innerHeight - runawayBtn.offsetHeight - 20;
        
        const randomX = Math.max(20, Math.floor(Math.random() * maxX));
        const randomY = Math.max(20, Math.floor(Math.random() * maxY));
        
        runawayBtn.style.left = `${randomX}px`;
        runawayBtn.style.top = `${randomY}px`;
        runawayBtn.style.bottom = 'auto'; // Override initial bottom positioning
    });
    runawayBtn.addEventListener('click', () => {
        alert("КАК ТЫ ЭТО СДЕЛАЛ?! 😱 Ты читер!");
    });

    // 2. Panic Button (Boss is coming)
    const panicBtn = document.getElementById('panic-btn');
    const fakeExcel = document.getElementById('fake-excel');
    
    function togglePanic() {
        fakeExcel.classList.toggle('hidden');
        fakeExcel.classList.toggle('flex');
    }

    panicBtn.addEventListener('click', togglePanic);
    
    // Also trigger panic mode with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            togglePanic();
        }
    });

    // 3. Fake Notifications (Toasts)
    const funnyNotifications = [
        "ФСБ: Отличная шутка, товарищ! Продолжайте.",
        "Ваш кот только что заказал 5 кг корма с вашей карты.",
        "Мама: Сынок, ты опять свои кампуктеры смотришь?",
        "Windows: Обнаружена угроза. Угроза слишком смешная.",
        "Военкомат: Мы оценили ваш юмор. Ждем на медкомиссию.",
        "Илон Маск: Куплю этот сайт за 44 миллиарда.",
        "Нейросеть: Я восстану, но сначала дочитаю этот анекдот.",
        "Сосед: Хватит ржать, стены тонкие!",
        "Ваш холодильник: Я скучаю, приди поешь."
    ];

    function showRandomToast() {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'bg-gray-800 border-l-4 border-purple-500 text-white p-4 rounded shadow-lg toast-enter flex items-center gap-3 pointer-events-auto';
        
        const randomMsg = funnyNotifications[Math.floor(Math.random() * funnyNotifications.length)];
        toast.innerHTML = `<i class="fa-solid fa-bell text-purple-400 animate-bounce"></i> <p class="font-bold">${randomMsg}</p>`;
        
        container.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    // Show a random notification every 15 seconds
    setInterval(showRandomToast, 15000);
    // Show first one after 5 seconds
    setTimeout(showRandomToast, 5000);

    // 4. Add Custom Joke Logic
    const addJokeBtn = document.getElementById('add-joke-btn');
    const addJokeModal = document.getElementById('add-joke-modal');
    const addModalContent = document.getElementById('add-modal-content');
    const closeAddModalBtn = document.getElementById('close-add-modal');
    const addJokeForm = document.getElementById('add-joke-form');

    function openAddModal() {
        addJokeModal.classList.remove('hidden');
        setTimeout(() => {
            addJokeModal.classList.remove('opacity-0');
            addModalContent.classList.remove('scale-90');
            addModalContent.classList.add('scale-100');
        }, 10);
    }

    function closeAddModal() {
        addJokeModal.classList.add('opacity-0');
        addModalContent.classList.remove('scale-100');
        addModalContent.classList.add('scale-90');
        setTimeout(() => {
            addJokeModal.classList.add('hidden');
        }, 300);
    }

    addJokeBtn.addEventListener('click', openAddModal);
    closeAddModalBtn.addEventListener('click', closeAddModal);
    addJokeModal.addEventListener('click', (e) => {
        if (e.target === addJokeModal) closeAddModal();
    });

    addJokeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('new-joke-category').value;
        const text = document.getElementById('new-joke-text').value.replace(/\n/g, '<br>');
        
        const newJoke = {
            id: Date.now(), // unique ID
            category: category,
            text: text,
            likes: 0
        };
        
        // Add to the beginning of the array
        jokes.unshift(newJoke);
        
        // Reset form and close modal
        addJokeForm.reset();
        closeAddModal();
        
        // Show success toast
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'bg-green-600 border-l-4 border-green-300 text-white p-4 rounded shadow-lg toast-enter flex items-center gap-3 pointer-events-auto';
        toast.innerHTML = `<i class="fa-solid fa-check-circle text-white text-xl"></i> <p class="font-bold">Шедевр успешно добавлен!</p>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 3000);

        // Re-render if we are on "Все" or the matching category
        if (currentCategory === 'Все' || currentCategory === category) {
            // Trigger click on current category to re-render
            document.querySelector(`.filter-btn[data-category="${currentCategory}"]`).click();
        }
    });

});