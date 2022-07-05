import React from "react"
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
      // fontWeight: 400
      marginRight: (theme) => theme.spacing(1.5),
   },
   header: {
      paddingLeft: (theme) => theme.spacing(3),
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

const Header = ({ title, subtitle }) => {
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
               />
            </Card>
         </Collapse>
      </AppBar>
   )
}

export default Header
