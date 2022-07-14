import React from "react"
import { Avatar, Box, Button } from "@mui/material"
import { alpha } from "@mui/material/styles"
import { getResizedUrl } from "../../../../../helperFunctions/HelperFunctions"
import ImageIcon from "@mui/icons-material/Image"
import EditIcon from "@mui/icons-material/Edit"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { sxStyles } from "../../../../../../types/commonTypes"

const styles = sxStyles({
   root: {
      width: "70%",
      height: "70%",
      maxHeight: 85,
      cursor: "pointer",
      boxShadow: 5,
      background: "common.white",
      "& img": {
         objectFit: "contain",
         maxWidth: "90%",
         maxHeight: "90%",
      },
      display: "flex",
      borderRadius: (theme) => theme.spacing(0.5),
      borderBottomRightRadius: (theme) => [theme.spacing(2.5), "!important"],
      borderTopLeftRadius: (theme) => [theme.spacing(2.5), "!important"],
   },
   hoverOverLay: {
      position: "absolute",
      width: "100%",
      height: "100%",
      color: "common.white",
      backgroundColor: (theme) => alpha(theme.palette.common.black, 0.4),
      opacity: 0,
      display: "flex",
      justifyContent: "center",
      "& svg": {
         position: "absolute",
         filter: `drop-shadow(0px 0px 2px rgba(0,0,0,0.4))`,
      },
      alignItems: "center",
      zIndex: 1,
      transition: (theme) =>
         theme.transitions.create(["opacity"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.short,
         }),
      "&:hover": {
         cursor: "pointer",
         opacity: 1,
      },
   },
})

interface Props {
   onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
   livestream: LivestreamEvent
}

const CompanyLogo = ({
   onClick,
   livestream: { companyLogoUrl, backgroundImageUrl },
}: Props) => {
   return (
      <Box
         display="flex"
         justifyContent="center"
         alignItems="center"
         position="relative"
         height="100%"
         width="100%"
         minWidth={160}
      >
         <Box onClick={onClick} sx={styles.hoverOverLay}>
            <EditIcon fontSize="large" color="inherit" />
         </Box>
         <Avatar
            sx={styles.root}
            variant="rounded"
            src={getResizedUrl(companyLogoUrl, "xs")}
         >
            {!backgroundImageUrl && (
               <Button size="large" startIcon={<ImageIcon />}>
                  Upload images
               </Button>
            )}
         </Avatar>
      </Box>
   )
}

export default CompanyLogo
