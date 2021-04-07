import {PaperBackground} from "../../materialUI/GlobalBackground/GlobalBackGround";
import Head from "next/head";
import {FeedHeader} from "../../components/views/header";
import {useEffect, useState} from "react";
import {withFirebase} from "../../context/firebase";
import {Container} from "@material-ui/core";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {groupsIndex, streamsIndex} from "../../algolia";
import SearchComponent from "../../components/views/NextLivestreams/SearchComponent";
import {isNotEmptyString} from "../../components/helperFunctions/HelperFunctions";
import {useRouter} from "next/router";

const useStyles = makeStyles(theme => ({
        containerRoot: {
            display: "flex",
            flex: 1,
        },
        footer: {
            marginTop: "auto"
        },
        mainBackground: {
            // minWidth: "fit-content"
        },
        drawerSpace: {
            minWidth: ({drawerClosedWidth}) => drawerClosedWidth,
        }
    })
)

const HITS_PER_PAGE = 9
const INITIAL_HITS_PER_PAGE = 3

const search = () => {
    const theme = useTheme()
    const router = useRouter()

    const {query: {q}, push, pathname} = router

    const drawerClosedWidth = theme.spacing(8)

    const classes = useStyles({drawerClosedWidth: drawerClosedWidth})
    const [searchParams, setSearchParams] = useState('')
    const [groupResults, setGroupResults] = useState(null);
    const [streamResults, setStreamResults] = useState(null);
    const [groupHits, setGroupHits] = useState(null);
    const [streamHits, setStreamHits] = useState(null);
    const [searching, setSearching] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingStreams, setLoadingStreams] = useState(false);
    const [enableGroupInfiniteScroll, setEnableGroupInfiniteScroll] = useState(false);

    useEffect(() => {
        if (q) {
            setSearchParams(q)
            handleSubmitSearch(null, q)
        }
    }, [q])

    const handleChange = (event) => {
        const value = event.currentTarget.value
        setSearchParams(value)
    }

    const hasMoreGroups = () => {
        return Boolean(groupResults && groupResults.page + 1 < groupResults.nbPages)
    }

    const hasMoreStreams = () => {
        return Boolean(streamResults && streamResults.page + 1 < streamResults.nbPages)
    }

    const handleSubmitSearch = async (event, routerQuery) => {
        const query = routerQuery || searchParams

        if (event) {
            event.preventDefault()
        }
        try {
            if (isNotEmptyString(query)) {
                setSearching(true)
                const requestOptions = {
                    hitsPerPage: INITIAL_HITS_PER_PAGE
                }

                const newGroupResults = await groupsIndex.search(query, requestOptions);
                const newStreamResults = await streamsIndex.search(query, requestOptions);

                await push(`${pathname}?q=${query}`)
                console.log("-> in the handleSubmitSearch");

                setStreamHits(newStreamResults.hits)
                setGroupHits(newGroupResults.hits)

                setStreamResults(newStreamResults)
                setGroupResults(newGroupResults)
                // reset search query
                setSearching(false)
                setSearchParams('')
            }
        } catch (e) {
            setSearching(false)
            console.log("-> e", e);
        }
    }

    const loadMoreStreams = async () => {
        try {
            if (!loadingStreams && streamHits && hasMoreStreams()) {
                setLoadingStreams(true)
                const requestOptions = {
                    hitsPerPage: HITS_PER_PAGE,
                    page: streamResults.page + 1
                }
                const newStreamResults = await streamsIndex.search(streamResults.query, requestOptions);
                await push(`${pathname}?q=${groupResults.query}`)
                console.log("-> fetched more streams");

                setStreamResults(newStreamResults)
                setStreamHits(prevState => [...prevState, ...newStreamResults.hits])
                setLoadingStreams(false)
            }

        } catch (e) {
            setLoadingStreams(false)
            console.log("-> e", e);
        }
    }

    const loadMoreGroups = async () => {
        try {
            if (!loadingGroups && groupHits && hasMoreGroups()) {
                setLoadingGroups(true)
                const requestOptions = {
                    hitsPerPage: HITS_PER_PAGE,
                    page: groupResults.page + 1
                }
                const newGroupResults = await groupsIndex.search(groupResults.query, requestOptions);
                await push(`${pathname}?q=${groupResults.query}`)
                console.log("-> fetched more groups");

                setGroupResults(newGroupResults)
                setGroupHits(prevState => [...prevState, ...newGroupResults.hits])
                setLoadingGroups(false)
            }

        } catch (e) {
            console.log("-> e", e);
            setLoadingGroups(false)
        }
    }


    return (
        <PaperBackground className={classes.mainBackground}>
            <Head>
                <title key="title">CareerFairy | Next Live Streams</title>
            </Head>
            <FeedHeader
                drawerClosedWidth={drawerClosedWidth}
                handleSubmitSearch={handleSubmitSearch}
                handleChange={handleChange}
                searchParams={searchParams}
            />
            <Container disableGutters className={classes.containerRoot}>
                <div className={classes.drawerSpace}/>
                <SearchComponent
                    searching={searching}
                    groupHits={groupHits}
                    streamHits={streamHits}
                    groupResults={groupResults}
                    hitsPerPage={HITS_PER_PAGE}
                    streamResults={streamResults}
                    loadingGroups={loadingGroups}
                    loadingStreams={loadingStreams}
                    setEnableGroupInfiniteScroll={setEnableGroupInfiniteScroll}
                    enableGroupInfiniteScroll={enableGroupInfiniteScroll}
                    hasMoreGroups={hasMoreGroups()}
                    hasMoreStreams={hasMoreStreams()}
                    loadMoreGroups={loadMoreGroups}
                    loadMoreStreams={loadMoreStreams}
                />
            </Container>
        </PaperBackground>
    );
};


export default withFirebase(search);
