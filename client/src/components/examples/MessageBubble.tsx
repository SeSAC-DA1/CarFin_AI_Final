import MessageBubble from '../MessageBubble'

export default function MessageBubbleExample() {
  return (
    <div className="space-y-4 p-4 max-w-2xl">
      <MessageBubble 
        type="user" 
        content="2500만원 이하 가족용 SUV 추천해주세요" 
        timestamp={new Date()} 
      />
      <MessageBubble 
        type="ai" 
        agent="concierge"
        content="가족용 SUV를 찾고 계시는군요. 예산 2500만원 이하로 최적의 차량을 찾아드리겠습니다." 
        timestamp={new Date()} 
      />
      <MessageBubble 
        type="ai" 
        agent="needs"
        content="사용자 프로필을 분석했습니다. 가족 구성원과 용도를 고려하여 추천하겠습니다." 
        timestamp={new Date()} 
      />
    </div>
  )
}
