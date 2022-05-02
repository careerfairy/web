import React from "react"
import { Wish } from "@careerfairy/shared-lib/dist/wishes"
import Paper from "@mui/material/Paper"
import { StylesProps } from "../../../types/commonTypes"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { Divider } from "@mui/material"

interface WishCardProps {
   wish: Wish
}

const styles: StylesProps = {
   root: {
      p: 0.5,
      borderRadius: 0,
      minHeight: "100px",
      display: "flex",
   },
   inner: {
      flex: 1,
      borderLeftColor: "primary.light",
      borderLeftWidth: "3px",
      borderLeftStyle: "solid",
      // flexWrap: "wrap",
      "& > *": {},
   },
   wishDetails: {
      // minWidth: 300,
      bgcolor: "primary.light",
   },
   wishEngagement: {
      // minWidth: 300,
      bgcolor: "secondary.light",
   },
}
const WishCard = ({ wish }: WishCardProps) => {
   return (
      <Paper variant="outlined" sx={styles.root}>
         <Stack
            divider={<Divider orientation="vertical" />}
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1, sm: 2, md: 4 }}
            sx={styles.inner}
         >
            <Box sx={styles.wishDetails}>
               <div>{wish.title}</div>
            </Box>
            <Box sx={styles.wishEngagement}>hi</Box>
         </Stack>
      </Paper>
   )
}

export default WishCard
