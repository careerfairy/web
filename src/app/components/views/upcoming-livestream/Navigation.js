import React, { useEffect, useState } from "react";
import { alpha, makeStyles } from "@material-ui/core/styles";
import { Tab, Tabs } from "@material-ui/core";
import debounce from "lodash.debounce";
import Link from "materialUI/NextNavLink";
import SectionContainer from "../common/Section/Container";

const useStyles = makeStyles((theme) => ({
   root: {
      position: "sticky !important",
      top: 0,
      zIndex: theme.zIndex.appBar,
   },
   tabs: {
      backgroundColor: theme.palette.background.default,
      borderRadius: theme.spacing(0, 0, 0.5, 0.5),
      width: "100%",
      borderBottom: `1px solid ${alpha(theme.palette.text.secondary, 0.1)}`,
   },
   navLink: {
      textDecoration: "none !important",
   },
}));

const Navigation = ({ aboutRef, questionsRef, speakersRef }) => {
   const classes = useStyles();
   const [value, setValue] = useState("about");
   const [tabs, setTabs] = useState([]);

   useEffect(() => {
      const newTabs = [
         { ref: aboutRef, label: "About", value: aboutRef.current?.id },
         {
            ref: speakersRef,
            label: "Speakers",
            value: speakersRef.current?.id,
         },
         {
            ref: questionsRef,
            label: "Questions",
            value: questionsRef.current?.id,
         },
      ].filter(({ ref }) => ref.current);
      setTabs(newTabs);
   }, [aboutRef.current, questionsRef.current, speakersRef.current]);

   useEffect(() => {
      let observer;
      if (tabs.length) {
         const options = {
            threshold: 0.9,
         };
         observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
               const entryId = entry.target.id;
               if (entry.isIntersecting) {
                  handleChange(_, entryId);
               }
            });
         }, options);
         tabs.forEach((tab) => observer.observe(tab.ref.current));
      }
      return () => observer?.disconnect();
   }, [tabs]);

   const handleChange = debounce((event, newValue) => {
      setValue(newValue);
   }, 250);

   if (!tabs.length) {
      return null;
   }

   return (
      <SectionContainer maxWidth="lg" className={classes.root}>
         <Tabs
            value={value}
            onChange={handleChange}
            className={classes.tabs}
            aria-label="upcoming event nav"
            centered
            variant="fullWidth"
         >
            {tabs.map((tab) => (
               <Tab
                  label={tab.label}
                  id={`upcoming-event-nav-link-${tab.value}`}
                  className={classes.navLink}
                  value={tab.value}
                  component={Link}
                  href={{ hash: `#${tab.value}` }}
                  key={tab.value}
               />
            ))}
         </Tabs>
      </SectionContainer>
   );
};

export default Navigation;
