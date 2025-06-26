import { Box, Chip, Typography } from "@mui/material"
import isEqual from "lodash/isEqual"
import React, { useCallback, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { userRepo } from "../../../../data/RepositoryInstances"
import { useAuth } from "../../../../HOCs/AuthProvider"
import * as actions from "../../../../store/actions"
import { Interest } from "../../../../types/interests"
import { useInterests } from "../../../custom-hook/useCollection"
import CircularLoader from "../../loader/CircularLoader"

const InterestsSelector = () => {
   const { authenticatedUser: user, userData } = useAuth()
   const [interests, setInterests] = useState<InterestsSelectedState>({})
   const [hasChanged, setHasChanged] = useState(false)
   const dispatch = useDispatch()

   const onChange = useCallback(() => {
      setHasChanged(true)
   }, [])

   useEffect(() => {
      if (hasChanged && Object.keys(interests).length > 0) {
         interestsSubmitHandler(
            interests,
            user?.email,
            dispatch,
            userData?.interestsIds
         ).catch(console.error)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [interests, hasChanged])

   return (
      <Box px={6}>
         <Typography variant="h6">What are your interests?</Typography>
         <Typography variant="body2" component="p">
            Select 5 to improve your site experience:
         </Typography>

         <Box data-testid={"signup-interests-selector"} my={2}>
            <InterestsChipsSelector
               interests={interests}
               setInterests={setInterests}
               onChange={onChange}
            />
         </Box>
      </Box>
   )
}

export const interestsSubmitHandler = async (
   interests: InterestsSelectedState,
   userEmail: string,
   dispatch,
   existingUserInterests?: string[]
) => {
   if (!userEmail) return

   const data = formatInterests(interests)

   if (userInterestsDidNotChange(data, existingUserInterests)) {
      return
   }

   try {
      await userRepo.updateInterests(userEmail, data)
   } catch (e) {
      dispatch(actions.sendGeneralError(e))
   }
}

export const userInterestsDidNotChange = (
   interests: string[],
   existingUserInterests?: string[]
): boolean => {
   return (
      existingUserInterests &&
      isEqual([...interests].sort(), [...existingUserInterests].sort())
   )
}

export const formatInterests = (
   interests: InterestsSelectedState
): string[] => {
   const data = []
   for (const interestUid in interests) {
      if (interests[interestUid].isSelected) {
         data.push(interestUid)
      }
   }

   return data
}

export const InterestsChipsSelector = ({
   interests,
   setInterests,
   onChange,
}: InterestsChipsSelectorProps) => {
   const { data: allInterests } = useInterests()
   const { userData } = useAuth()

   const interestsKeys = Object.keys(interests)

   useEffect(() => {
      setInterests(mapInitialState(allInterests, userData?.interestsIds))
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [userData, allInterests])

   const toggleInterest = (id: string) => {
      // select 5 at max
      if (
         !interests[id].isSelected &&
         Object.values(interests).filter((i) => i.isSelected).length >= 5
      ) {
         return
      }

      setInterests((prevState) => ({
         ...prevState,
         [id]: {
            ...prevState[id],
            isSelected: !prevState[id].isSelected,
         },
      }))

      if (onChange) {
         onChange(id)
      }
   }

   if (interestsKeys.length === 0) {
      return <CircularLoader />
   }

   return (
      <React.Fragment>
         {interestsKeys.map((id) => (
            <Chip
               key={id}
               label={interests[id].name}
               size="medium"
               sx={{
                  m: 0.6,
                  ml: 0,
               }}
               variant={interests[id].isSelected ? "filled" : "outlined"}
               color={interests[id].isSelected ? "primary" : "default"}
               onClick={() => toggleInterest(id)}
            />
         ))}
      </React.Fragment>
   )
}

type InterestsChipsSelectorProps = {
   interests: InterestsSelectedState
   setInterests: React.Dispatch<any>
   onChange?: (id: string) => void
}

export type InterestsSelectedState = {
   [index: string]: { name: string; isSelected: boolean }
}

/**
 * Set existing user interests as selected
 */
function mapInitialState(
   allInterests: Interest[],
   userInterests?: string[]
): InterestsSelectedState {
   const map = allInterests.reduce(
      (a, b) => ({
         ...a,
         [b.id]: { name: b.name, isSelected: false },
      }),
      {}
   )

   if (userInterests) {
      for (const userInterestId of userInterests) {
         map[userInterestId] && (map[userInterestId].isSelected = true)
      }
   }

   return map
}

export default InterestsSelector
