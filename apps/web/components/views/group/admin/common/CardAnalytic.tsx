import Link from "../../../common/Link"
import { Box, Typography } from "@mui/material"
import { ChevronRight } from "react-feather"
import CardCustom from "./CardCustom"
import { sxStyles } from "../../../../../types/commonTypes"

const styles = sxStyles({
   value: {
      fontSize: "3.43rem",
   },
   subheaderLink: {
      textDecoration: "none",
      fontWeight: 600,
   },
   subheaderIcon: {
      width: "18px",
      marginLeft: "5px",
   },
})

type Props = {
   title: string
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
export const SubheaderLink = ({
   link,
   title,
}: {
   link: string
   title: string
}) => {
   return (
      <Link href={link} color="secondary" sx={styles.subheaderLink}>
         <Box display="flex" mt={1}>
            <span>{title}</span>
            <ChevronRight style={styles.subheaderIcon} />
         </Box>
      </Link>
   )
}
