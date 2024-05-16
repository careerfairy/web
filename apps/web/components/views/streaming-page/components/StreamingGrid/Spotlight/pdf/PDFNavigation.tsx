import { IconButton, Stack, Typography } from "@mui/material"
import { useUpdatePresentationPageNumber } from "components/custom-hook/streaming/useUpdatePresentationPageNumber"
import { useStreamingContext } from "components/views/streaming-page/context"
import { ChevronLeft, ChevronRight } from "react-feather"
import { sxStyles } from "types/commonTypes"

const styles = sxStyles({
   root: {
      position: "absolute",
      left: "50%",
      bottom: 16,
      transform: "translate(-50%)",

      borderRadius: "8px",
      border: `1px solid`,
      borderColor: "neutral.50",
      background: `rgba(250, 250, 254, 0.85)`,
      backdropFilter: "blur(25px)",
      p: 1,
   },
   button: {
      p: 0,
      borderRadius: "4px",
      width: 24,
      height: 24,
      backgroundColor: (theme) => theme.brand.white[500],
      "& svg": {
         color: (theme) => theme.palette.neutral[800] + " !important",
      },
   },
   pageNumber: {
      userSelect: "none",
   },
})

type PDFNavigationProps = {
   page: number
   totalPages: number
}

export const PDFNavigation = ({ page, totalPages }: PDFNavigationProps) => {
   const { livestreamId } = useStreamingContext()
   const { trigger: updatePresentationPageNumber, isMutating } =
      useUpdatePresentationPageNumber(livestreamId)

   const prevDisabled = page === 1 || isMutating
   const nextDisabled = page === totalPages || isMutating
   return (
      <Stack spacing={1.5} direction="row" sx={styles.root}>
         <Stack direction="row" spacing={0.5}>
            <IconButton
               disabled={prevDisabled}
               sx={styles.button}
               onClick={() => updatePresentationPageNumber(-1)}
            >
               <ChevronLeft />
            </IconButton>
            <IconButton
               disabled={nextDisabled}
               sx={styles.button}
               onClick={() => updatePresentationPageNumber(1)}
            >
               <ChevronRight />
            </IconButton>
         </Stack>
         <Typography sx={styles.pageNumber} variant="small" color="neutral.800">
            {page} of {totalPages}
         </Typography>
      </Stack>
   )
}
