// material-ui
import { Box, styled } from "@mui/material"
import Stack, { StackProps } from "@mui/material/Stack"

// react feather
import { HelpCircle } from "react-feather"

// project imports
import { SettingsIcon } from "components/views/common/icons"
import { useGroup } from "."
import useIsMobile from "../../components/custom-hook/useIsMobile"
import { supportPageLink } from "../../constants/links"
import { NavLink } from "../common/NavList"
import { useGroupDashboard } from "./GroupDashboardLayoutProvider"

const Divider = styled(Box)({
   border: "1px solid #DDDDDD",
   width: "100%",
})

const LinksList = styled(Stack)(({ theme }) => ({
   padding: theme.spacing(0),
   justifyContent: "center",
   width: "100%",
}))

export const GroupBottomLinks = (props: StackProps) => {
   const { shrunkLeftMenuIsActive, group } = useGroup()
   const { setLeftDrawer, setMobileFullScreenMenu } = useGroupDashboard()
   const isMobile = useIsMobile()

   const handleMobileNavigate = () => {
      if (isMobile) {
         setMobileFullScreenMenu(false)
         setLeftDrawer(false)
      }
   }

   return (
      <LinksList spacing={2} {...props}>
         <Divider />
         <NavLink
            href={`/group/${group.id}/admin/settings/general`}
            pathname={`/group/[groupId]/admin/settings/general`}
            activePathPrefix={`/group/[groupId]/admin/settings`}
            id={"settings-page"}
            baseTextColor={"text.primary"}
            title={shrunkLeftMenuIsActive ? "" : "Settings"}
            Icon={SettingsIcon}
            shallow
            onMobileNavigate={handleMobileNavigate}
         />
         <NavLink
            href={supportPageLink}
            id={"support-page"}
            baseTextColor={"text.primary"}
            title={shrunkLeftMenuIsActive ? "" : "Support"}
            Icon={HelpCircle}
            external
            onMobileNavigate={handleMobileNavigate}
         />
      </LinksList>
   )
}
