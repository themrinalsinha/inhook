import { SidePanel } from '@/components/Dashboard/SidePanel'
import { RequestDetail } from '@/components/Dashboard/RequestDetail'

export const RequestInfo = () => {
  return (
    <div className="flex">
      <SidePanel className="w-1/4 px-4 pr-0"/>
      <RequestDetail className="w-3/4 px-4"/>
    </div>
  )
}
