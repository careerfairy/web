import { Box, Typography, Button, Stack } from "@mui/material"
import { sxStyles } from "types/commonTypes"
import {
   Star as StarIcon,
   Users as UsersIcon,
   TrendingUp as TrendingUpIcon,
} from "react-feather"
import { swipeToSparkByIndex } from "store/reducers/sparksFeedReducer"
import { useRouter } from "next/router"
import { useDispatch, useSelector } from "react-redux"
import { currentSparkIndexSelector } from "store/selectors/sparksFeedSelectors"
import Link from "next/link"

const styles = sxStyles({
   header: {
      mt: 9,
      textAlign: "center",

      "@media (max-height: 850px)": {
         mt: 3,
      },
   },
   title: {
      fontSize: "64px !important",
      fontWeight: "bold",
      lineHeight: "66px",

      "@media (max-height: 850px)": {
         fontSize: "32px !important",
         lineHeight: "34px",
      },
   },
   content: {
      display: "flex",
      flexDirection: "column",
      mx: 5,
      mt: "31px",
   },
   infoCard: {
      display: "flex",
      background: "white",
      borderRadius: "8px",
      height: "96px",
      alignItems: "center",
      px: 2,

      "@media (max-height: 700px)": {
         height: { md: "unset" },
      },
      "@media (max-height: 550px)": {
         height: "unset",
      },
   },
   icon: {
      mr: 1,

      "& svg": {
         color: (theme) => theme.palette.primary.main,

         "@media (max-height: 700px)": {
            height: { md: "24px" },
            width: { md: "24px" },
         },

         "@media (max-height: 550px)": {
            height: "24px",
            width: "24px",
         },
      },
   },
   infoText: {
      "@media (max-height: 700px)": {
         fontSize: "14px !important",
      },
   },
   actions: {
      position: "absolute",
      left: 0,
      bottom: "10%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",

      "@media (max-height: 600px)": {
         position: { md: "unset" },
         mt: 6,
      },

      "@media (max-height: 450px)": {
         position: "unset",
      },
   },
})

const SparkConversionFullCardNotification = () => {
   const dispatch = useDispatch()
   const currentSparkIndex = useSelector(currentSparkIndexSelector)
   const { asPath } = useRouter()

   const handleSwipeToNext = () => {
      dispatch(swipeToSparkByIndex(currentSparkIndex + 1))
   }

   return (
      <Box>
         <Box sx={styles.header}>
            <Typography variant="brandedH1" sx={styles.title}>
               <Box component="span" color="primary.main">
                  Ignite
               </Box>{" "}
               your career
            </Typography>
         </Box>

         <Stack sx={styles.content} spacing={1}>
            <Box sx={styles.infoCard}>
               <Box sx={styles.icon}>
                  <StarIcon size="42" />
               </Box>

               <Typography
                  variant="brandedBody"
                  color="text.primary"
                  sx={styles.infoText}
               >
                  Get personalized career recommendations
               </Typography>
            </Box>

            <Box sx={styles.infoCard}>
               <Box sx={styles.icon}>
                  <UsersIcon size="42" />
               </Box>

               <Typography
                  variant="brandedBody"
                  color="text.primary"
                  sx={styles.infoText}
               >
                  Meet your future colleagues in our live streams
               </Typography>
            </Box>

            <Box sx={styles.infoCard}>
               <Box sx={styles.icon}>
                  <TrendingUpIcon size="42" />
               </Box>

               <Typography
                  variant="brandedBody"
                  color="text.primary"
                  sx={styles.infoText}
               >
                  Increase your chances to get your dream job by 80%
               </Typography>
            </Box>
         </Stack>

         <Box sx={styles.actions}>
            <Button
               color="primary"
               variant="contained"
               component={Link}
               href={`/login?absolutePath=${asPath}`}
            >
               Sign up now
            </Button>

            <Button color="info" variant="text" onClick={handleSwipeToNext}>
               Watch more Sparks
            </Button>
         </Box>
      </Box>
   )
}

export default SparkConversionFullCardNotification
