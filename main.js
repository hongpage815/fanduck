// Main Application Logic

const app = document.getElementById('app');
let allocator;
try {
    allocator = new BudgetAllocator(OPTIONS);
} catch (e) {
    console.warn("Allocator init failed, using fallback");
    allocator = { recommend: () => ({ items: [] }) };
}

// Global Storage
const USER_CREATED_FUNDINGS = JSON.parse(localStorage.getItem('FANDUCK_MY_FUNDINGS') || '[]');

function deleteFunding(id, event) {
    if (event) {
        event.stopPropagation();
    }

    // Custom Popup
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4';
    popup.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transform scale-100 transition-all">
            <div class="text-center mb-6">
                <div class="text-4xl mb-4">😢</div>
                <h3 class="text-xl font-bold text-dark mb-2">정말 삭제하시겠습니까?</h3>
                <p class="text-gray-500 text-sm">
                    삭제된 펀딩은 복구할 수 없습니다.<br>
                    신중하게 결정해주세요.
                </p>
            </div>
            <div class="flex gap-3">
                <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition">취소</button>
                <button onclick="confirmDeleteFunding(${id}, this)" class="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition shadow-lg">삭제하기</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
}

function confirmDeleteFunding(id, btnElement) {
    const index = USER_CREATED_FUNDINGS.findIndex(f => f.id === id);
    if (index > -1) {
        USER_CREATED_FUNDINGS.splice(index, 1);
        localStorage.setItem('FANDUCK_MY_FUNDINGS', JSON.stringify(USER_CREATED_FUNDINGS));

        // Remove popup
        if (btnElement) btnElement.closest('.fixed').remove();

        render(); // Rerender current page
    }
}

// State
let state = {
    step: 0, // 0: Home, 1: Goal, 2: Category, 3: Details, 4: Result
    loading: false,
    loadingPhase: 0,
    recommendation: null,
    data: {
        artist: '',
        title: '',
        goalAmount: 0,
        deadline: '',
        categories: [],
        details: {
            ads: { style: '', locations: [] },
            gift: { level: 0 },
            food: { level: 0 },
            goods: { categories: [], items: [] }
        }
    }
};

// Loading Constants
const LOADING_PHRASES = [
    "🤖 팬심 데이터 분석 중...",
    "🎶 아티스트 일정 반영 중...",
    "🌍 글로벌 응원 밸런스 맞추는 중...",
    "❤️ 감동 포인트 살짝 추가 중..."
];

// --- Navigation ---
function goHome() {
    state.step = 0;
    render();
}

function startFunding() {
    // Reset state when starting new funding
    state = {
        step: 1,
        loading: false,
        loadingPhase: 0,
        recommendation: null,
        data: {
            artist: '',
            title: '',
            goalAmount: 0,
            deadline: '',
            categories: [],
            details: {
                ads: { style: '', locations: [] },
                gift: { level: 0 },
                food: { level: 0 },
                goods: { categories: [], items: [] }
            }
        }
    };
    render();
}

function nextStep() {
    state.step++;
    render();
}

function prevStep() {
    state.step--;
    render();
}

function goToPartners() {
    state.step = 'partners';
    render();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
}

// --- Render Functions ---

// Include CSS for New Home Page
const style = document.createElement('style');
style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    
    /* Animations */
    @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0px); }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }

    @keyframes pulse-slow {
        0%, 100% { transform: scale(1); opacity: 0.4; }
        50% { transform: scale(1.1); opacity: 0.6; }
    }
    .bg-blob {
        position: absolute;
        background: radial-gradient(circle, rgba(255,200,0,0.2) 0%, rgba(255,127,0,0.05) 50%, rgba(255,255,255,0) 80%);
        border-radius: 50%;
        animation: pulse-slow 12s infinite;
        z-index: 0;
        pointer-events: none;
    }

    .slide-up {
        animation: fadeUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        opacity: 0;
        transform: translateY(30px);
    }
    
    @keyframes fadeUp {
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .text-gradient {
        background: linear-gradient(135deg, #FFD700 0%, #FF8E00 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        display: inline-block;
    }

    .glass-header {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    }

    .glass-card {
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
    }
`;
document.head.appendChild(style);

function render() {
    // If loading, show loading screen
    if (state.loading) {
        app.innerHTML = '';
        renderLoading();
        window.scrollTo(0, 0);
        return;
    }

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const isStep3Update = (state.step === 3);

    // Toggle Static Header/Footer
    const staticHeader = document.querySelector('body > header');
    const staticFooter = document.querySelector('body > footer');

    // Reset App Container
    app.innerHTML = '';

    if (state.step === 0) {
        // Home View: Hide default static header/footer, use custom ones
        if (staticHeader) staticHeader.style.display = 'none';
        if (staticFooter) staticFooter.style.display = 'none';

        renderHome();
    } else if (state.step === 'funding_list') {
        if (staticHeader) staticHeader.style.display = 'none';
        if (staticFooter) staticFooter.style.display = 'block';
        app.className = 'bg-gray-50 min-h-screen';
        renderFundingListPage();
    } else if (state.step === 'funding_payment') {
        if (staticHeader) staticHeader.style.display = 'none';
        if (staticFooter) staticFooter.style.display = 'none';
        app.className = 'bg-gray-50 min-h-screen flex items-center justify-center';
        renderFundingPaymentPage();
    } else if (state.step === 'funding_detail') {
        if (staticHeader) staticHeader.style.display = 'none';
        if (staticFooter) staticFooter.style.display = 'block';
        app.className = 'bg-gray-50 min-h-screen';
        renderFundingDetailPage();
    } else if (state.step === 'partners') {
        // Partners Page: Show default static header/footer
        if (staticHeader) staticHeader.style.display = 'flex';
        if (staticFooter) staticFooter.style.display = 'block';

        // Restore Default Layout Container
        app.className = 'pt-16 pb-20 min-h-screen bg-gray-50';

        updateHeaderLogo();
        renderPartnersPage();
    } else {
        // Other Steps View: Show default static header/footer
        if (staticHeader) staticHeader.style.display = 'flex';
        if (staticFooter) staticFooter.style.display = 'block';

        // Restore Default Layout Container
        app.className = 'pt-16 pb-20 min-h-screen max-w-6xl mx-auto';

        updateHeaderLogo();

        if (state.step === 1) renderStep1();
        else if (state.step === 2) renderStep2();
        else if (state.step === 3) renderStep3();
        else if (state.step === 4) renderStep4();
    }

    // Scroll Logic
    if (isStep3Update && scrollY > 0) {
        setTimeout(() => window.scrollTo(0, scrollY), 0);
    } else {
        window.scrollTo(0, 0);
    }
}

// Format Amount Helper (Comma)
function formatAmountInput(e) {
    let value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric
    if (value) {
        value = parseInt(value).toLocaleString('ko-KR');
    }
    e.target.value = value;
    // Update State (remove comma for logic)
    state.data.goalAmount = value ? parseInt(value.replace(/,/g, '')) : 0;
}

function updateHeaderLogo() {
    const logoContainer = document.querySelector('header div:first-child');
    if (logoContainer) {
        logoContainer.innerHTML = `
            <img src="assets/logo.png" alt="FANDUCK" class="h-10 w-auto object-contain">
        `;
    }
}

function renderHome() {
    // 1. Setup Home Container
    app.className = "bg-gray-50 text-dark overflow-x-hidden";

    // 2. Sticky Glass Header
    const header = document.createElement('header');
    header.className = "fixed top-0 w-full z-50 glass-header transition-all duration-300 px-6 py-4 flex justify-between items-center";
    header.innerHTML = `
        <div class="flex items-center gap-2 cursor-pointer" onclick="goHome()">
            <img src="assets/logo.png" alt="FANDUCK" class="h-12 w-auto">
        </div>
        <nav class="hidden md:flex gap-8 text-sm font-bold text-gray-700">
            <a href="#" class="hover:text-primary transition" onclick="goHome()">홈</a>
            <a href="#" class="hover:text-primary transition" onclick="startFunding()">조공하기</a>
            <a href="#" class="hover:text-primary transition" onclick="goToPartners()">제휴사</a>
            <a href="#contact" class="hover:text-primary transition">문의하기</a>
        </nav>
        <button class="md:hidden text-2xl">☰</button>
    `;
    app.appendChild(header);

    // 3. Main Content Wrapper
    const main = document.createElement('div');
    main.className = "pt-20 relative";

    // --- Section A: Hero ---
    const hero = document.createElement('section');
    hero.className = "relative flex flex-col md:flex-row items-center justify-center gap-8 px-6 py-12 md:py-20 overflow-hidden"; // Reduced Padding Here
    hero.innerHTML = `
        <!-- Blob shifted to right -->
        <!-- <div class="bg-blob"></div> -->
        
        <!-- Text Area -->
        <div class="relative z-10 text-center md:text-left max-w-xl slide-up" style="animation-delay: 0.1s;">
            <h1 class="text-4xl md:text-6xl font-extrabold leading-tight mb-6 text-gray-900 tracking-tight">
                <span class="block mb-2 text-gray-800">나의 아티스트를 위한</span>
                <span class="text-gradient">가장 완벽한 조공</span>
            </h1>
            <p class="text-base text-gray-600 mb-8 leading-relaxed font-medium">
                팬심을 담은 광고부터 현장 서포트까지.<br>
                FANDUCK이 당신의 마음을 가장 빛나게 전달해드릴게요.
            </p>
            <button onclick="startFunding()" 
                    class="bg-dark hover:bg-black text-white font-bold py-4 px-10 rounded-full text-lg shadow-2xl transition transform hover:scale-105 active:scale-95 ring-4 ring-gray-100">
                아티스트 펀딩 생성하기 🚀
            </button>
        </div>

        <!-- Hero Image -->
        <div class="relative z-10 animate-float slide-up" style="animation-delay: 0.3s;">
             <div class="bg-blob absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-60 z-[-1]"></div>
            <img src="assets/hero.png" class="w-[300px] md:w-[450px] object-contain drop-shadow-2xl grayscale-0">
        </div>
    `;
    main.appendChild(hero);

    // --- Section B: Features (Zig-Zag) ---
    const features = document.createElement('section');
    features.className = "py-24 px-6 bg-white";
    features.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-24">
            ${FEATURES.map((item, index) => `
                <div class="flex flex-col md:flex-row items-center gap-16 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}">
                    <!-- Image Area -->
                    <div class="flex-1 w-full flex justify-center">
                        <div class="relative group">
                            ${index === 1 ? '' : '<div class="absolute inset-0 bg-yellow-50 rounded-full transform scale-95 group-hover:scale-110 transition duration-700"></div>'}
                            <img src="${item.image}" class="relative w-80 md:w-96 object-contain transform transition duration-500 group-hover:-translate-y-4 drop-shadow-xl">
                        </div>
                    </div>
                    <!-- Text Area -->
                    <div class="flex-1 text-center md:text-left">
                         <h3 class="text-3xl font-bold mb-6 text-dark leading-snug">${item.title}</h3>
                         <p class="text-xl text-gray-500 leading-relaxed whitespace-pre-line">${item.desc}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    main.appendChild(features);

    // --- Section C: Active Fundings ---
    const fundingSection = document.createElement('section');
    fundingSection.className = "py-32 px-6 bg-gray-50";
    fundingSection.innerHTML = `
        <div class="max-w-6xl mx-auto relative">
            <h3 class="text-3xl font-bold mb-16 flex items-center justify-center gap-2">
                <span class="text-yellow-500 text-4xl">★</span> 지금 뜨고 있는 펀딩
            </h3>
            <div class="absolute right-0 top-0 mt-1 md:mt-2">
                 <button onclick="goToFundingList()" class="text-sm font-bold text-gray-500 hover:text-primary transition flex items-center gap-1">전체보기 <span class="text-lg">›</span></button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                ${FUNDING_LIST.map(item => `
                    <div class="glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition duration-500 group cursor-pointer h-full ${item.isNew ? 'border-2 border-primary' : ''}" onclick="goToFundingDetail(${item.id})">
                        <!-- Image -->
                        <div class="h-72 bg-gray-200 bg-cover bg-center group-hover:scale-105 transition duration-1000 relative" 
                             style="background-image: url('${item.image}')">
                            <div class="absolute top-6 left-6">
                                <span class="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-base font-bold shadow-lg">${item.badge}</span>
                            </div>
                        </div>
                        <!-- Content -->
                        <div class="p-10 bg-white/60 relative">
                            <div class="flex justify-between items-start mb-4">
                                <span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">${item.artist}</span>
                            </div>
                            <h4 class="text-2xl font-bold mb-8 text-gray-900 leading-snug min-h-[64px]">${item.title}</h4>
                            
                            <div class="space-y-4">
                                <div class="flex items-end justify-between">
                                    <div class="flex items-baseline gap-1">
                                        <span class="text-5xl font-extrabold text-primary animate-funding-percent" data-target-percent="${item.progress}">0</span>
                                        <span class="text-2xl font-bold text-primary">%</span>
                                    </div>
                                    <span class="text-base font-bold text-gray-500 animate-funding-amount" data-target-amount="${item.current}">0원 달성</span>
                                </div>
                                <div class="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                                    <div class="bg-gradient-to-r from-primary to-secondary h-full rounded-full shadow-inner animate-funding-bar transition-all duration-1000 ease-out" style="width: 0%" data-target-width="${item.progress}"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    main.appendChild(fundingSection);

    // --- Section D: Service Stats ---
    const statsSection = document.createElement('section');
    statsSection.className = "py-16 bg-white border-y border-gray-100";
    statsSection.innerHTML = `
        <div class="max-w-6xl mx-auto text-center">
            <h3 class="text-3xl font-bold text-gray-800 mb-16 tracking-tight">지금까지 모인 응원 🫶</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                ${SERVICE_STATS.map((stat) => `
                    <div class="p-6">
                        <div class="text-4xl mb-6 bg-yellow-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">${stat.icon}</div>
                        <div class="text-5xl font-extrabold text-dark mb-2 counter tabular-nums" data-target="${stat.value}">${stat.value}</div>
                        <div class="text-gray-500 font-bold text-lg">${stat.label} <span class="text-gray-300 text-sm font-normal">(${stat.unit})</span></div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    main.appendChild(statsSection);

    // --- Section E: Image Slider ---
    const sliderSection = document.createElement('section');
    sliderSection.className = "py-20 bg-gray-900 text-white overflow-hidden";
    const sliderImages = [...ARTIST_IMAGES, ...ARTIST_IMAGES, ...ARTIST_IMAGES]; // Triple visual buffer

    sliderSection.innerHTML = `
        <div class="mb-12 text-center px-4">
            <h3 class="text-2xl font-bold text-white/90">지금 사랑받고 있는 아티스트 💛</h3>
        </div>
        <div class="relative w-full overflow-hidden">
            <div class="flex gap-6 animate-slide-left w-max hover:pause">
                ${sliderImages.map(item => `
                    <div class="w-56 h-72 rounded-xl overflow-hidden shadow-lg transform transition hover:scale-105 hover:shadow-2xl opacity-100 relative group">
                        <img src="${item.image}" class="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110">
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
                        <div class="absolute bottom-0 left-0 right-0 p-6 text-center">
                            <h4 class="text-white font-bold text-xl drop-shadow-md tracking-wider">${item.name}</h4>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <style>
            @keyframes slide-left {
                0% { transform: translateX(0); }
                100% { transform: translateX(-33.33%); }
            }
            .animate-slide-left {
                animation: slide-left 40s linear infinite;
            }
            .hover\\:pause:hover {
                animation-play-state: paused;
            }
        </style>
    `;
    main.appendChild(sliderSection);

    // --- Section F: Partner Slider ---
    const partnerSection = document.createElement('section');
    partnerSection.className = "py-20 bg-white border-t border-gray-100 overflow-hidden";
    partnerSection.innerHTML = `
        <div class="text-center mb-12">
            <h3 class="text-2xl font-bold text-gray-400 tracking-widest uppercase flex items-center justify-center gap-2">
                함께하는 파트너 🤝
            </h3>
        </div>
        <div class="relative w-full group">
            <div class="flex gap-12 animate-scroll-fast hover:pause">
                ${[...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS, ...PARTNER_LOGOS].map(partner => `
                    <div class="flex-shrink-0 w-40 h-20 rounded-xl flex items-center justify-center p-2 transition duration-300 hover:shadow-lg border-2 border-gray-50 bg-white">
                        <img src="${partner.image}" class="max-w-full max-h-full object-contain" alt="${partner.name}">
                    </div>
                `).join('')}
            </div>
        </div>
        <style>
            @keyframes scroll-fast {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-scroll-fast {
                animation: scroll-fast 30s linear infinite;
            }
            .hover\\:pause:hover {
                animation-play-state: paused;
            }
        </style>
    `;
    main.appendChild(partnerSection);

    // Final Append
    app.appendChild(main);
    const footer = document.createElement('footer');
    footer.className = "bg-black text-white/60 py-16 px-6 border-t border-white/10";
    footer.innerHTML = `
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div class="text-center md:text-left">
                 <img src="assets/logo.png" alt="FANDUCK" class="h-6 w-auto opacity-50 grayscale mx-auto md:mx-0 mb-4">
                 <p class="text-xs">© 2025 FANDUCK. All rights reserved.</p>
                 <p class="text-xs mt-1 opacity-50">Designed for Global K-POP Fandom</p>
            </div>
            <div class="flex gap-8 text-xs font-bold">
                <a href="#" class="hover:text-white transition">이용약관</a>
                <a href="#" class="hover:text-white transition">개인정보처리방침</a>
                <a href="mailto:partnership@fanduck.com" class="hover:text-white transition">파트너십 문의</a>
            </div>
        </div>
        <div class="fixed bottom-8 right-8 z-40">
            <button onclick="window.scrollTo({top:0, behavior:'smooth'})" class="w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-dark hover:bg-primary hover:text-white transition duration-300">
                <span class="text-xl font-bold">↑</span>
            </button>
        </div>
    `;
    main.appendChild(footer);

    app.appendChild(main);

    startCounterAnimation();
    startFundingAnimation();

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('shadow-md', 'bg-white/90');
        else header.classList.remove('shadow-md', 'bg-white/90');
    });
}

function renderPartnersPage() {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto px-4 py-12';

    container.innerHTML = `
        <!-- Page Header -->
        <div class="text-center mb-16 opacity-0" style="animation: fadeInUp 0.8s ease-out forwards;">
            <h1 class="text-5xl font-extrabold text-dark mb-4">
                함께하는 <span class="text-gradient">파트너</span>
            </h1>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                FANDUCK과 함께 팬덤 문화를 만들어가는<br>
                믿을 수 있는 파트너사를 소개합니다
            </p>
        </div>

        <!-- Categories -->
        <div class="space-y-20">
            ${Object.keys(PARTNERS_BY_CATEGORY).map((categoryKey, idx) => {
        const category = PARTNERS_BY_CATEGORY[categoryKey];
        return `
                    <div class="category-section opacity-0" style="animation: fadeInUp 0.8s ease-out ${0.2 + (idx * 0.2)}s forwards;" data-category="${categoryKey}">
                        <!-- Category Header -->
                        <div class="flex items-center gap-4 mb-8 pb-4 border-b-2 border-primary">
                            <div class="text-5xl">${category.icon}</div>
                            <div>
                                <h2 class="text-3xl font-bold text-dark">${category.title}</h2>
                                <p class="text-gray-500 mt-1">${category.description}</p>
                            </div>
                        </div>

                        <!-- Partners Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            ${category.partners.map(partner => `
                                <a href="${partner.url}" target="_blank" rel="noopener noreferrer" 
                                   class="partner-card group block bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-primary">
                                    <!-- Logo Placeholder -->
                                    <div class="mb-6 flex items-center justify-center">
                                        <div class="w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-110 bg-white border-4 border-gray-50 overflow-hidden relative">
                                            <img src="${partner.image}" class="w-full h-full object-contain p-4" alt="${partner.name}">
                                        </div>
                                    </div>

                                    <!-- Partner Info -->
                                    <div class="text-center">
                                        <h3 class="text-xl font-bold text-dark mb-2 group-hover:text-primary transition">
                                            ${partner.name}
                                        </h3>
                                        <p class="text-sm text-gray-500 mb-4">
                                            ${partner.description}
                                        </p>
                                        <div class="inline-flex items-center gap-2 text-primary font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span>자세히 보기</span>
                                            <span>→</span>
                                        </div>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
    }).join('')}
        </div>

        <!-- CTA Section -->
        <div class="mt-20 bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-center text-white opacity-0" style="animation: fadeInUp 0.8s ease-out 1s forwards;">
            <h3 class="text-3xl font-bold mb-4">파트너십 문의</h3>
            <p class="text-lg mb-8 opacity-90">
                FANDUCK과 함께 성장하고 싶으신가요?<br>
                파트너사 제휴 문의를 기다립니다.
            </p>
            <a href="mailto:partnership@fanduck.com" 
               class="inline-block bg-white text-primary font-bold py-4 px-10 rounded-full hover:bg-gray-100 transition shadow-xl transform hover:scale-105">
                파트너십 문의하기
            </a>
        </div>
    `;

    app.appendChild(container);

}

function renderStep1() {
    const container = document.createElement('div');
    container.className = 'max-w-xl mx-auto px-4 animate-fade-in';
    container.innerHTML = `
        <div class="mb-8 text-center">
            <span class="text-sm font-bold text-gray-400">STEP 1/4</span>
            <h2 class="text-2xl font-bold mt-1">누구를 서포트할까요?</h2>
        </div>
        <div class="space-y-6">
            <div>
                <label class="block text-sm font-bold mb-2">대상 아티스트</label>
                <input type="text" id="inputDetailsArtist" class="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition" placeholder="예: 아이브, 제로베이스원..." value="${state.data.artist}">
            </div>
            <div>
                <label class="block text-sm font-bold mb-2">펀딩 제목</label>
                <input type="text" id="inputDetailsTitle" class="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition" placeholder="예: 데뷔 1주년 기념 서포트" value="${state.data.title}">
            </div>
            <div>
                <label class="block text-sm font-bold mb-2">목표 금액 (원)</label>
                <input type="text" id="inputDetailsAmount" oninput="formatAmountInput(event)" class="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition" placeholder="숫자만 입력 (예: 5,000,000)" value="${state.data.goalAmount ? state.data.goalAmount.toLocaleString() : ''}">
            </div>
            <div>
                <label class="block text-sm font-bold mb-2">마감 목표일</label>
                <input type="date" id="inputDetailsDate" class="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition" value="${state.data.deadline}">
            </div>
            <div class="flex justify-end mt-8">
                <button onclick="handleStep1()" class="w-16 h-16 rounded-full bg-dark text-white flex items-center justify-center text-2xl hover:scale-110 transition shadow-lg">></button>
            </div>
        </div>
    `;
    app.appendChild(container);
}

function handleStep1() {
    const rawAmount = document.getElementById('inputDetailsAmount').value.replace(/,/g, '');
    const amount = rawAmount ? parseInt(rawAmount) : 0;
    const artist = document.getElementById('inputDetailsArtist').value;
    if (!amount || !artist) { alert('아티스트와 목표 금액은 필수입니다.'); return; }
    state.data.goalAmount = amount;
    state.data.artist = artist;
    state.data.title = document.getElementById('inputDetailsTitle').value;
    state.data.deadline = document.getElementById('inputDetailsDate').value;
    nextStep();
}

function renderStep2() {
    const container = document.createElement('div');
    container.className = 'max-w-2xl mx-auto px-4 animate-fade-in';
    container.innerHTML = `
        <div class="mb-8 text-center">
            <span class="text-sm font-bold text-gray-400">STEP 2/4</span>
            <h2 class="text-2xl font-bold mt-1">어떤 선물을 보낼까요?</h2>
            <p class="text-gray-500 text-sm mt-2">복수 선택이 가능합니다.</p>
        </div>
        <div class="grid grid-cols-2 gap-4 mb-8">
            ${CATEGORIES.map(cat => `
                <div onclick="toggleCategory('${cat.id}')" 
                     class="cursor-pointer border-2 ${state.data.categories.includes(cat.id) ? 'border-primary bg-yellow-50' : 'border-transparent bg-white shadow'} 
                            rounded-xl p-6 text-center transition hover:shadow-lg flex flex-col items-center justify-center h-40">
                    <div class="text-4xl mb-3">${cat.icon}</div>
                    <div class="font-bold text-lg">${cat.name}</div>
                    <div class="text-xs text-gray-400 mt-1">${cat.desc}</div>
                </div>
            `).join('')}
        </div>
        <div class="flex justify-between items-center mt-8 px-4">
             <button onclick="prevStep()" class="w-16 h-16 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-2xl hover:bg-gray-300 transition"><</button>
             <button onclick="handleStep2()" class="w-16 h-16 rounded-full bg-dark text-white flex items-center justify-center text-2xl hover:scale-110 transition shadow-lg">></button>
        </div>
    `;
    app.appendChild(container);
}
function toggleCategory(id) {
    if (state.data.categories.includes(id)) {
        state.data.categories = state.data.categories.filter(c => c !== id);
    } else {
        state.data.categories.push(id);
    }
    render();
}
function handleStep2() {
    if (state.data.categories.length === 0) { alert('최소 하나의 카테고리를 선택해주세요.'); return; }
    nextStep();
}

function renderStep3() {
    const container = document.createElement('div');
    container.className = 'max-w-3xl mx-auto px-4 animate-fade-in pb-20';

    let contentHtml = `
        <div class="mb-8 text-center">
            <span class="text-sm font-bold text-gray-400">STEP 3/4</span>
            <h2 class="text-2xl font-bold mt-1">상세 옵션을 선택해주세요</h2>
        </div>
    `;

    // Order: Ads -> Food -> Gift -> Goods
    if (state.data.categories.includes('ads')) {
        contentHtml += `
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">📢 광고 설정</h3>
                <div class="mb-4">
                    <span class="text-sm font-bold block mb-2">광고 스타일 (필수)</span>
                    <div class="flex gap-2">
                        ${OPTIONS.ads.styles.map(s => `
                             <button onclick="selectAdStyle('${s}')" class="flex-1 py-3 border rounded-lg text-sm font-medium ${state.data.details.ads.style === s ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-600 border-gray-200'}">${s}</button>
                        `).join('')}
                    </div>
                </div>
                <div>
                    <span class="text-sm font-bold block mb-2">노출 위치 (복수 선택)</span>
                    <div class="flex flex-wrap gap-2">
                         ${OPTIONS.ads.locations.map(loc => `
                             <button onclick="toggleAdLoc('${loc.id}')" class="px-4 py-2 border rounded-full text-sm ${state.data.details.ads.locations.includes(loc.id) ? 'bg-primary text-white border-primary' : 'bg-gray-50 text-gray-500 border-transparent'}">${loc.name}</button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    if (state.data.categories.includes('food')) {
        contentHtml += renderLevelSection('food', '🍱 식사/간식 보내기', OPTIONS.food.levels, state.data.details.food?.level);
    }

    if (state.data.categories.includes('gift')) {
        contentHtml += renderLevelSection('gift', '🎁 선물 보내기', OPTIONS.gift.levels, state.data.details.gift?.level);
    }

    if (state.data.categories.includes('goods')) {
        contentHtml += `
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 class="font-bold text-lg mb-4 flex items-center gap-2">🎨 굿즈 제작</h3>
                <div class="grid grid-cols-1 gap-6">
                    ${OPTIONS.goods.categories.map(cat => `
                        <div class="border border-gray-200 rounded-xl overflow-hidden">
                            <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-dark">
                                ${cat.name}
                            </div>
                            <div class="p-4 bg-white">
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    ${cat.items.map(item => `
                                        <label class="flex items-center gap-2 text-sm text-gray-600 p-2 border border-gray-100 rounded-lg hover:bg-yellow-50 cursor-pointer transition ${state.data.details.goods.items.includes(item) ? 'bg-yellow-50 border-primary ring-1 ring-primary' : ''}">
                                            <input type="checkbox" onchange="toggleGoodsItem(this, '${cat.id}', '${item}')" ${state.data.details.goods.items.includes(item) ? 'checked' : ''} class="accent-secondary w-4 h-4">
                                            <span>${item}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    contentHtml += `
         <div class="flex justify-between items-center mt-8 px-4">
             <button onclick="prevStep()" class="w-16 h-16 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-2xl hover:bg-gray-300 transition"><</button>
             <button onclick="handleStep3()" class="bg-dark text-white font-bold py-4 px-12 rounded-full hover:bg-black transition shadow-lg text-lg">AI 추천 받기 ✨</button>
        </div>
    `;

    container.innerHTML = contentHtml;
    app.appendChild(container);
}

function renderLevelSection(type, title, levels, currentLevel) {
    return `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h3 class="font-bold text-lg mb-4 flex items-center gap-2">${title}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                ${levels.map(l => `
                    <div onclick="selectLevel('${type}', ${l.level})" 
                         class="cursor-pointer border-2 ${currentLevel === l.level ? 'border-primary bg-yellow-50' : 'border-gray-100 bg-white'} 
                                rounded-xl p-4 transition hover:shadow-md relative overflow-hidden">
                        <div class="text-3xl mb-2">${l.icon}</div>
                        <div class="font-bold text-lg text-secondary">Level ${l.level}</div>
                        <div class="font-bold text-dark mb-1">${l.name}</div>
                        <p class="text-xs text-gray-500 mb-4 h-8 overflow-hidden">${l.desc}</p>
                        <div class="space-y-2 border-t border-gray-200 pt-3">
                            ${l.details.map(d => `
                                <div class="text-xs">
                                    <span class="font-bold block text-gray-700">· ${d.title}</span>
                                    <span class="text-gray-400">${d.info}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectLevel(type, level) {
    state.data.details[type].level = level;
    render();
}
function selectAdStyle(style) {
    state.data.details.ads.style = style;
    render();
}
function toggleAdLoc(id) {
    const locs = state.data.details.ads.locations;
    if (locs.includes(id)) state.data.details.ads.locations = locs.filter(l => l !== id);
    else state.data.details.ads.locations.push(id);
    render();
}
function toggleGoodsItem(el, catId, item) {
    const items = state.data.details.goods.items;

    // Toggle item in state
    if (items.includes(item)) {
        state.data.details.goods.items = items.filter(i => i !== item);
    } else {
        state.data.details.goods.items.push(item);
    }

    // Track category implicitly (optional, for logic consistency)
    if (!state.data.details.goods.categories.includes(catId)) {
        state.data.details.goods.categories.push(catId);
    }

    // Update UI (Simple re-render to reflect checked state styling)
    render();
}

// --- Loading & Analysis ---

function handleStep3() {
    if (state.data.categories.includes('ads') && !state.data.details.ads.style) { alert('광고 스타일을 선택해주세요.'); return; }
    if (state.data.categories.includes('food') && state.data.details.food.level === 0) { alert('먹거리 레벨을 선택해주세요.'); return; }
    if (state.data.categories.includes('gift') && state.data.details.gift.level === 0) { alert('선물 레벨을 선택해주세요.'); return; }

    // 1. Generate Recommendation (Safe)
    try {
        state.recommendation = allocator.recommend(state.data.goalAmount, state.data.categories, state.data.details);
    } catch (e) {
        console.error("Alloc Error", e);
        // Minimal fallback
        state.recommendation = {
            items: state.data.categories.map(c => ({ category: c, name: 'AI 추천 구성', cost: Math.floor(state.data.goalAmount / state.data.categories.length), detail: '기본 구성' }))
        };
    }

    // 2. Start Loading
    state.loading = true;
    state.loadingPhase = 0;
    render(); // Shows starting phase immediately

    const phases = 4;
    const durationPerPhase = 2000;
    let currentPhase = 0;

    const interval = setInterval(() => {
        currentPhase++;

        if (currentPhase >= phases) {
            clearInterval(interval);
            state.loading = false;
            nextStep(); // This triggers Step 4
        } else {
            state.loadingPhase = currentPhase;
            updateLoadingUI();
        }
    }, durationPerPhase);
}

// Simplified function to safely update DOM without re-render
function updateLoadingUI() {
    const currentStepEl = document.getElementById('currentAnalysisStep');
    const scrollContainer = document.getElementById('analysisScrollContainer');

    if (currentStepEl) {
        currentStepEl.innerText = LOADING_PHRASES[state.loadingPhase];
    }

    // Auto-scroll to next section
    if (scrollContainer) {
        const targetScroll = state.loadingPhase * 400; // 400px per phase
        scrollContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }

    // Highlight current step
    const steps = document.querySelectorAll('.analysis-step');
    steps.forEach((step, idx) => {
        if (idx === state.loadingPhase) {
            step.classList.add('active');
            step.classList.remove('opacity-30');
        } else if (idx < state.loadingPhase) {
            step.classList.add('completed');
            step.classList.remove('opacity-30');
        }
    });

    // Update progress bar
    if (window.updateLoadingProgress) {
        window.updateLoadingProgress();
    }
}

function renderLoading() {
    const container = document.createElement('div');
    container.className = 'fixed inset-0 z-50 bg-gradient-to-br from-yellow-50 via-white to-orange-50 overflow-hidden';

    // 분석 단계 데이터
    const analysisSteps = [
        {
            phase: 0,
            title: '🤖 팬심 데이터 분석 중...',
            image: LOADING_IMAGES[0],
            details: [
                '✓ 선택하신 카테고리 조합 분석',
                '✓ 목표 금액 대비 최적 비율 계산',
                '✓ 과거 성공 펀딩 데이터 참조'
            ]
        },
        {
            phase: 1,
            title: '🎶 아티스트 일정 반영 중...',
            image: LOADING_IMAGES[1],
            details: [
                '✓ 효과적인 타이밍 분석',
                '✓ 팬덤 활동 패턴 고려',
                '✓ 시즌별 트렌드 반영'
            ]
        },
        {
            phase: 2,
            title: '🌍 글로벌 응원 밸런스 맞추는 중...',
            image: LOADING_IMAGES[2],
            details: [
                '✓ 카테고리별 임팩트 분석',
                '✓ 비용 대비 효과 최적화',
                '✓ 팬과 아티스트 만족도 균형'
            ]
        },
        {
            phase: 3,
            title: '❤️ 감동 포인트 살짝 추가 중...',
            image: LOADING_IMAGES[3],
            details: [
                '✓ 특별한 조합 추천 완료',
                '✓ 최종 예산 배분 확정',
                '✓ AI 믹스 결과 생성 완료!'
            ]
        }
    ];

    container.innerHTML = `
        <div class="h-full flex flex-col">
            <!-- Top Header -->
            <div class="bg-white/80 backdrop-blur-md border-b border-gray-200 p-6 flex-shrink-0">
                <div class="max-w-4xl mx-auto">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
                            <span class="text-2xl">🤖</span>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold text-dark">AI가 최적의 조합을 찾고 있어요</h2>
                            <p class="text-sm text-gray-500">잠시만 기다려주세요, 곧 완벽한 믹스가 완성됩니다!</p>
                        </div>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div id="mainProgressBar" class="bg-gradient-to-r from-primary via-secondary to-primary h-full rounded-full transition-all duration-1000" style="width: 0%; background-size: 200% 100%; animation: shimmer 2s infinite;"></div>
                    </div>
                    
                    <!-- Current Step Text -->
                    <p id="currentAnalysisStep" class="text-center mt-3 text-primary font-bold text-lg animate-pulse">
                        ${LOADING_PHRASES[0]}
                    </p>
                </div>
            </div>

            <!-- Scrollable Analysis Steps -->
            <div id="analysisScrollContainer" class="flex-1 overflow-y-auto hide-scrollbar">
                <div class="max-w-4xl mx-auto py-8 px-6 space-y-8">
                    ${analysisSteps.map((step, idx) => `
                        <div class="analysis-step opacity-30 transition-all duration-500 ${idx === 0 ? 'active' : ''}" data-phase="${step.phase}">
                            <div class="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
                                <!-- Step Header -->
                                <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 border-b border-gray-200">
                                    <div class="flex items-center gap-4">
                                        <div class="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-xl text-primary">
                                            ${step.phase + 1}
                                        </div>
                                        <h3 class="text-xl font-bold text-dark">${step.title}</h3>
                                    </div>
                                </div>
                                
                                <!-- Step Content -->
                                <div class="p-8 flex flex-col md:flex-row gap-8 items-center">
                                    <!-- Image -->
                                    <div class="flex-shrink-0">
                                        <img src="${step.image}" class="w-64 h-64 object-contain drop-shadow-xl transform transition-transform duration-700 hover:scale-110" alt="분석 ${step.phase + 1}">
                                    </div>
                                    
                                    <!-- Details -->
                                    <div class="flex-1 space-y-4">
                                        ${step.details.map((detail, detailIdx) => `
                                            <div class="flex items-start gap-3 opacity-0 animate-fadeInUp" style="animation-delay: ${detailIdx * 0.2}s; animation-fill-mode: forwards;">
                                                <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                                                    <span class="text-green-600 text-sm">✓</span>
                                                </div>
                                                <p class="text-gray-700 font-medium">${detail}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <!-- Final Message -->
                    <div class="text-center py-12 opacity-0" id="finalMessage">
                        <div class="inline-block bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-full font-bold text-xl shadow-2xl animate-bounce">
                            🎉 완벽한 AI 믹스 완성!
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <style>
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .animate-fadeInUp {
                animation: fadeInUp 0.6s ease-out;
            }
            
            .analysis-step.active {
                opacity: 1 !important;
            }
            
            .analysis-step.active .bg-white {
                border-color: #FFC800;
                box-shadow: 0 0 30px rgba(255, 200, 0, 0.3);
            }
            
            .analysis-step.completed {
                opacity: 0.7 !important;
            }
            
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
            
            .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        </style>
    `;

    app.appendChild(container);

    // Update progress bar
    const updateProgress = () => {
        const progressBar = document.getElementById('mainProgressBar');
        if (progressBar) {
            const progress = ((state.loadingPhase + 1) / 4) * 100;
            progressBar.style.width = `${progress}%`;
        }

        // Show final message on last phase
        if (state.loadingPhase === 3) {
            setTimeout(() => {
                const finalMsg = document.getElementById('finalMessage');
                if (finalMsg) {
                    finalMsg.style.opacity = '1';
                    finalMsg.style.transition = 'opacity 0.5s ease-in';
                }
            }, 1500);
        }
    };

    // Initial progress
    setTimeout(updateProgress, 100);

    // Store update function for later use
    window.updateLoadingProgress = updateProgress;
}

function renderStep4() {
    const rec = state.recommendation;
    // Fallback if recommendation is missing
    if (!rec || !rec.items) {
        app.innerHTML = '<div class="p-8 text-center">결과 생성 중 오류가 발생했습니다.<br><button onclick="goHome()" class="underline text-blue-500 mt-4">처음으로 돌아가기</button></div>';
        return;
    }

    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto px-4 animate-fade-in pb-20 pt-8';

    const randomPhrase = (typeof COMPLIMENT_PHRASES !== 'undefined' && COMPLIMENT_PHRASES.length > 0)
        ? COMPLIMENT_PHRASES[Math.floor(Math.random() * COMPLIMENT_PHRASES.length)]
        : '이 조합... 팬심 제대로다 💛';

    // Result Page
    container.innerHTML = `
        <!-- Title -->
        <div class="mb-8 text-center flex flex-col items-center">
            <div class="flex items-center gap-2 mb-2">
                <img src="assets/FANDUCK_S.png" alt="Duck" class="w-12 h-12 object-contain animate-bounce">
                <h2 class="text-3xl font-bold">"${randomPhrase}"</h2>
            </div>
            <div class="text-lg text-secondary font-bold">AI가 추천한 응원 믹스가 완성됐어요! ✨</div>
        </div>

        <!-- 1. Top Purpose & Goal -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-8">
            <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                <div class="text-center md:text-left">
                    <div class="text-sm font-bold text-gray-400 mb-1">펀딩 목적</div>
                    <div class="text-2xl font-bold text-dark mb-2">${state.data.title || '아티스트 서포트'}</div>
                    <div class="text-sm text-secondary bg-yellow-50 px-3 py-1 rounded-full inline-block mb-3">
                        "기념일엔 '보이는 응원 + 남는 응원'을 균형 있게 구성했어요"
                    </div>
                </div>
                <div class="text-center md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                     ${state.data.deadline ? `
                        <div class="mb-4">
                            <div class="text-sm font-bold text-gray-400 mb-1">목표 달성일</div>
                            <div class="text-xl font-bold text-dark">${state.data.deadline}</div>
                        </div>
                    ` : ''}
                    <div class="text-sm font-bold text-gray-400 mb-1">목표 금액</div>
                    <div class="text-3xl font-bold text-primary">${formatCurrency(state.data.goalAmount)}</div>
                </div>
            </div>
        </div>

        <!-- 2. Main Summary Bar (Trust) -->
        <div class="mb-10 px-2">
            <div class="flex justify-between items-end mb-3">
                <span class="font-bold text-gray-700">AI 예산 구성 근거</span>
                <span class="text-xs font-bold text-primary bg-yellow-100 px-2 py-1 rounded">신뢰도 98%</span>
            </div>
            <!-- Dynamic Bar -->
            <div class="w-full h-8 bg-gray-100 rounded-full flex overflow-hidden shadow-inner relative">
                 ${rec.items.map((item, idx) => {
        const colors = ['bg-primary', 'bg-secondary', 'bg-yellow-300', 'bg-gray-400'];
        const color = colors[idx % colors.length];
        const percent = (item.cost / state.data.goalAmount) * 100;
        const width = percent.toFixed(1);
        return `<div class="${color} h-full flex items-center justify-center text-sm font-extrabold text-white overflow-hidden whitespace-nowrap shadow-sm" style="width: ${width}%" title="${item.name}">${percent > 5 ? Math.round(percent) + '%' : ''}</div>`;
    }).join('')}
            </div>
            <div class="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                ${rec.items.map((item, idx) => {
        const colors = ['bg-primary', 'bg-secondary', 'bg-yellow-300', 'bg-gray-400'];
        const color = colors[idx % colors.length];
        return `<div class="flex items-center gap-1"><div class="w-3 h-3 ${color} rounded-full"></div>${item.category === 'ads' ? '광고' : item.category === 'food' ? '식사' : item.category === 'gift' ? '선물' : '굿즈'}</div>`;
    }).join('')}
            </div>
        </div>

        <!-- 3. Category Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
             ${rec.items.map(item => `
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition hover:border-primary relative overflow-hidden group">
                    <div class="flex justify-between items-start mb-4">
                         <span class="text-xs font-bold text-white bg-gray-800 px-2 py-1 rounded uppercase tracking-wider">${item.category.toUpperCase()}</span>
                         <span class="font-bold text-lg text-dark">${formatCurrency(item.cost)}</span>
                    </div>
                    
                    <h3 class="font-bold text-xl mb-2">${item.name}</h3>
                    <p class="text-sm text-gray-600 mb-4 h-10 line-clamp-2">${item.detail}</p>
                    
                    <div class="bg-gray-50 p-3 rounded-xl text-xs text-secondary font-bold flex items-center gap-2">
                        <span class="text-lg">💡</span> ${getReason(item.category)}
                    </div>
                </div>
             `).join('')}
        </div>

        <!-- 4. Confirmation -->
        <div class="bg-gray-50 rounded-2xl p-8 mb-8 text-center border-2 border-dashed border-gray-200">
             <div class="font-bold text-lg text-dark mb-6">"이 응원은 아티스트, 팬 모두에게 남는 구성이에요." 💛</div>
             <div class="flex flex-col gap-3 items-center justify-center text-gray-700">
                 <label class="flex items-center gap-2 cursor-pointer hover:text-dark transition">
                     <input type="checkbox" id="check1" class="w-5 h-5 accent-primary"> 
                     <span class="text-sm font-medium">각 카테고리 구성과 금액을 확인했어요</span>
                 </label>
                 <label class="flex items-center gap-2 cursor-pointer hover:text-dark transition">
                     <input type="checkbox" id="check2" class="w-5 h-5 accent-primary"> 
                     <span class="text-sm font-medium">펀딩 성격과 유의사항을 이해했어요</span>
                 </label>
             </div>
        </div>

        <!-- 5. CTA Buttons -->
        <div class="flex flex-col md:flex-row gap-4 sticky bottom-6 z-10">
             <button onclick="prevStep()" class="flex-1 bg-gray-100 border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition shadow-sm text-lg">
                ← 뒤로가기
             </button>
             <button onclick="reshuffleFunding()" class="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition shadow-sm text-lg">
                비율만 다시 섞어보기 🎲
             </button>
             <button onclick="handleCompleteFunding()" class="flex-[2] bg-primary text-white font-bold py-4 rounded-xl hover:bg-yellow-500 transition shadow-lg text-lg transform hover:-translate-y-1">
                이 구성으로 펀딩 참여하기 🚀
             </button>
        </div>
    `;
    app.appendChild(container);
}

function reshuffleFunding() {
    // Show visual feedback
    const container = document.querySelector('.max-w-4xl');
    if (container) {
        // Add shake animation
        container.style.animation = 'shake 0.5s ease-in-out';

        // Add temporary overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-primary/20 z-40 animate-pulse';
        overlay.innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="bg-white rounded-2xl p-8 shadow-2xl transform scale-110">
                    <div class="text-6xl mb-4 animate-spin">🎲</div>
                    <p class="text-2xl font-bold text-dark">비율 재조정 중...</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Wait for animation
        setTimeout(() => {
            // Re-run recommendation with SAME details but new random weights
            try {
                state.recommendation = allocator.recommend(state.data.goalAmount, state.data.categories, state.data.details);
            } catch (e) {
                console.error("Reshuffle Error", e);
            }

            // Remove overlay and re-render
            overlay.remove();
            container.style.animation = '';

            // Add fade-in animation to new content
            render();

            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Add entrance animation to cards
            setTimeout(() => {
                const cards = document.querySelectorAll('.grid > div');
                cards.forEach((card, idx) => {
                    card.style.animation = `fadeInUp 0.5s ease-out ${idx * 0.1}s forwards`;
                    card.style.opacity = '0';
                });
            }, 100);
        }, 800);
    }

    // Add shake keyframes if not exists
    if (!document.getElementById('reshuffleStyles')) {
        const style = document.createElement('style');
        style.id = 'reshuffleStyles';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function handleCompleteFunding() {
    const c1 = document.getElementById('check1');
    const c2 = document.getElementById('check2');
    if (!c1.checked || !c2.checked) {
        alert('모든 확인 항목에 체크해주세요.');
        return;
    }

    // Custom Popup
    const popup = document.createElement('div');
    popup.className = "fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in";
    popup.innerHTML = `
        <div class="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl transform scale-100 transition-all">
            <div class="text-5xl mb-4">🎉</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">AI 응원 믹스 완성!</h3>
            <p class="text-gray-600 mb-8 leading-relaxed text-sm">
                선택해주신 조건을 바탕으로<br>
                AI가 가장 잘 어울리는 펀딩을 완성했어요.<br>
                이제 팬들과 함께 응원을 시작해볼까요? 💛
            </p>
            <div class="space-y-3">
                <button onclick="closePopupAndGoDetail()" class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-yellow-500 transition shadow-lg">펀딩 보러 가기</button>
                <button onclick="alert('클립보드에 공유되었습니다!')" class="w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-xl hover:bg-gray-200 transition">친구에게 공유하기</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
}

function closePopupAndGoHome() {
    const popup = document.querySelector('.fixed.z-\\[60\\]');
    if (popup) popup.remove();
    goHome();
}

function getReason(cat) {
    if (cat === 'ads') return '많은 사람들에게 알릴 수 있어 홍보 효과가 탁월해요';
    if (cat === 'food') return '스케줄 도중 힘이 되는 에너지를 전달해요';
    if (cat === 'gift') return '오랫동안 아티스트의 곁에 남는 선물이에요';
    if (cat === 'goods') return '팬들이 다함께 즐기고 소장할 수 있어요';
    return '최고의 선택이에요';
}

// Initial Render
render();

// --- Helpers ---
function startCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-target'));
                let startValue = 0;
                let duration = 2000;
                let startTime = null;

                function step(currentTime) {
                    if (!startTime) startTime = currentTime;
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    target.innerText = Math.floor(progress * endValue);

                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        target.innerText = endValue;
                    }
                }
                window.requestAnimationFrame(step);
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function startFundingAnimation() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                // 1. Percent Animation
                if (target.classList.contains('animate-funding-percent')) {
                    const endVal = parseInt(target.getAttribute('data-target-percent'));
                    animateValue(target, 0, endVal, 2000);
                }

                // 2. Amount Animation
                if (target.classList.contains('animate-funding-amount')) {
                    const endVal = parseInt(target.getAttribute('data-target-amount'));
                    animateValue(target, 0, endVal, 2000, true); // true for currency format
                }

                // 3. Bar Animation
                if (target.classList.contains('animate-funding-bar')) {
                    const width = target.getAttribute('data-target-width');
                    setTimeout(() => {
                        target.style.width = width + '%';
                    }, 200);
                }

                observer.unobserve(target);
            }
        });
    }, { threshold: 0.2 });

    const elements = document.querySelectorAll('.animate-funding-percent, .animate-funding-amount, .animate-funding-bar');
    elements.forEach(el => observer.observe(el));
}

function animateValue(obj, start, end, duration, isCurrency = false) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);

        if (isCurrency) {
            obj.innerText = new Intl.NumberFormat('ko-KR').format(current) + '원 달성';
        } else {
            obj.innerText = current;
        }

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            if (isCurrency) {
                obj.innerText = new Intl.NumberFormat('ko-KR').format(end) + '원 달성';
            } else {
                obj.innerText = end;
            }
        }
    };
    window.requestAnimationFrame(step);
}

// --- Funding Details ---
function calculateDDay(dateString) {
    if (!dateString) return 'D-Day';
    const target = new Date(dateString);
    const today = new Date();
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return '마감됨';
    if (days === 0) return '오늘 마감';
    return `D-${days}`;
}

function goToFundingDetail(id) {
    let funding = FUNDING_LIST.find(f => f.id === id);
    if (!funding) {
        funding = USER_CREATED_FUNDINGS.find(f => f.id === id);
    }

    if (funding) {
        state.targetFunding = funding;
        state.step = 'funding_detail';
        render();
        window.scrollTo(0, 0);
    } else {
        alert('펀딩 정보를 찾을 수 없습니다.');
    }
}

function renderFundingDetailPage() {
    const funding = state.targetFunding;
    if (!funding) { goHome(); return; }

    // Header for Detail Page (Reusable)
    const header = document.createElement('header');
    header.className = "fixed top-0 w-full z-50 glass-header px-6 py-4 flex justify-between items-center";
    header.innerHTML = `
        <div class="flex items-center gap-2 cursor-pointer" onclick="goHome()">
            <img src="assets/logo.png" alt="FANDUCK" class="h-12 w-auto">
        </div>
        <button onclick="goHome()" class="text-sm font-bold text-gray-500 hover:text-primary transition">
            ✕ 닫기
        </button>
    `;
    app.appendChild(header);

    const container = document.createElement('div');
    container.className = 'max-w-3xl mx-auto px-4 py-24 animate-fade-in';

    container.innerHTML = `
        <!-- Funding Detail Card -->
        <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <!-- Image Header -->
            <div class="h-80 md:h-96 bg-gray-200 bg-cover bg-center relative group" style="background-image: url('${funding.image}')">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div class="absolute bottom-8 left-8 right-8 text-white">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">${funding.badge}</span>
                        <span class="bg-white/20 backdrop-blur border border-white/30 px-3 py-1 rounded-full text-xs font-bold">${funding.artist}</span>
                    </div>
                    <h1 class="text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">${funding.title}</h1>
                </div>
            </div>

            <!-- Content Body -->
            <div class="p-8 md:p-10">
                <!-- Progress Section -->
                <div class="mb-12">
                    <div class="flex justify-between items-end mb-4">
                        <div>
                            <span class="text-5xl font-extrabold text-primary">${funding.progress}</span>
                            <span class="text-2xl font-bold text-gray-300 ml-1">%</span>
                        </div>
                        <div class="text-right">
                            <div class="text-2xl font-bold text-dark">${new Intl.NumberFormat('ko-KR').format(funding.current)}원</div>
                            <div class="text-sm text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded inline-block mt-1">목표까지 ${calculateDDay(funding.deadline)}</div>
                        </div>
                    </div>
                    <div class="w-full bg-gray-100 h-5 rounded-full overflow-hidden shadow-inner">
                        <div class="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden" style="width: ${funding.progress}%">
                            <div class="absolute inset-0 bg-white/30 animate-pulse"></div>
                        </div>
                    </div>
                    <div class="mt-6 grid grid-cols-2 gap-4">
                         <div class="bg-gray-50 p-4 rounded-2xl text-center">
                            <div class="text-xs text-gray-400 font-bold mb-1">마감일</div>
                            <div class="text-dark font-bold">${funding.deadline || '상시 모집'}</div>
                         </div>
                         <div class="bg-gray-50 p-4 rounded-2xl text-center">
                            <div class="text-xs text-gray-400 font-bold mb-1">참여 인원</div>
                            <div class="text-dark font-bold">${Math.floor(funding.current / 12500).toLocaleString()}명 <span class="text-xs font-normal text-gray-400">참여 중</span></div>
                         </div>
                    </div>
                </div>

                <!-- Description -->
                <div class="mb-12 border-t border-gray-100 pt-10">
                    <h3 class="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                        <span class="text-2xl">📝</span> 프로젝트 소개
                    </h3>
                    <p class="text-gray-600 leading-loose text-lg font-medium whitespace-pre-line bg-gray-50 p-6 rounded-2xl">
                        ${funding.description}
                    </p>
                </div>

                <!-- Mix List (New) -->
                ${funding.items && funding.items.length > 0 ? `
                    <div class="mb-12 border-t border-gray-100 pt-10">
                        <h3 class="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                             <span class="text-2xl">🎁</span> 펀딩 구성 품목
                        </h3>
                        <div class="space-y-3">
                            ${funding.items.map(item => {
        const ICONS = { ads: '📢', food: '🍱', gift: '🎁', goods: '🎨', flower: '💐' };
        const icon = ICONS[item.category] || '✨';
        return `
                                <div class="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-lg">
                                            ${icon}
                                        </div>
                                        <div>
                                            <div class="font-bold text-gray-800">${item.name}</div>
                                            <div class="text-xs text-gray-400 capitalize">${item.category}</div>
                                        </div>
                                    </div>
                                    <div class="font-bold text-primary">${new Intl.NumberFormat('ko-KR').format(item.cost)}원</div>
                                </div>
                            `;
    }).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Action Buttons -->
                <div class="flex gap-4 sticky bottom-4 z-10">
                    <button onclick="handleJoinFunding('${funding.id}')" class="flex-1 bg-primary text-white font-bold py-5 rounded-2xl text-xl hover:bg-yellow-500 transition shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2">
                        <span>펀딩 참여하기 💖</span>
                    </button>
                    <button onclick="alert('링크가 복사되었습니다.')" class="w-20 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition shadow-md">
                        <span class="text-2xl">🔗</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    app.appendChild(container);
}

function closePopupAndGoDetail() {
    const popup = document.querySelector('.fixed.z-\\[60\\]');
    if (popup) popup.remove();

    // Create new funding object
    const totalCost = state.recommendation ? state.recommendation.items.reduce((sum, item) => sum + item.cost, 0) : 0;
    const newFunding = {
        id: Date.now(), // Generate unique ID
        artist: state.data.artist,
        title: state.data.title,
        progress: 0,
        current: 0,
        goal: totalCost || 10000000,
        image: 'assets/default_funding.png',
        badge: '✨ NEW',
        deadline: state.data.deadline,
        description: `내가 직접 구성한 ${state.data.artist}님을 위한 맞춤 서포트입니다!\n팬 여러분의 많은 관심 부탁드립니다. 💛`,
        items: state.recommendation ? state.recommendation.items : [],
        isNew: true
    };

    USER_CREATED_FUNDINGS.push(newFunding);
    localStorage.setItem('FANDUCK_MY_FUNDINGS', JSON.stringify(USER_CREATED_FUNDINGS));
    goToFundingDetail(newFunding.id);
}

// Participation Logic
const participatedHistory = new Set();

function handleJoinFunding(id) {
    if (participatedHistory.has(id.toString())) {
        showRejoinPopup(id);
    } else {
        goToPayment(id);
    }
}

function showRejoinPopup(id) {
    const popup = document.createElement('div');
    popup.className = "fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in";
    popup.innerHTML = `
        <div class="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl transform scale-100 transition-all">
            <div class="text-5xl mb-4">🤔</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">이미 참여한 펀딩입니다.</h3>
            <p class="text-gray-600 mb-8 text-sm leading-relaxed">
                재참여하시겠습니까?<br>
                당신의 따뜻한 마음을 한 번 더 전해보세요! 💛
            </p>
            <div class="flex gap-3">
                <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition">아니오</button>
                <button onclick="this.closest('.fixed').remove(); goToPayment('${id}')" class="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-yellow-500 transition shadow-lg">네, 참여할래요</button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
}

/* Funding List Page */
function goToFundingList() {
    state.step = 'funding_list';
    render();
    window.scrollTo(0, 0);
}

function renderFundingListPage() {
    // Header for List Page
    const header = document.createElement('header');
    header.className = "fixed top-0 w-full z-50 glass-header px-6 py-4 flex justify-between items-center";
    header.innerHTML = `
        <div class="flex items-center gap-2 cursor-pointer" onclick="goHome()">
            <img src="assets/logo.png" alt="FANDUCK" class="h-12 w-auto">
        </div>
        <button onclick="goHome()" class="text-sm font-bold text-gray-500 hover:text-primary transition">✕ 닫기</button>
    `;
    app.appendChild(header);

    const container = document.createElement('div');
    container.className = 'max-w-6xl mx-auto px-4 py-32 animate-fade-in';

    container.innerHTML = `
        <h2 class="text-3xl font-bold mb-8 text-center">진행 중인 펀딩</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${[...FUNDING_LIST, ...USER_CREATED_FUNDINGS].map(item => `
                <div class="glass-card rounded-3xl overflow-hidden hover:shadow-xl transition duration-300 group cursor-pointer ${item.isNew ? 'border-2 border-primary' : ''}" onclick="goToFundingDetail(${item.id})">
                    <div class="h-64 bg-gray-200 bg-cover bg-center group-hover:scale-105 transition duration-700 relative" style="background-image: url('${item.image}')">
                        <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">${calculateDDay(item.deadline)}</div>
                        ${item.isNew ? '<div class="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">NEW</div>' : ''}
                        ${item.isNew ? `<button onclick="deleteFunding(${item.id}, event)" class="absolute top-4 right-14 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition shadow-sm z-30 pointer-events-auto">✕</button>` : ''}
                    </div>
                    <div class="p-6">
                        <div class="flex items-center gap-2 mb-2">
                             <span class="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">${item.artist}</span>
                             ${item.badge ? `<span class="text-xs font-bold text-primary bg-yellow-50 px-2 py-1 rounded">${item.badge}</span>` : ''}
                        </div>
                        <h3 class="text-xl font-bold mb-4 line-clamp-2 h-14">${item.title}</h3>
                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">달성률</span>
                                <span class="font-bold text-primary">${item.progress}%</span>
                            </div>
                            <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div class="bg-primary h-full rounded-full" style="width: ${item.progress}%"></div>
                            </div>
                            <div class="flex justify-between text-sm pt-1">
                                <span class="text-gray-500">모인 금액</span>
                                <span class="font-bold text-dark">${new Intl.NumberFormat('ko-KR').format(item.current)}원</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    app.appendChild(container);
}

/* Payment Page */
function goToPayment(id) {
    // 팝업 대신 페이지 이동
    participatedHistory.add(id.toString());
    state.step = 'funding_payment';
    render();
    window.scrollTo(0, 0);
}

function renderFundingPaymentPage() {
    const funding = state.targetFunding;
    if (!funding) { goHome(); return; }

    const container = document.createElement('div');
    container.className = 'w-full max-w-lg mx-auto px-6 py-12 animate-fade-in';

    container.innerHTML = `
        <div class="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative">
             <button onclick="goToFundingDetail(state.targetFunding.id)" class="absolute top-6 right-6 text-gray-400 hover:text-dark">✕</button>
             
             <div class="text-center mb-8">
                <h2 class="text-2xl font-bold mb-2">펀딩 참여하기</h2>
                <p class="text-gray-500 text-sm">${funding.title}</p>
             </div>

             <div class="space-y-6">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">참여 금액</label>
                    <div class="relative">
                        <input type="text" placeholder="금액을 입력하세요" class="w-full text-right p-4 pr-12 text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition" oninput="formatAmountInput(event)">
                        <span class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">원</span>
                    </div>
                    <div class="flex gap-2 mt-2 overflow-x-auto pb-2">
                        <button onclick="addAmount(10000)" class="flex-shrink-0 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-bold hover:bg-gray-200">+1만원</button>
                        <button onclick="addAmount(30000)" class="flex-shrink-0 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-bold hover:bg-gray-200">+3만원</button>
                        <button onclick="addAmount(50000)" class="flex-shrink-0 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-bold hover:bg-gray-200">+5만원</button>
                    </div>
                </div>
                
                <div class="bg-yellow-50 p-4 rounded-xl flex items-start gap-3">
                    <span class="text-xl">💡</span>
                    <p class="text-xs text-gray-600 leading-relaxed">
                        전달해주신 후원금은 투명하게 사용되며,<br>
                        목표 달성 시 아티스트에게 전달됩니다.
                    </p>
                </div>

                <button onclick="handlePaymentComplete()" class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-yellow-500 transition shadow-lg text-lg">
                    결제하기
                </button>
             </div>
        </div>
    `;
    app.appendChild(container);

    // Helper for adding amount
    window.addAmount = (val) => {
        const input = document.querySelector('input[type="text"]');
        let current = parseInt(input.value.replace(/,/g, '')) || 0;
        current += val;
        input.value = current.toLocaleString('ko-KR');

        // Trigger formatting logic (Step 323 formatAmountInput) - Optional if direct value set
    };
}

function handlePaymentComplete() {
    const input = document.querySelector('input[type="text"]');
    if (!input.value || input.value === '0') {
        alert('금액을 입력해주세요!');
        return;
    }

    // Update Funding Data
    if (state.targetFunding && state.targetFunding.isNew) {
        const amount = parseInt(input.value.replace(/,/g, ''));
        state.targetFunding.current += amount;

        // Calculate progress
        if (state.targetFunding.goal > 0) {
            state.targetFunding.progress = Math.min(100, Math.floor((state.targetFunding.current / state.targetFunding.goal) * 100));
        } else {
            state.targetFunding.progress += 1;
        }

        // Update LocalStorage
        const index = USER_CREATED_FUNDINGS.findIndex(f => f.id === state.targetFunding.id);
        if (index !== -1) {
            USER_CREATED_FUNDINGS[index] = state.targetFunding;
            localStorage.setItem('FANDUCK_MY_FUNDINGS', JSON.stringify(USER_CREATED_FUNDINGS));
        }
    }

    // Show Success Popup
    const popup = document.createElement('div');
    popup.className = "fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in";
    popup.innerHTML = `
        <div class="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl transform scale-100 transition-all">
            <div class="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">참여 완료!</h3>
            <p class="text-gray-600 mb-8 text-sm leading-relaxed">
                성공적으로 펀딩에 참여하셨습니다.<br>
                아티스트에게 큰 힘이 될 거예요!
            </p>
            <button onclick="this.closest('.fixed').remove(); goToFundingList()" class="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-yellow-500 transition shadow-lg">
                확인
            </button>
        </div>
    `;
    document.body.appendChild(popup);
}
