/**
 * 커피숍 창업 비용 계산기 - Alpine.js 컴포넌트
 */
function cafeCalc() {
    return {
        sizeOptions: [
            { value: 8, label: '10평 미만', desc: '소형' },
            { value: 12, label: '10~15평', desc: '1인카페' },
            { value: 17, label: '15~20평', desc: '일반' },
            { value: 25, label: '20~30평', desc: '중형' },
            { value: 40, label: '30평 이상', desc: '대형' }
        ],
        conceptOptions: [
            { value: 'basic', label: '깔끔 심플', price: '평당 120~150만', min: 120, max: 150 },
            { value: 'normal', label: '무난한 카페', price: '평당 150~200만', min: 150, max: 200 },
            { value: 'sensible', label: '감성·무드', price: '평당 250~320만', min: 250, max: 320 },
            { value: 'premium', label: '하이엔드', price: '평당 320~400만', min: 320, max: 400 }
        ],
        equipOptions: [
            { value: 'budget', label: '실속형', price: '1,000~2,000만', min: 1000, max: 2000 },
            { value: 'mid', label: '중간급', price: '2,000~3,500만', min: 2000, max: 3500 },
            { value: 'premium', label: '고급기', price: '3,500~5,000만', min: 3500, max: 5000 }
        ],
        regionOptions: [
            { value: 'seoul_center', label: '서울 핵심 (강남·홍대·성수)', deposit: { min: 3000, max: 5000 } },
            { value: 'seoul_sub', label: '서울 그 외 지역', deposit: { min: 2000, max: 3500 } },
            { value: 'metro', label: '경기·인천', deposit: { min: 1500, max: 3000 } },
            { value: 'city', label: '광역시급', deposit: { min: 1500, max: 2500 } },
            { value: 'local', label: '중소도시', deposit: { min: 1000, max: 2000 } }
        ],

        sel: { size: null, concept: null, equip: null, region: '' },
        result: null,
        toast: false,
        openFaq: null,

        init() {
            // URL 파라미터 복원 (공유 링크)
            const p = new URLSearchParams(window.location.search);
            if (p.get('size')) this.sel.size = parseInt(p.get('size'));
            if (p.get('concept')) this.sel.concept = p.get('concept');
            if (p.get('equip')) this.sel.equip = p.get('equip');
            if (p.get('region')) this.sel.region = p.get('region');
            this.$nextTick(() => this.calc());
        },

        pick(key, val) {
            this.sel[key] = val;
            this.calc();
        },

        calc() {
            if (!this.sel.size || !this.sel.concept || !this.sel.equip || !this.sel.region) {
                this.result = null;
                return;
            }

            const size = this.sel.size;
            const concept = this.conceptOptions.find(c => c.value === this.sel.concept);
            const equip = this.equipOptions.find(e => e.value === this.sel.equip);
            const region = this.regionOptions.find(r => r.value === this.sel.region);

            const items = [
                { name: '인테리어', min: size * concept.min, max: size * concept.max },
                { name: '머신·장비', min: equip.min, max: equip.max },
                { name: '가구·소품', min: 300 + size * 30, max: 500 + size * 50 },
                { name: '첫 재료비', min: 300, max: 500 },
                { name: '보증금', min: region.deposit.min, max: region.deposit.max },
                { name: '잡비·예비', min: 200, max: 500 }
            ];

            const totalMin = items.reduce((s, i) => s + i.min, 0);
            const totalMax = items.reduce((s, i) => s + i.max, 0);

            this.result = { items, totalMin, totalMax };

            // 결과 카드로 스크롤
            this.$nextTick(() => {
                const el = document.getElementById('result-area');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            if (typeof gtag === 'function') gtag('event', 'calculator_used', { calculator_type: 'cafe' });
        },

        fmt(v) {
            if (v >= 10000) return (v / 10000).toFixed(1) + '억';
            return v.toLocaleString();
        },

        pct(item) {
            if (!this.result) return 0;
            const avg = (item.min + item.max) / 2;
            const totalAvg = (this.result.totalMin + this.result.totalMax) / 2;
            return Math.round(avg / totalAvg * 100);
        },

        barW(item) {
            if (!this.result) return '0%';
            return (item.max / this.result.totalMax * 100) + '%';
        },

        share() {
            const params = new URLSearchParams({
                size: this.sel.size,
                concept: this.sel.concept,
                equip: this.sel.equip,
                region: this.sel.region
            });
            const url = location.origin + location.pathname + '?' + params;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => this.showToast());
            } else {
                const ta = document.createElement('textarea');
                ta.value = url;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                this.showToast();
            }
        },

        showToast() {
            this.toast = true;
            setTimeout(() => { this.toast = false; }, 2000);
        },

        toggleFaq(n) {
            this.openFaq = this.openFaq === n ? null : n;
        }
    }
}
