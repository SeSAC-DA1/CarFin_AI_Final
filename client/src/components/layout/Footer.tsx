import { Github, FileText, Mail, Car } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                <Car className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg">CarFin AI</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              학술 논문 기반 AI 중고차 추천 시스템
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">제품</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">AI 상담</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">차량 검색</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">가격 정보</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">연구</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">적용 논문</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">기술 블로그</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">성능 분석</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">연락</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-card hover-elevate rounded-lg border border-border">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-card hover-elevate rounded-lg border border-border">
                <FileText className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-card hover-elevate rounded-lg border border-border">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 CarFin AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
