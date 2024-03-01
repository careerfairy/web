import { FC } from "react"
import { PlusCircle } from "react-feather"
import { Box, Button } from "@mui/material"
import { sxStyles } from "@careerfairy/shared-ui"
import useIsMobile from "components/custom-hook/useIsMobile"

const styles = sxStyles({
   container: (theme) => ({
      display: "flex",
      justifyContent: "center",
      width: "100%",
      height: "74px",
      border: `1px solid ${theme.brand.white[500]}`,
      borderRadius: "12px",
      background: `linear-gradient(0deg, #FFFFFF, #FFFFFF), linear-gradient(0deg, ${theme.brand.white[500]}, ${theme.brand.white[500]})`,
   }),
   button: {
      fontWeight: 600,
      padding: "28px",
      borderRadius: "12px",
   },
})

type AddQuestionButtonProps = {
   handleClick: () => void
}

const AddQuestionButton: FC<AddQuestionButtonProps> = ({ handleClick }) => {
   const isMobile = useIsMobile()
   return (
      <Box sx={styles.container}>
         <Button
            sx={styles.button}
            startIcon={<PlusCircle strokeWidth={2.5} />}
            color="secondary"
            fullWidth
            onClick={handleClick}
         >
            {isMobile ? "Question" : "Add question"}
         </Button>
      </Box>
   )
}

export default AddQuestionButton
