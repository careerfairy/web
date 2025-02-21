import { Group } from "@careerfairy/shared-lib/groups"
import { InteractionSources } from "@careerfairy/shared-lib/groups/telemetry"
import {
   Box,
   Button,
   ClickAwayListener,
   Stack,
   SwipeableDrawer,
   Tooltip,
   TooltipProps,
   Typography,
   styled,
   tooltipClasses,
} from "@mui/material"
import { SuspenseWithBoundary } from "components/ErrorBoundary"
import useLivestreamCompanyHostSWR from "components/custom-hook/live-stream/useLivestreamCompanyHostSWR"
import {
   useStreamIsLandscape,
   useStreamIsMobile,
} from "components/custom-hook/streaming"
import useIsMobile from "components/custom-hook/useIsMobile"
import FollowButton from "components/views/common/company/FollowButton"
import { CompanyIcon } from "components/views/common/icons"
import CircularLogo from "components/views/common/logos/CircularLogo"
import Link from "next/link"
import { ComponentType, useState } from "react"
import { ExternalLink, MapPin, Tag, Users } from "react-feather"
import { sxStyles } from "types/commonTypes"
import { makeGroupCompanyPageUrl } from "util/makeUrls"
import { useStreamingContext } from "../../context"
import { SidePanelView } from "../SidePanel/SidePanelView"
import { CircularButton } from "./CircularButton"

const styles = sxStyles({
   contentWrapper: {
      display: "inline-flex",
      padding: "12px 16px",
      alignItems: "center",
      gap: 1.5,
      width: "100%",
      justifyContent: "center",
   },
   wrapperMobile: {
      gap: 2,
      padding: 0,
   },
   companyInfoWrapper: {
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      flex: "1 0 0",
   },
   viewerMinWidth: {
      minWidth: "200px",
   },
   companyInfoWrapperMaxWidth: {
      maxWidth: "250px",
   },
   companyInfo: {
      flex: "1 0 0",
   },
   companyInfoLandscape: {
      alignItems: "flex-start",
   },
   companyTitle: {
      fontWeight: 600,
      display: "inline-block",
   },
   companyTitleLimit: {
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
      mb: 0,
   },
   companyTitleMobile: {
      mb: 1,
   },
   actionButtonsWrapper: {
      justifyContent: "center",
      alignItems: "center",
      alignSelf: "stretch",
      gap: 1.5,
      borderRadius: 3,
      background: (theme) => theme.brand.black[100],
      flex: "1 0 0",
   },
   actionButtonsDesktop: {
      py: 1.5,
      px: 0.5,
   },
   actionButtonsMobile: {
      background: "unset",
   },
   actionButtonsLandscape: {
      py: 3,
      px: 3.5,
   },
   companyIcon: {
      display: "flex",
      gap: 0.5,
      color: (theme) => theme.palette.neutral["600"],
   },
   icon: {
      flexShrink: 0,
      width: "12px",
      height: "auto",
      alignSelf: "flex-start",
      paddingTop: "2px",
   },
   smallText: {
      fontWeight: 400,
      display: "flex",
   },
   textAlign: {
      textAlign: "center",
      alignItems: "center",
   },
   alignIcon: {
      minWidth: "fit-content",
   },
   visitButton: {
      color: (theme) => theme.brand.black[700],
      whiteSpace: "nowrap",
   },
   followButton: {
      fontSize: undefined,
   },
   paper: {
      borderRadius: "12px 12px 0 0",
   },
})

export const CompanyButton = () => {
   return (
      <SuspenseWithBoundary fallback={<></>}>
         <CompanyButtonLayout />
      </SuspenseWithBoundary>
   )
}

const CompanyButtonLayout = () => {
   const isMobile = useStreamIsMobile()
   const [isInfoOpen, setIsInfoOpen] = useState(false)
   const { livestreamId } = useStreamingContext()
   const { data: hostCompany } = useLivestreamCompanyHostSWR(livestreamId)

   const toggleInfoOpen = () => {
      setIsInfoOpen((tooltipOpen) => !tooltipOpen)
   }

   const closeTooltip = () => {
      setIsInfoOpen(false)
   }

   if (!hostCompany) return null

   return (
      <>
         {isMobile ? (
            <>
               <CompanyLogo
                  src={hostCompany.logoUrl}
                  alt={hostCompany.universityName}
                  onClick={toggleInfoOpen}
                  size={32}
               />

               <SwipeableDrawer
                  open={isInfoOpen}
                  onOpen={() => null}
                  onClose={toggleInfoOpen}
                  anchor="bottom"
                  PaperProps={{ sx: styles.paper }}
               >
                  <SidePanelView
                     id="company-panel"
                     title="Company Information"
                     icon={<CompanyIcon />}
                     handlePanelToggle={toggleInfoOpen}
                  >
                     <Content company={hostCompany} />
                  </SidePanelView>
               </SwipeableDrawer>
            </>
         ) : (
            <ClickAwayListener onClickAway={closeTooltip}>
               <Box>
                  <StyledTooltip
                     disableHoverListener
                     open={isInfoOpen}
                     title={<Content company={hostCompany} />}
                  >
                     <Box>
                        <CompanyLogo
                           src={hostCompany.logoUrl}
                           alt={hostCompany.universityName}
                           onClick={toggleInfoOpen}
                           size={40}
                        />
                     </Box>
                  </StyledTooltip>
               </Box>
            </ClickAwayListener>
         )}
      </>
   )
}

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
   <Tooltip {...props} classes={{ popper: className }} />
))({
   [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: "none",
      padding: 0,
   },
})

type Props = {
   company: Group
}

const Content = ({ company }: Props) => {
   const isMobile = useStreamIsMobile()
   const streamIsLandscape = useStreamIsLandscape()
   const { isHost } = useStreamingContext()

   return (
      <Stack
         sx={[styles.contentWrapper, isMobile && styles.wrapperMobile]}
         direction={isMobile && !streamIsLandscape ? "column" : "row"}
      >
         <Stack
            direction={isMobile ? "column" : "row"}
            sx={[
               styles.companyInfoWrapper,
               (isHost || !company.publicProfile) && styles.viewerMinWidth,
               !streamIsLandscape && styles.companyInfoWrapperMaxWidth,
               streamIsLandscape
                  ? styles.companyInfoLandscape
                  : isMobile && styles.textAlign,
            ]}
         >
            <Link
               href={makeGroupCompanyPageUrl(
                  company.universityName,
                  InteractionSources.Streaming_Page
               )}
               target="_blank"
            >
               <CompanyLogo
                  src={company.logoUrl}
                  alt={company.universityName}
                  size={isMobile ? 64 : 48}
               />
            </Link>

            <Stack
               sx={[
                  styles.companyInfo,
                  !isMobile && { overflow: "auto" },
                  isMobile && !streamIsLandscape && styles.textAlign,
               ]}
               gap={isMobile ? 1 : 0.5}
            >
               {company.universityName ? (
                  <Typography
                     variant="brandedBody"
                     sx={[
                        styles.companyTitle,
                        isMobile
                           ? styles.companyTitleMobile
                           : styles.companyTitleLimit,
                     ]}
                  >
                     {company.universityName}
                  </Typography>
               ) : null}

               {company.companyCountry.name ? (
                  <CompanyInfoIcon
                     icon={MapPin}
                     title={company.companyCountry.name}
                  />
               ) : null}

               {company.companyIndustries?.length > 0 && (
                  <CompanyInfoIcon
                     icon={Tag}
                     title={company.companyIndustries
                        .map((industry) => industry.name)
                        .join(", ")}
                  />
               )}
               {company.companySize ? (
                  <CompanyInfoIcon icon={Users} title={company.companySize} />
               ) : null}
            </Stack>
         </Stack>

         {!isHost && company.publicProfile ? (
            <Stack
               sx={[
                  styles.actionButtonsWrapper,
                  streamIsLandscape
                     ? styles.actionButtonsLandscape
                     : isMobile
                     ? styles.actionButtonsMobile
                     : styles.actionButtonsDesktop,
               ]}
            >
               <ActionButtons company={company} />
            </Stack>
         ) : null}
      </Stack>
   )
}

const ActionButtons = ({ company }: { company: Group }) => {
   return (
      <>
         <FollowButton
            variant="contained"
            size="small"
            sx={styles.followButton}
            group={company}
            interactionSource={InteractionSources.Streaming_Page}
         />
         <Button
            variant="text"
            size="small"
            sx={styles.visitButton}
            endIcon={<ExternalLink />}
            href={makeGroupCompanyPageUrl(
               company.universityName,
               InteractionSources.Streaming_Page
            )}
            target="_blank"
         >
            Company page
         </Button>
      </>
   )
}

type InfoIcon = {
   title: string
   icon: ComponentType
}

const CompanyInfoIcon = ({ icon, title }: InfoIcon) => {
   const isMobile = useIsMobile()
   return (
      <Box sx={styles.companyIcon}>
         <Box component={icon} sx={styles.icon} />
         <Box sx={[isMobile && styles.alignIcon, styles.smallText]}>
            <Typography variant="xsmall">{title}</Typography>
         </Box>
      </Box>
   )
}

type LogoButton = {
   src: string
   alt: string
   size: number
   onClick?: () => void
}

const CompanyLogo = ({ src, alt, size, onClick }: LogoButton) => {
   const isClickable = Boolean(onClick)

   return (
      <>
         <CircularButton
            sx={{ height: size, width: size }}
            disableRipple={isClickable}
            disableFocusRipple={isClickable}
            disableTouchRipple={isClickable}
            onClick={onClick}
         >
            {src ? (
               <CircularLogo alt={alt} src={src} size={size} />
            ) : (
               <CompanyIcon color="primary" />
            )}
         </CircularButton>
      </>
   )
}
