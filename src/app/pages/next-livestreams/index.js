import {useEffect, useState} from "react";
import {withFirebase} from "../../context/firebase";
import {Container} from "@material-ui/core";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {isNotEmptyString} from "../../components/helperFunctions/HelperFunctions";
import {useRouter} from "next/router";
import NextLivestreams from "../../components/views/NextLivestreams/NextLivestreams";
import NextLivestreamsLayout from "../../layouts/NextLivestreamsLayout";

const useStyles = makeStyles(theme => ({
        containerRoot: {
            // display: "flex",
            // flex: 1,
        },
        footer: {
            marginTop: "auto"
        },
        mainBackground: {
            // minWidth: "fit-content",
            height: "inherit"
        },
        drawerSpace: {
            minWidth: ({drawerClosedWidth}) => drawerClosedWidth,
        }
    })
)


const nextLivestreams = (props) => {
    const theme = useTheme()
    const router = useRouter()

    const {query: {search, page}, push, asPath, pathname} = router

    const drawerClosedWidth = theme.spacing(8)

    const classes = useStyles({drawerClosedWidth: drawerClosedWidth})
    const [searchParams, setSearchParams] = useState('')

    useEffect(() => {
        if (search) {
            setSearchParams(search)
            console.log("-> in the useEffect");
            handleSubmitSearch(null, search)
        }
    }, [search])

    const handleChange = (event) => {
        const value = event.currentTarget.value
        setSearchParams(value)
    }

    const handleSubmitSearch = async (event, routerQuery) => {
        const query = routerQuery || searchParams
        if (event) {
            event.preventDefault()
        }
        if (isNotEmptyString(query)) {
            await push(`${pathname}/search?q=${query}`)
        }

    }

    return (
        <NextLivestreamsLayout
            drawerClosedWidth={drawerClosedWidth}
            handleSubmitSearch={handleSubmitSearch}
            handleChange={handleChange}
            searchParams={searchParams}
        >

            {/*<Container disableGutters className={classes.containerRoot}>*/}
                {/*<div className={classes.drawerSpace}/>*/}
                <NextLivestreams/>
            {/*</Container>*/}

        </NextLivestreamsLayout>
    )
};


export default withFirebase(nextLivestreams);
