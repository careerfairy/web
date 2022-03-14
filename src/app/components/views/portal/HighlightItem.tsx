import React from "react";
import Box from "@mui/material/Box";
import { Theme } from "@mui/material/styles";
import Image from "next/image";
import PlayIcon from "@mui/icons-material/PlayArrowRounded";

const itemSpacingSize = 14;
const mobileFactor = 0.8;
const styles = {
   root: {
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
   },
   circleRoot: {
      borderRadius: "50%",
      position: "relative",
      background: (theme: Theme) =>
         `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.secondary.gradient})`,
      padding: 0.5,
      height: (theme) => ({
         xs: theme.spacing(itemSpacingSize * mobileFactor),
         md: theme.spacing(itemSpacingSize),
      }),
      width: (theme) => ({
         xs: theme.spacing(itemSpacingSize * mobileFactor),
         md: theme.spacing(itemSpacingSize),
      }),
      display: "flex",
      color: "white",
      // m: 1,
      "&:hover": {
         "& svg": {
            fontSize: (theme) => ({
               xs: theme.spacing(itemSpacingSize * 0.3),
               md: theme.spacing(itemSpacingSize * 0.5),
            }),
            textShadow: (theme) => theme.darkTextShadow,
         },
         "& .overlay": {
            opacity: 0.5,
         },
         "& .innerWrapper": {
            padding: 0,
         },
      },
   },
   innerWrapper: {
      background: (theme: Theme) => theme.palette.background.paper,
      transition: (theme) => theme.transitions.create(["padding"]),
      padding: 0.5,
      borderRadius: "50%",
      flex: 1,
      position: "relative",
      display: "flex",
   },
   imageWrapper: {
      borderRadius: "50%",
      position: "relative",
      flex: 1,
      display: "grid",
      placeItems: "center",
   },
   imageOverlay: {
      background: "black",
      borderRadius: "50%",
      opacity: 0,
      transition: (theme) => theme.transitions.create(["opacity"]),
      position: "absolute",
      inset: 0,
   },
   thumbnailImage: {
      borderRadius: "50%",
      margin: 1,
   },
   icon: {
      zIndex: 2,
      fontSize: (theme) => ({
         xs: theme.spacing(itemSpacingSize * 0.2),
         md: theme.spacing(itemSpacingSize * 0.4),
      }),
      transition: (theme) => theme.transitions.create(["color", "font-size"]),
   },
   logoRoot: {
      height: (theme) => ({
         xs: theme.spacing(7),
      }),
      width: "100%",
      p: 1,
      display: "flex",
   },
   logoWrapper: {
      flex: 1,
      display: "flex",
      p: 0.5,
      "& > *": {
         position: "relative",
         flex: 1,
      },
   },
} as const;
const HighlightItem = ({
   highLight: { videoUrl, thumbnail, logo },
   handleOpenVideoDialog,
}: HighlightItemProps) => {
   return (
      <Box onClick={() => handleOpenVideoDialog(videoUrl)} sx={styles.root}>
         <Box sx={styles.circleRoot}>
            <Box className="innerWrapper" sx={styles.innerWrapper}>
               <Box sx={styles.imageWrapper}>
                  <Box
                     sx={styles.thumbnailImage}
                     layout="fill"
                     src={thumbnail}
                     component={Image}
                  />
                  <Box className={"overlay"} sx={styles.imageOverlay} />
                  <PlayIcon sx={styles.icon} />
               </Box>
            </Box>
         </Box>
         <Box sx={styles.logoRoot}>
            <Box sx={styles.logoWrapper}>
               <Box>
                  <Image
                     alt="logo"
                     objectFit={"contain"}
                     layout="fill"
                     src={logo}
                  />
               </Box>
            </Box>
         </Box>
      </Box>
   );
};

export interface HighLightType {
   videoUrl: string;
   id: string;
   thumbnail: string;
   logo: string;
}
interface HighlightItemProps {
   highLight: HighLightType;
   handleOpenVideoDialog: (videoUrl: string) => void;
}

export default HighlightItem;
