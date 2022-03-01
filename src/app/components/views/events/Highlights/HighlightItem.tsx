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
      m: 1,
   },
   innerWrapper: {
      background: (theme: Theme) => theme.palette.background.paper,
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
   thumbnailImage: {
      borderRadius: "50%",
      margin: 1,
   },
   icon: {
      zIndex: 1,
      fontSize: (theme) => ({
         xs: theme.spacing(itemSpacingSize * 0.4),
         md: theme.spacing(itemSpacingSize * 0.7),
      }),
      transition: (theme) => theme.transitions.create(["color", "font-size"]),
      "&:hover": {
         color: (theme) => theme.palette.primary.main,
         fontSize: (theme) => ({
            xs: theme.spacing(itemSpacingSize * 0.5),
            md: theme.spacing(itemSpacingSize * 0.8),
         }),
      },
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
      boxShadow: 1,
      borderRadius: 1,
      p: 0.5,
      background: "white",
      "& > *": {
         position: "relative",
         flex: 1,
      },
   },
} as const;
const HighlightItem = ({
   highLight: { id, videoUrl, thumbnail, logo },
   handleOpenVideoDialog,
}: HighlightItemProps) => {
   return (
      <Box onClick={() => handleOpenVideoDialog(videoUrl)} sx={styles.root}>
         <Box sx={styles.circleRoot}>
            <Box sx={styles.innerWrapper}>
               <Box sx={styles.imageWrapper}>
                  <Box
                     sx={styles.thumbnailImage}
                     layout="fill"
                     src={thumbnail}
                     component={Image}
                  />
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
