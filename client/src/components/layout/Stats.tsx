const stats = [
  { value: "Level 3", label: "Google Agent", sublabel: "최고 수준" },
  { value: "논문 3개", label: "학술 검증", sublabel: "SIGIR·RecSys" },
  { value: "171개", label: "테스트 통과", sublabel: "검증된 정확도" },
  { value: "무료", label: "추천 서비스", sublabel: "회원가입 불필요" }
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
