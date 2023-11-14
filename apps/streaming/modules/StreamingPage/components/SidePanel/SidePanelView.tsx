import { sxStyles } from "@careerfairy/shared-ui"
import { Box, IconButton, Typography } from "@mui/material"
import { useAppDispatch } from "hooks"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import { toggleSidePanel } from "store/streamingAppSlice"
import { ReactNode } from "react"

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
   title: string
   icon?: ReactNode
   children: ReactNode
   id: string
}

export const SidePanelView = ({ title, icon, children, id }: Props) => {
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
         <Box sx={styles.content}>{children}</Box>
      </Box>
   )
}
