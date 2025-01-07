import { Button, ButtonProps } from "@mui/material"
import Link from "components/views/common/Link"
import { Page, TalentGuideModule } from "data/hygraph/types"
import { forwardRef } from "react"

type CTAButtonProps = ButtonProps & {
   nextModule: Page<TalentGuideModule>
}

export const CTAButton = forwardRef<HTMLButtonElement, CTAButtonProps>(
   ({ nextModule, ...props }, ref) => {
      return (
         <Button
            ref={ref}
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            component={Link}
            noLinkStyle
            href={`/levels/${nextModule.slug}`}
            {...props}
         >
            Start course {nextModule.content.level}
         </Button>
      )
   }
)

CTAButton.displayName = "CTAButton"
