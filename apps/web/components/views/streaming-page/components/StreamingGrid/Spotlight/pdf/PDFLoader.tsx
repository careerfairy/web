import { Box, CircularProgress } from "@mui/material"
import { sxStyles } from "types/commonTypes"

type Props = {
   parentHeight: number
   aspectRatio: number | string
}

const styles = sxStyles({
   container: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: (theme) => theme.brand.white[500],
   },
})

export const PDFLoader = ({ parentHeight, aspectRatio }: Props) => (
   <Box
      sx={[
         styles.container,
         {
            height: parentHeight,
            aspectRatio: aspectRatio || "auto",
         },
      ]}
   >
      <CircularProgress
         size={40}
         sx={{
            color: (theme) => theme.brand.black[700],
            opacity: 0.5,
         }}
      />
   </Box>
)
