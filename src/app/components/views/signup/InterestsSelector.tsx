import {useAuth} from "../../../HOCs/AuthProvider";
import React, {useContext, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import userRepo from "../../../data/firebase/UserRepository";
import {
  Box,
  Button, Chip, CircularProgress,
  Typography
} from "@mui/material";
import useCollection from "../../custom-hook/useCollection";
import {Interest} from "../../../types/interests";
import CircularLoader from "../loader/CircularLoader";
import * as actions from "../../../store/actions/snackbarActions"
import {IMultiStepContext, MultiStepContext} from "./MultiStepWrapper";
import _ from "lodash";

const InterestsSelector = () => {
  const {authenticatedUser: user, userData} = useAuth()
  const [interests, setInterests] = useState<InterestsSelectedState>({})
  const {nextStep} = useContext<IMultiStepContext>(MultiStepContext)
  const [isLoading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handleSubmit = async () => {
    setLoading(true)
    await interestsSubmitHandler(interests, user?.email, dispatch, userData?.interestsIds)
    void nextStep()
    setLoading(false)
  }

  return (
    <Box px={6}>
      <Typography variant='h6'>What are your interests?</Typography>
      <Typography variant="body2" component="p">
        Select some to improve your site experience:
      </Typography>

      <Box my={2}>
        <InterestsChipsSelector interests={interests}
                                setInterests={setInterests}/>
      </Box>

      <Box style={{textAlign: 'center'}}>
        <Button variant="contained"
                onClick={handleSubmit}
                disabled={isLoading}
                startIcon={
                  isLoading && (<CircularProgress size={20} color="inherit"/>)
                }>Continue</Button>
      </Box>
    </Box>
  )
}

export const interestsSubmitHandler = async (interests: InterestsSelectedState,
                                             userEmail: string,
                                             dispatch,
                                             existingUserInterests?: string[]) => {
  if (!userEmail) return

  const data = []
  for (let interestUid in interests) {
    if (interests[interestUid].isSelected) {
      data.push(interestUid)
    }
  }

  // Should we update the user data?
  if (existingUserInterests && _.isEqual(data.sort(), [...existingUserInterests].sort())) {
    return // skip, the user data is the same
  }

  try {
    await userRepo.updateInterests(userEmail, data)
  } catch (e) {
    dispatch(actions.sendGeneralError(e))
  }
}

export const InterestsChipsSelector = ({interests, setInterests}) => {
  const allInterests = useCollection<Interest>("interests")
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
