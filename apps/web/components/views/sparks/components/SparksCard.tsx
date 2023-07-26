import { FC } from "react"
import { sxStyles } from "types/commonTypes"
import Box from "@mui/material/Box"

const styles = sxStyles({
   root: {
      display: "flex",
      height: "443px",
      width: "100%",
      objectFit: "cover",
      borderRadius: 3,
      overflow: "hidden",
   },
})

type Props = {}

const placeholder =
   "https://firebasestorage.googleapis.com/v0/b/careerfairy-e1fd9.appspot.com/o/company-pages%2F1dGZnHVaeYaz1KuLHvei%2Fphotos%2F210124b5-b6cb-43b9-b78a-47c4560ece42?alt=media&token=def000b4-0357-4607-ab3c-8ffb3eae1b0a"

const SparksCard: FC<Props> = (props) => {
   return (
      <Box
         component="img"
         sx={styles.root}
         src={placeholder}
         alt="Your alt text"
      />
   )
}

export default SparksCard
