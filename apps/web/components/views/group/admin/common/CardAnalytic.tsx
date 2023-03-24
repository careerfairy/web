import { CircularProgress, Typography } from "@mui/material"
import CardCustom, { SubheaderLink } from "./CardCustom"
import { sxStyles } from "../../../../../types/commonTypes"
import React, { FC } from "react"
import { useGroup } from "../../../../../layouts/GroupDashboardLayout"
import useCountQuery from "../../../../custom-hook/useCountQuery"

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

type AggregationCardProps = Pick<Props, "value">
export const ATSCard: FC<AggregationCardProps> = (props) => {
   const { group } = useGroup()
   return (
      <CardAnalytic
         title="In-stream applications"
         value={props.value}
         linkDescription={"Go to applicants"}
         link={`/group/${group.id}/admin/ats-integration?section=1`}
      />
   )
}

export const TalentPoolCard: FC<AggregationCardProps> = (props) => {
   const { group } = useGroup()

   return (
      <CardAnalytic
         title="Talent Pool"
         value={props.value}
         linkDescription={"Go to talent pool"}
         link={`/group/${group.id}/admin/analytics/talent-pool?section=1`} // Should go to new talent pool page
      />
   )
}

export const AverageRegistrationsPerStreamCard: FC<AggregationCardProps> = (
   props
) => (
   <CardAnalytic title="Average registrations per stream" value={props.value} />
)

type RenderAsyncCountProps = ReturnType<typeof useCountQuery>

/**
 * Renders a count asynchronously.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {number} props.count - The count to be displayed.
 * @param {boolean} props.loading - Indicates if the count is currently being loaded.
 * @param {Error} props.error - Any error that occurred while loading the count.
 * @returns {JSX.Element} - The rendered component.
 */
export const RenderAsyncCount: FC<RenderAsyncCountProps> = ({
   count,
   error,
   loading,
}) => {
   if (loading) {
      return <CircularProgress color="secondary" size={30} />
   }

   if (error) {
      return <>0</>
   }

   return <>{count}</>
}
