import { HandRaiseState } from "@careerfairy/shared-lib/livestreams/hand-raise"
import { Box } from "@mui/material"
import { useUpdateUserHandRaiseState } from "components/custom-hook/streaming/hand-raise/useUpdateUserHandRaiseState"
import { forwardRef } from "react"
import { Phone } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

const styles = sxStyles({
   root: {
      backgroundColor: "error.main",
      "&:hover": {
         backgroundColor: "error.dark",
      },
      "& svg": {
         color: (theme) => theme.brand.white[50],
         transform: "rotate(135deg)",
      },
   },
})

export const StopHandRaisingButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { livestreamId, agoraUserId } = useStreamingContext()
   const { trigger: updateHandRaiseState, isMutating } =
      useUpdateUserHandRaiseState(livestreamId)

   return (
      <BrandedTooltip
         title={enableTooltip ? ActionTooltips.StopHandRaise : null}
      >
         <ActionBarButtonStyled
            {...props}
            disabled={isMutating}
            sx={styles.root}
            ref={ref}
            onClick={() =>
               updateHandRaiseState({
                  handRaiseId: agoraUserId,
                  state: HandRaiseState.denied,
               })
            }
         >
            <Box component={Phone} />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})

StopHandRaisingButton.displayName = "StopSharingButton"
