// AI Budget Allocator Logic (Randomized & Detail-Oriented)

class BudgetAllocator {
    constructor(data) {
        this.data = data; // content of OPTIONS from data.js
    }

    // Main function to recommend a package
    recommend(budget, categories, details = {}) {
        const count = categories.length;
        if (count === 0) return { items: [] };

        // 1. Generate Random Weights
        // Use power of 3 to create more dramatic differences (highs get higher, lows get lower)
        let weights = categories.map(() => Math.pow(Math.random(), 2) + 0.1); // Bias variance
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        weights = weights.map(w => w / totalWeight); // Normalize

        // 2. Allocate Budget
        // Round to nearest 10,000 KRW for clean numbers
        let allocated = weights.map(w => Math.floor((budget * w) / 10000) * 10000);

        // Adjust for rounding errors (add/sub difference to the largest chunk)
        let currentTotal = allocated.reduce((a, b) => a + b, 0);
        let diff = budget - currentTotal;
        const maxIndex = allocated.indexOf(Math.max(...allocated));
        allocated[maxIndex] += diff;

        // 3. Generate Items based on Details
        let recommendation = [];

        // Defined category priority order for display
        const priority = { 'ads': 1, 'food': 2, 'gift': 3, 'goods': 4 };

        // We need to match budget to category correctly.
        // The 'allocated' array indices correspond to the original 'categories' array passed in (before any sorting).
        // Since we didn't sort 'categories' array itself before allocation, we can trust the index mapping now.

        let budgetMap = {};
        categories.forEach((cat, i) => {
            budgetMap[cat] = allocated[i];
        });

        // Use a COPY to sort for display order, so we don't mess up original indices if used elsewhere (though safe here)
        const sortedCats = [...categories].sort((a, b) => (priority[a] || 99) - (priority[b] || 99));

        sortedCats.forEach(cat => {
            const catBudget = budgetMap[cat];
            if (cat === 'gift') {
                recommendation.push(this.pickGift(catBudget, details.gift));
            } else if (cat === 'food') {
                recommendation.push(this.pickFood(catBudget, details.food));
            } else if (cat === 'ads') {
                recommendation.push(this.pickAds(catBudget, details.ads));
            } else if (cat === 'goods') {
                recommendation.push(this.pickGoods(catBudget, details.goods));
            }
        });

        // Verify total (should match budget exactly)
        return { items: recommendation, totalCost: budget, remainder: 0 };
    }

    pickGift(budget, detail) {
        // Reflect Level Selection
        const levelData = this.data.gift.levels.find(l => l.level === detail.level);
        const name = levelData ? levelData.name : "맞춤형 선물 세트";
        // Create custom description
        const desc = levelData ? levelData.details.map(d => d.title).join(' + ') : "아티스트를 위한 프리미엄 기프트";

        return { category: 'gift', name: name, detail: desc, cost: budget };
    }

    pickFood(budget, detail) {
        // Reflect Level Selection
        const levelData = this.data.food.levels.find(l => l.level === detail.level);
        const name = levelData ? levelData.name : "서포트 도시락";
        const desc = levelData ? levelData.details.map(d => d.title).join(' + ') : "스탭과 아티스트를 위한 도시락";

        return { category: 'food', name: name, detail: desc, cost: budget };
    }

    pickAds(budget, detail) {
        // Reflect Style & Locations
        // Style: '영상 광고' or '이미지 광고'
        // Locations: ['sns', 'subway', ...]
        const style = detail.style || "맞춤 광고";

        // Map Location IDs to Names
        const locNames = (detail.locations || []).map(id => {
            const locObj = this.data.ads.locations.find(l => l.id === id);
            return locObj ? locObj.name : id;
        });

        let name = `${style} 패키지`;
        let desc = locNames.length > 0 ? locNames.join(', ') : "타겟 맞춤형 매체 집행";

        return { category: 'ads', name: name, detail: desc, cost: budget };
    }

    pickGoods(budget, detail) {
        // Reflect Items
        // Items: ['응원봉', '슬로건' ...]
        const items = detail.items || [];
        const count = Math.floor(budget / 5000); // Rough estimation logic just for flavor text if needed

        const name = "팬 굿즈 제작";
        const desc = items.length > 0 ? items.join(', ') : "팬들을 위한 스페셜 굿즈";

        return { category: 'goods', name: name, detail: desc, cost: budget };
    }
}
