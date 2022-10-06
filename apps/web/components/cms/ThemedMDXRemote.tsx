import React from "react"
import Image from "next/image"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import { GraphCMSImageLoader } from "./util"
import Fade from "@stahl.luke/react-reveal/Fade"
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote"
import Link from "../views/common/Link"

const ThemedMDXRemote = (props: MDXRemoteProps) => {
   return (
      <MDXRemote
         {...props}
         components={{
            ...props.components,
            blockquote: ({ children }) => (
               <Fade bottom>
                  <Box
                     component={"blockquote"}
                     sx={{
                        pl: 2,
                        borderLeft: "4px solid",
                        borderColor: "secondary.dark",
                     }}
                  >
                     <Typography>{children}</Typography>
                  </Box>
               </Fade>
            ),
            bold: ({ children }) => (
               <Box sx={{ color: "secondary.main", display: "inline" }}>
                  <b>{children}</b>
               </Box>
            ),
            italic: ({ children }) => <em>{children}</em>,
            underline: ({ children }) => <u>{children}</u>,
            h6: ({ children }) => (
               <Typography variant="h6">{children}</Typography>
            ),
            h5: ({ children }) => (
               <Typography variant="h5">{children}</Typography>
            ),
            h4: ({ children }) => (
               <Typography variant="h4">{children}</Typography>
            ),
            h3: ({ children }) => (
               <Typography variant="h3">{children}</Typography>
            ),
            h2: ({ children }) => (
               <Typography variant="h2">{children}</Typography>
            ),
            h1: ({ children }) => (
               <Typography variant="h1">{children}</Typography>
            ),
            p: ({ children }) => <Typography>{children}</Typography>,
            img: ({ title, height, width, src }) => (
               <Image
                  alt={title}
                  height={height}
                  width={width}
                  loader={GraphCMSImageLoader}
                  src={src}
               />
            ),
            ul: ({ children }) => <Box component={"ul"}>{children}</Box>,
            li: ({ children }) => (
               <Box
                  component={"li"}
                  sx={{
                     listStyleImage: "url(/check-icon.svg)",
                     "&:not(:last-child)": {
                        mb: 2,
                     },
                  }}
               >
                  {children}
               </Box>
            ),
            a: ({ children, href, ...rest }) => {
               if (href.match(/^https?:\/\/|^\/\//i)) {
                  return (
                     <Link
                        href={href}
                        sx={{
                           color: "secondary.dark",
                        }}
                        target={"_blank"}
                        rel={"noopener noreferrer"}
                        {...rest}
                        noLinkStyle
                     >
                        {children}
                     </Link>
                  )
               }

               return (
                  <Link
                     sx={{
                        color: "secondary.dark",
                        cursor: "pointer",
                     }}
                     {...rest}
                     href={href}
                     noLinkStyle
                  >
                     {children}
                  </Link>
               )
            },
         }}
      />
   )
}

export default ThemedMDXRemote
