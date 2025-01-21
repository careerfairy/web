import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { Box } from "@mui/material"
import { Page, TalentGuideModule } from "data/hygraph/types"
import Link from "next/link"
import { forwardRef } from "react"
import { Play } from "react-feather"

type CTAButtonProps = LoadingButtonProps & {
   nextLevel: Page<TalentGuideModule>
}

export const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
   ({ nextLevel, ...props }, ref) => {
      if (!nextLevel) {
         return (
            <LoadingButton
               ref={ref}
               variant="contained"
               color="primary"
               size="large"
               fullWidth
               endIcon={<Play />}
               {...props}
               loading
               disabled
            >
               Start Level 0
            </LoadingButton>
         )
      }

      return (
         <Box width="100%" component={Link} href={`/levels/${nextLevel.slug}`}>
            <LoadingButton
               ref={ref}
               variant="contained"
               color="primary"
               size="large"
               fullWidth
               endIcon={<Play />}
               {...props}
            >
               Start Level {nextLevel.slug}
            </LoadingButton>
         </Box>
      )
   }
)

CTAButton.displayName = "CTAButton"
