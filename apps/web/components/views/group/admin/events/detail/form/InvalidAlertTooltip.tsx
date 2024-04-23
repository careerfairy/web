import {
   Box,
   Button,
   Stack,
   Tooltip,
   TooltipProps,
   Typography,
   styled,
   tooltipClasses,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { Info } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useLivestreamCreationContext } from "../LivestreamCreationContext"
import { LivestreamFormValues } from "./types"

const styles = sxStyles({
   okButton: {
      color: "grey",
   },
})

const tabLabelsMap: Record<keyof LivestreamFormValues, string> = {
   general: "General",
   speakers: "Speakers",
   questions: "Questions",
   jobs: "Job Openings",
}

type InvalidAlertTooltipContentProps = {
   handleOkClick?: () => void
}

export const InvalidAlertTooltipContent = ({
   handleOkClick,
}: InvalidAlertTooltipContentProps) => {
   const isMobile = useIsMobile()
   const { isGeneralTabInvalid, isSpeakerTabInvalid } =
      useLivestreamCreationContext()

   const tabsWithErros = [
      isGeneralTabInvalid && tabLabelsMap.general,
      isSpeakerTabInvalid && tabLabelsMap.speakers,
   ].filter(Boolean)

   return (
      <Stack padding="20px" spacing={2} width="100%">
         {Boolean(isMobile) && <Info color="#FE9B0E" size={48} />}
         <Typography variant="brandedH5" fontWeight={600}>
            Required field missing
         </Typography>
         <Typography variant="medium" fontWeight={400}>
            {
               "You can't publish your live stream until all the required fields are filled. Please complete the following sections:"
            }
            <br />
            <Box component="ul" color="warning.main" paddingLeft="15px">
               {tabsWithErros.map((tabLabel, index) => (
                  <li key={index}>
                     <Typography fontSize="inherit">{tabLabel}</Typography>
                  </li>
               ))}
            </Box>
         </Typography>
         {Boolean(isMobile) && (
            <Button
               fullWidth
               variant="outlined"
               color="grey"
               onClick={handleOkClick}
               sx={styles.okButton}
            >
               Ok
            </Button>
         )}
      </Stack>
   )
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
   <Tooltip {...props} classes={{ popper: className }} />
))({
   [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 416,
   },
})

const InvalidAlertTooltip = () => (
   <CustomWidthTooltip
      title={<InvalidAlertTooltipContent />}
      color="#FE9B0E"
      enterDelay={75}
      leaveDelay={75}
   >
      <Info color="#FE9B0E" />
   </CustomWidthTooltip>
)

export default InvalidAlertTooltip
