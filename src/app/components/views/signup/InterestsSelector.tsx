import {useAuth} from "../../../HOCs/AuthProvider";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import userRepo from "../../../data/firebase/UserRepository";
import {
  Box,
  Chip,
  Typography
} from "@mui/material";
import { useInterests } from "../../custom-hook/useCollection";
import {Interest} from "../../../types/interests";
import CircularLoader from "../loader/CircularLoader";
import * as actions from "../../../store/actions/snackbarActions"
import _ from "lodash";

const InterestsSelector = () => {
  const {authenticatedUser: user, userData} = useAuth()
  const [interests, setInterests] = useState<InterestsSelectedState>({})
  const [hasChanged, setChanged] = useState(false)
  const dispatch = useDispatch()

  const onChange = useCallback(() => {
    setChanged(true)
  }, [])

  useEffect(() => {
    if (hasChanged && Object.keys(interests).length > 0) {
      interestsSubmitHandler(interests, user?.email, dispatch, userData?.interestsIds)
        .catch(console.error)
    }
  }, [interests, hasChanged])

  return (
    <Box px={6}>
      <Typography variant='h6'>What are your interests?</Typography>
      <Typography variant="body2" component="p" color="textSecondary">
        We'll highlight the best events for you:
      </Typography>

      <Box my={2}>
        <InterestsChipsSelector interests={interests}
                                setInterests={setInterests}
                                onChange={onChange}/>
      </Box>
    </Box>
  )
}

export const interestsSubmitHandler = async (interests: InterestsSelectedState,
                                             userEmail: string,
                                             dispatch,
                                             existingUserInterests?: string[]) => {
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

export const userInterestsDidNotChange = (interests: string[], existingUserInterests?: string[]): boolean => {
  return existingUserInterests && _.isEqual([...interests].sort(), [...existingUserInterests].sort())
}

export const formatInterests = (interests: InterestsSelectedState): string[] => {
  const data = []
  for (let interestUid in interests) {
    if (interests[interestUid].isSelected) {
      data.push(interestUid)
    }
  }

  return data
}

export const InterestsChipsSelector = ({
                                         interests,
                                         setInterests,
                                         onChange
                                       }: InterestsChipsSelectorProps) => {
  const {data: allInterests} = useInterests()
  const {userData} = useAuth()

  const interestsKeys = Object.keys(interests)

  useEffect(() => {
    setInterests(mapInitialState(allInterests, userData?.interestsIds))
  }, [userData, allInterests])

  const toggleInterest = (id: string) => {
    setInterests(prevState => ({
      ...prevState,
      [id]: {
        ...prevState[id],
        isSelected: !prevState[id].isSelected
      }
    }))

    if (onChange) {
      onChange(id)
    }
  }

  if (interestsKeys.length === 0) {
    return <CircularLoader/>
  }

  return (
    <React.Fragment>
      {interestsKeys.map((id) => (
        <Chip key={id} label={interests[id].name}
              size="small"
              variant={interests[id].isSelected ? 'filled' : 'outlined'}
              color={interests[id].isSelected ? 'primary' : 'default'}
              onClick={() => toggleInterest(id)}/>
      ))}
    </React.Fragment>
  )
}

type InterestsChipsSelectorProps = {
  interests: InterestsSelectedState,
  setInterests: React.Dispatch<any>,
  onChange?: (id: string) => void
}

export type InterestsSelectedState = { [index: string]: { name: string, isSelected: boolean } }

/**
 * Set existing user interests as selected
 */
function mapInitialState(allInterests: Interest[], userInterests?: string[]): InterestsSelectedState {
  const map = allInterests.reduce((a, b) => ({
    ...a,
    [b.id]: {name: b.name, isSelected: false}
  }), {})

  if (userInterests) {
    for (let userInterestId of userInterests) {
      map[userInterestId] && (map[userInterestId].isSelected = true)
    }
  }

  return map
}

export default InterestsSelector
