import { Box } from "@mui/material"
import { Globe } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileItem } from "./ProfileItem"

const styles = sxStyles({
   emptyLinksRoot: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: "16px 12px",
      backgroundColor: (theme) => theme.brand.white[300],
      border: (theme) => `1px solid ${theme.brand.white[400]}`,
      borderRadius: "8px",
   },
   icon: {
      width: "36px",
      height: "36px",
   },
})

type Props = {
   hasItems?: boolean
}

export const ProfileLanguages = ({ hasItems }: Props) => {
   const handleAdd = () => alert("Todo add language form")

   return (
      <ProfileItem hasItems={hasItems} title="Languages" handleAdd={handleAdd}>
         <ProfileLanguagesDetails />
      </ProfileItem>
   )
}

const ProfileLanguagesDetails = () => {
   const handleAdd = () => alert("Todo add language form")
   return (
      <Box sx={styles.emptyLinksRoot}>
         <EmptyItemView
            title="Language buffet"
            description="What languages can you feast on? Select all that apply."
            addButtonText={"Select languages"}
            handleAdd={handleAdd}
            icon={<Box component={Globe} sx={styles.icon} />}
         />
      </Box>
   )
}
