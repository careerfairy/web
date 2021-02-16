import {TealBackground} from "../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import Header from "../components/views/header/Header";
import Footer from "../components/views/footer/Footer";
import React, {useState} from "react";
import {Typography} from "@material-ui/core";
import DraftStreamForm from "../components/views/draftStreamForm/DraftStreamForm";
import {buildLivestreamObject} from "../components/helperFunctions/streamFormFunctions";
import {useSnackbar} from "notistack";
import {useRouter} from "next/router";
import {GENERAL_ERROR, SAVE_WITH_NO_VALIDATION, SUBMIT_FOR_APPROVAL} from "../components/util/constants";
import {withFirebase} from "../context/firebase";
import {useAuth} from "../HOCs/AuthProvider";


const draftStream = ({firebase}) => {

    const [submitted, setSubmitted] = useState(false)
    const {authenticatedUser} = useAuth()
    const {enqueueSnackbar} = useSnackbar()
    const router = useRouter()
    const {
        query: {absolutePath},
        push
    } = router;

    const onSubmit = async (values, {setSubmitting}, targetCategories, updateMode, draftStreamId, setFormData, setDraftId, status) => {
        try {
            setSubmitting(true)
            const livestream = buildLivestreamObject(values, targetCategories, updateMode, draftStreamId, firebase);
            if (status === SUBMIT_FOR_APPROVAL) {
                const newStatus = {
                    pendingApproval: true,
                    seen: false,
                }
                livestream.status = newStatus
                setFormData(prevState => ({...prevState, status: newStatus}))
            }
            let id;
            if (updateMode) {
                id = livestream.id
                if(!livestream.author){
                    livestream.author = {
                        email: authenticatedUser.email
                    }
                }
                await firebase.updateLivestream(livestream, "draftLivestreams")

                console.log("-> Draft livestream was updated with id", id);
            } else {
                const author = {
                    email: authenticatedUser?.email || "anonymous"
                }
                id = await firebase.addLivestream(livestream, "draftLivestreams", author)
                console.log("-> Draft livestream was created with id", id);
                push(`/draft-stream?draftStreamId=${id}`)
            }

            if (absolutePath) {
                return push({
                    pathname: absolutePath,
                })
            }
            setDraftId(id)
            setSubmitted(true)
            window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
            if (status === SAVE_WITH_NO_VALIDATION) {
                enqueueSnackbar("You changes have been saved!", {
                    variant: "default",
                    preventDuplicate: true,
                });
            }
        } catch (e) {
            enqueueSnackbar(GENERAL_ERROR, {
                variant: "error",
                preventDuplicate: true,
            });
            console.log("-> e", e);
        }
        setSubmitting(false)
    }

    return (
        <TealBackground style={{paddingBottom: 0}}>
            <Head>
                <title key="title">CareerFairy | Draft a Live Stream</title>
            </Head>
            <div style={{background: "rgb(44, 66, 81)"}}>
                <Header color="white"/>
            </div>
            <Typography variant="h3" align="center" style={{marginTop: submitted ? "15vh" : "1.5rem", color: "white"}}
                        gutterBottom>
                {submitted ? "Success!" : "Draft a Live Stream"}
            </Typography>
            <DraftStreamForm onSubmit={onSubmit} submitted={submitted} setSubmitted={setSubmitted}/>
            <Footer/>
        </TealBackground>
    )
};

export default withFirebase(draftStream);