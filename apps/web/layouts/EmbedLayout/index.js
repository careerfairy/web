import React from "react"

import { styles } from "../../materialUI/styles/layoutStyles/basicLayoutStyles"

import { Box } from "@mui/material"

const EmbedLayout = ({ children }) => {
   return (
      <Box sx={styles.root}>
         <Box sx={styles.wrapper}>
            <Box sx={styles.contentContainer}>
               <Box sx={styles.content}>{children}</Box>
            </Box>
         </Box>
      </Box>
   )
}

export default EmbedLayout
