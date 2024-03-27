import { combineStyles, sxStyles } from "types/commonTypes"
import { Box, IconButton, Typography, BoxProps } from "@mui/material"
import { useAppDispatch } from "components/custom-hook/store"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { toggleSidePanel } from "store/reducers/streamingAppReducer"
import { ReactNode, RefObject } from "react"

const styles = sxStyles({
   baseBgColor: {
      bgcolor: "#FDFDFD",
   },
   root: {
      display: "flex",
      flexDirection: "column",
      borderRadius: "16px",
      flex: 1,
      overflowY: "auto",
   },
   header: {
      borderRadius: "16px 16px 0 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: 2,
      py: 1.5,
      borderBottom: "1px solid #F9F9F9",
      position: "sticky",
      top: 0,
      zIndex: 1,
   },
   footer: {
      position: "sticky",
      bottom: 0,
      zIndex: 1,
   },
   closeIcon: {
      ml: "auto",
      color: "text.primary",
   },
   icon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
   },
   content: {
      px: 1.5,
      py: 1.855,
      flex: 1,
      overflowY: "auto",
   },
})

type Props = {
   title: ReactNode
   icon?: ReactNode
   children: ReactNode
   id: string
   contentWrapperStyles?: BoxProps["sx"]
   contentRef?: RefObject<HTMLElement>
   bottomContent?: ReactNode
}

export const SidePanelView = ({
   title,
   icon,
   children,
   id,
   contentWrapperStyles,
   bottomContent,
   contentRef,
}: Props) => {
   const dispatch = useAppDispatch()
   const handleToggle = () => {
      dispatch(toggleSidePanel())
   }

   return (
      <Box id={id} sx={[styles.root, styles.baseBgColor]}>
         <Box sx={[styles.header, styles.baseBgColor]}>
            {icon ? (
               <Box mr={1.125} sx={styles.icon} component="span">
                  {icon}
               </Box>
            ) : null}
            <Typography variant="medium">{title}</Typography>
            <IconButton
               size="small"
               onClick={handleToggle}
               sx={styles.closeIcon}
            >
               <CloseRoundedIcon fontSize="small" />
            </IconButton>
         </Box>
         <Box
            sx={combineStyles(styles.content, contentWrapperStyles)}
            ref={contentRef}
         >
            {children}
         </Box>
         {Boolean(bottomContent) && (
            <Box sx={styles.footer}>{bottomContent}</Box>
         )}
      </Box>
   )
}
