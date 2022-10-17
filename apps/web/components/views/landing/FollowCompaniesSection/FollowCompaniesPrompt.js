import React from "react"
import { Box } from "@mui/material"
import HeroButton from "../HeroSection/HeroButton"
import { sxStyles } from "../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: 2,
   },
})

const FollowCompaniesPrompt = () => {
   return (
      <Box sx={styles.root}>
         <Box>
            <HeroButton
               href="/wishlist"
               color="secondary"
               size={"small"}
               variant="outlined"
            >
               Add to Wishlist
            </HeroButton>
         </Box>
      </Box>
   )
}

export default FollowCompaniesPrompt
