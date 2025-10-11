const stats = [
  { value: "5개 Agent", label: "멀티에이전트", sublabel: "실시간 협업" },
  { value: "실제 매물", label: "데이터 통합", sublabel: "KB차차차·엔카" },
  { value: "MACRec", label: "SIGIR 2024", sublabel: "논문 구현" },
  { value: "Level 3", label: "Google 기준", sublabel: "Agent 수준" }
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
