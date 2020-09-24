import React, {createRef, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import GroupCarouselCard from "./GroupCarouselCard";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Slider from "react-slick";
import {Button, IconButton, Typography} from "@material-ui/core";
import Link from "next/link";
import {useRouter} from "next/router";


const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: 1000,
        position: "sticky",
        top: 0
    },
    slider: {
        boxShadow: "0 0 5px grey",
        "& .slick-next:before, .slick-prev:before": {
            content: "'' !important",
            display: "none"
        },
        background: "rgb(250, 250, 250)",

    },
    button: {
        height: 90,
        borderRadius: 20,
        marginTop: "auto",
    },
    next: {
        display: 'block',
        position: "absolute",
        zIndex: 20,
        right: 0,
        WebkitTransform: "translate(-50%,-50%)",
        transform: "translate(-50%,-50%)",
        top: "50%",
    },
    prev: {
        display: 'block',
        position: "absolute",
        zIndex: 20,
        left: 50,
        WebkitTransform: "translate(-50%,-50%)",
        transform: "translate(-50%,-50%)",
        top: "50%",
    }
}));

const GroupsCarousel = ({groupIds, handleSetGroup, mobile, groupData, handleResetGroup, user}) => {
    const [activeSlide, setActiveSlide] = useState(0)
    const router = useRouter()
    const absolutePath = router.asPath;

    const classes = useStyles()
    const customSlider = createRef()

    const handleNext = () => {
        customSlider.current.slickNext()
    }

    const handlePrev = () => {
        customSlider.current.slickPrev()
    }

    const handleFollowGroups = () => {
        return router.push(user ? '/groups' : {pathname: '/login', query: {absolutePath}})
    }


    const renderGroupCards = groupIds?.map((id, index) => {
        return <GroupCarouselCard index={index} mobile={mobile} handleResetGroup={handleResetGroup}
                                  activeSlide={activeSlide}
                                  groupData={groupData} key={id} handleSetGroup={handleSetGroup} groupId={id}/>
    })

    const settings = {
        initialSlide: 0,
        centerMode: true,
        centerPadding: "60px",
        focusOnSelect: true,
        infinite: true,
        arrows: false,
        slidesToScroll: 1,
        slidesToShow: mobile ? 1 : groupIds.length > 4 ? 4 : groupIds.length,
        speed: 500,
        beforeChange: (current, next) => setActiveSlide(next),
    };

    const singleSettings = {
        centerMode: true,
        slidesToScroll: 1,
        slidesToShow: 1,
        arrows: false,
    }

    return (
        <div className={classes.root}>
            {groupIds.length > 0 ?
                <>
                    <IconButton className={classes.prev} onClick={handlePrev}>
                        <NavigateBeforeIcon color="primary" fontSize="large"/>
                    </IconButton>
                    <Slider ref={customSlider} className={classes.slider} {...settings}>
                        {renderGroupCards}
                    </Slider>
                    <IconButton className={classes.next} onClick={handleNext}>
                        <NavigateNextIcon color="primary" fontSize="large"/>
                    </IconButton>
                </>
                :
                <Slider className={classes.slider} {...singleSettings}>
                        <Button fullWidth onClick={handleFollowGroups} className={classes.button} color="primary">
                            <Typography variant="h5">Follow Some Groups</Typography>
                        </Button>
                </Slider>}
        </div>
    )

};

export default GroupsCarousel;
