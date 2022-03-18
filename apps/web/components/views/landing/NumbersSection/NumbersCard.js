import React from "react"
import { alpha } from "@mui/material/styles"
import { Box, Typography } from "@mui/material"

const circleWidth = 22
const styles = {
   graphicsContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: "1 / 1",
      marginBottom: (theme) => theme.spacing(2),
   },
   graphicCircle: {
      width: (theme) => theme.spacing(circleWidth),
      height: (theme) => theme.spacing(circleWidth),
      borderRadius: "50%",
      background: (theme) =>
         `linear-gradient(${alpha(theme.palette.secondary.main, 0.1)}, 75%, ${
            theme.palette.secondary.light
         })`,
      position: "absolute",
   },
   secondaryShadow: {
      filter: (theme) =>
         `drop-shadow(4.092px 4.39px 9.5px ${theme.palette.secondary.light})`,
   },
   primaryShadow: {
      filter: (theme) =>
         `drop-shadow(4.092px 4.39px 9.5px ${alpha(
            theme.palette.primary.light,
            0.2
         )})`,
   },
   bottomLeft: {
      top: "55%",
      left: "45%",
      transform: "translate(-50%, -50%)",
   },
   topRight: {
      top: "45%",
      left: "55%",
      transform: "translate(-50%, -50%)",
   },
   middle: {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: (theme) => theme.palette.primary.main,
      color: (theme) => theme.palette.common.white,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
   },
   amount: {
      fontSize: "3.5rem",
   },
   label: {
      fontWeight: 600,
      fontSize: "2rem",
   },
}
const NumbersCard = ({ label, amount }) => {
   return (
      <Box>
         <Box sx={styles.graphicsContainer}>
            <Box
               sx={[
                  styles.graphicCircle,
                  styles.bottomLeft,
                  styles.secondaryShadow,
               ]}
            />
            <Box
               sx={[
                  styles.graphicCircle,
                  styles.topRight,
                  styles.secondaryShadow,
               ]}
            />
            <Box
               sx={[styles.graphicCircle, styles.middle, styles.primaryShadow]}
            >
               <Typography sx={styles.amount} variant="h4" align="center">
                  {amount}
               </Typography>
            </Box>
         </Box>
         <Typography align="center" variant="h3" sx={styles.label}>
            {label}
         </Typography>
      </Box>
   )
}

export default NumbersCard
