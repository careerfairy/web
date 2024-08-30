import { Stack } from "@mui/material"

export const SectionsWrapper = ({ children }) => {
   return (
      <Stack spacing={5} marginBottom={10}>
         {children}
      </Stack>
   )
}
