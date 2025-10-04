const stats = [
  { value: "15만대+", label: "실제 매물", sublabel: "엔카·차차차" },
  { value: "3명의 AI", label: "멀티 에이전트", sublabel: "실시간 협업" },
  { value: "6가지", label: "평가 기준", sublabel: "TOPSIS 분석" },
  { value: "3개 논문", label: "검증된 시스템", sublabel: "SIGIR·RecSys" }
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
