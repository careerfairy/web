import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { Box, Stack, Typography } from "@mui/material"
import FramerBox from "components/views/common/FramerBox"
import { AnimatePresence } from "framer-motion"
import { Check as CorrectIcon, X as WrongIcon } from "react-feather"
import { combineStyles, sxStyles } from "types/commonTypes"

const styles = sxStyles({
   button: {
      justifyContent: "flex-start",
      p: 1,
      borderRadius: "8px",
      transition: (theme) => theme.transitions.create("all"),
      width: "100%",
      textAlign: "left",
   },
   icon: {
      width: 24,
      height: 24,
      color: "inherit",
      strokeWidth: 3,
      flexShrink: 0,
   },
   iconSlot: {
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      transition: (theme) => theme.transitions.create("all"),
      flexShrink: 0,
   },
   textContainer: {
      flex: 1,
      display: "flex",
      alignItems: "flex-start",
      fontWeight: 400,
   },
   voteIconDot: {
      width: 12,
      height: 12,
      bgcolor: "neutral.800",
      borderRadius: "50%",
   },
   buttonVariants: {
      default: {
         borderColor: (theme) => theme.brand.black[500] + " !important",
         border: "1px solid",
         color: (theme) => theme.palette.neutral[700] + " !important",
      },
      selected: {
         borderColor: (theme) => theme.brand.purple[300] + " !important",
         border: "1.5px solid",
         background: `linear-gradient(90deg, #00BD40 0%, rgba(0, 189, 64, 0.00) 0.01%), #FEFEFE`,
         color: (theme) => theme.palette.neutral[700] + " !important",
      },
      correct: {
         bgcolor: (theme) => theme.palette.success[700] + " !important",
         color: "white !important",
      },
      wrong: {
         bgcolor: (theme) => theme.palette.error[500] + " !important",
         color: (theme) => theme.brand.white[100] + " !important",
      },
      correction: {
         borderColor: (theme) => theme.palette.success[700] + " !important",
         border: "1px solid",
         bgcolor: "#F3FBF6 !important",
         color: (theme) => theme.palette.neutral[700] + " !important",
      },
   },
   iconSlotVariants: {
      default: { bgcolor: "neutral.50" },
      selected: { bgcolor: "secondary.50", color: "neutral.800" },
      correct: { bgcolor: "success.50", color: "success.700" },
      wrong: { bgcolor: "error.50", color: "error.500" },
      correction: { bgcolor: "success.700", color: "white" },
   },
   animateIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
})

type AnswerButtonVariant =
   | "default"
   | "selected"
   | "correct"
   | "wrong"
   | "correction"

type Props = Omit<LoadingButtonProps, "variant"> & {
   variant?: AnswerButtonVariant
}

export const AnswerButton = ({ variant, sx, children, ...props }: Props) => (
   <Box
      variant="text"
      {...props}
      sx={combineStyles([styles.button, styles.buttonVariants[variant], sx])}
      component={LoadingButton}
   >
      <Stack spacing={1} direction="row" alignItems="center">
         <Box sx={[styles.iconSlot, styles.iconSlotVariants[variant]]}>
            <AnimatePresence mode="wait">
               {variant === "correct" && (
                  <AnimateIcon key="correct">
                     <Box component={CorrectIcon} sx={styles.icon} />
                  </AnimateIcon>
               )}
               {variant === "correction" && (
                  <AnimateIcon key="correction">
                     <Box component={CorrectIcon} sx={styles.icon} />
                  </AnimateIcon>
               )}
               {variant === "wrong" && (
                  <AnimateIcon key="wrong">
                     <Box component={WrongIcon} sx={styles.icon} />
                  </AnimateIcon>
               )}
               {variant === "selected" && (
                  <AnimateIcon key="selected">
                     <Box sx={styles.voteIconDot} />
                  </AnimateIcon>
               )}
            </AnimatePresence>
         </Box>
         <Typography variant="small" sx={styles.textContainer}>
            {children}
         </Typography>
      </Stack>
   </Box>
)

/**
 * Playful pop and rotate animation for icons:
 * - Enter: Fades in while scaling up and rotating from -180° to 0° with a bouncy finish
 * - Exit: Fades out while scaling down and rotating to 180° with a snappy retraction
 */
const iconAnimation = {
   initial: { opacity: 0, scale: 0.5, rotate: -180 },
   animate: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
         duration: 0.3,
         ease: "backOut",
      },
   },
   exit: {
      opacity: 0,
      scale: 0.5,
      rotate: 180,
      transition: {
         duration: 0.2,
         ease: "backIn",
      },
   },
}

const AnimateIcon = ({ children }: { children: React.ReactNode }) => {
   return (
      <FramerBox {...iconAnimation} sx={styles.animateIcon}>
         {children}
      </FramerBox>
   )
}
