import { Stack } from "@mui/material"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import { ProfileMoreDots } from "./ProfileMoreDots"

const styles = sxStyles({
   cardRoot: {
      justifyContent: "space-between",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      backgroundColor: (theme) => theme.brand.white[100],
   },
   contentWrapper: {
      p: "16px 12px",
      width: "100%",
   },
   contentWrapperClickable: {
      cursor: "pointer",
   },
})

type ProfileCardProps = {
   children: ReactNode
   editText: string
   deleteText: string
   handleEdit: () => void
   handleDelete: () => void
   href?: string
}

export const ProfileItemCard = (props: ProfileCardProps) => {
   const { children, editText, deleteText, handleDelete, handleEdit, href } =
      props

   const handleClick = () => {
      if (href) {
         window.open(href, "_blank")
      }
   }

   return (
      <Stack direction={"row"} sx={styles.cardRoot}>
         <Stack
            direction={"row"}
            spacing={1.5}
            sx={[
               styles.contentWrapper,
               href ? styles.contentWrapperClickable : null,
            ]}
            onClick={handleClick}
         >
            {children}
         </Stack>
         <ProfileMoreDots
            editText={editText}
            deleteText={deleteText}
            handleEditClick={handleEdit}
            handleDeleteClick={handleDelete}
         />
      </Stack>
   )
}
