const stats = [
  { value: "15만대", label: "실시간 매물", sublabel: "KB·엔카 연동" },
  { value: "3분", label: "빠른 추천", sublabel: "AI 자동 분석" },
  { value: "Top 3", label: "맞춤 추천", sublabel: "개인화 분석" },
  { value: "5개 AI", label: "협업 시스템", sublabel: "전문 분석" }
];

export default function Stats() {
  return (
    <section className="py-12 border-y border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center space-y-2" data-testid={`stat-${index}`}>
              <div className="font-mono text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
