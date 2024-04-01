import { FC } from "react"
import {
   Box,
   LinearProgress,
   linearProgressClasses,
   tooltipClasses,
   Typography,
} from "@mui/material"
import { sxStyles } from "../../../../../../types/commonTypes"
import { Spark } from "@careerfairy/shared-lib/sparks/sparks"
import BrandedTooltip from "../../../../common/tooltips/BrandedTooltip"
import { useGroup } from "layouts/GroupDashboardLayout"

const styles = sxStyles({
   tooltip: {
      maxWidth: 350,
      [`& .${tooltipClasses.tooltip}`]: {
         maxWidth: 350,
      },
   },
   progressBar: {
      width: "100%",
      height: 5,
      borderRadius: 5,
      bgcolor: "grey.300",
      [`& .${linearProgressClasses.bar}`]: {
         borderRadius: 5,
      },
   },
   progressCount: {
      color: (theme) => theme.palette.grey.A700,
   },
   headerMessage: {
      mb: 2,
      fontWeight: "bold",
   },
})

type Props = {
   isCriticalState: boolean
   publicSparks: Spark[]
   maxPublicSparks: number
}

const SparksCounter: FC<Props> = ({
   isCriticalState,
   publicSparks,
   maxPublicSparks,
}) => {
   const { groupPresenter } = useGroup()
   const isTrialPlan = groupPresenter.isTrialPlan()
   const planLimitReached = groupPresenter.hasReachedMaxSparks(
      publicSparks.length
   )

   const tooltipMessage = getTooltipMessage(
      isTrialPlan,
      isCriticalState,
      maxPublicSparks,
      planLimitReached
   )
   const unlimited = groupPresenter.hasUnlimitedSparks()
   const maxSparks = unlimited ? 100 : maxPublicSparks
   const slots = unlimited
      ? "Unlimited "
      : `${publicSparks.length}/${maxPublicSparks}`

   const progressColor =
      isCriticalState || planLimitReached ? "error" : "secondary"
   return (
      <BrandedTooltip title={tooltipMessage} sx={styles.tooltip}>
         <Box alignSelf={"center"}>
            <Typography variant={"body1"} sx={styles.progressCount}>
               {slots} Spark slots
            </Typography>

            <LinearProgress
               sx={styles.progressBar}
               color={progressColor}
               variant="determinate"
               value={
                  publicSparks.length
                     ? (publicSparks.length / maxSparks) * 100
                     : 0
               }
            />
         </Box>
      </BrandedTooltip>
   )
}
const renderLimitReachedMessage = () => (
   <Box>
      <Typography variant={"h6"} sx={styles.headerMessage}>
         All Sparks used!
      </Typography>
      <Typography variant={"body1"} fontSize={16}>
         Your company{"'"}s been using Sparks like a champ! To keep the
         recognition flowing and continue engaging your awesome talent, consider
         adding more Sparks to your plan.
      </Typography>
   </Box>
)

const renderCriticalMessage = () => (
   <Box>
      <Typography variant={"h6"} sx={styles.headerMessage}>
         You’re running out of Spark slots!
      </Typography>
      <Typography variant={"body1"} fontSize={16}>
         Your company is nearing its Spark slot limit. Consider getting more
         slots to continue engaging your talent community with more Sparks.
      </Typography>
   </Box>
)
const renderDefaultMessage = () => (
   <Box>
      <Typography variant={"h6"} sx={styles.headerMessage}>
         Your company Sparks are visible!
      </Typography>
      <Typography variant={"body1"} fontSize={16}>
         {`Congrats! Your Sparks are now live on CareerFairy. Currently you can
            publish unlimited Sparks.`}
      </Typography>
   </Box>
)

const renderTrialMessage = (maxPublicSparks: number) => (
   <Box>
      <Typography variant={"body1"} fontSize={16}>
         {`You can publish a maximum of ${maxPublicSparks} Sparks as part of the trial.`}
      </Typography>
   </Box>
)

const getTooltipMessage = (
   isTrialPlan: boolean,
   isCriticalState: boolean,
   maxPublicSparks: number,
   planLimitReached: boolean
) => {
   if (isTrialPlan) {
      return renderTrialMessage(maxPublicSparks)
   }

   if (isCriticalState) {
      return renderCriticalMessage()
   }

   if (planLimitReached) {
      return renderLimitReachedMessage()
   }

   return renderDefaultMessage()
}

export default SparksCounter
