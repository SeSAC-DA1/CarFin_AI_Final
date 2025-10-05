const stats = [
  { value: "3분안에", label: "완벽한 추천", sublabel: "빠른 분석" },
  { value: "15만대 중에서", label: "딱 맞는 차량", sublabel: "실제 매물" },
  { value: "3개 논문", label: "학술 검증", sublabel: "SIGIR·RecSys" },
  { value: "3명의 AI", label: "멀티에이전트", sublabel: "실시간 협업" }
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
