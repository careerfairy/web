import React, { useState } from "react"
import { Avatar, Box, Button } from "@mui/material"

const cardBorderRadius = 6
const styles = {
   root: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
   },
   groupLogo: (theme) => ({
      background: theme.palette.common.white,
      padding: theme.spacing(1),
      "& img": {
         objectFit: "contain",
      },
   }),
   smallButton: (theme) => ({
      marginTop: theme.spacing(1),
      borderRadius: cardBorderRadius,
      padding: theme.spacing(0.5, 0),
   }),
   btn: {
      cursor: "pointer",
   },
}

const GroupLogoButton = ({ group, handleFollow }) => {
   const [hovered, setHovered] = useState(false)
   return (
      <Box
         sx={{
            ...styles.root,
            "& .MuiAvatar-root": (theme) => ({
               boxShadow: hovered ? theme.shadows[8] : "none",
               width: theme.spacing(6),
               height: theme.spacing(6),
               transition: theme.transitions.create(["box-shadow"], {
                  easing: theme.transitions.easing.easeInOut,
                  duration: theme.transitions.duration.standard,
               }),
            }),
            ...(handleFollow && styles.btn),
         }}
         onClick={handleFollow}
         onMouseEnter={() => setHovered(true)}
         onMouseLeave={() => setHovered(false)}
      >
         <Avatar
            sx={styles.groupLogo}
            src={group.imgPath}
            alt={group.label}
            imgProps={{ loading: "lazy" }}
         />
         {handleFollow && (
            <Button
               variant={hovered ? "contained" : "outlined"}
               size="small"
               fullWidth
               sx={styles.smallButton}
               color="primary"
            >
               Follow
            </Button>
         )}
      </Box>
   )
}

export default GroupLogoButton
