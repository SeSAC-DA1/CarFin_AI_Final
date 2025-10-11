const stats = [
  { value: "15만대", label: "통합 매물 DB", sublabel: "실시간 검색" },
  { value: "3분", label: "평균 분석 시간", sublabel: "즉시 결과" },
  { value: "171개", label: "단위 테스트 통과", sublabel: "검증된 정확도" },
  { value: "논문 3개", label: "학술 검증", sublabel: "SIGIR·RecSys" }
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
