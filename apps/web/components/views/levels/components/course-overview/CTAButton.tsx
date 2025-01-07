import { Button, ButtonProps } from "@mui/material"
import Link from "components/views/common/Link"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { forwardRef } from "react"

type CTAButtonProps = ButtonProps & {
   nextLevel: Page<TalentGuideModule>
}

export const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
   ({ nextLevel, ...props }, ref) => {
      return (
         <Button
            ref={ref}
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            component={Link}
            noLinkStyle
            href={`/levels/${nextLevel.slug}`}
            {...props}
         >
            Start course {nextLevel.content.level}
         </Button>
      )
   }
)

CTAButton.displayName = "CTAButton"
