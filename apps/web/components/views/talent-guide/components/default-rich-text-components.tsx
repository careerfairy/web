import { NodeRendererType } from "@graphcms/rich-text-react-renderer"
import { Box, Typography } from "@mui/material"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { sxStyles } from "types/commonTypes"

const ReactPlayer = dynamic(() => import("react-player"), {
   ssr: false,
})

const VIDEO_CONFIG = {
   file: {
      attributes: {
         playsInline: true,
      },
   },
}

const styles = sxStyles({
   link: {
      color: "primary.dark",
      cursor: "pointer",
   },
   image: {
      maxWidth: "100%",
      height: "auto",
   },
   player: {
      maxHeight: "calc(100vh - 150px)",
      display: "flex",
      justifyContent: "center",
      width: "100% !important",
      "& video": {
         width: "auto !important",
         borderRadius: 2,
      },
   },
})

export const createDefaultRichTextComponents = (
   isMobile: boolean
): NodeRendererType => {
   return {
      p: ({ children }) => (
         <Typography
            variant="medium"
            component="p"
            sx={{
               margin: "revert", // allows render of empty paragraphs
            }}
         >
            {children}
         </Typography>
      ),
      h1: ({ children }) => (
         <Typography
            variant={isMobile ? "mobileBrandedH1" : "desktopBrandedH1"}
            component="h1"
         >
            {children}
         </Typography>
      ),
      h2: ({ children }) => (
         <Typography
            variant={isMobile ? "mobileBrandedH2" : "desktopBrandedH2"}
            component="h2"
         >
            {children}
         </Typography>
      ),
      h3: ({ children }) => (
         <Typography
            variant={isMobile ? "mobileBrandedH3" : "desktopBrandedH3"}
            component="h3"
         >
            {children}
         </Typography>
      ),
      h4: ({ children }) => (
         <Typography
            variant={isMobile ? "mobileBrandedH4" : "desktopBrandedH4"}
            component="h4"
         >
            {children}
         </Typography>
      ),
      h5: ({ children }) => (
         <Typography variant="brandedH5" component="h5">
            {children}
         </Typography>
      ),
      h6: ({ children }) => (
         <Typography variant="h6" component="h6">
            {children}
         </Typography>
      ),
      img: ({ title, altText, height, width, src }) => (
         <Box display="flex" justifyContent="center">
            <Image
               alt={altText || title}
               quality={100}
               height={height}
               width={width}
               // loader={HygraphImageLoader} TODO: fix this not working, see example in https://github.com/hygraph/hygraph-examples/blob/master/with-nextjs-image-loader/pages/index.js
               src={src}
               style={styles.image}
            />
         </Box>
      ),
      a: ({ children, openInNewTab, href, rel, ...rest }) => {
         if (href.match(/^https?:\/\/|^\/\//i)) {
            return (
               <Box
                  sx={styles.link}
                  component={"a"}
                  href={href}
                  target={openInNewTab ? "_blank" : "_self"}
                  rel={rel || "noopener noreferrer"}
                  {...rest}
               >
                  {children}
               </Box>
            )
         }

         return (
            <Box component={Link} sx={styles.link} href={href} {...rest}>
               {children}
            </Box>
         )
      },
      video: ({ src }) => (
         <Box
            id="react-player-rich-text"
            component={ReactPlayer}
            url={src}
            controls
            playsinline
            sx={styles.player}
            config={VIDEO_CONFIG}
         />
      ),
   }
}
