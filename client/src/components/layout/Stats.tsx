const stats = [
  { value: "5개 AI", label: "멀티에이전트 협업", sublabel: "Google Level 3 달성" },
  { value: "논문 3개", label: "SIGIR·RecSys 구현", sublabel: "국제학회 검증" },
  { value: "15만대", label: "실시간 매물 분석", sublabel: "3초 내 처리" },
  { value: "TCO", label: "총 소유비용 계산", sublabel: "법적근거 5가지" }
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
