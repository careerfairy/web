import { Stack } from "@mui/material"
import { ReactNode } from "react"
import { sxStyles } from "types/commonTypes"
import { ProfileMoreDots } from "./ProfileMoreDots"

const styles = sxStyles({
   cardRoot: {
      justifyContent: "space-between",
      p: "16px 10px 12px 12px",
      borderRadius: "8px",
      border: (theme) => `1px solid ${theme.brand.white[500]}`,
      backgroundColor: (theme) => theme.brand.white[100],
   },
})

type ProfileCardProps = {
   children: ReactNode
   editText: string
   deleteText: string
   handleEdit: () => void
   handleDelete: () => void
}

export const ProfileItemCard = (props: ProfileCardProps) => {
   const { children, editText, deleteText, handleDelete, handleEdit } = props

   return (
      <Stack direction={"row"} sx={styles.cardRoot}>
         <Stack direction={"row"} spacing={1.5}>
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
