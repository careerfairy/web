// @ts-ignore
import { Typography } from "@mui/material"
import { useCompanyPage } from ".."

const MentorsSection = () => {
   const { editMode, groupCreators } = useCompanyPage()

   console.log(editMode, JSON.stringify(groupCreators))

   return (
      <>
         <Typography variant="h4" fontWeight={"600"} color="black" mb={1}>
            Testimonials
         </Typography>
      </>
   )
}

export default MentorsSection
