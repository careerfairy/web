import React, { useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Collapse } from "@mui/material"
import BreakoutRoomBanner from "../../../banners/BreakoutRoomBanner"
import HandRaiseStreamerBanner from "../../../banners/HandRaiseStreamerBanner"
import { STREAM_ELEMENT_SPACING } from "../../../../../constants/streams"
import HandRaiseViewerBanner from "../../../banners/HandRaiseViewerBanner"
import { useRouter } from "next/router"
import { useCurrentStream } from "../../../../../context/stream/StreamContext"

const useStyles = makeStyles((theme) => ({
   bannerTop: {
      "& > :last-child": {},
      "& > *": {
         margin: theme.spacing(
            STREAM_ELEMENT_SPACING,
            STREAM_ELEMENT_SPACING,
            0
         ),
      },
   },
   bannerBottom: {
      "& > :last-child": {},
      "& > *": {
         margin: theme.spacing(
            0,
            STREAM_ELEMENT_SPACING,
            STREAM_ELEMENT_SPACING
         ),
      },
   },
}))

interface Props {
   presenter: boolean
   handRaiseActive: boolean
   isBottom?: boolean
   mobile: boolean
}
const Banners = ({ presenter, handRaiseActive, isBottom, mobile }: Props) => {
   const { currentLivestream } = useCurrentStream()
   const {
      query: { breakoutRoomId },
   } = useRouter()

   const [showBreakoutBanner, setShowBreakoutBanner] = useState(false)
   const [showViewerHandRaiseBanner, setShowViewerHandRaiseBanner] =
      useState(false)
   const [showStreamerHandRaiseBanner, setShowStreamerHandRaiseBanner] =
      useState(false)

   const classes = useStyles()
   useEffect(() => {
      setShowBreakoutBanner(Boolean(presenter && breakoutRoomId))
   }, [presenter, breakoutRoomId])

   useEffect(() => {
      setShowStreamerHandRaiseBanner(Boolean(presenter && handRaiseActive))
      setShowViewerHandRaiseBanner(
         Boolean(
            !presenter &&
               handRaiseActive &&
               !mobile &&
               currentLivestream?.hasStarted
         )
      )
   }, [presenter, handRaiseActive, mobile, currentLivestream?.hasStarted])

   return (
      <div className={isBottom ? classes.bannerBottom : classes.bannerTop}>
         <Collapse in={showViewerHandRaiseBanner} unmountOnExit>
            <HandRaiseViewerBanner />
         </Collapse>
         <Collapse in={showBreakoutBanner} unmountOnExit>
            <BreakoutRoomBanner />
         </Collapse>
         <Collapse in={showStreamerHandRaiseBanner} unmountOnExit>
            <HandRaiseStreamerBanner />
         </Collapse>
      </div>
   )
}

export default Banners
