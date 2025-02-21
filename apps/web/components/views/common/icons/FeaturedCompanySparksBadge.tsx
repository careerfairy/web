import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/sparks/featured-company-public-sparks-badge.svg"

const FeaturedCompanySparksBadge = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} inheritViewBox {...props} />
}

export default FeaturedCompanySparksBadge
