import { sxStyles } from "@careerfairy/shared-ui"
import { Button } from "@mui/material"
import Link from "next/link"
import { useRouter } from "next/router"
import { ChevronLeft } from "react-feather"

const styles = sxStyles({
   backButton: {
      position: "absolute",
      top: 8,
      left: 18,
      padding: "8px",
   },
})

export const BackButton = () => {
   const router = useRouter()

   return (
      <Button
         variant="text"
         color="grey"
         startIcon={<ChevronLeft />}
         LinkComponent={Link}
         href={
            router.query.companyName
               ? `/company/${encodeURIComponent(
                    router.query.companyName as string
                 )}`
               : "/"
         }
         sx={styles.backButton}
      >
         Back
      </Button>
   )
}
