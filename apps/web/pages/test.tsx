import React from "react"
import { Button } from "@mui/material"
import DashboardLayout from "../layouts/DashboardLayout"
import Stack from "@mui/material/Stack"

const Test = () => {
   return (
      <DashboardLayout headerTitle={"Test Page"}>
         <Stack p={3} spacing={2}>
            {Array.from({ length: 100 }, (_, i) => (
               <Button key={i} variant="contained" color="primary">
                  {i}
               </Button>
            ))}
         </Stack>
      </DashboardLayout>
   )
}

export default Test
