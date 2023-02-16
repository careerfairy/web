import { Box, Typography } from "@mui/material"
import { useCompanyPage } from "./index"
import { StylesProps } from "../../../../../types/commonTypes"

// react feather
import {
   MapPin as MapPinIcon,
   Tag as TagIcon,
   Users as UsersIcon,
} from "react-feather"
import { useCallback, useMemo } from "react"

const styles: StylesProps = {
   wrapper: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
   },
   iconsWrapper: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      mt: 3,
   },
   icon: {
      display: "flex",
      ml: { md: 5 },
      mt: { xs: 1, md: "unset" },
   },
}
const AboutSection = () => {
   const { group } = useCompanyPage()
   const { companyCountry, companyIndustry, companySize, description } = group

   const showIcons = useMemo(
      () => companySize || companyIndustry?.name || companyCountry?.name,
      [companyCountry?.name, companyIndustry?.name, companySize]
   )

   const renderIcons = useCallback(
      () => (
         <Box sx={styles.iconsWrapper}>
            {companyCountry?.name ? (
               <Box display={"flex"}>
                  <MapPinIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companyCountry.name}
                  </Typography>
               </Box>
            ) : null}

            {companyIndustry?.name ? (
               <Box sx={styles.icon}>
                  <TagIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companyIndustry.name}
                  </Typography>
               </Box>
            ) : null}

            {companySize ? (
               <Box sx={styles.icon}>
                  <UsersIcon size={20} />
                  <Typography variant="body1" color="black" ml={1}>
                     {companySize}
                  </Typography>
               </Box>
            ) : null}
         </Box>
      ),
      [companyCountry?.name, companyIndustry?.name, companySize]
   )

   return (
      <Box sx={styles.wrapper}>
         <Box>
            <Typography variant="h4" fontWeight={"600"} color="black">
               About
            </Typography>
         </Box>
         {showIcons ? renderIcons() : null}
         <Box mt={2}>
            <Typography variant="h6" fontWeight={400} color="black">
               {description}
            </Typography>
         </Box>
      </Box>
   )
}

export default AboutSection
