import Image from "next/legacy/image"
import { PublicGroup } from "@careerfairy/shared-lib/groups"
import { Avatar, Box, Button, Typography } from "@mui/material"
import { getResizedUrl } from "components/helperFunctions/HelperFunctions"
import { useRouter } from "next/router"
import { FC, useCallback } from "react"
import { sxStyles } from "types/commonTypes"
import { companyNameSlugify } from "@careerfairy/shared-lib/utils"
import { useDispatch, useSelector } from "react-redux"
import { swipeToSparkByIndex } from "store/reducers/sparksFeedReducer"
import { currentSparkIndexSelector } from "store/selectors/sparksFeedSelectors"

const styles = sxStyles({
   content: {
      display: "flex",
      flexDirection: "column",
      alignSelf: "center",
      alignItems: "center",

      px: { xs: 2, md: 2, lg: 4 },
   },
   header: {
      textAlign: "center",
      mt: 4,
   },
   title: {
      fontWeight: "bold",

      "@media (max-height: 800px)": {
         fontSize: "22px !important",
      },
   },
   subtitle: {
      mt: 3,

      "@media (max-height: 800px)": {
         fontSize: "14px !important",
      },
   },
   actions: {
      display: "flex",
      flexDirection: "column",
      mt: 6,
      alignItems: "center",
   },
   btn: {
      border: "1.5px solid white",
      fontWeight: "bold",
      textTransform: "none",
   },
   backBtn: {
      textTransform: "none",
      mt: 2,
   },
   avatar: {
      width: (theme) => theme.spacing(15),
      height: (theme) => theme.spacing(15),
   },
   companyAvatar: {
      padding: 1,
      backgroundColor: "white",
      boxShadow: 3,
      border: "3px solid white !important",
      width: 110,
      height: 110,

      "@media (max-height: 700px)": {
         width: { md: 80 },
         height: { md: 80 },
      },
   },
   nextImageWrapper: {
      position: "relative",
      width: "100%",
      height: "100%",
   },
})

type Props = {
   group?: PublicGroup
}

const SparkGroupFullCardNotification: FC<Props> = ({ group }) => {
   const dispatch = useDispatch()
   const { push } = useRouter()
   const currentSparkIndex = useSelector(currentSparkIndexSelector)

   const handleBackToCompanyPageClick = useCallback(() => {
      void push(`/company/${companyNameSlugify(group.universityName)}`)
   }, [group.universityName, push])

   const handleSwipeToNext = useCallback(() => {
      dispatch(swipeToSparkByIndex(currentSparkIndex + 1))
   }, [currentSparkIndex, dispatch])

   return (
      <Box sx={styles.content}>
         <Avatar
            title={`${group.universityName}`}
            variant="circular"
            sx={styles.companyAvatar}
         >
            <Box sx={styles.nextImageWrapper}>
               <Image
                  src={getResizedUrl(group.logoUrl, "lg")}
                  layout="fill"
                  objectFit="contain"
                  quality={100}
                  alt={`logo of company ${group.universityName}`}
               />
            </Box>
         </Avatar>
         <Box sx={styles.header}>
            <Typography variant={"h3"} sx={styles.title}>
               That’s all from
            </Typography>
            <Typography variant={"h3"} sx={styles.title} mt={1}>
               {group.universityName}
            </Typography>

            <Typography variant={"h6"} sx={styles.subtitle}>
               But there are more Sparks to watch on our platform! Keep
               scrolling or click on the button to watch all Sparks
            </Typography>
         </Box>
         <Box sx={styles.actions}>
            <Button
               color="primary"
               variant="contained"
               onClick={handleSwipeToNext}
               sx={styles.btn}
            >
               Watch all Sparks
            </Button>

            <Button
               color="info"
               variant="text"
               onClick={handleBackToCompanyPageClick}
               sx={styles.backBtn}
            >
               Back to company page
            </Button>
         </Box>
      </Box>
   )
}

export default SparkGroupFullCardNotification
