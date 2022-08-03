import React, { ReactNode } from "react"
import {
   AppBar,
   Box,
   Card,
   CardHeader,
   Collapse,
   Typography,
} from "@mui/material"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import { alpha } from "@mui/material/styles"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      boxShadow: "none",
      background: "none",
   },
   title: {
      marginRight: (theme) => theme.spacing(1.5),
   },
   header: {
      paddingX: (theme) => theme.spacing(3),
      paddingY: (theme) => theme.spacing(1),
   },
   titleButton: {},
   menuItem: {
      "&:focus": {
         backgroundColor: (theme) => theme.palette.primary.main,
         "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
            color: (theme) => theme.palette.common.white,
         },
      },
   },
   appBar: {
      boxShadow: "none",
      background: (theme) => theme.palette.common.white,
      borderBottom: (theme) =>
         `1px solid ${alpha(theme.palette.text.secondary, 0.3)}`,
      top: 64,
   },
})

type Props = {
   title: string
   subtitle: string
   actionNode?: ReactNode
   children?: ReactNode
}

const Header = ({ title, subtitle, actionNode, children }: Props) => {
   const isScrolling = useScrollTrigger()

   return (
      <AppBar sx={styles.appBar} position="sticky" color="default">
         <Collapse in={!isScrolling}>
            <Card sx={styles.root}>
               <CardHeader
                  sx={styles.header}
                  title={
                     <Box display="flex" flexWrap="wrap" alignItems="center">
                        <Typography sx={styles.title} variant="h4">
                           {title}
                        </Typography>
                     </Box>
                  }
                  subheader={subtitle}
                  action={actionNode}
               />
            </Card>
         </Collapse>
         {children}
      </AppBar>
   )
}

export default Header
