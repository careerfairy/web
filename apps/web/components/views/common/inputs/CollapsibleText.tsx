import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Box, Button, Collapse } from "@mui/material"
import { Theme } from "@mui/material/styles"
import { SxProps } from "@mui/system"
import React, {
   ReactNode,
   useCallback,
   useEffect,
   useRef,
   useState,
} from "react"
import { isHeightOverflowing } from "util/LayoutUtil"
import { sxStyles } from "../../../../types/commonTypes"
import SanitizedHTML from "../../../util/SanitizedHTML"

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
   collapsedSize?: number | string
   slots?: {
      expand?: ReactNode
      collapse?: ReactNode
   }
   containerSx?: SxProps
}

const CollapsibleText = ({
   text,
   textStyle,
   collapsedSize,
   slots,
   containerSx,
}: Props) => {
   const [isTextCollapsed, setIsTextCollapsed] = useState(true)
   const [isTextOverflowing, setIsTextOverflowing] = useState(false)
   const textRef = useRef(null)

   useEffect(() => {
      setIsTextOverflowing(isHeightOverflowing(textRef?.current))
   }, [textRef])

   const handleClick = useCallback(() => {
      setIsTextCollapsed((prev) => !prev)
   }, [])

   return (
      <Box sx={containerSx}>
         <Collapse
            in={!isTextCollapsed}
            ref={textRef}
            collapsedSize={collapsedSize || 75}
         >
            <SanitizedHTML
               sx={textStyle ? textStyle : styles.text}
               htmlString={text}
            />
         </Collapse>
         {isTextOverflowing ? (
            <Box display="flex" justifyContent="start">
               {isTextCollapsed ? (
                  slots?.expand && React.isValidElement(slots.expand) ? (
                     React.cloneElement(slots.expand as React.ReactElement, {
                        onClick: handleClick,
                     })
                  ) : (
                     <Button
                        variant="text"
                        color="secondary"
                        sx={styles.collapseBtn}
                        endIcon={<ExpandMoreIcon />}
                        onClick={handleClick}
                     >
                        View more
                     </Button>
                  )
               ) : null}

               {!isTextCollapsed ? (
                  slots?.collapse && React.isValidElement(slots.collapse) ? (
                     React.cloneElement(slots.collapse as React.ReactElement, {
                        onClick: handleClick,
                     })
                  ) : (
                     <Button
                        variant="text"
                        color="secondary"
                        sx={styles.collapseBtn}
                        endIcon={<ExpandLessIcon />}
                        onClick={handleClick}
                     >
                        View less
                     </Button>
                  )
               ) : null}
            </Box>
         ) : null}
      </Box>
   )
}

export default CollapsibleText
