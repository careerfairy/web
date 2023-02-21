import { Box, Typography } from "@mui/material"
import CompanyPhotos from "./CompanyPhotos"

const MediaSection = () => {
   return (
      <Box>
         <CompanyPhotos />
         <Typography variant="h4" fontWeight={"600"} color="black">
            Videos
         </Typography>
      </Box>
   )
}

export default MediaSection
