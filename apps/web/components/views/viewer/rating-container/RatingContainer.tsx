import React, { useCallback, useEffect, useState } from "react"
import { useFirebaseService } from "context/firebase/FirebaseServiceContext"
import { Button, FormControl, Grid, TextField } from "@mui/material"
import { useAuth } from "../../../../HOCs/AuthProvider"
import makeStyles from "@mui/styles/makeStyles"
import { Formik } from "formik"
import clsx from "clsx"
import * as actions from "../../../../store/actions"
import { getMinutesPassed } from "../../../helperFunctions/HelperFunctions"
import { useDispatch } from "react-redux"
import useStreamRef from "../../../custom-hook/useStreamRef"
import { EventRating } from "@careerfairy/shared-lib/src/livestreams"
import NormalRating from "./NormalRating"
import SentimentRating from "./SentimentRating"
import { LivestreamEvent } from "@careerfairy/shared-lib/dist/livestreams"
import { errorLogAndNotify } from "util/CommonUtil"

const useStyles = makeStyles((theme) => ({
   snackbar: {
      alignItems: "flex-start",
      "& #notistack-snackbar": {
         paddingLeft: theme.spacing(2),
      },
      maxWidth: 350,
      "& .SnackbarItem-action": {
         marginLeft: `${theme.spacing(3)} !important`,
      },
   },
   action: {
      display: "flex",
      flexDirection: "column",
   },
   button: {
      marginBottom: theme.spacing(2.5),
      marginTop: theme.spacing(1),
   },
   submitButton: {
      marginLeft: theme.spacing(0.5),
   },
   input: {
      marginBottom: theme.spacing(1),
      paddingRight: theme.spacing(2.5),
   },
}))

type ActionComponentProps = {
   rating: EventRating
   livestreamId: string
   email: string
}

export interface RatingComponentProps {
   values: {
      [key: string]: any
      message: string
   }
   rating: EventRating
   isSubmitting: boolean
   setFieldValue: (field: string, value: any) => void
   setSubmitting: (value: boolean) => void
   error: string
}

const ActionComponent = ({
   livestreamId,
   email,
   rating,
}: ActionComponentProps) => {
   const firebase = useFirebaseService()
   const classes = useStyles()
   const dispatch = useDispatch()
   const closeSnackbar = useCallback(
      (key) => dispatch(actions.closeSnackbar(key)),
      [dispatch]
   )

   const handleFormSubmit = useCallback(
      async (values, { setSubmitting }) => {
         setSubmitting(true)
         try {
            const newValues = {
               rating: Number(values[rating.id]),
               message: values.message,
            }
            await firebase.rateLivestream(
               livestreamId,
               email,
               newValues,
               rating
            )
         } catch (e) {
            errorLogAndNotify(e)
         }
         setSubmitting(false)
         closeSnackbar(rating.id)
      },
      [closeSnackbar, email, firebase, livestreamId, rating.id]
   )

   const handleDismiss = async (setSubmitting) => {
      setSubmitting(true)
      try {
         await firebase.optOutOfRating(livestreamId, email, rating.id)
      } catch (e) {}
      setSubmitting(false)
      closeSnackbar(rating.id)
   }

   const renderRating = useCallback(
      ({
         rating,
         isSubmitting,
         setSubmitting,
         setFieldValue,
         values,
         error,
      }: RatingComponentProps) => {
         const onChange = async (e, value) => {
            setFieldValue(rating.id, value)
            if (!rating.hasText) {
               let selectedValue = value
               if (selectedValue === null) {
                  // if no rating is selected, set it to
                  // null by the rating API, we have to set it back to its prev value
                  selectedValue = values[rating.id]
                  setFieldValue(rating.id, selectedValue)
               }
               const submitValues = {
                  [rating.id]: selectedValue,
                  message: values.message,
               }
               await handleFormSubmit(submitValues, { setSubmitting })
            } else {
               setFieldValue(rating.id, value)
            }
         }

         const props = {
            disabled: isSubmitting,
            error,
            onChange,
            value: values[rating.id],
            name: rating.id,
         }
         return rating.isSentimentRating ? (
            <SentimentRating {...props} highlightSelectedOnly />
         ) : (
            <NormalRating {...props} />
         )
      },
      [handleFormSubmit]
   )

   return (
      <Formik
         initialValues={{
            [rating.id]: rating.isSentimentRating ? 3 : 4,
            message: "",
         }}
         enableReinitialize
         validate={(values) => {
            let errors: any = {}
            if (!values[rating.id] && !values.message) {
               errors.message = "Please fill one"
               errors[rating.id] = "Please fill one"
            }
            return errors
         }}
         onSubmit={handleFormSubmit}
      >
         {({
            values,
            errors,
            handleChange,
            handleSubmit,
            isSubmitting,
            setSubmitting,
            setFieldValue,
         }) => (
            <Grid container>
               {!rating.noStars && (
                  <Grid xl={12} lg={12} md={12} sm={12} xs={12} item>
                     <FormControl error={Boolean(errors[rating.id])}>
                        {renderRating({
                           rating,
                           values,
                           setFieldValue,
                           isSubmitting,
                           setSubmitting,
                           error: errors[rating.id] as string,
                        })}
                     </FormControl>
                  </Grid>
               )}
               {rating.hasText ? (
                  <>
                     <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
                        <TextField
                           multiline
                           fullWidth
                           disabled={isSubmitting}
                           name="message"
                           value={values.message}
                           error={Boolean(errors.message)}
                           // @ts-ignore
                           helperText={errors.message}
                           inputProps={{ maxLength: 1000 }}
                           label="Review"
                           onChange={handleChange}
                           variant="outlined"
                           className={classes.input}
                        />
                     </Grid>
                     <Grid xl={12} lg={12} md={12} sm={12} xs={12} item>
                        <Button
                           disabled={isSubmitting}
                           onClick={() => handleDismiss(setSubmitting)}
                           className={classes.button}
                           color="grey"
                        >
                           Cancel
                        </Button>
                        <Button
                           color="primary"
                           disabled={isSubmitting}
                           onClick={(e) =>
                              // @ts-ignore
                              handleSubmit(e)
                           }
                           variant="contained"
                           className={clsx(
                              classes.button,
                              classes.submitButton
                           )}
                        >
                           Submit
                        </Button>
                     </Grid>
                  </>
               ) : null}
            </Grid>
         )}
      </Formik>
   )
}

interface Props {
   livestreamId: string
   livestream: LivestreamEvent
}

const RatingContainer = ({ livestream, livestreamId }: Props) => {
   const { authenticatedUser } = useAuth()
   const firebase = useFirebaseService()
   const classes = useStyles()
   const streamRef = useStreamRef()
   const dispatch = useDispatch()
   const enqueueSnackbar = (...args) =>
      dispatch(actions.enqueueSnackbar(...args))
   const [minutesPassed, setMinutesPassed] = useState(null)
   const [ratings, setRatings] = useState([])

   useEffect(() => {
      if (livestream?.id) {
         const unsubscribeRatings =
            firebase.listenToLivestreamRatingsWithStreamRef(
               streamRef,
               async (querySnapshot) => {
                  setRatings((prevState) => {
                     return querySnapshot.docs.map((doc) => {
                        const oldRating = prevState.find(
                           (ratingObj) => ratingObj.id === doc.id
                        )
                        return {
                           id: doc.id,
                           ...doc.data(),
                           hasRated: oldRating?.hasRated || false,
                        }
                     })
                  })
               }
            )
         return () => unsubscribeRatings()
      }
   }, [firebase, livestream?.id, streamRef])

   useEffect(() => {
      const interval = setInterval(() => {
         setMinutesPassed(getMinutesPassed(livestream))
      }, 10 * 1000) // check for minutes passed every 10 seconds
      return () => clearInterval(interval)
   }, [livestream.start])

   useEffect(() => {
      if (minutesPassed) {
         ;(async function () {
            await handleCheckRatings()
         })()
      }
   }, [minutesPassed, livestream.hasEnded])

   const hasNotRatedAndTimeHasPassed = (rating) => {
      return Boolean(
         !rating.hasRated &&
            minutesPassed >= rating.appearAfter &&
            authenticatedUser?.email
      )
   }

   const hasNotRatedAndNotTimeYetButStreamEndedAndRatingIsForEnd = (rating) => {
      return Boolean(
         !rating.hasRated && authenticatedUser?.email && livestream.hasEnded
      )
   }

   const handleCheckRatings = async () => {
      for (const [index, rating] of ratings.entries()) {
         // this loop allows for easy async functions along with index
         if (
            hasNotRatedAndTimeHasPassed(rating) ||
            hasNotRatedAndNotTimeYetButStreamEndedAndRatingIsForEnd(rating)
         ) {
            // if you've already rated, don't bother making an api call
            const hasRated = await firebase.checkIfUserRated(
               livestreamId,
               authenticatedUser.email,
               rating.id
            )
            if (hasRated) {
               const newRatings = [...ratings]
               newRatings[index].hasRated = true // mark that particular rating as already rated
               setRatings(newRatings) // set updated ratings with new has rated status
            } else {
               if (
                  (rating.isForEnd && livestream.hasEnded) ||
                  !rating.isForEnd
               ) {
                  // dispatch snackbar if the rating isn't for the end OR is for the end and the livestream has ended
                  enqueueSnackbar({
                     message: rating.question,
                     options: {
                        variant: "info",
                        persist: true,
                        preventDuplicate: true,
                        className: classes.snackbar,
                        key: rating.id,
                        action: (
                           <ActionComponent
                              rating={rating}
                              email={authenticatedUser.email}
                              livestreamId={livestreamId}
                           />
                        ),
                     },
                  })
               }
            }
         }
      }
   }

   return null
}

export default RatingContainer
