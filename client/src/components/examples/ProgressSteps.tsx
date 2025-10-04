import ProgressSteps from '../ProgressSteps'

const steps = [
  { id: "greeting", label: "인사", status: "completed" as const },
  { id: "budget", label: "예산 설정", status: "completed" as const },
  { id: "preference", label: "선호도 분석", status: "active" as const },
  { id: "recommendation", label: "추천 완료", status: "pending" as const }
]

export default function ProgressStepsExample() {
  return <ProgressSteps steps={steps} />
}
