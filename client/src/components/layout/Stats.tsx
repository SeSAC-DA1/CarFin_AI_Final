const stats = [
  { value: "5개 AI", label: "멀티에이전트 협업", sublabel: "동시 실시간 분석" },
  { value: "논문 2개", label: "SIGIR·RecSys 구현", sublabel: "국제학회 검증" },
  { value: "AirFlow", label: "실시간 데이터 수집", sublabel: "검증된 방법론 기반" },
  { value: "TOPSIS", label: "다기준 의사결정", sublabel: "6가지 정밀 평가" }
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
