const functions = require("firebase-functions");

const { admin } = require("./api/firestoreAdmin");
const { client } = require("./api/postmark");

const { setHeaders } = require("./util");

exports.sendEmailToStudentOfUniversityAndField = functions.https.onRequest(
   async (req, res) => {
      setHeaders(req, res);

      const recipientsGroupsAndCategories =
         req.body.recipientsGroupsAndCategories;
      console.log(req.body);
      const groups = Object.keys(recipientsGroupsAndCategories);

      console.log(groups);
      let recipients = new Set();

      const emailsToRemove = [
         "christina.habetler@tucareer.com",
         "michaela.unger@tucareer.com",
         "susanne.leeb@tucareer.com",
         "julia.hainitz@tucareer.com",
         "christine.kaiser@hr.ethz.ch",
         "evelyne.kappel@hr.ethz.ch",
         "ekappel@gmx.ch,",
         "franziska.liese@hr.ethz.ch",
         "anja.pauling@hr.ethz.ch",
         "lorena.coletti@hr.ethz.ch",
         "stephan.burkart@fhnw.ch",
         "sibylle.graf@fhnw.ch",
         "csc.business@fhnw.ch",
         "wels@zhaw.ch",
         "spib@zhaw.ch",
         "birgit-helga.mueller@unibas.ch",
         "n.astitouh@unibas.ch",
         " anja.robert@zhv.rwth-aachen.de",
         "neslihan.congar@zhv.rwth-aachen.de",
         "s.potstada@tu-braunschweig.de",
         "reiner.laue@verwaltung.uni-stuttgart.de",
         "thao.luu@tu-dresden.de",
         "cecilia.czambor@tu-dresden.de",
         "jazzny@gmx.de",
         "john.imonopi@lernende.ethz.ch",
         "michael.grunder@hr.ethz.ch",
         "daniela.gunz@uzh.ch",
         "roger.gfroerer@careerservices.uzh.ch",
         "sabine.demerle@epfl.ch",
         "cc@epfl.ch",
         "regina.cardoso@epfl.ch",
         "philippe.ory@epfl.ch",
         "nadine.leemann@unisg.ch",
         "gerd.winandi-martin@unisg.ch",
         "maxim.polikarpov@telejob.ch",
         "sandro.luh@telejob.ch",
         "konrad.jakubowski@telejob.ch",
         "reiner.laue@verwaltung.uni-stuttgart.de",
         "s.potstada@tu-braunschweig.de",
         "Anja.Robert@zhv.rwth-aachen.de",
         "Neslihan.Congar@zhv.rwth-aachen.de",
         "kathrin.neumann@uni-graz.at",
         "melanie.koeppel@uni-graz.at",
         "angela.messner-lipp@uni-graz.at",
      ];

      let snapshot = await admin
         .firestore()
         .collection("userData")
         .where("groupIds", "array-contains-any", groups)
         .get();
      console.log(snapshot.size);
      snapshot.forEach((doc) => {
         let student = doc.data();
         groups.forEach((group) => {
            let registeredGroup = student.registeredGroups.find(
               (registeredGroup) => registeredGroup.groupId === group
            );
            if (registeredGroup) {
               let categoryId = recipientsGroupsAndCategories[group].categoryId;
               let selectedOptions =
                  recipientsGroupsAndCategories[group].selectedOptions;
               let registeredCategory = registeredGroup.categories.find(
                  (category) => category.id === categoryId
               );
               if (
                  registeredCategory &&
                  selectedOptions.includes(
                     registeredCategory.selectedValueId
                  ) &&
                  !emailsToRemove.includes(student.userEmail) &&
                  !student.unsubscribed
               ) {
                  recipients.add(student.userEmail);
               }
            }
         });
      });
      console.log(recipients.size);
      let testEmails = ["maximilian@careerfairy.io"];
      let templates = [];
      recipients.forEach((recipient) => {
         const email = {
            TemplateId: 22748248,
            From: "CareerFairy <noreply@careerfairy.io>",
            To: recipient,
            TemplateModel: {
               userEmail: recipient,
            },
         };
         templates.push(email);
      });
      let arraysOfTemplates = [];
      for (index = 0; index < templates.length; index += 500) {
         myChunk = templates.slice(index, index + 500);
         // Do something if you want with the group
         arraysOfTemplates.push(myChunk);
      }
      console.log(arraysOfTemplates.length);
      arraysOfTemplates.forEach((arrayOfTemplates) => {
         client.sendEmailBatchWithTemplates(arrayOfTemplates).then(
            (response) => {
               console.log(
                  `Successfully sent email to ${arrayOfTemplates.length}`
               );
            },
            (error) => {
               console.error(
                  `Error sending email to ${arrayOfTemplates.length}`,
                  error
               );
            }
         );
      });
   }
);
