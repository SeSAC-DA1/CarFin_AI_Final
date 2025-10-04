import QuickReplyButtons from '../QuickReplyButtons'
import { DollarSign, Car, Truck } from 'lucide-react'

const quickReplies = [
  { label: "2000만원 이하", value: "budget_2000", icon: DollarSign },
  { label: "3000만원 이하", value: "budget_3000", icon: DollarSign },
  { label: "SUV", value: "type_suv", icon: Truck },
  { label: "세단", value: "type_sedan", icon: Car },
  { label: "해치백", value: "type_hatchback", icon: Car }
]

export default function QuickReplyButtonsExample() {
  return (
    <div className="p-4">
      <QuickReplyButtons 
        options={quickReplies} 
        onSelect={(value) => console.log('Selected:', value)} 
      />
    </div>
  )
}
