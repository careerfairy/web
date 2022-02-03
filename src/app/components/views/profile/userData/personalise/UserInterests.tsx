import {Button, Typography, Box, CircularProgress} from "@mui/material";
import React, {useState} from "react";
import {
  InterestsChipsSelector,
  InterestsSelectedState,
  interestsSubmitHandler,
} from "../../../signup/InterestsSelector";
import {useDispatch} from "react-redux";

const styles = {
  title: {
    color: 'text.secondary',
    textTransform: "uppercase",
    fontSize: "1.8rem",
  }
}

const UserInterests = ({userData}) => {
  const [isLoading, setLoading] = useState(false)
  const [interests, setInterests] = useState<InterestsSelectedState>({})
  const dispatch = useDispatch()

  const handleSubmit = async () => {
    setLoading(true)
    await interestsSubmitHandler(interests, userData?.id, dispatch, userData?.interestsIds)
    setLoading(false)
  }
  
  return (
    <>
      <Typography sx={styles.title} variant="h4">
        Interests
      </Typography>

      <Typography variant="body2" component="p">
        Select some to improve your site experience
      </Typography>

      <Box my={3}>
        <InterestsChipsSelector interests={interests}
                                setInterests={setInterests}/>
      </Box>

      <Box style={{textAlign: 'center'}}>
        <Button variant="contained" color="primary"
                disabled={isLoading}
                startIcon={
                  isLoading && (<CircularProgress size={20} color="inherit"/>)
                }
                onClick={handleSubmit}
        >
          Update
        </Button>
      </Box>
    </>
  )
}

export default UserInterests
