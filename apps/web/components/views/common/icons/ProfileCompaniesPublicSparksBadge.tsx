import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon"
import ReactComponent from "public/sparks/profile-companies-public-sparks-badge.svg"

const ProfileCompaniesPublicSparksBadge = (props: SvgIconProps) => {
   return <SvgIcon component={ReactComponent} inheritViewBox {...props} />
}

export default ProfileCompaniesPublicSparksBadge
