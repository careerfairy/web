import React from "react"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
type Props = {
   preview: boolean
}
const Alert = ({ preview }: Props) => {
   return (
      <Box
         className={cn("border-b", {
            "bg-accent-7 border-accent-7 text-white": preview,
            "bg-accent-1 border-accent-2": !preview,
         })}
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
                     <a
                        href={`https://github.com/vercel/next.js/tree/canary/examples/${EXAMPLE_PATH}`}
                        className="underline hover:text-success duration-200 transition-colors"
                     >
                        available on GitHub
                     </a>
                     .
                  </>
               )}
            </Box>
         </Container>
      </Box>
   )
}

export default Alert
