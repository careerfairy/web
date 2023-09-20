import Box from "@mui/material/Box"
import { FC, useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import AspectRatio from "../common/AspectRatio"
import useSparksFeedIsFullScreen from "./hooks/useSparksFeedIsFullScreen"
import Image from "next/image"
import { sadEmoji } from "constants/images"
import { Button, Stack, Typography } from "@mui/material"
import Link from "../common/Link"
import { useDispatch } from "react-redux"
import {
   fetchNextSparks,
   resetSparksFeed,
   setSparkCategories,
} from "store/reducers/sparksFeedReducer"

const styles = sxStyles({
   root: {
      width: "100%",
   },
   inner: {
      borderRadius: 3.25,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: "#F3F3F5",
      alignItems: "center",
      justifyContent: "center",
      "& .MuiButton-root": {
         textTransform: "none",
         fontSize: "1.14286rem",
      },
   },
   title: {
      color: "primary.600",
      textAlign: "center",
      fontSize: {
         sparksFullscreen: "1.71429rem",
         xs: "1.42857rem",
      },
      fontWeight: 700,
      lineHeight: "150%",
   },
   description: {
      color: "#3D3D47",
      textAlign: "center",
      fontSize: "1.14286rem",
      lineHeight: "1.92857rem",
   },
   backBtn: {
      color: "#8E8E8E",
   },
   clearBtn: {
      bgcolor: "primary.600",
   },
})

const EmptyFilterView: FC = () => {
   const isFullScreen = useSparksFeedIsFullScreen()

   const dispatch = useDispatch()

   const handleClearFilters = useCallback(() => {
      dispatch(resetSparksFeed())
      dispatch(setSparkCategories([]))
      dispatch(fetchNextSparks())
   }, [dispatch])

   return (
      <Box sx={styles.root}>
         <AspectRatio aspectRatio={isFullScreen ? null : "9:16"}>
            <Stack p={5.375} spacing={1} sx={styles.inner}>
               <Image
                  objectFit="contain"
                  alt="sad emoji"
                  quality={100}
                  width={133}
                  height={104}
                  src={sadEmoji}
               />
               <Box pb={1} />
               <Typography component="h2" sx={styles.title}>
                  Filtered Sparks not found
               </Typography>
               <Typography component="p" sx={styles.description}>
                  Sorry, we couldn’t find any Sparks matching your filtering
                  criteria.
               </Typography>
               <Box pb={2} />
               <Button
                  onClick={handleClearFilters}
                  variant="contained"
                  color="primary"
                  sx={styles.clearBtn}
               >
                  Clear filters
               </Button>
               <Box />
               <Button
                  sx={styles.backBtn}
                  component={Link}
                  href="/portal"
                  variant="text"
                  color="grey"
               >
                  Back to home page
               </Button>
            </Stack>
         </AspectRatio>
      </Box>
   )
}

export default EmptyFilterView
