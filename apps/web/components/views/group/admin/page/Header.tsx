import { useCompanyPage } from "./index"
import { Box } from "@mui/material"
import { getResizedUrl } from "../../../../helperFunctions/HelperFunctions"
import Image from "next/image"
import { StylesProps } from "../../../../../types/commonTypes"

const styles: StylesProps = {
   imageWrapper: {
      width: "100%",
      height: "300px",
      position: "relative",
   },
}

const Header = () => {
   const { group } = useCompanyPage()

   return (
      <>
         <Box sx={styles.imageWrapper}>
            <Image
               src={getResizedUrl(group?.bannerImageUrl, "lg")}
               alt={group.universityName}
               layout="fill"
               objectFit="cover"
            />
         </Box>
      </>
   )
}

export default Header
