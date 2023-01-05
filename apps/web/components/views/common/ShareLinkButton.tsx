import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import Box from "@mui/material/Box"

import { Button, ButtonBase, ButtonProps, Tooltip } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useCopyToClipboard } from "react-use"

import useSnackbarNotifications from "../../custom-hook/useSnackbarNotifications"
import useIsMobile from "../../custom-hook/useIsMobile"
import { sxStyles } from "../../../types/commonTypes"

const hoveredContentClassName = "hovered-content"
const contentClassName = "non-hovered-content"

const styles = sxStyles({
   root: {
      position: "relative",
      "&:hover": {
         [`& .${hoveredContentClassName}`]: {
            opacity: 1,
         },
         [`& .${contentClassName}`]: {
            opacity: 0,
         },
      },
      [`& .${hoveredContentClassName}`]: {
         opacity: 0,
         transition: "opacity 0.5s",
      },
      [`& .${contentClassName}`]: {
         opacity: 1,
         transition: "opacity 0.5s",
      },
      borderRadius: (theme) => theme.shape.borderRadius,
   },
   iconButton: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
   },
   urlButton: {
      px: 2,
      maxWidth: 200,
      borderBottomLeftRadius: 0,
      borderTopLeftRadius: 0,
      textTransform: "none",
      fontWeight: "normal",
      color: "text.secondary",
   },
   ButtonText: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: "0.915rem",
   },
   hoveredContent: {
      display: "flex",
   },
   content: {
      position: "absolute",
   },
})

type Props = {
   linkUrl: string
   size?: ButtonProps["size"]
}
const ShareLinkButton = ({ linkUrl, size }: Props) => {
   const [copiedFromButton, setCopiedFromButton] = useState(false)
   const [_, copyToClipboard] = useCopyToClipboard()
   const { successNotification } = useSnackbarNotifications()
   const isMobile = useIsMobile()

   const copyFromButton = () => {
      copyToClipboard(linkUrl)
      setCopiedFromButton(true)
      successNotification("Referral link has been copied to your clipboard")
   }

   useEffect(() => {
      if (copiedFromButton) {
         setTimeout(() => {
            setCopiedFromButton(false)
         }, 2000)
      }
   }, [copiedFromButton])

   return (
      <Tooltip
         title="Copied!"
         placement="bottom"
         open={copiedFromButton}
         enterDelay={500}
         PopperProps={popperProps}
         arrow
         leaveDelay={200}
         disableFocusListener
         disableHoverListener
         disableTouchListener
      >
         <ButtonBase onClick={copyFromButton} sx={styles.root}>
            <Button
               className={contentClassName}
               color={"primary"}
               sx={styles.content}
               variant={"contained"}
               size={size}
            >
               SHARE CAREERFAIRY
            </Button>
            <Box
               className={hoveredContentClassName}
               sx={styles.hoveredContent}
               component={"span"}
            >
               <Button
                  size={size}
                  sx={styles.iconButton}
                  color="primary"
                  variant="contained"
                  disableRipple
                  disableElevation
                  startIcon={!isMobile && <ContentPasteIcon />}
               >
                  {isMobile ? <ContentPasteIcon /> : "COPY"}
               </Button>
               <Button
                  size={size}
                  disableRipple
                  sx={styles.urlButton}
                  variant={"outlined"}
               >
                  <Box sx={styles.ButtonText}>{linkUrl}</Box>
               </Button>
            </Box>
         </ButtonBase>
      </Tooltip>
   )
}

const popperProps = {
   disablePortal: true,
}

export default ShareLinkButton
