import { EmoteType } from "@careerfairy/shared-lib/livestreams"
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined"
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined"
import Box from "@mui/material/Box"
import RubberBand from "@stahl.luke/react-reveal/RubberBand"
import clsx from "clsx"
import { EmoteEntity, EmoteMessage } from "context/agora/RTMContext"
import {
   memo,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useState,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import { TransitionGroup } from "react-transition-group"
import { emotesSelector } from "store/selectors/streamSelectors"
import { sxStyles } from "types/commonTypes"
import { v4 as uuidv4 } from "uuid"
import TutorialContext from "../../../../context/tutorials/TutorialContext"
import * as actions from "../../../../store/actions"
import ClappingSVG from "../../../util/CustomSVGs"
import { EMOTE_MESSAGE_TEXT_TYPE } from "../../../util/constants"
import { useFallbackEmotes } from "./useFallbackEmotes"

const styles = ({ right, color, durationTransform, opacity, distance }) =>
   sxStyles({
      actionBtn: {
         borderRadius: "50%",
         backgroundColor: color,
         width: 50,
         height: 50,
         boxShadow: (theme) => theme.shadows[10],
         position: "absolute",
         top: "50%",
         left: "50%",
         transform: "translate(-50%, -50%)",
      },
      image: {
         color: "white",
         position: "absolute",
         top: "50%",
         left: "50%",
         transform: "translate(-50%, -50%)",
         width: "25px",
         height: "25px",
      },
      animatedBox: {
         transition: `transform ${durationTransform}ms ease-in, opacity ${durationTransform}ms cubic-bezier(1,0,.83,.67)`,
         position: "absolute",
         opacity: opacity,
         right: right,
         transform: `translateY(${distance}vh)`,
         "-moz-transform": `translateY(${distance}vh)`,
         "-o-transform": `translateY(${distance}vh)`,
         "-webkit-transform": `translateY(${distance}vh)`,
      },
   })

const START_DISTANCE = 0
const ActionButton = ({ iconName, color }) => {
   const [distance, setDistance] = useState(START_DISTANCE)
   const [opacity, setOpacity] = useState(1)
   useEffect(() => {
      setDistance(-100)
      setOpacity(0)
   }, [])

   const durationTransform = useMemo(() => randomInteger(3500, 4500), [])
   const right = useMemo(() => getRandomHorizontalPosition(90), [])

   const classes = styles({
      color,
      distance,
      right,
      durationTransform,
      opacity,
   })

   const renderIcon = () => {
      if (iconName === "like") {
         return <ThumbUpAltOutlinedIcon sx={classes.image} fontSize="medium" />
      } else if (iconName === "clapping") {
         return <ClappingSVG style={classes.image} />
      } else {
         return (
            <FavoriteBorderOutlinedIcon sx={classes.image} fontSize="medium" />
         )
      }
   }

   return (
      <Box sx={classes.animatedBox}>
         <RubberBand style={{ position: "absolute" }}>
            <Box sx={classes.actionBtn}>{renderIcon()}</Box>
         </RubberBand>
      </Box>
   )
}

const ActionButtonMemoized = memo(ActionButton)

const emotes = [
   EmoteType.CLAPPING,
   EmoteType.LIKE,
   EmoteType.HEART,
   EmoteType.CONFUSED,
] as const

function IconsContainer({ className, livestreamId }) {
   const emotesData = useSelector(emotesSelector)
   const { showBubbles, setShowBubbles } = useContext(TutorialContext)

   /**
    * If the RTM fails to connect, will dispatch emotes from Firestore
    */
   useFallbackEmotes(livestreamId)

   const dispatch = useDispatch()

   const simulateEmotes = useCallback(() => {
      const index = randomInteger(1, 3)
      const memberId: EmoteMessage["memberId"] = uuidv4()
      const message: EmoteEntity = {
         textType: EMOTE_MESSAGE_TEXT_TYPE,
         emoteType: emotes[index - 1],
         timestamp: new Date().getTime(),
      }
      dispatch(actions.setEmote(message, memberId))
   }, [dispatch])

   useEffect(() => {
      if (showBubbles) {
         let count = 0
         const interval = setInterval(() => {
            count = count + 1
            if (count === 10) {
               setShowBubbles(false)
            }
            simulateEmotes()
         }, 200)
         return () => clearInterval(interval)
      }
   }, [setShowBubbles, showBubbles, simulateEmotes])

   const getColor = useCallback((iconName) => {
      if (iconName === "clapping") {
         return "#f15946"
      } else if (iconName === "heart") {
         return "#f9c22e"
      } else {
         return "#e01a4f"
      }
   }, [])

   return (
      <div className={clsx(className)}>
         {emotesData.length > 0 && (
            <TransitionGroup>
               {emotesData.map((iconEl) => (
                  <ActionButtonMemoized
                     key={iconEl.timestamp}
                     iconName={iconEl.emoteType}
                     color={getColor(iconEl.emoteType)}
                  />
               ))}
            </TransitionGroup>
         )}
      </div>
   )
}

const getRandomHorizontalPosition = (maxDistance: number) => {
   return Math.random() * maxDistance
}

const randomInteger = (min: number, max: number) => {
   return Math.floor(Math.random() * (max - min + 1)) + min
}

export default memo(IconsContainer)
