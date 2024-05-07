import { LivestreamModes } from "@careerfairy/shared-lib/livestreams"
import { useSetLivestreamMode } from "components/custom-hook/streaming/useSetLivestreamMode"
import { StopIcon } from "components/views/common/icons/StopIcon"
import { forwardRef } from "react"
import { sxStyles } from "types/commonTypes"
import { useStreamingContext } from "../../context"
import { ActionTooltips } from "../BottomBar/AllActionComponents"
import { BrandedTooltip } from "../BrandedTooltip"
import { ActionBarButtonStyled, ActionButtonProps } from "./ActionBarButton"

const styles = sxStyles({
   root: {
      backgroundColor: "error.50",
      "&:hover": {
         backgroundColor: "error.100",
      },
      border: "1px solid",
      borderColor: "error.300",
      "&:disabled": {
         borderColor: (theme) => theme.palette.action.disabled,
      },
   },
})

export const StopSharingButton = forwardRef<
   HTMLButtonElement,
   ActionButtonProps
>(({ enableTooltip, ...props }, ref) => {
   const { livestreamId } = useStreamingContext()
   const { trigger: setLivestreamMode, isMutating } =
      useSetLivestreamMode(livestreamId)

   return (
      <BrandedTooltip title={enableTooltip ? ActionTooltips.StopShare : null}>
         <ActionBarButtonStyled
            {...props}
            disabled={isMutating}
            sx={styles.root}
            color={"error"}
            ref={ref}
            active
            onClick={() => setLivestreamMode({ mode: LivestreamModes.DEFAULT })}
         >
            <StopIcon color="inherit" />
         </ActionBarButtonStyled>
      </BrandedTooltip>
   )
})

StopSharingButton.displayName = "StopSharingButton"
