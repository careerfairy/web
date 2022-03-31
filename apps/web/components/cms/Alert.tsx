import React from "react"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
type Props = {
   preview: boolean
}
const Alert = ({ preview }: Props) => {
   return (
      <Box
         sx={{
            borderBottom: "thin",
            bgcolor: preview ? "warning.dark" : "white",
            color: preview ? "white" : "black",
            borderRadius: 2,
         }}
      >
         <Container>
            <Box
               sx={{ py: 2, textAlign: "center" }}
               className="py-2 text-center text-sm"
            >
               {preview ? (
                  <>
                     This page is a preview.{" "}
                     <Box
                        component="a"
                        href="/api/exit-preview"
                        sx={{
                           textDecoration: "underline",
                           transition: (theme) =>
                              theme.transitions.create(["color"]),
                           color: "secondary",
                           ":hover": {
                              color: "primary",
                           },
                        }}
                     >
                        Click here
                     </Box>{" "}
                     to exit preview mode.
                  </>
               ) : (
                  <>
                     The source code for this case study is{" "}
                     <Box
                        component={"a"}
                        sx={{
                           textDecoration: "underline",
                           transition: (theme) =>
                              theme.transitions.create(["color"]),
                           color: "primary",
                           ":hover": {
                              color: "secondary",
                           },
                        }}
                        href={`https://github.com/careerfairy/web/blob/feature/setup_case_studies/apps/web/pages/companies/customers/%5Bslug%5D.tsx`}
                     >
                        available on GitHub
                     </Box>
                     .
                  </>
               )}
            </Box>
         </Container>
      </Box>
   )
}

export default Alert
