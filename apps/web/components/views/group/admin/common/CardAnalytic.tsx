import { Typography } from "@mui/material"
import CardCustom, { SubheaderLink } from "./CardCustom"
import { sxStyles } from "../../../../../types/commonTypes"
import React, { FC } from "react"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"

const styles = sxStyles({
   value: {
      fontSize: "3.43rem",
   },
   root: {
      "& .MuiCardContent-root": {
         mt: "auto",
      },
   },
})

type Props = {
   title: React.ReactNode
   tooltip?: string
   value: React.ReactNode
   link?: string
   linkDescription?: string
}
export const CardAnalytic = ({
   title,
   tooltip,
   value,
   link,
   linkDescription,
}: Props) => {
   const subHeader = link ? (
      <SubheaderLink link={link} title={linkDescription} />
   ) : undefined

   return (
      <CardCustom
         sx={styles.root}
         title={title}
         helpTooltip={tooltip}
         subHeader={subHeader}
      >
         <Typography mt={1} sx={styles.value} align="right">
            {value}
         </Typography>
      </CardCustom>
   )
}

type ATSCardProps = {
   value: number
}
export const ATSCard: FC<ATSCardProps> = ({ value }) => {
   const { group } = useGroup()
   return (
      <CardAnalytic
         title="In-stream applications"
         value={value}
         linkDescription={"Go to applicants"}
         link={`/group/${group.id}/admin/ats-integration?section=1`}
      />
   )
}
