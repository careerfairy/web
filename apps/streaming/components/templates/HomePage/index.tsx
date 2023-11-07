import { Box, Typography, Button, Stack } from "@mui/material"

import { Content } from "./styled"
import { Button as SharedButton } from "@careerfairy/shared-ui"

export const HomePage = () => {
   return (
      <Content>
         <Typography variant="h1">Home Page</Typography>
         <SharedButton onClick={() => console.log("UI button")}>
            UI button
         </SharedButton>
         <Box my={0.5} />
         <SharedButton onClick={() => console.log("Material UI button")}>
            Button from Theme
         </SharedButton>
         <Box my={0.5} />

         <Button disabled variant="contained" size="small">
            small button
         </Button>
         <Box my={0.5} />

         <Button variant="contained" size="medium">
            medium button
         </Button>
         <Box my={0.5} />

         <Button variant="contained" color="secondary" size="large">
            large button
         </Button>
      </Content>
   )
}
