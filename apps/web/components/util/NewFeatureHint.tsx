import { useRouter } from "next/router"
import React, { FC, useEffect, useState } from "react"
import { StyledTooltipWithButton } from "../../materialUI/GlobalTooltips"
import { type TooltipProps } from "@mui/material/Tooltip"
import { Backdrop, Box } from "@mui/material"
import { sxStyles } from "../../types/commonTypes"

const styles = sxStyles({
   elementWrapper: {
      cursor: "pointer",
   },
   backDrop: {
      zIndex: (theme) => theme.zIndex.drawer + 1,
      m: "0px !important",
   },
})

type Props = {
   buttonText: string
   children: React.ReactNode
   hide?: boolean
   localStorageKey: string
   onClickConfirm?: () => void
   placement?: TooltipProps["placement"]
   tooltipText: string
   tooltipTitle: string
   backDrop?: boolean
}

const NewFeatureHint: FC<Props> = ({
   children,
   localStorageKey,
   tooltipText,
   buttonText,
   tooltipTitle,
   placement,
   onClickConfirm,
   hide,
   backDrop,
}) => {
   const [hasSeenTip, setHasSeenTip] = useState(false)
   const {
      query: { isRecordingWindow },
   } = useRouter()

   useEffect(() => {
      const hasSeenDataSetButton = localStorage.getItem(localStorageKey)
      setHasSeenTip(Boolean(JSON.parse(hasSeenDataSetButton)))
   }, [localStorageKey])

   const markAsSeen = () => {
      localStorage.setItem(localStorageKey, JSON.stringify(true))
      setHasSeenTip(true)
   }

   const handleSeen = () => {
      markAsSeen()
      onClickConfirm?.()
   }

   const show = Boolean(!hasSeenTip && !hide && !isRecordingWindow)

   const showBackdrop = Boolean(show && backDrop)

   return (
      <>
         <StyledTooltipWithButton
            placement={placement}
            open={show}
            tooltipTitle={tooltipTitle}
            onConfirm={handleSeen}
            tooltipText={tooltipText}
            buttonText={buttonText}
            backdropEnabled={showBackdrop}
         >
            <Box
               component={"span"}
               onClick={handleSeen}
               sx={styles.elementWrapper}
            >
               {children}
            </Box>
         </StyledTooltipWithButton>
         {showBackdrop ? (
            <Backdrop sx={styles.backDrop} open={show} onClick={markAsSeen} />
         ) : null}
      </>
   )
}

export default NewFeatureHint
