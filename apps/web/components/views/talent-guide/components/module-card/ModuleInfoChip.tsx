import {
   Box,
   CircularProgress,
   CircularProgressProps,
   Stack,
   Typography,
} from "@mui/material"
import useIsMobile from "components/custom-hook/useIsMobile"
import { statusStyles } from "./styles"

type Props = {
   moduleDuration: string
   percentProgress?: number
   moduleLevel: number
}

export const ModuleInfoChip = ({
   moduleDuration,
   percentProgress,
   moduleLevel,
}: Props) => {
   const isMobile = useIsMobile()

   return (
      <Stack direction="row" justifyContent="space-between" alignItems="center">
         <Box sx={[statusStyles.info, statusStyles.chip]}>
            <Typography
               sx={statusStyles.infoText}
               variant={isMobile ? "xsmall" : "small"}
               component="p"
            >
               Level {moduleLevel}
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="4"
                  height="4"
                  viewBox="0 0 4 4"
                  fill="none"
               >
                  <circle cx="2" cy="2" r="2" fill="currentColor" />
               </svg>
               {moduleDuration} min
            </Typography>
         </Box>
         {Boolean(percentProgress) && (
            <Stack
               sx={statusStyles.progressDisplay}
               spacing={0.75}
               direction="row"
            >
               <Progress value={percentProgress || 0} />
               <Typography
                  variant={isMobile ? "xsmall" : "small"}
                  component="p"
                  color="primary.main"
               >
                  {percentProgress?.toFixed(0)}%
               </Typography>
            </Stack>
         )}
      </Stack>
   )
}

const defaultProps: CircularProgressProps = {
   size: 20,
   thickness: 7,
   variant: "determinate",
}

const Progress = ({ value }: { value: number }) => {
   return (
      <Box sx={statusStyles.progress}>
         <CircularProgress
            {...defaultProps}
            sx={statusStyles.backgroundCircle}
            value={100}
         />
         <CircularProgress
            {...defaultProps}
            sx={statusStyles.progressCircle}
            value={value}
         />
      </Box>
   )
}
