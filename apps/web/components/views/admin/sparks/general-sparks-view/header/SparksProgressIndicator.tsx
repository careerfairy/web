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

const styles = sxStyles({
   tooltip: {
      maxWidth: 350,
      [`& .${tooltipClasses.tooltip}`]: {
         maxWidth: 350,
      },
   },
   progressBar: {
      width: "100%",
      height: 10,
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
}

const SparksProgressIndicator: FC<Props> = ({
   isCriticalState,
   publicSparks,
}) => {
   return (
      <BrandedTooltip
         title={
            isCriticalState ? renderCriticalMessage() : renderDefaultMessage()
         }
         sx={styles.tooltip}
      >
         <Box>
            <Typography variant={"body1"} sx={styles.progressCount}>
               {publicSparks.length}/15 Spark slots
            </Typography>

            <LinearProgress
               sx={styles.progressBar}
               color={isCriticalState ? "error" : "secondary"}
               variant="determinate"
               value={
                  publicSparks.length ? (publicSparks.length / 15) * 100 : 0
               }
            />
         </Box>
      </BrandedTooltip>
   )
}

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
         Congrats! Your Sparks are now live on CareerFairy. Currently you can
         publish a maximum of 15 Sparks.
      </Typography>
   </Box>
)

export default SparksProgressIndicator
