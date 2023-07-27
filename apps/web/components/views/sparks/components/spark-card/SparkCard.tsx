import Box from "@mui/material/Box"
import Image from "next/image"
import { FC } from "react"
import { sxStyles } from "types/commonTypes"

const placeholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-pages%2F1dGZnHVaeYaz1KuLHvei%2Fphotos%2F210124b5-b6cb-43b9-b78a-47c4560ece42?alt=media&token=def000b4-0357-4607-ab3c-8ffb3eae1b0a"

const styles = sxStyles({
   root: {
      display: "flex",
      height: {
         xs: 405,
         md: 443,
      },
      width: "100%",
      objectFit: "cover",
      borderRadius: 3,
      overflow: "hidden",
      position: "relative",

      "&::after": {
         content: '""',
         position: "absolute",
         top: 0,
         right: 0,
         bottom: 0,
         left: 0,
         background: `linear-gradient(180deg, rgba(0, 0, 0, 0.60) 0%, rgba(0, 0, 0, 0) 17.71%), linear-gradient(180deg, rgba(0, 0, 0, 0) 82.29%, rgba(0, 0, 0, 0.60) 100%)`,
         zIndex: -1,
      },
   },
   img: {
      zIndex: -1,
      objectPosition: "top",
   },
})

type Props = {}

const SparkCard: FC<Props> = (props) => {
   return (
      <Box sx={styles.root}>
         <Box
            component={Image}
            src={placeholder}
            alt="Your alt text"
            objectFit="cover"
            layout="fill"
            sx={styles.img}
         />
      </Box>
   )
}

export default SparkCard
