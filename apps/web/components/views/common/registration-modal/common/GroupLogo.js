import React from "react"
import { CardMedia } from "@mui/material"
import Image from "next/legacy/image"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   media: {
      display: "flex",
      justifyContent: "center",
      padding: "1.5em 1em 1em 1em",
      p: 1,
      height: {
         xs: 100,
         sm: 150,
      },
      maxWidth: 350,
      alignSelf: "center",
      margin: "0 auto",
      "& img": {
         objectFit: "contain",
         maxWidth: "80%",
         padding: 1,
         borderRadius: 1,
         background: "common.white",
      },
   },
})
const GroupLogo = ({ logoUrl, alt = "" }) => {
   return (
      <CardMedia sx={styles.media}>
         {logoUrl && (
            <Image
               src={getResizedUrl(logoUrl, "md")}
               width={350}
               height={150}
               alt={alt}
            />
         )}
      </CardMedia>
   )
}

export default GroupLogo
