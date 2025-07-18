import { ReactNode } from "react"
import { AdminContainer } from "../common/Container"

export const LivestreamAnalyticsContainer = ({
   children,
}: {
   children: ReactNode
}) => {
   return (
      <AdminContainer
         sx={{
            pt: 1,
            pb: 2,
         }}
      >
         {children}
      </AdminContainer>
   )
}
