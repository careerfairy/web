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
import { FC, useMemo } from "react"
import { Info } from "react-feather"
import { LivestreamFormValues } from "./types"
import { useLivestreamFormValues } from "./useLivestreamFormValues"

const tabLabelsMap: Record<keyof LivestreamFormValues, string> = {
   general: "General",
   speakers: "Speakers",
   questions: "Questions",
   jobs: "Job Openings",
}

type InvalidAlertTooltipContentProps = {
   handleOkClick?: () => void
}

export const InvalidAlertTooltipContent: FC<
   InvalidAlertTooltipContentProps
> = ({ handleOkClick }) => {
   const isMobile = useIsMobile()
   const { errors } = useLivestreamFormValues()

   const tabsWithErros = useMemo(
      () => Object.keys(errors).map((key) => tabLabelsMap[key]),
      [errors]
   )

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
