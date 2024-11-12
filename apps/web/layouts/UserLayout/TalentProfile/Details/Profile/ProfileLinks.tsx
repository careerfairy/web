import { Box } from "@mui/material"
import { Link } from "react-feather"
import { EmptyItemView } from "./EmptyItemView"
import { ProfileItem } from "./ProfileItem"

import { sxStyles } from "types/commonTypes"

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

export const ProfileLinks = ({ hasItems }: Props) => {
   const handleAdd = () => alert("Todo add")

   return (
      <ProfileItem hasItems={hasItems} title="Links" handleAdd={handleAdd}>
         <Box sx={styles.emptyLinksRoot}>
            <EmptyItemView
               title={"Share your links"}
               description={
                  "Add any relevant links to your profile, such as your GitHub, portfolio, or personal website."
               }
               addButtonText={"Add links"}
               handleAdd={handleAdd}
               icon={<Box component={Link} sx={styles.icon} />}
            />
         </Box>
      </ProfileItem>
   )
}
