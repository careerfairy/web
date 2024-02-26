import { ReactNode } from "react"
import { Tooltip } from "@mui/material"
import { BrandedBadge } from "components/views/common/inputs/BrandedBadge"

interface DeviceErrorWrapperProps {
   children: ReactNode
   errorMessage?: string
   isLoading?: boolean
}

export const DeviceErrorWrapper = ({
   children,
   errorMessage,
}: DeviceErrorWrapperProps) => {
   if (errorMessage) {
      return (
         <Tooltip placement="top" title={errorMessage}>
            <BrandedBadge
               color="warning"
               badgeContent={errorMessage ? "!" : undefined}
            >
               {children}
            </BrandedBadge>
         </Tooltip>
      )
   }
   return <>{children}</>
}
