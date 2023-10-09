import { Box, Button, Collapse } from "@mui/material"
import SanitizedHTML from "../../../util/SanitizedHTML"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import React, { useCallback, useMemo, useState } from "react"
import { sxStyles } from "../../../../types/commonTypes"
import { SxProps } from "@mui/system"
import { Theme } from "@mui/material/styles"

const MAX_LENGTH_TO_SHOW_COLLAPSE_BUTTONS = 290

const styles = sxStyles({
   text: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "27px",
   },
   collapseBtn: {
      p: 0,
      mt: 2,
      textTransform: "none",
      fontSize: "16px",
   },
})

type Props = {
   text: string
   textStyle?: SxProps<Theme>
   maxLength?: number
   collapsedSize?: number
}

const CollapsableText = ({
   text,
   textStyle,
   maxLength,
   collapsedSize,
}: Props) => {
   const [isTextCollapsed, setIsTextCollapsed] = useState(true)

   const showCollapse = useMemo(
      () => text.length >= maxLength || MAX_LENGTH_TO_SHOW_COLLAPSE_BUTTONS,
      [maxLength, text.length]
   )

   const handleClick = useCallback(() => {
      setIsTextCollapsed((prev) => !prev)
   }, [])

   return (
      <Box>
         <Collapse in={!isTextCollapsed} collapsedSize={collapsedSize || 75}>
            <SanitizedHTML
               sx={Boolean(textStyle) ? textStyle : styles.text}
               htmlString={text}
            />
         </Collapse>
         {showCollapse ? (
            <Box display="flex" justifyContent="start">
               {isTextCollapsed ? (
                  <Button
                     variant="text"
                     color="secondary"
                     sx={styles.collapseBtn}
                     endIcon={<ExpandMoreIcon />}
                     onClick={handleClick}
                  >
                     View more
                  </Button>
               ) : null}

               {!isTextCollapsed && (
                  <Button
                     variant="text"
                     color="secondary"
                     sx={styles.collapseBtn}
                     startIcon={<ExpandLessIcon />}
                     onClick={handleClick}
                  >
                     View less
                  </Button>
               )}
            </Box>
         ) : null}
      </Box>
   )
}

export default CollapsableText
