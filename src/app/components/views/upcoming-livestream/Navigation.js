import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Tab, Tabs } from "@material-ui/core";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import clsx from "clsx";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({
   root: {},
   tabs: {
      position: "sticky",
      top: 0,
      backgroundColor: theme.palette.background.default,
      zIndex: theme.zIndex.appBar,
      transition: theme.transitions.create(["top"], {
         duration: theme.transitions.duration.standard,
         easing: theme.transitions.easing.easeInOut,
      }),
   },
   tabsScrolling: {
      // top: 64,
   },
}));

const Navigation = ({ aboutRef, questionsRef, speakersRef }) => {
   const isScrolling = useScrollTrigger();
   const router = useRouter();
   console.log("-> router", router);
   const classes = useStyles();
   const [value, setValue] = useState("about");
   const [tabs, setTabs] = useState([]);
   useEffect(() => {
      const newTabs = [
         { ref: aboutRef, label: "About", value: aboutRef.current.id },
         { ref: speakersRef, label: "Speakers", value: speakersRef.current.id },
         {
            ref: questionsRef,
            label: "Questions",
            value: questionsRef.current.id,
         },
      ].filter(({ ref }) => ref.current);
      setTabs(newTabs);
   }, [aboutRef, questionsRef, speakersRef]);

   React.useEffect(() => {
      let observer;
      if (tabs.length) {
         const options = {
            threshold: 0.5,
         };
         observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
               const navElement = document.querySelector(
                  `a[href="#${entry.target.id}"]`
               );
               if (entry.isIntersecting) {
                  console.log("-> entry", entry);
                  console.log("-> entry.target.id", entry.target.id);
                  // setValue(entry.target.id);
                  // if (!navElement.classList.contains("active")) {
                  //    navElement.classList.add("active");
                  // }
               } else if (navElement.classList.contains("active")) {
                  // navElement.classList.remove("active");
               }
            });
         }, options);
         tabs.forEach((tab) => observer.observe(tab.ref.current));
      }
      return () => observer?.disconnect();
   }, [tabs]);

   const handleChange = (event, newValue) => {
      setValue(newValue);
   };

   if (!tabs.length) {
      return null;
   }

   return (
      <Tabs
         value={value}
         className={clsx(classes.tabs, {
            [classes.tabsScrolling]: !isScrolling,
         })}
         onChange={handleChange}
         aria-label="simple tabs example"
      >
         {tabs.map((tab) => (
            <Tab
               href={`#${tab.value}`}
               label={tab.label}
               value={tab.value}
               key={tab.value}
            />
         ))}
      </Tabs>
   );
};

export default Navigation;
