import { Box, Typography } from "@mui/material"
import CompanyPhotos from "./CompanyPhotos"

const MediaSection = () => {
   return (
      <Box
         borderRadius={{
            xs: 0,
            mobile: 4,
         }}
         p={3}
         bgcolor={"background.default"}
      >
         <CompanyPhotos />
         <Typography variant="h4" fontWeight={"600"} color="black">
            Videos
         </Typography>
      </Box>
   )
}

export default MediaSection
