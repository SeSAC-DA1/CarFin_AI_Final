import { Menu, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { Link } from "wouter";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 hover-elevate rounded-lg px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-bold text-lg">CarFin AI</div>
              <div className="text-xs text-muted-foreground">논문 기반 추천</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm hover:text-primary transition-colors">
              홈
            </Link>
            <Link href="/chat" className="text-sm hover:text-primary transition-colors">
              AI 상담
            </Link>
            <a href="#features" className="text-sm hover:text-primary transition-colors">
              기능
            </a>
            <a href="#papers" className="text-sm hover:text-primary transition-colors">
              논문
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button className="hidden md:inline-flex" data-testid="button-nav-start">
              시작하기
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
