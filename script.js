
// ===== CONFIGURAÇÕES FIXAS =====
const CONFIG = {
    startDate: '2025-10-29',  // <-- MUDE AQUI: Data do início do namoro (AAAA-MM-DD)
    name1: '☀',        // <-- MUDE AQUI: Seu nome
    name2: '☽'       // <-- MUDE AQUI: Nome dela
};

// ===== LETRA DA MÚSICA COM TIMESTAMPS =====
// COMO SINCRONIZAR:
// 1. Abra a música no celular/computador
// 2. Anote o tempo (em segundos) que cada frase começa
// 3. Coloque no formato: { time: SEGUNDOS, text: "frase" }
//
// Exemplo: Se a frase começa em 0:15, coloque time: 15
//          Se começa em 1:30, coloque time: 90 (60 + 30)

const LYRICS_SYNC = [
     { time: 0.2, text: "E foi assim" },
    { time: 2.3, text: "Quando eu te vi a primeira vez" },
    { time: 5.2, text: "Você duvidava da minha cara, me chamava de canalha" },
    { time: 8.5, text: "Mas hoje o tempo passou e olha só o que a gente fez" },
    { time: 11.8, text: "E quando eu vi" },
    { time: 14.1, text: "Num piscar de olhos, me entreguei" },
    { time: 17.1, text: "Agora não penso mais em nada além de te ter em casa" },
    { time: 20.5, text: "Virou minha namorada que me chama de meu bem" },
    { time: 24, text: "E eu fui" },
    { time: 26.2, text: "Sem querer, mudei" },
    { time: 29.1, text: "Já não sou tão só" },
    { time: 32.1, text: "Sei que eu sou ruim, mas sem você eu já fui pior" },
    { time: 38.1, text: "Se eu esqueci de mim, foi pra conhecer nóis" },
    { time: 44.1, text: "É simples assim" },
    { time: 46.9, text: "Se é amor, não dói" },
    { time: 48.5, text: "Vou até à porta da tua casa, toco a campainha" },
    { time: 51.5, text: "FFlores escondidas pra dar pra minha companhia" },
    { time: 54.1, text: "Minha companheira, minha prometida, quero todo dia" },
    { time: 57.6, text: "Te busco na sexta e te levo na quinta e volta a fita" },
    { time: 60.5, text: "Pela avenida, luzes brilham, só não mais que a sua" },
    { time: 63.5, text: "FSó não mais que a cura que cê trouxe pra minha vida" },
    { time: 66.2, text: "Pega o beck e pila, a calcinha tira e vem por cima" },
    { time: 69.2, text: "Fala meu nome no ouvido com a voz firme, quem diria?" },
    { time: 72.1, text: "Logo eu que não valia nada, tenho tudo" },
    { time: 75.6, text: "Uma mina foda com pensamento maduro" },
    { time: 77.9, text: "Que não tem medo do mundo, mas me abraça no escuro" },
    { time: 81.2, text: "Que fala que a vida é linda e minha vida é te ter junto" },
    { time: 84.2, text: "Tem mó cara de malvada, mas tem o coração puro" },
    { time: 87.6, text: "Penso em você a cada segundo" },
    { time: 89.4, text: "A cada mina que me cerca pela fama e pelo lucro" },
    { time: 92.4, text: "Encontrei você dizendo que não liga se eu for duro" },
    { time: 95.3, text: "Aí não deu" },
    { time: 96.3, text: "E foi assim" },
    { time: 98, text: "Quando eu te vi a primeira vez" },
    { time: 101, text: "Você duvidava da minha cara, me chamava de canalha" },
    { time: 104.4, text: "Mas hoje o tempo passou e olha só o que a gente fez" },
    { time: 107.8, text: "E quando eu vi" },
    { time: 110, text: "Num piscar de olhos, me entreguei" },
    { time: 113.1, text: "Agora não penso mais em nada além de te ter em casa" },
    { time: 116.4, text: "Virou minha namorada que me chama de meu bem" },
    { time: 119.7, text: "E eu fui" },
    { time: 122.1, text: "Sem querer, mudei" },
    { time: 125.1, text: "Já não sou tão só" },
    { time: 128.1, text: "Sei que eu sou ruim, mas sem você eu fui pior" },
    { time: 134.1, text: "Se eu esqueci de mim, foi pra conhecer nóis" },
    { time: 140, text: "É simples assim (é simples assim)" },
    { time: 143, text: "Se é amor, não dói" },
    { time: 145.2, text: "💛" },
    // ADICIONE MAIS LINHAS AQUI COM OS TEMPOS CORRETOS
    // Ouça a música e ajuste os números "time" para sincronizar!
];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
});

// ===== TELA DE ENTRADA =====
function initSplashScreen() {
    const splash = document.getElementById('splashScreen');
    const music = document.getElementById('bgMusic');
    const musicControl = document.getElementById('musicControl');
    const lyricsContainer = document.getElementById('lyricsContainer');
    
    // Clica em qualquer lugar para começar
    splash.addEventListener('click', () => {
        // Esconde a tela de entrada
        splash.classList.add('hidden');
        
        // Inicia a música
        music.volume = 0.4;
        music.play();
        
        // Mostra controles
        musicControl.classList.add('visible');
        lyricsContainer.classList.add('visible');
        
        // Inicia o site
        initSite();
        
        // Inicia a exibição da letra
        startLyrics();
    });
    
    // Controle de música (pausar/tocar)
    musicControl.addEventListener('click', () => {
        if (music.paused) {
            music.play();
            musicControl.classList.remove('paused');
            musicControl.querySelector('i').className = 'fas fa-pause';
            musicControl.title = 'Pausar música';
        } else {
            music.pause();
            musicControl.classList.add('paused');
            musicControl.querySelector('i').className = 'fas fa-play';
            musicControl.title = 'Tocar música';
        }
    });
    
    // Quando a música terminar
    music.addEventListener('ended', () => {
        music.currentTime = 0;
        musicControl.classList.add('paused');
        musicControl.querySelector('i').className = 'fas fa-play';
        musicControl.title = 'Tocar música';
    });
}

// ===== EXIBIÇÃO DA LETRA SINCRONIZADA =====
function startLyrics() {
    const lyricsText = document.getElementById('lyricsText');
    const music = document.getElementById('bgMusic');
    let lastIndex = -1;
    let currentText = '';
    
    function updateLyrics() {
        const currentTime = music.currentTime;
        
        // Encontra a frase atual baseada no tempo da música
        let currentIndex = 0;
        for (let i = 0; i < LYRICS_SYNC.length; i++) {
            if (currentTime >= LYRICS_SYNC[i].time) {
                currentIndex = i;
            }
        }
        
        const newText = LYRICS_SYNC[currentIndex].text;
        
        // Só atualiza se mudou de frase
        if (newText !== currentText) {
            currentText = newText;
            
            // Fade out
            lyricsText.classList.add('fade-out');
            
            // Espera o fade out, troca o texto, fade in
            setTimeout(() => {
                lyricsText.textContent = newText;
                lyricsText.classList.remove('fade-out');
            }, 300);
        }
    }
    
    // Atualiza a cada 200ms para sincronização precisa
    setInterval(updateLyrics, 200);
}

// ===== INICIALIZA O SITE =====
function initSite() {
    updateNames();
    initParticles();
    initStars();
    initCounter();
    initGallery();
    initTimeline();
    initQuotes();
    initQuoteGenerator();
    initGames();
    initLetters();
    initReasons();
    initModals();
    initFloatingButtons();
    initSectionObserver();
    initScrollEffects();
}

// ===== ATUALIZA NOMES =====
function updateNames() {
    document.getElementById('heroName1').textContent = CONFIG.name1;
    document.getElementById('heroName2').textContent = CONFIG.name2;
    document.getElementById('footerName1').textContent = CONFIG.name1;
    document.getElementById('footerName2').textContent = CONFIG.name2;
    
    const year = new Date(CONFIG.startDate + 'T00:00:00').getFullYear();
    document.getElementById('footerDate').textContent = year;
}

// ===== PARTÍCULAS CANVAS =====
function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resize();
    window.addEventListener('resize', resize);
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width || 
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ===== ESTRELAS DE FUNDO =====
function initStars() {
    const container = document.querySelector('.stars');
    if (!container) return;
    
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.cssText = `
            position: absolute;
            width: ${Math.random() * 3 + 1}px;
            height: ${Math.random() * 3 + 1}px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: twinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        container.appendChild(star);
    }
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // Parallax no hero
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
        
        // Elementos que aparecem ao scroll
        document.querySelectorAll('.fade-up').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.classList.add('visible');
            }
        });
    });
}

// ===== CONTADOR =====
function initCounter() {
    const elements = {
        years: document.getElementById('years'),
        months: document.getElementById('months'),
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
        display: document.getElementById('startDateDisplay')
    };
    
    function update() {
        const start = new Date(CONFIG.startDate + 'T00:00:00');
        const now = new Date();
        let diff = now - start;
        
        if (diff < 0) diff = 0;
        
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        diff -= years * (1000 * 60 * 60 * 24 * 365);
        
        const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
        diff -= months * (1000 * 60 * 60 * 24 * 30);
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);
        
        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * (1000 * 60);
        
        const seconds = Math.floor(diff / 1000);
        
        elements.years.textContent = years;
        elements.months.textContent = months;
        elements.days.textContent = days;
        elements.hours.textContent = hours;
        elements.minutes.textContent = minutes;
        elements.seconds.textContent = seconds;
    }
    
    function formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR');
    }
    
    elements.display.textContent = formatDate(CONFIG.startDate);
    update();
    setInterval(update, 1000);
}

// ===== GALERIA =====
function initGallery() {
    const tabs = document.querySelectorAll('.tab-btn');
    const items = document.querySelectorAll('.gallery-item');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const filter = tab.dataset.filter;
            
            items.forEach(item => {
                const category = item.dataset.category;
                if (filter === 'all' || category === filter) {
                    item.style.display = '';
                    item.style.animation = 'fadeIn 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Controle de vídeos na galeria
    const videoItems = document.querySelectorAll('.video-item');
    videoItems.forEach(item => {
        const video = item.querySelector('video');
        if (video) {
            item.addEventListener('click', () => {
                if (video.paused) {
                    // Pausa outros vídeos
                    document.querySelectorAll('.video-item video').forEach(v => {
                        v.pause();
                        v.closest('.video-item').classList.remove('playing');
                    });
                    video.play();
                    item.classList.add('playing');
                } else {
                    video.pause();
                    item.classList.remove('playing');
                }
            });
        }
    });
}

// ===== TIMELINE =====
function initTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.2 });
    
    items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
}

// ===== QUOTES CAROUSEL =====
function initQuotes() {
    const slides = document.querySelectorAll('.quote-slide');
    const dotsContainer = document.getElementById('quotesDots');
    const prevBtn = document.getElementById('prevQuote');
    const nextBtn = document.getElementById('nextQuote');
    let currentIndex = 0;
    let autoSlide;
    
    // Create dots
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'quote-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.quote-dot');
    
    function goTo(index) {
        slides[currentIndex].classList.remove('active');
        dots[currentIndex].classList.remove('active');
        
        currentIndex = index;
        if (currentIndex >= slides.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = slides.length - 1;
        
        slides[currentIndex].classList.add('active');
        dots[currentIndex].classList.add('active');
        
        resetAutoSlide();
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlide);
        autoSlide = setInterval(() => goTo(currentIndex + 1), 6000);
    }
    
    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
    
    // Touch support
    let touchStartX = 0;
    const wrapper = document.getElementById('quotesWrapper');
    
    wrapper.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    wrapper.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
        }
    }, { passive: true });
    
    resetAutoSlide();
}

// ===== QUOTE GENERATOR =====
function initQuoteGenerator() {
    const btn = document.getElementById('generateQuoteBtn');
    const display = document.getElementById('generatedQuote');
    
    const quotes = [
        "Você é a pessoa que faz meu coração bater mais forte todos os dias.",
        "Cada momento ao seu lado é uma página do livro mais bonito que já li.",
        "O amor não se explica, se vive. E viver ao seu lado é o maior presente.",
        "Se eu pudesse escolher uma estrela, escolheria você.",
        "Você não é apenas meu amor, é minha melhor aventura.",
        "Amar você é fácil como respirar, natural como o sol nascer.",
        "Você é o motivo dos meus sorrisos mais sinceros.",
        "Você é meu porto seguro em meio às tempestades da vida.",
        "Obrigado por colorir minha vida com todas as cores do amor.",
        "Você é a música que meu coração escolheu para tocar eternamente.",
        "Em você encontrei meu lar, minha paz, meu tudo.",
        "Você é a resposta para todas as perguntas do meu coração.",
        "Meu amor por você cresce a cada dia que passa.",
        "Você transforma dias comuns em momentos extraordinários.",
        "Ao seu lado, descobri o verdadeiro significado de felicidade."
    ];
    
    btn.addEventListener('click', () => {
        btn.disabled = true;
        const icon = btn.querySelector('i');
        icon.className = 'fas fa-spinner fa-spin';
        
        setTimeout(() => {
            const quote = quotes[Math.floor(Math.random() * quotes.length)];
            display.textContent = `"${quote}"`;
            display.style.animation = 'none';
            display.offsetHeight;
            display.style.animation = 'fadeIn 0.5s ease';
            
            btn.disabled = false;
            icon.className = 'fas fa-magic';
        }, 800);
    });
}

// ===== GAMES =====
function initGames() {
    // Quiz
    document.getElementById('quizGameCard').addEventListener('click', () => {
        resetQuiz();
        openModal('quizModal');
    });
    
    initQuiz();
    
    // Love Calculator
    document.getElementById('loveCalcCard').addEventListener('click', () => {
        document.getElementById('loveResult').innerHTML = '';
        openModal('loveCalcModal');
    });
    
    document.getElementById('calcLoveBtn').addEventListener('click', calculateLove);
    
    // Truth or Dare
    document.getElementById('truthDareCard').addEventListener('click', () => {
        document.getElementById('truthDareResult').innerHTML = '';
        openModal('truthDareModal');
    });
    
    document.getElementById('truthBtn').addEventListener('click', () => showTruthOrDare('truth'));
    document.getElementById('dareBtn').addEventListener('click', () => showTruthOrDare('dare'));
    
    // Compliments
    document.getElementById('complimentCard').addEventListener('click', () => {
        openModal('complimentModal');
    });
    
    document.getElementById('genComplimentBtn').addEventListener('click', generateCompliment);
}

// ===== QUIZ =====
const quizQuestions = [
    { q: "Qual é a comida favorita do seu amor?", o: ["Pizza", "Hambúrguer", "Sushi", "Churrasco"] },
    { q: "Qual é a cor preferida do seu parceiro(a)?", o: ["Azul", "Verde", "Amarelo", "Rosa"] },
    { q: "Onde foi o primeiro encontro de vocês?", o: ["Cinema", "Restaurante", "Parque", "Shopping"] },
    { q: "Qual é o filme favorito do casal?", o: ["Comédia", "Ação", "Romance", "Terror"] },
    { q: "Qual é a música 'do casal'?", o: ["Pop", "Rock", "Sertanejo", "MPB"] },
    { q: "Qual é o maior medo do seu amor?", o: ["Altura", "Escuro", "Insetos", "Ficar sozinho(a)"] },
    { q: "Qual é o sonho do seu parceiro(a)?", o: ["Viajar o mundo", "Família", "Sucesso", "Todos"] },
    { q: "O que mais irrita seu amor?", o: ["Mentira", "Atraso", "Bagunça", "Falta de atenção"] },
    { q: "Qual é o hobbie favorito de vocês juntos?", o: ["Séries", "Cozinhar", "Viajar", "Games"] },
    { q: "Qual estação do ano vocês preferem?", o: ["Primavera", "Verão", "Outono", "Inverno"] }
];

let quizState = { current: 0, score: 0, answers: [] };

function initQuiz() {
    document.getElementById('startQuizBtn').addEventListener('click', startQuiz);
    document.getElementById('restartQuizBtn').addEventListener('click', resetQuiz);
}

function resetQuiz() {
    quizState = { current: 0, score: 0, answers: [] };
    document.getElementById('quizStart').classList.remove('hidden');
    document.getElementById('quizGameArea').classList.add('hidden');
    document.getElementById('quizResult').classList.add('hidden');
}

function startQuiz() {
    document.getElementById('quizStart').classList.add('hidden');
    document.getElementById('quizGameArea').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    const q = quizQuestions[quizState.current];
    document.getElementById('quizQuestion').textContent = q.q;
    document.getElementById('quizProgressBar').style.width = `${((quizState.current + 1) / quizQuestions.length) * 100}%`;
    document.getElementById('quizProgressText').textContent = `${quizState.current + 1}/${quizQuestions.length}`;
    
    const optionsDiv = document.getElementById('quizOptions');
    optionsDiv.innerHTML = '';
    
    q.o.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => selectAnswer(i));
        optionsDiv.appendChild(btn);
    });
}

function selectAnswer(index) {
    quizState.answers.push(index);
    quizState.score += Math.random() > 0.3 ? 1 : 0; // Simulated scoring
    
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.style.pointerEvents = 'none');
    options[index].classList.add('correct');
    
    setTimeout(() => {
        quizState.current++;
        if (quizState.current < quizQuestions.length) {
            showQuestion();
        } else {
            showQuizResult();
        }
    }, 1000);
}

function showQuizResult() {
    document.getElementById('quizGameArea').classList.add('hidden');
    document.getElementById('quizResult').classList.remove('hidden');
    
    const score = quizState.score;
    const total = quizQuestions.length;
    const percent = (score / total) * 100;
    
    document.getElementById('resultScore').textContent = `${score}/${total}`;
    
    let icon, message;
    if (percent >= 80) {
        icon = '🏆';
        message = 'Incrível! Vocês se conhecem muito bem!';
    } else if (percent >= 60) {
        icon = '😍';
        message = 'Muito bom! Vocês têm uma conexão especial!';
    } else if (percent >= 40) {
        icon = '😊';
        message = 'Bom! Ainda há muito a descobrir um sobre o outro!';
    } else {
        icon = '💕';
        message = 'Que tal passar mais tempo juntos se conhecendo?';
    }
    
    document.getElementById('resultIcon').textContent = icon;
    document.getElementById('resultMessage').textContent = message;
}

// ===== LOVE CALCULATOR =====
function calculateLove() {
    const name1 = document.getElementById('calcName1').value.trim();
    const name2 = document.getElementById('calcName2').value.trim();
    
    if (!name1 || !name2) {
        document.getElementById('loveResult').innerHTML = '<p style="color: var(--gray-light)">Preencha os dois nomes!</p>';
        return;
    }
    
    const percentage = Math.floor(Math.random() * 31) + 70;
    
    let message;
    if (percentage >= 95) message = 'Almas gêmeas! 💫';
    else if (percentage >= 85) message = 'Amor verdadeiro! 💛';
    else if (percentage >= 75) message = 'Combinação perfeita! ✨';
    else message = 'Muito amor no ar! 💕';
    
    document.getElementById('loveResult').innerHTML = `
        <div style="font-size: 3rem; margin-bottom: 10px;">💕</div>
        <div style="font-size: 2.5rem; font-weight: bold; color: var(--yellow);">${percentage}%</div>
        <div style="margin-top: 10px; color: var(--white);">${message}</div>
    `;
}

// ===== TRUTH OR DARE =====
const truths = [
    "Qual foi a fantasia mais ousada que você já teve com seu amor? 🔥",
    "Qual parte do corpo do seu parceiro(a) te deixa mais louco(a)?",
    "Conte o sonho mais 'quente' que já teve com seu amor 😏",
    "O que seu amor faz que te deixa com mais desejo?",
    "Qual foi o momento mais constrangedor que vocês já passaram juntos?",
    "Qual lugar mais inusitado vocês já se beijaram?",
    "O que você mais tem vontade de fazer com seu amor que nunca fez?",
    "Qual foi o beijo mais marcante de vocês e por quê? 💋",
    "Se pudesse realizar UMA fantasia com seu amor, qual seria?",
    "Qual foi a maior loucura que você fez por amor?",
    "O que te excita mais: olhar, toque ou palavras do seu amor?",
    "Conte seu maior segredo sobre seu relacionamento 🤫",
    "O que você acha mais sexy no seu parceiro(a)?",
    "Qual foi a declaração de amor mais constrangedora que você já fez?",
    "Você tem algum fetiche que nunca contou? Agora é hora! 😈",
    "O que seu amor faz que te tira do sério (de paixão)?",
    "Se vocês pudessem viajar para qualquer lugar do mundo para um momento romântico, onde seria?",
    "Qual cantada você usaria no seu amor se fossem se conhecer hoje?"
];

const dares = [
    "Dê um beijo de cinema de pelo menos 30 segundos! 💋",
    "Faça uma dança sensual pro seu amor (coloca uma música!)",
    "Morda de leve a orelha do seu parceiro(a) 😈",
    "Dê 10 beijinhos no pescoço do seu amor",
    "Olhe nos olhos do seu amor por 2 minutos sem rir (se aguentar!)",
    "Sussurre algo bem picante no ouvido do seu amor 🔥",
    "Faça uma massagem sensual nos ombros por 3 minutos",
    "Grave um áudio dizendo as 3 coisas que mais te atraem no seu amor",
    "Dê um selinho a cada 30 segundos pelos próximos 5 minutos",
    "Abrace seu amor por trás e diga algo romântico no ouvido",
    "Deixe seu amor escolher um lugar pra você beijar 😏",
    "Faça carinho na barriga do seu amor por 2 minutos",
    "Imite como você ficou na primeira vez que viu seu amor (exagera!)",
    "Ligue pra alguém e diga que tá muito apaixonado(a) 📱",
    "Poste um story marcando seu amor com uma declaração constrangedora",
    "Dance coladinho uma música romântica (bem coladinho mesmo!)",
    "Dê um beijo na testa, nariz, bochecha e boca do seu amor (nessa ordem)",
    "Conte como foi a última vez que você ficou com ciúmes 😅"
];

function showTruthOrDare(type) {
    const list = type === 'truth' ? truths : dares;
    const item = list[Math.floor(Math.random() * list.length)];
    const label = type === 'truth' ? 'Verdade' : 'Desafio';
    const emoji = type === 'truth' ? '🤔' : '😈';
    
    document.getElementById('truthDareResult').innerHTML = `
        <div>
            <div style="font-size: 2rem; margin-bottom: 10px;">${emoji}</div>
            <div style="color: var(--yellow); margin-bottom: 10px; font-weight: 600;">${label}</div>
            <div>${item}</div>
        </div>
    `;
}

// ===== COMPLIMENTS =====
const compliments = [
    "Você é a pessoa mais incrível que já conheci! 💛",
    "Seu sorriso ilumina meu dia inteiro! ✨",
    "Você me faz querer ser uma pessoa melhor!",
    "Cada momento com você é precioso!",
    "Você é minha definição de felicidade!",
    "Seus olhos são minha vista favorita!",
    "Você faz tudo parecer mais bonito!",
    "Seu abraço é meu lugar favorito!",
    "Você é mais especial do que imagina!",
    "Meu coração escolheu você!",
    "Você é a melhor parte do meu dia!",
    "Sua risada é minha música favorita!",
    "Você me completa de todas as formas!",
    "Sou sortudo(a) por ter você!",
    "Você é pura magia! ✨"
];

function generateCompliment() {
    const display = document.getElementById('complimentDisplay');
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    display.style.animation = 'none';
    display.offsetHeight;
    display.textContent = compliment;
    display.style.animation = 'fadeIn 0.5s ease';
}

// ===== LETTERS =====
function initLetters() {
    const cards = document.querySelectorAll('.letter-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
}

// ===== RAZÕES PRA TE AMAR =====
function initReasons() {
    const carousel = document.querySelector('.reasons-carousel');
    const cards = document.querySelectorAll('.reason-card');
    const prevBtn = document.getElementById('prevReason');
    const nextBtn = document.getElementById('nextReason');
    
    if (!carousel || cards.length === 0) return;
    
    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth + 20; // + gap
    
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        
        cards.forEach((card, i) => {
            card.classList.remove('active');
            if (i === currentIndex) card.classList.add('active');
        });
    }
    
    prevBtn?.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
        updateCarousel();
    });
    
    nextBtn?.addEventListener('click', () => {
        currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
        updateCarousel();
    });
    
    // Touch/Swipe
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextBtn?.click() : prevBtn?.click();
        }
    }, { passive: true });
    
    // Auto-play
    setInterval(() => {
        currentIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
        updateCarousel();
    }, 5000);
    
    updateCarousel();
}

// ===== MODALS =====
function initModals() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Click outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
}

function openModal(id) {
    const modal = document.getElementById(id);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== FLOATING BUTTONS =====
function initFloatingButtons() {
    const backToTop = document.getElementById('backToTop');
    const surpriseBtn = document.getElementById('surpriseBtn');
    
    // Back to top
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Surprise
    const surpriseMessages = [
        "Você é a melhor coisa que aconteceu na minha vida!",
        "Meu coração é seu, hoje e sempre!",
        "Obrigado por existir na minha vida!",
        "Você me faz a pessoa mais feliz do mundo!",
        "Cada dia com você é uma aventura incrível!",
        "Você é meu sol em dias nublados!",
        "Te amo mais do que palavras podem expressar!",
        "Você é meu presente favorito da vida!"
    ];
    
    surpriseBtn.addEventListener('click', () => {
        const message = surpriseMessages[Math.floor(Math.random() * surpriseMessages.length)];
        document.getElementById('surpriseMessage').textContent = message;
        openModal('surpriseModal');
        createConfetti();
    });
}

// ===== CONFETTI =====
function createConfetti() {
    const colors = ['#FFD700', '#FFA500', '#FFD700', '#FFF8DC'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            pointer-events: none;
            z-index: 9999;
            animation: confettiFall ${Math.random() * 2 + 2}s ease-out forwards;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
}

// Add confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== HOVER EFFECTS =====
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.game-card, .letter-card, .reason-card');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });
});

// ===== SECTION OBSERVER =====
function initSectionObserver() {
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => observer.observe(section));
}

// Log
console.log('💛 Site carregado com sucesso!');
