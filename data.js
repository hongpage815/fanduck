const LOADING_IMAGES = [
    'assets/FANDUCK_Goods.png',
    'assets/FANDUCK_Delivery.png',
    'assets/FANDUCK_FoodTruck.png',
    'assets/FANDUCK_AD.png'
];

const PARTNER_LOGOS = [
    { name: 'CJ MEZZOMEDIA', color: '#E31E24', image: 'assets/partner_cj_mezzomedia.png' },
    { name: 'CJ FRESHWAY', color: '#00A651', image: 'assets/partner_cj_freshway.jpg' },
    { name: 'CJ OLIVEYOUNG', color: '#FF6B9D', image: 'assets/partner_olive_young.png' },
    { name: 'CJ 제일제당', color: '#C8102E', image: 'assets/partner_cj_cheiljedang.jpg' },
    { name: 'CJ ENM', color: '#FF6600', image: 'assets/partner_cj_enm.jpg' },
    { name: 'TVING', color: '#FF153C', image: 'assets/partner_tving.jpg' },
    { name: 'CGV', color: '#E71A0F', image: 'assets/partner_cgv.png' },
    { name: 'VIPS', color: '#881824', image: 'assets/partner_vips.png' },
    { name: '뚜레쥬르', color: '#0F5436', image: 'assets/partner_tous_les_jours.png' },
    { name: 'CJ 온스타일', color: '#5F0080', image: 'assets/partner_cj_onstyle.png' },
    { name: 'bibigo', color: '#749A32', image: 'assets/partner_bibigo.png' },
    { name: 'O-NE', color: '#00A9E0', image: 'assets/partner_one.png' },
    { name: '브랜드웍스코리아', color: '#000000', image: 'assets/partner_brandworks_korea.png' }
];

// 카테고리별 파트너사 데이터
const PARTNERS_BY_CATEGORY = {
    ads: {
        title: '광고',
        icon: '📢',
        description: '아티스트를 세상에 알리는 최고의 파트너',
        partners: [
            { name: 'CJ MEZZOMEDIA', color: '#E31E24', url: 'https://www.cjmezzomedia.com', description: '미디어 광고 전문', image: 'assets/partner_cj_mezzomedia.png' },
            { name: 'CJ ENM', color: '#FF6600', url: 'https://www.cjenm.com', description: '콘텐츠 & 미디어', image: 'assets/partner_cj_enm.jpg' },
            { name: 'CGV', color: '#E71A0F', url: 'https://cgv.co.kr/', description: '극장 광고', image: 'assets/partner_cgv.png' },
            { name: 'TVING', color: '#FF153C', url: 'https://www.tving.com', description: 'OTT 광고', image: 'assets/partner_tving.jpg' }
        ]
    },
    food: {
        title: '식사/간식',
        icon: '🍱',
        description: '현장에 힘이 되는 든든한 서포트',
        partners: [
            { name: 'CJ FRESHWAY', color: '#00A651', url: 'https://www.cjfreshway.com', description: '프리미엄 푸드 서비스', image: 'assets/partner_cj_freshway.jpg' },
            { name: 'CJ 제일제당', color: '#C8102E', url: 'https://www.cj.co.kr', description: '식품 & 외식 브랜드', image: 'assets/partner_cj_cheiljedang.jpg' },
            { name: '뚜레쥬르', color: '#0F5436', url: 'https://www.tlj.co.kr', description: '베이커리 전문', image: 'assets/partner_tous_les_jours.png' },
            { name: 'VIPS', color: '#881824', url: 'https://www.ivips.co.kr', description: '프리미엄 스테이크', image: 'assets/partner_vips.png' },
            { name: 'bibigo', color: '#749A32', url: 'https://www.bibigo.com', description: '글로벌 한식 브랜드', image: 'assets/partner_bibigo.png' },
            { name: 'THE PLACE', color: '#000000', url: 'https://www.italiantheplace.co.kr/', description: '이탈리안 비스트로', image: 'assets/partner_the_place.png' },
            { name: 'GOURMET', color: '#A67C52', url: 'https://www.cj.co.kr', description: '미식 라이프스타일', image: 'assets/partner_gourmet.png' },
            { name: 'Creeat', color: '#000000', url: 'https://www.cj.co.kr', description: '미래 식문화 창조', image: 'assets/partner_creeat.png' }
        ]
    },
    gift: {
        title: '선물',
        icon: '🎁',
        description: '특별한 날을 더 특별하게',
        partners: [
            { name: 'CJ OLIVEYOUNG', color: '#FF6B9D', url: 'https://www.oliveyoung.co.kr', description: '뷰티 & 라이프스타일', image: 'assets/partner_olive_young.png' },
            { name: 'CJ 온스타일', color: '#5F0080', url: 'https://display.cjonstyle.com', description: '패션 & 리빙', image: 'assets/partner_cj_onstyle.png' }
        ]
    },
    goods: {
        title: '팬 굿즈',
        icon: '🎨',
        description: '팬덤만의 특별한 굿즈 제작',
        partners: [
            { name: 'CJ ENM', color: '#FF6600', url: 'https://www.cjenm.com', description: '캐릭터 & 라이선스', image: 'assets/partner_cj_enm.jpg' },
            { name: 'O-NE', color: '#00A9E0', url: 'https://www.cjlogistics.com', description: '물류/배송 지원', image: 'assets/partner_one.png' },
            { name: '브랜드웍스코리아', color: '#000000', url: 'https://brandworkskorea.kr/', description: '의류 & 패션 아이템', image: 'assets/partner_brandworks_korea.png' }
        ]
    }
};

const ARTIST_IMAGES = [
    { name: 'BTS', image: 'assets/artist_bts.jpg' },
    { name: 'SEVENTEEN', image: 'assets/artist_seventeen.jpg' },
    { name: 'Stray Kids', image: 'assets/artist_straykids.jpg' },
    { name: 'IVE', image: 'assets/artist_ive.jpg' },
    { name: 'BABYMONSTER', image: 'assets/artist_babymonster.jpg' },
    { name: '(G)I-DLE', image: 'assets/artist_gidle.png' },
    { name: 'aespa', image: 'assets/artist_aespa.jpg' },
    { name: 'ZEROBASEONE', image: 'assets/artist_zerobaseone_1.png' },
    { name: 'RIIZE', image: 'assets/artist_riize.jpg' },
    { name: 'ZEROBASEONE', image: 'assets/artist_zerobaseone_2.jpg' }
];

const FEATURES = [
    { title: '아티스트 광고를 해보세요', desc: '지하철, 버스, 전광판 등\n원하는 위치에 나의 아티스트를 홍보하세요.', image: 'assets/FANDUCK_AD.png' },
    { title: '아티스트에게 잊지못할 선물을!', desc: '특별한 기념일에\n마음을 담은 선물을 전해보세요.', image: 'assets/FANDUCK_Delivery.png' },
    { title: '아티스트에게 멋진 한 끼를!', desc: '촬영장, 연습실로\n든든한 도시락과 커피차를 보내드려요.', image: 'assets/FANDUCK_FoodTruck.png' },
    { title: '우리만의 굿즈 만들기', desc: '응원봉, 슬로건 등\n팬덤만의 특별한 굿즈를 제작해보세요.', image: 'assets/FANDUCK_Goods.png' }
];

/* 
 * [Notice]
 * 아래 FUNDING_LIST의 이미지 경로는 현재 환경에 맞게 임시로 설정되었습니다.
 * 원본 환경(다른 PC)에 'zb1.jpg', 'ive.jpg' 등의 파일이 있다면 해당 경로로 수정해서 사용해주세요.
 */
const FUNDING_LIST = [
    {
        id: 1,
        artist: 'ZEROBASEONE',
        title: '데뷔 1주년 축하 광고',
        progress: 85,
        current: 4250000,
        image: 'assets/artist_zerobaseone_2.jpg',
        badge: '🔥 인기',
        deadline: '2026-01-31',
        description: '제로베이스원의 데뷔 1주년을 맞이하여 강남역 지하철 광고를 진행합니다! 제로즈 여러분의 많은 참여 부탁드립니다 🌹',
        items: [
            { category: 'ads', name: 'Premier', cost: 3500000 },
            { category: 'goods', name: 'Basic', cost: 500000 },
            { category: 'ads', name: 'Special', cost: 250000 }
        ]
    },
    {
        id: 2,
        artist: 'IVE',
        title: '월드투어 성공 기원 서포트',
        progress: 60,
        current: 3000000,
        image: 'assets/artist_ive.jpg',
        badge: '🌟 추천',
        deadline: '2026-03-15',
        description: '아이브의 첫 번째 월드투어의 성공을 기원하며 도시락 서포트를 준비했습니다. 다이브 함께해요! 💘',
        items: [
            { category: 'food', name: 'Special', cost: 2000000 },
            { category: 'food', name: 'Basic', cost: 800000 },
            { category: 'gift', name: 'Basic', cost: 200000 }
        ]
    }
];

const SERVICE_STATS = [
    { icon: '🎁', value: 1250, label: '진행된 펀딩', unit: '건' },
    { icon: '💰', value: 85, label: '누적 펀딩액', unit: '억원' },
    { icon: '💖', value: 320, label: '참여 팬덤', unit: '팀' }
];

const CATEGORIES = [
    { id: 'ads', name: '광고', icon: '📢', desc: '내 아티스트를 세상에 알리기' },
    { id: 'food', name: '식사/간식', icon: '🍱', desc: '촬영장에 힘이 되는 도시락' },
    { id: 'gift', name: '선물', icon: '🎁', desc: '마음을 담은 특별한 선물' },
    { id: 'goods', name: '팬 굿즈', icon: '🎨', desc: '우리만의 굿즈 제작' }
];

const OPTIONS = {
    amount: {
        presets: [1000000, 3000000, 5000000, 10000000],
        placeholder: '목표 금액을 입력하세요 (최소 50만원)'
    },
    date: {
        placeholder: '마감일을 선택하세요'
    },
    ads: {
        styles: ['영상 광고', '이미지 광고'],
        locations: [
            { id: 'sns', name: 'SNS / 포털' },
            { id: 'subway', name: '거리 / 지하철' },
            { id: 'network', name: '애드 네트워크' },
            { id: 'ott', name: 'OTT 플랫폼' },
            { id: 'cinema', name: '영화관' }
        ]
    },
    food: {
        levels: [
            {
                level: 1,
                name: 'Basic',
                icon: '🍪',
                desc: '가볍게 전하는 응원 한 끼',
                details: [
                    { title: '음료류', info: '커피 또는 기본 음료' },
                    { title: '뚜레쥬르', info: '기본 베이커리 (빵, 쿠키, 간단 디저트)' },
                    { title: 'CJ 간편식', info: '비비고 컵밥 등 기본 구성' }
                ]
            },
            {
                level: 2,
                name: 'Premium',
                icon: '🍱',
                desc: '조금 더 든든한 팬심',
                details: [
                    { title: '뚜레쥬르 프리미엄', info: '케이크 또는 고급 디저트 라인' },
                    { title: 'CJ 빕스 도시락', info: '메인과 사이드 구성 포함' },
                    { title: '디저트/카페', info: '프리미엄 세트 및 음료 교환권' }
                ]
            },
            {
                level: 3,
                name: 'Luxury',
                icon: '👨‍🍳',
                desc: '현장을 책임지는 진짜 서포트',
                details: [
                    { title: 'CJ 프레시웨이 밥차', info: '현장 조리 및 맞춤형 메뉴' },
                    { title: '프리미엄 디저트', info: '한정 구성 또는 스페셜 에디션' },
                    { title: '고급 식품/음료', info: '정찬 패키지 및 스페셜티 라인업' }
                ]
            }
        ]
    },
    gift: {
        levels: [
            {
                level: 1,
                name: 'Basic',
                icon: '🎁',
                desc: '센스 있는 기본 선물',
                details: [
                    { title: 'CJ 브랜드웍스', info: '기본 라인 의류 및 베이직 아이템' },
                    { title: 'CJ 올리브영', info: '스탠다드 스킨케어, 보습/클렌징' },
                    { title: '생활용품', info: '소형 가전 또는 뷰티 디바이스 입문형' },
                    { title: 'CJ 바이오', info: '기본 건강기능식품(비타민 등)' }
                ]
            },
            {
                level: 2,
                name: 'Premium',
                icon: '💎',
                desc: '확실하게 느껴지는 특별함',
                details: [
                    { title: 'CJ 브랜드웍스', info: '프리미엄 의류, 한정 소재' },
                    { title: 'CJ 온스타일', info: '중고가 패션 브랜드 시즌 라인' },
                    { title: 'CJ 올리브영/정관장', info: '고가 스킨케어, 중간 가격대 홍삼' },
                    { title: '프리미엄 기기', info: '중형 뷰티 디바이스, 안마기' }
                ]
            },
            {
                level: 3,
                name: 'Luxury',
                icon: '👑',
                desc: '히스토리에 남을 최상위 프리미엄 라인',
                details: [
                    { title: 'Brand/OnStyle', info: '최상위 라인 및 리미티드 에디션' },
                    { title: 'OliveYoung Lux', info: '설화수/조말론 풀세트' },
                    { title: 'CJ 정관장 최상위', info: '고함량 프리미엄 홍삼 및 한정판' },
                    { title: '하이엔드 기기', info: '고가 뷰티기기, 전신 안마기' }
                ]
            }
        ]
    },
    delivery: {
        types: [
            { title: '한식/일식/양식', info: '프리미엄 도시락' },
            { title: '간식/베이커리', info: '커피차/간식박스' },
            { title: 'CJ 프레시웨이', info: '라이브 쿠킹 푸드트럭' },
            { title: '특급 호텔 뷔페', info: 'VIP 전담 케이터링 서비스' }
        ]
    },
    goods: {
        categories: [
            { id: 'concert', name: '콘서트/응원 굿즈', items: ['응원봉', '슬로건', '부채'] },
            { id: 'photo', name: '포토/인화 굿즈', items: ['포토카드', '포토북', '달력', '스티커', '케이스', '마스킹테이프', '인형/피규어', '기타 문구류'] },
            { id: 'daily', name: '데일리/잡화 굿즈', items: ['의류/패션', '에코백', '모자', '머그컵', '텀블러', '담요'] },
            { id: 'digital', name: '디지털 굿즈', items: ['모바일 배경화면', '디지털 스티커', 'SNS 프로필팩'] }
        ]
    }
};

const COMPLIMENT_PHRASES = [
    "이 조합... 팬심 제대로다 💛",
    "아티스트가 감동받을 완벽한 구성! ✨",
    "이거면 전설의 서포트로 남을 거예요! 🏆",
    "센스 만점! 팬덤 역사에 길이 남을 믹스 😎",
    "최고의 효율과 감동을 모두 잡은 선택! 🎯",
    "이 구역의 서포트 장인은 바로 당신! 👑"
];
