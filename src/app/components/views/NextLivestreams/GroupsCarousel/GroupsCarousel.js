import React, {createRef, useEffect, useState} from 'react';
import {makeStyles} from "@material-ui/core/styles";
import CarouselCard from "./CarouselCard";
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import Slider from "react-slick";
import {Button, IconButton, Typography} from "@material-ui/core";
import {useRouter} from "next/router";
import NextLivestreamsCard from "./NextLivestreamsCard";


const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: 1000,
        position: "sticky",
        top: 0
    },
    slider: {
        boxShadow: "0 3px 3px grey",
        width: "100%",
        "& .slick-next:before, .slick-prev:before": {
            content: "'' !important",
            display: "none"
        },
        background: "rgb(44, 66, 81)",
    },
    button: {
        height: 90,
        borderRadius: 20,
        marginTop: "auto",
    },
    next: {
        display: ({singleCard}) => singleCard ? 'none' : 'block',
        position: "absolute",
        zIndex: 20,
        right: 0,
        WebkitTransform: "translate(-50%,-50%)",
        transform: "translate(-50%,-50%)",
        top: "50%",
    },
    prev: {
        display: ({singleCard}) => singleCard ? 'none' : 'block',
        position: "absolute",
        zIndex: 20,
        left: 57,
        WebkitTransform: "translate(-50%,-50%)",
        transform: "translate(-50%,-50%)",
        top: "50%",
    },
    icon: {
        color: "black",
        backgroundColor: "white",
        borderRadius: "50%",
        opacity: 0.5
    }
}));

const GroupsCarousel = ({groupIds, handleSetGroup, mobile, groupData, handleResetGroup, user, setGroupIdsToRemove, groupIdsToRemove}) => {
    const router = useRouter()
    const absolutePath = router.asPath;
    const classes = useStyles({mobile, singleCard: groupIds.length <= 1})
    const customSlider = createRef()
    const [activeSlide, setActiveSlide] = useState(0)





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
        if (id === "upcoming") {
            return (<NextLivestreamsCard mobile={mobile} handleSetGroup={handleSetGroup} groupData={groupData}
                                         position={index} key={index}
                                         handleResetGroup={handleResetGroup} activeSlide={activeSlide}/>)
        } else {
            return <CarouselCard index={index}
                                 mobile={mobile}
                                 groupIdsToRemove={groupIdsToRemove}
                                 setGroupIdsToRemove={setGroupIdsToRemove}
                                 handleSetGroup={handleSetGroup}
                                 handleResetGroup={handleResetGroup}
                                 activeSlide={activeSlide}
                                 groupData={groupData}
                                 key={index}
                                 groupId={id}
            />
        }
    })

    const settings = {
        initialSlide: 0,
        centerMode: true,
        centerPadding: "60px",
        focusOnSelect: true,
        infinite: true,
        swipeToSlide: true,
        arrows: false,
        slidesToScroll: 1,
        slidesToShow: !groupIds.length || mobile ? 1 : groupIds.length > 4 ? 4 : groupIds.length,
        speed: 500,
        beforeChange: (current, next) => setActiveSlide(next),
    };

    return (
        <div className={classes.root}>
            <IconButton className={classes.prev} onClick={handlePrev}>
                <NavigateBeforeIcon className={classes.icon} color="primary" fontSize="large"/>
            </IconButton>
            <Slider ref={customSlider} className={classes.slider} {...settings}>
                {renderGroupCards}

            </Slider>
            <IconButton className={classes.next} onClick={handleNext}>
                <NavigateNextIcon className={classes.icon} fontSize="large"/>
            </IconButton>
        </div>
    )

};

export default GroupsCarousel;
