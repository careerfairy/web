import { forwardRef, ReactNode, useEffect } from "react"
import { responsiveConfetti } from "../../util/confetti"
import useIsMobile from "../../custom-hook/useIsMobile"
import CustomNotification from "./CustomNotification"

interface ReportCompleteProps {
   message: string | ReactNode
   id: string | number
}

const RewardNotification = forwardRef<HTMLDivElement, ReportCompleteProps>(
   (props, ref) => {
      const isMobile = useIsMobile()

      useEffect(() => {
         responsiveConfetti(isMobile)
         // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return (
         <CustomNotification
            {...props}
            variant="success"
            title={"Congratulations!"}
            ref={ref}
         />
      )
   }
)

RewardNotification.displayName = "RewardNotification"

export default RewardNotification
