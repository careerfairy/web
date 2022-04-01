import React from "react"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"

const Alert = () => {
   return (
      <Box
         sx={{
            borderBottom: "thin",
            bgcolor: "warning.dark",
            color: "white",
            borderRadius: 2,
            position: "fixed",
            zIndex: 1,
            top: 65,
            right: "50%",
            transform: "translateX(50%)",
         }}
      >
         <Container>
            <Box
               sx={{ py: 2, textAlign: "center" }}
               className="py-2 text-center text-sm"
            >
               This page is a preview.{" "}
               <Box
                  component="a"
                  href="/api/exit-preview"
                  sx={{
                     textDecoration: "underline",
                     transition: (theme) => theme.transitions.create(["color"]),
                     color: "secondary",
                     "&:hover": {
                        color: "primary",
                     },
                  }}
               >
                  Click here
               </Box>{" "}
               to exit preview mode.
            </Box>
         </Container>
      </Box>
   )
}

export default Alert
