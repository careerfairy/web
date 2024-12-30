import {
   Box,
   CircularProgress,
   CircularProgressProps,
   Stack,
   Typography,
} from "@mui/material"
import { statusStyles } from "./styles"

type Props = {
   moduleName: string
   moduleDuration: string
   percentProgress?: number
}

export const ModuleInfoChip = ({
   moduleName,
   moduleDuration,
   percentProgress,
}: Props) => {
   return (
      <Stack direction="row" justifyContent="space-between" alignItems="center">
         <Box sx={[statusStyles.info, statusStyles.chip]}>
            <Typography
               sx={statusStyles.infoText}
               variant="small"
               component="p"
            >
               {moduleName}{" "}
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="4"
                  height="4"
                  viewBox="0 0 4 4"
                  fill="none"
               >
                  <circle cx="2" cy="2" r="2" fill="currentColor" />
               </svg>
               {moduleDuration}
            </Typography>
         </Box>
         {Boolean(percentProgress) && (
            <Stack
               sx={statusStyles.progressDisplay}
               spacing={0.75}
               direction="row"
            >
               <Progress value={25} />
               <Typography variant="small" component="p" color="primary.main">
                  {percentProgress}%
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
