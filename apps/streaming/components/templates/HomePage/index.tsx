import { Box, Typography } from "@mui/material"

import { Content } from "./styled"
import { Button } from "@careerfairy/ui"

export const HomePage = () => {
   return (
      <Content>
         <Typography
            variant="h6"
            sx={{ mb: 1.5, color: (theme) => theme.brand.blue }}
         >
            Home Page
         </Typography>
         <Button onClick={() => console.log("UI button")}>UI button</Button>
         <Box my={0.5} />
         <Button onClick={() => console.log("Material UI button")}>
            Button from Theme
         </Button>
      </Content>
   )
}
