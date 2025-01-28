import {
   Box,
   CircularProgress,
   CircularProgressProps,
   Stack,
   Typography,
} from "@mui/material"
import { useModuleCardContext } from "./ModuleCard"
import { statusStyles } from "./styles"

type Props = {
   estimatedModuleDurationMinutes?: number
   percentProgress?: number
   moduleLevel: number
}

const calculateDurationRange = (estimatedMinutes = 20) => {
   const minDuration = Math.floor(estimatedMinutes * 0.75)
   const maxDuration = estimatedMinutes
   return `${minDuration}-${maxDuration}`
}

export const LevelInfo = ({
   moduleLevel,
   estimatedModuleDurationMinutes,
}: Pick<Props, "moduleLevel" | "estimatedModuleDurationMinutes">) => {
   const { isMobile } = useModuleCardContext()

   return (
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
            {calculateDurationRange(estimatedModuleDurationMinutes)} min
         </Typography>
      </Box>
   )
}

const ProgressInfo = ({ percentProgress }: Pick<Props, "percentProgress">) => {
   const { isMobile } = useModuleCardContext()

   if (!percentProgress) return null

   return (
      <Stack sx={statusStyles.progressDisplay} spacing={0.75} direction="row">
         <Progress value={percentProgress} />
         <Typography
            variant={isMobile ? "xsmall" : "small"}
            component="p"
            color="primary.main"
         >
            {percentProgress.toFixed(0)}%
         </Typography>
      </Stack>
   )
}

export const ModuleInfoChip = ({
   estimatedModuleDurationMinutes,
   percentProgress,
   moduleLevel,
}: Props) => {
   return (
      <Stack direction="row" justifyContent="space-between" alignItems="center">
         <LevelInfo
            moduleLevel={moduleLevel}
            estimatedModuleDurationMinutes={estimatedModuleDurationMinutes}
         />
         <ProgressInfo percentProgress={percentProgress} />
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
