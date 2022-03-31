import Box from "@mui/material/Box"
import { SxProps } from "@mui/system"
import { Theme } from "@mui/material/styles"

const styles = {
   root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 5,
   },
}

interface Props {
   url: string
   sx?: SxProps<Theme>
   maxWidth?: number
}

const Video = ({ url, sx, maxWidth }: Props) => {
   return (
      <Box
         sx={[
            styles.root,
            {
               "& video": {
                  borderRadius: "inherit",
                  maxWidth,
               },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
         ]}
      >
         <video playsInline controls width="100%">
            <source src={url} type="video/mp4" />
         </video>
      </Box>
   )
}

export default Video
