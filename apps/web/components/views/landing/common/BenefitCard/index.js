import PropTypes from "prop-types"
import React from "react"
import { Box, Button, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import CmsImage from "../../../../cms/image"

const angle = 20
const rectLength = 130
const styles = {
   graphicContainer: {
      height: rectLength * 1.5,
      position: "relative",
   },
   angled: {
      transform: `translate(-50%,-50%) rotate(${angle}deg)`,
   },
   angledReverse: {
      transform: `translate(-50%,-50%) rotate(-${angle}deg)`,
   },
   rectangle: (theme) => ({
      borderRadius: "25%",
      position: "absolute",
      top: "50%",
      left: "50%",
      width: rectLength,
      height: rectLength,
      [theme.breakpoints.down("md")]: {
         width: rectLength * 0.7,
         height: rectLength * 0.7,
      },
   }),
   graphic: (theme) => ({
      position: "absolute",
      top: "50%",
      maxWidth: rectLength * 0.6,
      maxHeight: rectLength * 0.6,
      height: "auto",
      left: "50%",
      transform: `translate(-50%,-50%)`,
      [theme.breakpoints.down("md")]: {
         width: rectLength * 0.5,
      },
   }),
   btn: {
      borderRadius: (theme) => theme.spacing(2),
      textDecoration: "none !important",
   },
}

const BenefitCard = ({
   description,
   imageUrl,
   name,
   primaryGradientStart,
   primaryGradientEnd,
   secondaryGradientStart,
   secondaryGradientEnd,
   buttonProps,
   image,
}) => {
   const theme = useTheme()

   return (
      <Box>
         <Box sx={styles.graphicContainer}>
            <Box
               sx={{
                  ...styles.rectangle(theme),
                  ...styles.angledReverse,
                  filter:
                     "drop-shadow(2.302px 32.92px 17.5px rgba(112,57,229,0.19))",
                  backgroundImage: `linear-gradient(-8deg, ${
                     secondaryGradientStart || theme.palette.secondary.main
                  } 1%, ${
                     secondaryGradientEnd || theme.palette.secondary.light
                  } 100%)`,
               }}
            />
            <Box
               sx={{
                  ...styles.rectangle(theme),
                  ...styles.angled,
                  backgroundImage: `linear-gradient(-8deg, ${
                     primaryGradientStart || theme.palette.primary.dark
                  } 1%, ${
                     primaryGradientEnd || theme.palette.primary.light
                  } 100%)`,
                  filter:
                     "drop-shadow(21.632px 36.001px 24.5px rgba(189,243,236,0.29))",
               }}
            />

            {image ? (
               <Box sx={styles.graphic}>
                  <CmsImage cmsImage={image} />
               </Box>
            ) : (
               <Box
                  component="img"
                  sx={styles.graphic}
                  src={imageUrl}
                  alt={name}
               />
            )}
         </Box>
         <div
            style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               minHeight: 100,
            }}
         >
            <Typography gutterBottom component="h5" align="center" variant="h5">
               <b>{name}</b>
            </Typography>
         </div>
         <Typography variant="body1" color="textSecondary" align="center">
            {description}
         </Typography>
         {buttonProps && (
            <Box display="flex" justifyContent="center" p={2}>
               <Button
                  sx={styles.btn}
                  variant="outlined"
                  color="primary"
                  {...buttonProps}
               />
            </Box>
         )}
      </Box>
   )
}

export default BenefitCard

BenefitCard.propTypes = {
   description: PropTypes.string,
   imageUrl: PropTypes.string,
}
