import { Typography } from "@mui/material"
import CardCustom, { SubheaderLink } from "./CardCustom"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   value: {
      fontSize: "3.43rem",
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
      <CardCustom title={title} helpTooltip={tooltip} subHeader={subHeader}>
         <Typography mt={1} sx={styles.value} align="right">
            {value}
         </Typography>
      </CardCustom>
   )
}
