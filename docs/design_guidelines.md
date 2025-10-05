# CarFin AI Design Guidelines (Compact)

## Design Approach
**Hybrid**: Marketing landing (reference-based) + Utility application (design system)
- **Inspirations**: CarMax Skye (trust), Linear (precision), Stripe (data clarity), 엔카닷컴 (Korean UX)
- **Principles**: Academic credibility, speed, data transparency, Korean-first optimization

---

## Color Palette

### Core Colors (HSL)
- **Primary**: 59 89% 53% | **Dark**: 222 47% 11% | **Success**: 142 71% 45%
- **Bg Light**: 0 0% 98% | **Bg Dark**: 222 47% 6%
- **Surface Light**: 0 0% 100% | **Surface Dark**: 222 47% 11%
- **Border Light**: 214 32% 91% | **Border Dark**: 217 33% 17%

### Accents (Minimal Use)
- **AI Activity**: 271 81% 56% (purple) | **Warning**: 38 92% 50% (amber)
- **Medals**: Gold 45 93% 47% | Silver 0 0% 63% | Bronze 25 95% 53%

**Dark Mode**: Mandatory throughout application.

---

## Typography

### Fonts
- **Primary**: 'Pretendard Variable', -apple-system, sans-serif
- **Monospace**: 'JetBrains Mono' (prices, data, IDs)

### Scale
- **Hero**: text-6xl font-bold (60px) | **Headers**: text-4xl font-bold (36px)
- **Cards**: text-xl font-semibold (20px) | **Body**: text-base (16px)
- **Captions**: text-sm (14px) | **Labels**: text-xs uppercase tracking-wider (12px)

### Korean Considerations
- Min body: 16px | Line-height: 1.7 | Letter-spacing: normal to -0.02em max

---

## Layout

### Spacing (Tailwind)
**Units**: 2, 4, 8, 12, 16, 20, 24, 32
- **Micro**: p-2/gap-2 | **Component**: p-4/gap-4 | **Section**: py-16 md:py-24 lg:py-32
- **Max-width**: 7xl (1280px) content, 4xl chat, [1600px] dashboard

### Grids
- **Features**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- **Vehicles**: grid-cols-1 lg:grid-cols-2 xl:grid-cols-3

---

## Components

### Landing Page

**Hero** (80vh min)
- Full-width diagonal gradient (primary→dark 135deg)
- Two-column: text left, AI viz right (desktop)
- Headline: text-6xl, gradient "AI 기반" emphasis
- CTAs: Primary solid + secondary outline w/backdrop-blur
- Trust: "170K+ 실제 매물" "평균 1.2초 응답"

**Features** (3-col grid)
- Cards: white/dark, subtle shadow, hover lift
- Icons: Lucide 48px, primary color
- Agent cards: role badges, avatars (🎪🔍📊)

**Stats** (4-col desktop)
- Numbers: text-5xl font-bold, counting animation
- Labels: text-sm uppercase tracking-wide

**Process** (horizontal timeline)
- 4 steps: numbered badges, icons, dashed connectors
- Animated progress indicator

### Chatbot Interface

**Layout**: 3-col desktop (agent sidebar 240px | chat | recommendations), stack mobile

**Agent Sidebar**
- Status cards: pulse dots (idle gray, thinking purple, done green)
- Progress bar: 0-100%
- Avatars: 🎪 Concierge, 🔍 Needs Analyst, 📊 Data Analyst

**Messages**
- User: right, primary bg, white text, rounded-2xl
- AI: left, surface bg, border-l-4 agent color, rounded-2xl
- Labels: badge w/agent name+icon | Timestamps: text-xs muted

**Activity Feed**
- Scrollable stream: icon + agent + action + time
- New items: slide-in, fade highlight (purple tint)
- Collapsible mode

**Vehicle Cards**
- Layout: image 300px + content + actions
- Ranking: medal emoji (🥇🥈🥉) + number
- Scores: circular TOPSIS (0-100), linear matching %
- Price: text-3xl font-bold monospace
- Specs: 4-item grid (year, mileage, fuel, transmission)
- CTA: "상세 분석 보기" full-width mobile

### Analysis Dashboard (Modal)

**Container**: max-w-6xl, 90vh, scrollable
- Header: name, close, share
- Tabs (6): 종합|금융|리뷰|상태|옵션|경쟁 (sticky scroll)

**Tab Patterns**
- **종합**: TOPSIS gauge, strength/weakness 2-col, radar chart
- **금융**: TCO 5-year bar, cost calculator sliders, depreciation curve
- **리뷰**: Sentiment analysis, cards w/ratings, keyword cloud
- Charts: subtle gradients, clean axes, no 3D
- Tables: striped, monospace numbers, right-aligned

**Re-recommendation**
- Inline feedback form, chip filters (가격↑ 안전↑)
- "재추천 받기" button, countdown display

### Inputs

**Chat Input**
- Fixed bottom, max-w-4xl centered
- Textarea: auto-grow (max 4 lines)
- Placeholder: "예: 2500만원 이하 가족용 SUV 추천해주세요"
- Send: airplane icon, primary, disabled state
- Counter: text-xs when >100 chars

**Form Controls**
- Selects: h-10, rounded borders
- Sliders: primary track, large thumb
- Checkboxes: primary checked state

---

## Animations

### Micro-interactions (<300ms)
- **Hover**: scale 1.02 + shadow | **Cards**: translateY -2px
- **Loading**: shimmer skeleton screens
- **AI Thinking**: 3 pulsing dots (sequential)

### Transitions
- **Modal**: fade + scale 0.95→1.0 (200ms)
- **Tabs**: crossfade (150ms)
- **Recommendations**: stagger 100ms delay

### Real-time
- **Typing**: char-by-char reveal + cursor
- **Progress**: smooth fill w/easing
- **Status**: color transition + pulse

**Philosophy**: Enhance, don't distract. Respect `prefers-reduced-motion`.

---

## Images

**Landing**: Abstract tech viz (AI nodes, car silhouettes, gradients) | Custom SVG agent icons | Minimal process diagrams

**Chatbot**: Vehicle 16:9 lazy-loaded | Geometric agent avatars (no photos) | Friendly empty states

**Strategy**: Typography/color/data-focused. Vehicle photos functional only.

---

## Accessibility & Responsive

### A11y
- **Contrast**: WCAG AAA (7:1 min)
- **Focus**: 2px solid primary ring, 2px offset
- **SR**: All elements labeled, ARIA live for AI updates
- **Keyboard**: Full support, logical tabs, Esc closes modals

### Breakpoints
- **Mobile**: <768px (stack, single-col)
- **Tablet**: 768-1024px (2-col grids)
- **Desktop**: >1024px (3-col grids)
- **Ultra-wide**: >1600px (max-w constraints)

### Mobile
- Bottom nav for primary actions
- Swipeable horizontal tabs
- Accordion for dense info
- Touch targets: min 44×44px

---

## Visual Voice

**Professional yet Approachable**: Clean layouts, rounded-lg to rounded-2xl, generous whitespace

**Data-Driven but Human**: Prominent digestible charts, visible agent personalities, warm colors (not sterile)

**Korean Market**: Higher info density accepted, trust signals prominent (academic credentials), premium typography precision