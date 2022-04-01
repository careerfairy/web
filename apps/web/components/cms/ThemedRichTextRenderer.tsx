import React from "react"
import { RichText } from "@graphcms/rich-text-react-renderer"
import { RichTextContent } from "@graphcms/rich-text-types"
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded"
import Link from "next/link"
import Image from "next/image"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import { GraphCMSImageLoader } from "./util"

type Props = {
   rawContent: RichTextContent
}
const ThemedRichTextRenderer = ({ rawContent }: Props) => {
   return (
      <RichText
         content={rawContent}
         renderers={{
            blockquote: ({ children }) => (
               <Box
                  component={"blockquote"}
                  sx={{
                     pl: 2,
                     borderLeft: "4px solid",
                     borderColor: "primary.dark",
                  }}
               >
                  <Typography>{children}</Typography>
               </Box>
            ),
            bold: ({ children }) => <b>{children}</b>,
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
            p: ({ children }) => (
               <Typography variant="body1">{children}</Typography>
            ),
            img: ({ title, altText, height, width, src }) => (
               <Image
                  alt={altText || title}
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
                        mb: 1,
                     },
                  }}
               >
                  {children}
               </Box>
            ),
            a: ({ children, openInNewTab, href, rel, ...rest }) => {
               if (href.match(/^https?:\/\/|^\/\//i)) {
                  return (
                     <Box
                        component={"a"}
                        href={href}
                        sx={{
                           color: "primary.dark",
                        }}
                        target={openInNewTab ? "_blank" : "_self"}
                        rel={rel || "noopener noreferrer"}
                        {...rest}
                     >
                        {children}
                     </Box>
                  )
               }

               return (
                  <Link href={href}>
                     <Box
                        component={"a"}
                        sx={{
                           color: "primary.dark",
                           cursor: "pointer",
                        }}
                        {...rest}
                     >
                        {children}
                     </Box>
                  </Link>
               )
            },
         }}
      />
   )
}

export default ThemedRichTextRenderer
