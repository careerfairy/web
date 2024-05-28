import { forwardRef, ReactNode, useEffect } from "react"
import useIsMobile from "../../custom-hook/useIsMobile"
import { responsiveConfetti } from "../../util/confetti"
import CustomNotification from "./CustomNotification"

interface ReportCompleteProps {
   message: string | ReactNode
   id: string | number
}

const RewardNotification = forwardRef<HTMLDivElement, ReportCompleteProps>(
   ({ message, ...props }, ref) => {
      const isMobile = useIsMobile()

      useEffect(() => {
         responsiveConfetti(isMobile)
         // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return (
         <CustomNotification
            {...props}
            content={message}
            variant="success"
            title={"Congratulations!"}
            ref={ref}
         />
      )
   }
)

RewardNotification.displayName = "RewardNotification"

export default RewardNotification
