import { withFirebase } from "../../../context/firebase/FirebaseServiceContext"

import Head from "next/head"
import Link from "next/link"
import { Box, Button, Container } from "@mui/material"
import GeneralLayout from "../../../layouts/GeneralLayout"
import { useEffect } from "react"
import { getWindow } from "../../../util/PathUtils"

const DataProtection = () => {
   useEffect(() => {
      // Refresh Usercentrics Privacy UI
      // There is a race condition where this page loads after the UC script
      // We need to request UC to redraw again
      getWindow()?.UC_UI?.restartEmbeddings()
   }, [])

   return (
      <>
         <Head>
            <title key="title">CareerFairy | Data Protection Notice</title>
         </Head>
         <GeneralLayout>
            <Container>
               <TextContent />
            </Container>
         </GeneralLayout>
      </>
   )
}

const TextContent = () => {
   const resetCookieConsent = () => {
      getWindow()?.UC_UI?.showSecondLayer()
   }
   return (
      <Box
         sx={{
            fontSize: "1.1rem",
            "> p": {
               marginBottom: 4,
            },
            "div > p": {
               marginBottom: 4,
            },

            ol: {
               fontSize: 16,
            },
         }}
      >
         <p>
            <span>
               <Link href={"/data-protection"}>EN</Link> | DE
            </span>
         </p>
         <ol start={1}>
            <li>
               <b>
                  <span>Worum geht es in diesen Datenschutzhinweisen? </span>
               </b>
            </li>
         </ol>
         <p>
            <span>
               Dies ist eine Übersetzung der Englischen Version der
               Datenschutzhinweise. Bei Unstimmigkeiten, gehen die{" "}
               <a href={"/data-protection"}>englischen Datenschutzhinweise</a>{" "}
               vor.
            </span>
         </p>
         <p>
            <span>Die </span>
            <b>
               <span>CareerFairy AG </span>
            </b>
            <span>(nachstehend auch &laquo;</span>
            <b>
               <span>wir</span>
            </b>
            <span>&raquo;, &laquo;</span>
            <b>
               <span>uns</span>
            </b>
            <span>
               &raquo;) beschafft und bearbeitet Personendaten, die Sie oder
               auch andere Personen (&laquo;
            </span>
            <b>
               <span>Dritte</span>
            </b>
            <span>&raquo;) betreffen. Wir verwenden den Begriff &laquo;</span>
            <b>
               <span>Daten</span>
            </b>
            <span>&raquo; hier gleichbedeutend mit &laquo;</span>
            <b>
               <span>Personendaten</span>
            </b>
            <span>&raquo; oder &laquo;</span>
            <b>
               <span>personenbezogene Daten</span>
            </b>
            <span>&raquo;.&nbsp;</span>
         </p>
         <p>
            <span>
               In dieser Datenschutzerklärung beschreiben wir, was wir mit Ihren
               Daten tun, wenn Sie{" "}
            </span>
            <b>
               <span>careerfairy.io, careerfairy.com,</span>
            </b>
            <span>
               {" "}
               andere Websites von uns oder unsere Apps verwenden (nachfolgend
               gesamthaft &laquo;
            </span>
            <b>
               <span>Website</span>
            </b>
            <span>
               &raquo;), unsere Dienstleistungen oder Produkte beziehen,
               anderweitig mit uns im Rahmen eines Vertrags in Verbindung
               stehen, mit uns kommunizieren oder sonst mit uns zu tun haben.{" "}
            </span>
            <span>
               Gegebenenfalls werden wir Sie durch eine rechtzeitige
               schriftliche Mitteilung über zusätzliche, nicht in diesen
               Datenschutzhinweisen erwähnte Bearbeitungsaktivitäten
               informieren.{" "}
            </span>
            <span>
               Zusätzlich können wir Sie über die Bearbeitung Ihrer Daten
               separat informieren, z.B. in Einwilligungserklärungen,
               Vertragsbedingungen, zusätzlichen Datenschutzerklärungen,
               Formularen und Hinweisen.
            </span>
         </p>
         <p>
            <span>
               Wenn Sie uns Daten über andere Personen wie z.B.
               Familienmitglieder, Arbeitskollegen etc. übermitteln bzw.
               bekanntgeben, gehen wir davon aus, dass Sie dazu befugt sind und
               dass diese Daten richtig sind. Mit der Übermittlung von Daten
               über Dritte bestätigen Sie dies. Bitte stellen Sie auch sicher,
               dass diese Dritten über diese Datenschutzhinweise informiert
               wurden.
            </span>
         </p>
         <p>
            <span>
               Diese Datenschutzhinweise sind auf die Anforderungen der
               EU-Datenschutz-Grundverordnung (&laquo;
            </span>
            <b>
               <span>DSGVO</span>
            </b>
            <span>&raquo;) und das Schweizer Datenschutzgesetz (&laquo;</span>
            <b>
               <span>DSG</span>
            </b>
            <span>&raquo;) ausgelegt.</span>
            <span>
               &raquo;. Ob und inwieweit diese Gesetze anwendbar sind, hängt
               jedoch vom Einzelfall ab.
            </span>
         </p>

         <div>
            <ol start={2}>
               <li>
                  <p>
                     <strong>
                        2. Wer ist für die Bearbeitung Ihrer Daten
                        verantwortlich?
                     </strong>
                  </p>
               </li>
            </ol>

            <p>
               <span>
                  Für die in diesen Datenschutzhinweisen beschriebenen
                  Datenbearbeitungen der CareerFairy AG ist datenschutzrechtlich
                  die{" "}
               </span>
               <b>
                  <span>
                     CareerFairy AG, Technoparkstrasse 1, 8005 Z&uuml;rich,
                     Switzerland{" "}
                  </span>
               </b>
               <span>(die &laquo;</span>
               <b>
                  <span>CareerFairy AG</span>
               </b>
               <span>&raquo;)</span>
               <span>
                  , verantwortlich, soweit im Einzelfall nichts Anderes
                  kommuniziert wird z.B. in weiteren Datenschutzerklärungen, auf
                  Formularen oder in Verträgen.&nbsp;
               </span>
            </p>

            <p>
               Sie können uns für Ihre Datenschutzanliegen und die Ausübung
               Ihrer Rechte gemäss Ziff. 11 wie folgt erreichen:&nbsp;
            </p>

            <p style={{ marginLeft: "40px", marginBottom: 0 }}>
               CareerFairy AG&nbsp;
               <br />
               Technoparkstrasse 1&nbsp;
               <br />
               8005 Z&uuml;rich&nbsp;
               <br />
               Switzerland&nbsp;
               <br />
               privacy@careerfairy.io&nbsp;
            </p>

            <p style={{ marginBottom: 0 }}>
               Wir haben folgende zusätzlichen Stellen eingesetzt:&nbsp;
            </p>

            <ul>
               <li>
                  <p>Datenschutzbeauftragter gemäss Art. 37 ff. DSGVO:&nbsp;</p>
               </li>
            </ul>

            <p style={{ marginLeft: "40px", marginBottom: 0 }}>
               Priverion GmbH&nbsp;
               <br />
               Europaallee 41&nbsp;
               <br />
               8021 Z&uuml;rich&nbsp;
               <br />
               Switzerland&nbsp;
            </p>

            <p style={{ marginLeft: "40px", marginBottom: 0 }}>
               privacy@careerfairy.io&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     Datenschutzvertreter in der EU gemäss Art. 27 DSGVO:&nbsp;
                  </p>
               </li>
            </ul>

            <p style={{ marginLeft: "40px" }}>
               SIDD Datenschutz Deutschland UG (haftungsbeschr&auml;nkt)&nbsp;
               <br />
               Schellingstr. 109a&nbsp;
               <br />
               80798 M&uuml;nchen&nbsp;
               <br />
               Germany&nbsp;
            </p>

            <p>
               Sie können für Datenschutzanliegen auch diese Stellen
               kontaktieren.
            </p>
         </div>

         <div>
            <ol start={3}>
               <li>
                  <p>
                     <strong>Welche Daten bearbeiten wir?</strong> &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Wir bearbeiten verschiedene Kategorien von Daten über Sie. Die
               wichtigsten Kategorien sind folgende: &nbsp;&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Technische Daten</strong>: Wenn Sie unsere Website
                     oder andere elektronische Angebote (z.B. kostenloses WLAN)
                     verwenden, erheben wir die IP-Adresse Ihres Endgeräts und
                     weitere technische Daten, um die Funktionalität und
                     Sicherheit dieser Angebote sicherzustellen. Zu diesen Daten
                     gehören auch Protokolle, in denen die Verwendung unserer
                     Systeme aufgezeichnet wird. Wir bewahren technische Daten
                     in der Regel für 6 Monate auf. Um die Funktionalität dieser
                     Angebote sicherzustellen, können wir Ihnen bzw. Ihrem
                     Endgerät auch einen individuellen Code zuweisen (z.B. in
                     Form eines Cookies, vgl. dazu Ziff. 12). Die technischen
                     Daten für sich lassen grundsätzlich keine Rückschlüsse auf
                     Ihre Identität zu. Im Rahmen von Benutzerkonten,
                     Registrierungen, Zugangskontrollen oder der Abwicklung von
                     Verträgen können sie jedoch mit anderen Datenkategorien
                     (und so ggf. mit Ihrer Person) verknüpft
                     werden.&nbsp;&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     <strong>Registrierungsdaten</strong>: Bestimmte Angebote
                     z.B. von Wettbewerben und Dienstleistungen (z.B.
                     Login-Bereiche unserer Website, Newsletter-Versand,
                     kostenloser WLAN-Zugang etc.) können nur mit einem
                     Benutzerkonto oder einer Registrierung genutzt werden, die
                     direkt bei uns oder über unsere externen
                     Login-Dienstleister erfolgen kann. Dabei müssen Sie uns
                     bestimmte Daten angeben, und wir erheben Daten über die
                     Nutzung des Angebots oder der Dienstleistung. Wenn Sie
                     einen Gutschein bei uns einlösen, verlangen wir bei der
                     Einlösung unter Umständen bestimmte Daten von Ihnen. Wenn
                     wir Ihnen einen Gutschein für einen unserer Vertragspartner
                     ausstellen, übermitteln wir dem jeweiligen Vertragspartner
                     unter Umständen gewisse Ihrer Registrierungsdaten oder
                     erhalten solche (vgl. Ziff. 7). Bei Zugangskontrollen zu
                     bestimmten Anlagen können Registrierungsdaten anfallen; je
                     nach Kontrollsystem auch biometrische Daten. Wir bewahren
                     Registrierungsdaten in der Regel während 12 Monaten nach
                     dem Ende der Nutzung der Dienstleistung oder der Auflösung
                     des Nutzerkontos auf.&nbsp;&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Wenn Sie sich dafür entscheiden, ein Konto auf der
               CareerFairy-Website zu erstellen oder sich bei einem Konto
               anzumelden, werden Sie um die Angabe der folgenden persönlichen
               Daten gebeten:&nbsp;
            </p>

            <ul>
               <li>
                  <p>Vorname&nbsp;</p>
               </li>
               <li>
                  <p>Nachname&nbsp;</p>
               </li>
               <li>
                  <p>Email-Addresse&nbsp;</p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     Universität und Land, an dem Sie studieren oder studiert
                     haben&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Sie können sich dafür entscheiden, uns keine personenbezogenen
               Daten zur Verfügung zu stellen, allerdings können Sie dann kein
               Konto erstellen oder an Live-Stream-Veranstaltungen
               teilnehmen.&nbsp;
            </p>

            <p>
               Zusätzlich zu diesen Informationen kann eine Organisation
               (Veranstalter), die Live-Stream-Events auf CareerFairy
               veranstaltet (z. B. ein Karriereservice einer Universität), bei
               der Anmeldung zu den Events auch weitere (personenbezogene) Daten
               anfordern, die für die Teilnahme an diesen Events/
               Live-Stream-Events des Veranstalters erforderlich sind. Hierzu
               können beispielsweise folgende Daten gehören:
            </p>

            <ul>
               <li>
                  <p>
                     Studienfach [falls von Ihrem Career Service
                     ausgewählt].&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     Qualifikationsniveau, auf dem Sie studieren (BSc / MSc /
                     PhD) [falls von Ihrem Career Service ausgewählt].&nbsp;
                  </p>
               </li>
               <li>
                  <p>Weitere offene Fragen&nbsp;</p>
               </li>
            </ul>

            <p>
               Für diese Datenerhebung ist ausschliesslich die Organisation
               (Veranstalter) verantwortlich. Hierzu werden Ihnen bei der
               Veranstaltungsanmeldung die Datenschutzhinweise der Organisation
               (Veranstalter) zur Verfügung gestellt.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Kommunikationsdaten</strong>: Wenn Sie mit uns über
                     das Kontaktformular, per E-Mail, Telefon oder Chat,
                     brieflich oder über sonstige Kommunikationsmittel in
                     Kontakt stehen, erfassen wir die zwischen Ihnen und uns
                     ausgetauschten Daten, einschliesslich Ihrer Kontaktdaten
                     und der Randdaten der Kommunikation. Wenn wir
                     Telefongespräche oder Video-Konferenzen z.B. zu Schulungs-
                     und Qualitätssicherungszwecken aufzeichnen oder mithören,
                     weisen wir Sie besonders darauf hin. Solche Aufzeichnungen
                     dürfen nur entsprechend unseren internen Vorgaben gemacht
                     und verwendet werden. Sie werden darüber informiert, ob und
                     wann solche Aufzeichnungen stattfinden, z.B. durch eine
                     Anzeige während der betreffenden Video-Konferenz. Falls Sie
                     keine Aufzeichnung wünschen, weisen Sie uns bitte darauf
                     hin oder beenden Sie Ihre Teilnahme. Möchten Sie lediglich
                     keine Aufzeichnung Ihres Bildes, schalten Sie bitte Ihre
                     Kamera aus. Wenn wir Ihre Identität feststellen wollen oder
                     müssen, z.B. bei einem von Ihnen gestellten
                     Auskunftsbegehren, einem Antrag für Medienzugang etc.,
                     erheben wir Daten, um Sie zu identifizieren (z.B. eine
                     Kopie eines Ausweises). Wir bewahren diese Daten in der
                     Regel während 12 Monaten ab dem letzten Austausch mit Ihnen
                     auf. Diese Frist kann länger sein, soweit dies aus
                     Beweisgründen oder zur Einhaltung gesetzlicher oder
                     vertraglicher Vorgaben erforderlich oder technisch bedingt
                     ist. E-Mails in persönlichen Postfächern und schriftliche
                     Korrespondenzen werden in der Regel mindestens 10 Jahre
                     aufbewahrt. Aufzeichnungen von (Video-)Konferenzen werden
                     in der Regel während 24 Monaten aufbewahrt. Chats werden in
                     der Regel während 2 Jahren aufbewahrt.&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     <strong>Handheben</strong>&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Wenn Sie als Zuschauer an einem Live-Stream-Event teilnehmen,
               können die anderen Teilnehmer Sie weder sehen noch hören. Während
               der Live-Stream-Veranstaltung haben Sie die Möglichkeit, den
               Rednern des Unternehmens per Handzeichen-Funktion mitzuteilen,
               dass Sie mit Ihrer Videokamera und Ihrem Mikrofon am Live-Stream
               teilnehmen möchten. Die dabei entstehenden Live-Videos werden von
               uns nicht aufgezeichnet, es sei denn, der Veranstalter weist Sie
               vor Veranstaltungsbeginn ausdrücklich darauf hin und holt Ihr
               Einverständnis ein.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Stammdaten</strong>: Als Stammdaten bezeichnen wir
                     die Grunddaten, die wir nebst den Vertragsdaten (siehe
                     unten) für die Abwicklung unserer vertraglichen und
                     sonstigen geschäftlichen Beziehungen oder für Marketing-
                     und Werbezwecke benötigen, wie Name, Kontaktdaten und
                     Informationen z.B. über Ihre Rolle und Funktion, Ihre
                     Bankverbindung(en), Ihr Geburtsdatum, die Kundenhistorie,
                     Vollmachten, Unterschriftsberechtigungen und
                     Einwilligungserklärungen. Ihre Stammdaten bearbeiten wir,
                     wenn Sie ein Kunde oder sonstiger geschäftlicher Kontakt
                     sind oder für einen solchen tätig sind (z.B. als
                     Kontaktperson des Geschäftspartners), oder weil wir Sie für
                     unsere eigenen Zwecke oder die Zwecke eines
                     Vertragspartners ansprechen wollen (z.B. im Rahmen von
                     Marketing und Werbung, mit Einladungen an Anlässe, mit
                     Gutscheinen, mit Newslettern etc.). Wir erhalten Stammdaten
                     von Ihnen selbst (z.B. bei einem Kauf oder im Rahmen einer
                     Registrierung), von Stellen, für die Sie tätig sind, oder
                     von Dritten wie z.B. unseren Vertragspartnern, Verbänden
                     und Adresshändlern und aus öffentlich zugänglichen Quellen
                     wie z.B. öffentlichen Registern oder dem Internet
                     (Websites, Social Media etc.). Wir bewahren diese Daten in
                     der Regel während 10 Jahren ab dem letzten Austausch mit
                     Ihnen auf, mindestens aber ab Vertragsende. Diese Frist
                     kann länger sein, soweit dies aus Beweisgründen oder zur
                     Einhaltung gesetzlicher oder vertraglichen Vorgaben
                     erforderlich oder technisch bedingt ist. Bei reinen
                     Marketing- und Werbekontakten ist die Frist normalerweise
                     wesentlich kürzer, meist nicht mehr als 2 Jahre seit dem
                     letzten Kontakt.&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Vertragsdaten</strong>: Das sind Daten, die im
                     Zusammenhang mit einem Vertragsschluss bzw. der
                     Vertragsabwicklung anfallen, z.B. Angaben über Verträge und
                     den zu erbringenden oder erbrachten Leistungen, sowie Daten
                     aus dem Vorfeld eines Vertragsabschlusses, die zur
                     Abwicklung erforderlichen oder verwendeten Angaben und
                     Angaben über Reaktionen (z.B. Beschwerden oder Angaben zur
                     Zufriedenheit etc.). Auch Gesundheitsdaten und Angaben über
                     Dritte gehören dazu, z.B. über Erbkrankheiten in der
                     Familie. Diese Daten erheben wir i.d.R. von Ihnen, von
                     Vertragspartnern und von in die Abwicklung des Vertrages
                     involvierten Dritten, aber auch von Drittquellen (z.B.
                     Anbietern von Bonitätsdaten) und aus öffentlich
                     zugänglichen Quellen. Wir bewahren diese Daten in der Regel
                     während 10 Jahren ab der letzten Vertragsaktivität auf,
                     mindestens aber ab Vertragsende. Diese Frist kann länger
                     sein, soweit dies aus Beweisgründen oder zur Einhaltung
                     gesetzlicher oder vertraglichen Vorgaben erforderlich oder
                     technisch bedingt ist.&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Verhaltens- und Präferenzdaten</strong>: Je
                     nachdem, in welcher Beziehung wir zu Ihnen stehen,
                     versuchen wir Sie kennenzulernen und unsere Produkte,
                     Dienstleistungen und Angebote besser auf Sie auszurichten.
                     Dazu erheben und nutzen wir Daten über Ihr Verhalten und
                     Ihre Präferenzen. Wir tun dies, indem wir Angaben über Ihr
                     Verhalten in unserem Bereich auswerten, und wir können
                     diese Angaben auch mit Angaben von Dritten – auch aus
                     öffentlich zugänglichen Quellen – ergänzen. Gestützt darauf
                     können wir etwa die Wahrscheinlichkeit berechnen, dass Sie
                     bestimmte Leistungen in Anspruch nehmen oder sich auf eine
                     bestimmte Weise verhalten. Die dazu bearbeiteten Daten sind
                     uns teilweise bereits bekannt (z.B. wenn Sie unsere
                     Leistungen in Anspruch nehmen), oder wir gewinnen diese
                     Daten, indem wir Ihr Verhalten aufzeichnen (z.B. wie Sie
                     auf unserer Website navigieren). Wir anonymisieren oder
                     löschen diese Daten, wenn sie für die verfolgten Zwecke
                     nicht mehr aussagekräftig sind, was je nach der Art der
                     Daten zwischen 2-3 Wochen und 24 Monaten (bei Produkte- und
                     Dienstleistungspräferenzen) der Fall sein kann. Diese Frist
                     kann länger sein, soweit dies aus Beweisgründen oder zur
                     Einhaltung gesetzlicher oder vertraglichen Vorgaben
                     erforderlich oder technisch bedingt ist. Wie das Tracking
                     auf unserer Website funktioniert, beschreiben wir in Ziff.
                     12. &nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     <strong>Sonstige Daten</strong>: Daten von Ihnen erheben
                     wir auch in anderen Situationen. Im Zusammenhang mit
                     behördlichen oder gerichtlichen Verfahren etwa fallen Daten
                     an (wie Akten, Beweismittel etc.), die sich auch auf Sie
                     beziehen können. Aus Gründen des Gesundheitsschutzes können
                     wir ebenfalls Daten erheben (z.B. im Rahmen von
                     Schutzkonzepten). Wir können Fotos, Videos und Tonaufnahmen
                     erhalten oder herstellen, in denen Sie erkennbar sein
                     können (z.B. an Anlässen, durch Sicherheitskameras etc.).
                     Wir können auch Daten darüber erheben, wer wann bestimmte
                     Gebäude betritt oder entsprechende Zugangsrechte hat (inkl.
                     bei Zugangskontrollen, gestützt auf Registrierungsdaten
                     oder Besucherlisten etc.), wer wann an Anlässen oder
                     Aktionen (z.B. Wettbewerben) teilnimmt oder wer wann unsere
                     Infrastruktur und Systeme verwendet. Schliesslich erheben
                     und bearbeiten wir Daten über unsere Aktionäre und anderen
                     Anleger; neben Stammdaten sind dies u.a. Angaben für die
                     entsprechenden Register, bezüglich der Ausübung ihrer
                     Rechte und der Durchführung von Anlässen (z.B.
                     Generalversammlungen). Die Aufbewahrungsfrist dieser Daten
                     richtet sich nach dem Zweck und wird auf das Erforderliche
                     beschränkt. Das reicht von einigen wenigen Tagen bei vielen
                     der Sicherheitskameras und in der Regel einigen Wochen bei
                     Daten für ein Contact Tracing über Besucherdaten, die in
                     der Regel während 3 Monaten aufbewahrt werden bis hin zu
                     Berichten über Anlässe mit Bildern, die einige Jahre oder
                     länger aufbewahrt werden können. Daten über Sie als
                     Aktionär oder sonstiger Anleger werden entsprechend den
                     gesellschaftsrechtlichen Vorgaben aufbewahrt, in jedem Fall
                     aber solange Sie investiert sind.&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Vieler der in dieser Ziff. 3 genannten Daten geben Sie uns selbst
               bekannt (z.B. über Formulare, im Rahmen der Kommunikation mit
               uns, im Zusammenhang mit Verträgen, bei der Verwendung der
               Website etc.). Sie sind dazu nicht verpflichtet, unter Vorbehalt
               von Einzelfällen, z.B. im Rahmen von verbindlichen
               Schutzkonzepten (gesetzliche Verpflichtungen). Wenn Sie mit uns
               Verträge schliessen oder Leistungen beanspruchen wollen, müssen
               Sie uns zudem im Rahmen Ihrer vertraglichen Verpflichtung gemäss
               dem einschlägigen Vertrag Daten bereitstellen, insbesondere
               Stamm-, Vertrags- und Registrierungsdaten. Bei der Nutzung
               unserer Website ist die Bearbeitung technischer Daten
               unvermeidlich. Wenn Sie Zugang zu bestimmten Systemen oder
               Gebäuden erhalten möchten, müssen Sie uns Registrierungsdaten
               angeben. Bei Verhaltens- und Präferenzdaten haben Sie jedoch
               grundsätzlich die Möglichkeit, zu widersprechen oder keine
               Einwilligung zu geben.&nbsp;
            </p>

            <p>
               Soweit dies nicht unzulässig ist, entnehmen wir Daten auch
               öffentlich zugänglichen Quellen (z.B. Betreibungsregister,
               Grundbücher, Handelsregister, Medien oder dem Internet inkl.
               Social Media) oder von Behörden und von sonstigen Dritten (wie
               z.B. Kreditauskunfteien, Adresshändler, Verbände,
               Vertragspartner, Internet-Analysedienste etc.).&nbsp;&nbsp;
            </p>
         </div>

         <div>
            <ol start={4}>
               <li>
                  <p>
                     <strong>
                        Zu welchen Zwecken bearbeiten wir Ihre Daten?
                     </strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Wir bearbeiten Ihre Daten zu den Zwecken, die wir im Folgenden
               erläutern. Weitere Hinweise für den Online-Bereich finden Sie in
               Ziff. 12 und 13. Diese Zwecke bzw. die ihnen zugrundeliegenden
               Ziele stellen berechtigte Interessen von uns und ggf. von Dritten
               dar. Sie finden weitere Angaben zu den Rechtsgrundlagen unserer
               Bearbeitung in Ziff. 5.&nbsp;
            </p>

            <p>
               Wir bearbeiten Ihre Daten zu Zwecken im Zusammenhang mit der{" "}
               <strong>Kommunikation mit Ihnen</strong>, insbesondere zur
               Beantwortung von Anfragen und der Geltendmachung Ihrer Rechte
               (Ziff. 11) und um Sie bei Rückfragen zu kontaktieren. Hierzu
               verwenden wir insbesondere Kommunikationsdaten und Stammdaten und
               im Zusammenhang mit von Ihnen genutzten Angeboten und
               Dienstleistungen auch Registrierungsdaten. Wir bewahren diese
               Daten auf, um unsere Kommunikation mit Ihnen zu dokumentieren,
               für Schulungszwecke, zur Qualitätssicherung und für Nachfragen.
               &nbsp;
            </p>

            <p>
               Daten bearbeiten wir für die Aufnahme, Verwaltung und Abwicklung
               von <strong>Vertragsbeziehungen</strong>
               .&nbsp;&nbsp;
            </p>

            <p>
               Wir bearbeiten Daten für <strong>Marketingzwecke</strong> und zur
               <strong>Beziehungspflege</strong>, , z.B. um unseren Kunden und
               anderen Vertragspartnern personalisierte Werbung zu Produkten und
               Dienstleistungen von uns und von Dritten (z.B. von
               Werbe-Vertragspartnern) zu senden. Das kann z.B. in Form von
               Newslettern und anderen regelmässigen Kontakten (elektronisch,
               telefonisch), über andere Kanäle, für welche wir von Ihnen
               Kontaktinformationen haben, aber auch im Rahmen von einzelnen
               Marketingaktionen (z.B. Anlässe, Wettbewerbe etc.) erfolgen und
               auch Gratisleistungen enthalten (z.B. Einladungen, Gutscheine
               etc.). Sie können solche Kontakte jederzeit ablehnen (siehe am
               Ende dieser Ziff. 4) bzw. eine Einwilligung in die
               Kontaktaufnahme für Werbezwecke verweigern oder widerrufen. Mit
               Ihrer Einwilligung können wir unsere Online-Werbung im Internet
               zielgerichteter auf Sie ausrichten (dazu Ziff. 12). Schliesslich
               wollen wir auch Vertragspartnern von uns ermöglichen, unsere
               Kunden und andere Vertragspartner zu Werbezwecken anzusprechen
               (dazu Ziff. 7).&nbsp;
            </p>

            <p>
               Ihre Daten bearbeiten wir weiter zur{" "}
               <strong>Marktforschung</strong>, zur{" "}
               <strong>
                  Verbesserung unserer Dienstleistungen und unseres Betriebs{" "}
               </strong>
               , und zur <strong>Produktentwicklung</strong>.&nbsp;&nbsp;
            </p>

            <p>
               Wir können Ihre Daten auch zu{" "}
               <strong>Sicherheitszwecken </strong> und für die{" "}
               <strong>Zugangskontrolle</strong> bearbeiten.&nbsp;&nbsp;
            </p>

            <p>
               Wir bearbeiten Personendaten zur{" "}
               <strong>Einhaltung von Gesetzen</strong>,{" "}
               <strong>
                  Weisungen und Empfehlungen von Behörden und interner
                  Regularien (&laquo;Compliance&raquo;)
               </strong>
               .&nbsp;&nbsp;
            </p>

            <p>
               Wir bearbeiten Daten auch für Zwecke unseres{" "}
               <strong>Risikomanagements </strong> und im Rahmen einer
               umsichtigen <strong>Unternehmensführung</strong>, einschliesslich
               Betriebsorganisation und Unternehmensentwicklung.&nbsp;&nbsp;
            </p>

            <p>
               Wir können Ihre Daten <strong>zu weiteren Zwecken </strong>{" "}
               bearbeiten, z.B. im Rahmen unserer internen Abläufe und
               Administration oder zu Schulungs- und
               Qualitätssicherungszwecken.&nbsp;&nbsp;
            </p>
         </div>

         <div>
            <ol start={5}>
               <li>
                  <b>
                     <span>
                        Auf welcher Grundlage bearbeiten wir Ihre Daten
                     </span>
                  </b>
               </li>
            </ol>
            <p>
               <span>Soweit wir Sie für bestimmte Bearbeitungen um Ihre </span>
               <b>
                  <span>Einwilligung </span>
               </b>
               <span>
                  bitten (z.B. für die Bearbeitung von besonders schützenswerten
                  Personendaten, für Marketingmailings, für die Erstellung
                  personalisierter Bewegungsprofile und für die Werbesteuerungs-
                  und Verhaltensanalyse auf der Website), informieren wir Sie
                  gesondert über die entsprechenden Zwecke der Bearbeitung.
                  Einwilligungen können Sie jederzeit durch schriftliche
                  Mitteilung (postalisch) oder, wo nicht anders angegeben oder
                  vereinbart, per E-Mail an uns jederzeit mit Wirkung für die
                  Zukunft widerrufen; unsere Kontaktangaben finden Sie in Ziff.{" "}
               </span>
               <span>2</span>
               <span>
                  . Für den Widerruf Ihrer Einwilligung beim Online-Tracking
                  vgl. Ziff.{" "}
               </span>
               <span>12</span>
               <span>
                  . Wo Sie über ein Benutzerkonto verfügen, kann ein Widerruf
                  oder eine Kontaktnahme mit uns ggf. auch über die betreffende
                  Website oder sonstige Dienstleistung durchgeführt werden.
                  Sobald wir die Mitteilung über den Widerruf Ihrer Einwilligung
                  erhalten haben, werden wir Ihre Daten nicht mehr für die
                  Zwecke bearbeiten, denen Sie ursprünglich zugestimmt haben, es
                  sei denn, wir haben eine andere Rechtsgrundlage dafür. Durch
                  den Widerruf Ihrer Einwilligung wird die Rechtmässigkeit der
                  aufgrund der Einwilligung bis zum Widerruf erfolgten
                  Bearbeitung nicht berührt.
               </span>
            </p>
            <p>
               <span>
                  Wo wir Sie nicht um Ihre Einwilligung für eine Bearbeitung
                  bitten, stützen wir die Bearbeitung Ihrer Personendaten
                  darauf, dass die Bearbeitung für die{" "}
               </span>
               <b>
                  <span>Anbahnung oder Abwicklung eines Vertrags</span>
               </b>
               <span>
                  mit Ihnen (oder der von Ihnen vertretenen Stelle) erforderlich
                  ist oder dass wir oder Dritte ein{" "}
               </span>
               <b>
                  <span>berechtigtes Interesse </span>
               </b>
               <span>
                  daran haben, so insbesondere um die vorstehend unter Ziff.{" "}
               </span>
               <span>4</span>
               <span>
                  {" "}
                  beschriebenen Zwecke und damit verbundenen Ziele zu verfolgen
                  und entsprechende Massnahmen durchführen zu können. Zu unseren
                  berechtigten Interessen gehört auch die Einhaltung von{" "}
               </span>
               <b>
                  <span>gesetzlichen Vorschriften</span>
               </b>
               <span>
                  , soweit diese nicht ohnehin bereits vom jeweils anwendbaren
                  Datenschutzrecht als Rechtsgrundlage anerkannt ist (z.B. bei
                  der DSGVO das Recht im EWR und in der Schweiz). Dazu gehört
                  aber auch die Vermarktung unserer Produkte und
                  Dienstleistungen, das Interesse, unsere Märkte besser zu
                  verstehen und unser Unternehmen, einschliesslich des
                  operativen Betriebs, sicher und effizient zu führen und
                  weiterzuentwickeln.
               </span>
            </p>

            <p>
               Wenn wir sensible Daten erhalten (z.B. Gesundheitsdaten, Angaben
               zu politischen, religiösen oder weltanschaulichen Ansichten oder
               biometrische Daten zur Identifikation), können wir Ihre Daten
               auch gestützt auf andere Rechtsgrundlagen bearbeiten, z.B. im
               Falle von Auseinandersetzungen aufgrund der Notwendigkeit der
               Bearbeitung für einen etwaigen Prozess oder die Durchsetzung oder
               Abwehr von <strong>Rechtsansprüchen</strong>. In Einzelfällen
               können andere Rechtsgründe zum Tragen kommen, was wir Ihnen
               soweit erforderlich separat kommunizieren.&nbsp;
            </p>
         </div>

         <div>
            <ol start={6}>
               <li>
                  <p>
                     <strong>
                        Was gilt bei Profiling und automatisierten
                        Einzelentscheiden?
                     </strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Wir können bestimmte Ihrer persönlichen Eigenschaften zu den in
               Ziff. 4 genannten Zwecken anhand Ihrer Daten (Ziff. 3)
               automatisiert bewerten (&laquo;Profiling&raquo;), wenn wir
               Präferenzdaten ermitteln wollen, aber auch um Missbrauchs- und
               Sicherheitsrisiken festzustellen, statistische Auswertungen
               vorzunehmen oder für betriebliche Planungszwecke. Zu denselben
               Zwecken können wir auch Profile erstellen, d.h. wir können
               Verhaltens- und Präferenzdaten, aber auch Stamm- und
               Vertragsdaten und Ihnen zugeordnete technische Daten kombinieren,
               um Sie als Person mit ihren unterschiedlichen Interessen und
               sonstigen Eigenschaften besser zu verstehen. &nbsp;
            </p>

            <p>
               In beiden Fällen achten wir auf die Verhältnismässigkeit und
               Zuverlässigkeit der Ergebnisse und treffen Massnahmen gegen eine
               missbräuchliche Verwendung dieser Profile oder eines Profiling.
               Können diese Rechtswirkungen oder erhebliche Nachteile für Sie
               mit sich bringen, sehen wir grundsätzlich eine manuelle
               Überprüfung vor. &nbsp;
            </p>
         </div>

         <div>
            <ol start={7}>
               <li>
                  <p>
                     <strong>Wem geben wir Ihre Daten bekannt</strong>
                     &nbsp;&nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Im Zusammenhang mit unseren Verträgen, der Website, unseren
               Dienstleistungen und Produkten, unseren rechtlichen Pflichten
               oder sonst zur Wahrung unserer berechtigten Interessen und den
               weiteren in Ziff. 4 aufgeführten Zwecken übermitteln wir Ihre
               Personendaten auch an Dritte, insbesondere an die folgenden
               Kategorien von Empfängern: &nbsp;&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Dienstleister</strong>: Wir arbeiten mit
                     Dienstleistern im In- und Ausland zusammen, die in unserem
                     Auftrag oder in gemeinsamer Verantwortlichkeit mit uns
                     Daten über Sie bearbeiten oder in eigener
                     Verantwortlichkeit Daten über Sie von uns erhalten (z.B.
                     IT-Provider, Versandunternehmen, Werbedienstleister,
                     Login-Dienstleister, Reinigungsunternehmen,
                     Bewachungsunternehmen, Banken, Versicherungen,
                     Inkassofirmen, Wirtschaftsauskunfteien, oder Adressprüfer).
                     Dazu können auch Gesundheitsdaten gehören. Zu den für die
                     Website beigezogenen Dienstleistern vgl. Ziff. 12. Zentrale
                     Dienstleister im IT-Bereich sind für uns Google Ireland
                     Ltd. und Amazon Web Services EMEA SARL. &nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     <strong>Veranstaltungsveranstalter (Organisatoren)</strong>
                     : Bei der Teilnahme an einer Veranstaltung, die von einem
                     Veranstalter ausgerichtet wird, werden Informationen über
                     die Teilnehmer an den Veranstalter übermittelt. Die
                     Teilnehmer erhalten bei der Anmeldung zu einer
                     Veranstaltung eine Benachrichtigung, die sie über die
                     übertragenen Informationen sowie die Datenschutzhinweise
                     des Veranstalters informiert. Die Veranstalter fungieren
                     als eigenständige Verantwortliche im Rahmen des
                     Datenschutzes.&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Wenn Sie der Weitergabe Ihrer personenbezogenen Daten an einen
               potenziellen Arbeitgeber (sogenannten Veranstalter) zustimmen,
               indem Sie sich dessen Talentpool auf CareerFairy anschliessen,
               stellt CareerFairy diesem Veranstalter eine Kopie Ihrer
               personenbezogenen Daten zur Verfügung. Die Funktionalität des
               Talentpools kann von jedem Veranstalter individuell abgeschaltet
               werden.&nbsp;
            </p>

            <p>
               Wir arbeiten mit Veranstaltern innerhalb und ausserhalb des
               Europäischen Wirtschaftsraums, der Schweiz und des Vereinigten
               Königreichs zusammen. Veranstalter innerhalb des Europäischen
               Wirtschaftsraums und der Schweiz unterliegen den gleichen oder
               ähnlichen Datenschutzgesetzen wie CareerFairy.&nbsp;
            </p>

            <p>
               Für Veranstalter ausserhalb dieser Länder gelten jedoch
               möglicherweise nicht die gleichen Datenschutzgesetze und damit
               das gleiche Datenschutzniveau.&nbsp;
            </p>

            <p>
               Vor der Übermittlung der Daten an den jeweiligen Veranstalter
               wird ausdrücklich auf die Datenschutzhinweise des Veranstalters
               hingewiesen. Als eigenständer Verantwortlicher verarbeitet der
               Veranstalter Ihre Daten mit eigenen Mitteln und für eigene
               Zwecke.&nbsp;
            </p>

            <p>
               Wenn Sie nicht möchten, dass Ihre personenbezogenen Daten an den
               Veranstalter ausserhalb des Europäischen Wirtschaftsraums, der
               Schweiz und des Vereinigten Königreichs übermittelt werden,
               registrieren Sie sich bitte nicht bei den Talentpools dieses
               Veranstalters.&nbsp;
            </p>

            <p>
               Wir geben Ihre personenbezogenen Daten nicht an Organisatoren
               weiter, es sei denn, Sie haben Ihre ausdrückliche Zustimmung
               durch den Beitritt zum Talentpool eines bestimmten Unternehmens
               gegeben. Sie können sich jederzeit vom Talentpool eines
               Unternehmens abmelden, indem Sie auf die entsprechende
               Schaltfläche klicken.&nbsp;
            </p>

            <p>
               Sobald ein Veranstalter eine Kopie Ihrer personenbezogenen Daten
               erhalten hat, ist der Veranstalter für den Umgang mit diesen
               personenbezogenen Daten verantwortlich. Wenn Sie Bedenken
               hinsichtlich der Datenschutzpraktiken eines Veranstalters haben
               oder die Löschung Ihrer personenbezogenen Daten aus den Systemen
               eines Veranstalters wünschen, wenden Sie sich bitte direkt an
               diesen Veranstalter. Die Kontaktdaten finden Sie in den
               Datenschutzhinweisen des jeweiligen Veranstalters.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>
                        Weitergabe Ihrer Daten an potenzielle Arbeitgeber
                     </strong>
                     : Wenn Sie der Weitergabe Ihrer personenbezogenen Daten an
                     einen potenziellen Arbeitgeber zustimmen, übermittelt
                     CareerFairy eine Kopie Ihrer personenbezogenen Daten an
                     diesen Arbeitgeber.&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Wir arbeiten mit Arbeitgebern innerhalb und ausserhalb des
               Europäischen Wirtschaftsraums, der Schweiz und des Vereinigten
               Königreichs zusammen. Arbeitgeber innerhalb des Europäischen
               Wirtschaftsraums, der Schweiz und des Vereinigten Königreichs
               unterliegen den gleichen oder ähnlichen Datenschutzbestimmungen
               wie CareerFairy. Arbeitgeber ausserhalb dieser Länder unterliegen
               jedoch möglicherweise nicht dem gleichen Schutzniveau. Wenn Sie
               nicht möchten, dass Ihre personenbezogenen Daten an potenzielle
               Arbeitgeber ausserhalb des Europäischen Wirtschaftsraums, der
               Schweiz und des Vereinigten Königreichs weitergegeben werden,
               melden Sie sich bitte nicht für die Talentpools dieser
               Arbeitgeber an.&nbsp;
            </p>

            <p>
               Wir geben Ihre personenbezogenen Daten nicht an potenzielle
               Arbeitgeber weiter, es sei denn, Sie haben Ihre Einwilligung
               durch den Beitritt zum Talentpool eines bestimmten Unternehmens
               gegeben. Wenn Sie Ihre Meinung ändern, können Sie das Kästchen
               jederzeit deaktivieren.&nbsp;
            </p>

            <p>
               Sobald ein potenzieller Arbeitgeber über eine Kopie Ihrer
               personenbezogenen Daten verfügt, ist der Arbeitgeber für den
               Umgang mit diesen personenbezogenen Daten selbst verantwortlich.
               Wenn Sie Bedenken hinsichtlich der Datenschutzpraktiken eines
               potenziellen Arbeitgebers haben oder die Löschung Ihrer
               personenbezogenen Daten aus den Systemen eines potenziellen
               Arbeitgebers wünschen, wenden Sie sich bitte direkt an diesen
               Arbeitgeber.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Vertragspartner inklusive Kunden</strong>: Gemeint
                     sind zunächst die Kunden (z.B. Leistungsbezüger) und
                     anderen Vertragspartner von uns, weil sich diese
                     Datenübermittlung aus diesen Verträgen ergibt. Sie erhalten
                     z.B. Registrierungsdaten zu ausgegebenen und eingelösten
                     Gutscheinen, Einladungen etc. Wenn Sie für einen solchen
                     Vertragspartner selbst tätig sind, können wir diesem auch
                     in diesem Zusammenhang Daten über Sie übermitteln. Dazu
                     können auch Gesundheitsdaten gehören. Zu den Empfängern
                     gehören weiter Vertragspartner, mit denen wir kooperieren
                     oder die für uns Werbung treiben und denen wir deshalb
                     Daten über Sie für Analyse- und Marketingzwecke übermitteln
                     (das können wiederum Leistungsbezüger sein, aber z.B. auch
                     Sponsoren und Anbieter von Online-Werbung). Wir verlangen
                     von diesen Partnern, dass Sie Ihnen nur dann Werbung
                     zusenden oder basierend auf Ihren Daten ausspielen, wenn
                     Sie dem zugestimmt haben (für den Online-Bereich vgl. Ziff.
                     12). Unsere Online-Werbevertragspartner sind in Ziff. 12
                     aufgeführt.&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Behörden</strong>: Wir können Personendaten an
                     Ämter, Gerichte und andere Behörden im In- und Ausland
                     weitergeben, wenn wir dazu rechtlich verpflichtet oder
                     berechtigt sind oder dies zur Wahrung unserer Interessen
                     als erforderlich erscheint. Dazu können auch
                     Gesundheitsdaten gehören. Die Behörden bearbeiten in
                     eigener Verantwortlichkeit Daten über Sie, die sie von uns
                     erhalten.&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Weitere Personen</strong>: Gemeint sind andere
                     Fällen, wo sich der Einbezug von Dritten aus den Zwecken
                     gemäss Ziff. 4 ergibt, z.B. Leistungsempfänger, Medien und
                     Vereine, an denen wir mitwirken oder wenn Sie Teil einer
                     unserer Publikationen sind.&nbsp;&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Alle diese Kategorien von Empfängern können ihrerseits Dritte
               beiziehen, so dass Ihre Daten auch diesen zugänglich werden
               können. Die Bearbeitung durch bestimmte Dritte können wir
               beschränken (z.B. IT-Provider), jene anderer Dritter aber nicht
               (z.B. Behörden, Banken etc.).&nbsp;
            </p>

            <p>
               Wir behalten uns diese Datenbekanntgaben auch dann vor, wenn sie
               geheime Daten betreffen (es sei denn, wir haben mit Ihnen
               ausdrücklich vereinbart, dass wir diese Daten nicht an bestimmte
               Dritte weitergeben, es sei denn wir wären dazu gesetzlich
               verpflichtet). Ungeachtet dessen unterstehen Ihre Daten auch nach
               einer Bekanntgabe in der Schweiz und im restlichen Europa
               weiterhin einem angemessenen Datenschutz. Für die Bekanntgabe in
               andere Länder gelten die Bestimmungen von Ziff. 8. Möchten Sie
               nicht, dass bestimmte Daten weitergegeben werden, teilen Sie uns
               dies bitte mit, damit wir prüfen können, ob und inwieweit wir
               Ihnen entgegenkommen können (Ziff. 2).&nbsp;
            </p>

            <p>
               Wir ermöglichen auch <strong>bestimmten Dritten</strong> , auf
               unserer Website und bei Anlässen von uns ihrerseits{" "}
               <strong>Personendaten von Ihnen</strong> zu erheben (z.B.
               Medienfotografen, Anbieter von Tools, die wir auf unserer Website
               eingebunden haben etc.). Soweit wir nicht in entscheidender Weise
               an diesen Datenerhebungen beteiligt sind, sind diese Dritten
               alleine dafür verantwortlich. Bei Anliegen und zur Geltendmachung
               Ihrer Datenschutzrechte wenden Sie sich bitte direkt an diese
               Dritten. Vgl. Ziff. 12 für die Website.
            </p>
         </div>

         <div>
            <ol start={8}>
               <li>
                  <p>
                     <strong>
                        Gelangen Ihre Personendaten auch ins Ausland?
                     </strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Wie in Ziff. 7 erläutert, geben wir Daten auch anderen Stellen
               bekannt. Diese befinden sich nicht nur in der Schweiz. Ihre Daten
               können daher sowohl in Europa als auch in den USA bearbeitet
               werden; in Ausnahmefällen aber in jedem Land der Welt.
               &nbsp;&nbsp;
            </p>

            <p>
               Befindet sich ein Empfänger in einem Land ohne angemessenen
               gesetzlichen Datenschutz, verpflichten wir den Empfänger
               vertraglich zur Einhaltung des anwendbaren Datenschutzes (dazu
               verwenden wir die revidierten Standardvertragsklauseln der
               Europäischen Kommission, die hier:{" "}
               <a
                  href="https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj"
                  rel="noreferrer noopener"
                  target="_blank"
               >
                  https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj
               </a>
               ? abrufbar sind), soweit er nicht bereits einem gesetzlich
               anerkannten Regelwerk zur Sicherstellung des Datenschutzes
               unterliegt und wir uns nicht auf eine Ausnahmebestimmung stützen
               können. Eine Ausnahme kann namentlich bei Rechtsverfahren im
               Ausland gelten, aber auch in Fällen überwiegender öffentlicher
               Interessen oder wenn eine Vertragsabwicklung eine solche
               Bekanntgabe erfordert, wenn Sie eingewilligt haben oder wenn es
               sich um von Ihnen allgemein zugänglich gemachte Daten handelt,
               deren Bearbeitung Sie nicht widersprochen haben. &nbsp;&nbsp;
            </p>

            <p>
               Beachten Sie bitte auch, dass Daten, die über das Internet
               ausgetauscht werden, häufig über Drittstaaten geleitet werden.
               Ihre Daten können daher auch dann ins Ausland gelangen, wenn sich
               Absender und Empfänger im gleichen Land befinden.&nbsp;
            </p>

            <ol start={9}>
               <li>
                  <p>
                     <strong>Wie lange bearbeiten wir Ihre Daten?</strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Wir bearbeiten Ihre Daten so lange, wie es unsere
               Bearbeitungszwecke, die gesetzlichen Aufbewahrungsfristen und
               unsere berechtigten Interessen der Bearbeitung zu Dokumentations-
               und Beweiszwecken es verlangen oder eine Speicherung technisch
               bedingt ist. Weitere Angaben zur jeweiligen Speicher- und
               Bearbeitungsdauer finden Sie jeweils bei den einzelnen
               Datenkategorien in Ziff. 3 bzw. bei den Cookie-Kategorien in
               Ziff. 12. Stehen keine rechtlichen oder vertraglichen Pflichten
               entgegen, löschen oder anonymisieren wir Ihre Daten nach Ablauf
               der Speicher- oder Bearbeitungsdauer im Rahmen unserer üblichen
               Abläufe.&nbsp;
            </p>

            <ol start={10}>
               <li>
                  <p>
                     <strong>Wie schützen wir Ihre Daten?</strong> &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Wir treffen angemessene Sicherheitsmassnahmen, um die
               Vertraulichkeit, Integrität und Verfügbarkeit Ihrer Personendaten
               zu wahren, um sie gegen unberechtigte oder unrechtmässige
               Bearbeitungen zu schützen und den Gefahren des Verlusts, einer
               unbeabsichtigten Veränderung, einer ungewollten Offenlegung oder
               eines unberechtigten Zugriffs entgegenzuwirken. &nbsp;
            </p>
         </div>

         <div>
            <ol start={11}>
               <li>
                  <p>
                     <strong>Welche Rechte haben Sie?&nbsp;</strong>
                  </p>
               </li>
            </ol>

            <p>
               <strong>
                  Das anwendbare Datenschutzrecht gewährt Ihnen unter bestimmten
                  Umständen das Recht, der Bearbeitung Ihrer Daten zu
                  widersprechen, insbesondere jener für Zwecke des
                  Direktmarketings, des für Direktwerbung betriebenen Profilings
                  und weiterer berechtigter Interessen an der Bearbeitung.&nbsp;
               </strong>
            </p>

            <p>
               Um Ihnen die Kontrolle über die Bearbeitung Ihrer Personendaten
               zu erleichtern, haben Sie im Zusammenhang mit unserer
               Datenbearbeitung je nach anwendbarem Datenschutzrecht auch
               folgende Rechte: &nbsp;&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     Das Recht, von uns Auskunft zu verlangen, ob und welche
                     Daten wir von Ihnen bearbeiten;&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     das Recht, dass wir Daten korrigieren, wenn sie unrichtig
                     sind;&nbsp;
                  </p>
               </li>
               <li>
                  <p>das Recht, die Löschung von Daten zu verlangen;&nbsp;</p>
               </li>
               <li>
                  <p>
                     das Recht, von uns die Herausgabe bestimmter Personendaten
                     in einem gängigen elektronischen Format oder ihre
                     Übertragung an einen anderen Verantwortlichen zu
                     verlangen;&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     das Recht, eine Einwilligung zu widerrufen, soweit unsere
                     Bearbeitung auf Ihrer Einwilligung beruht;&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     das Recht auf Nachfrage weitere Informationen zu erhalten,
                     die für die Ausübung dieser Rechte erforderlich sind;&nbsp;
                  </p>
               </li>
            </ul>

            <ul>
               <li>
                  <p>
                     das Recht, bei automatisierten Einzelentscheidungen (Ziff.
                     6) Ihren Standpunkt darzulegen und zu verlangen, dass die
                     Entscheidung von einer natürlichen Person überprüft
                     wird.&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               <strong>
                  Wenn Sie uns gegenüber die oben genannten Rechte ausüben
                  wollen
               </strong>
               , wenden Sie sich bitte schriftlich, bei uns vor Ort oder, wo
               nicht anders angegeben oder vereinbart, per E-Mail an uns; unsere
               Kontaktangaben finden Sie in Ziff. 2. Damit wir einen Missbrauch
               ausschliessen können, müssen wir Sie identifizieren (z.B. mit
               einer Ausweiskopie, soweit dies nicht anders möglich
               ist).&nbsp;&nbsp;
            </p>

            <p>
               Sie haben diese Rechte auch gegenüber anderen Stellen, die mit
               uns eigenverantwortlich zusammenarbeiten – wenden Sie sich bitte
               direkt an diese, wenn Sie Rechte im Zusammenhang mit deren
               Bearbeitung wahrnehmen wollen. Angaben zu unseren wichtigen
               Kooperationspartnern und Dienstleistern finden Sie in Ziff. 7,
               weitere Angaben in Ziff. 12.&nbsp;
            </p>

            <p>
               Bitte beachten Sie, dass für diese Rechte nach dem anwendbaren
               Datenschutzrecht Voraussetzungen, Ausnahmen oder Einschränkungen
               gelten (z.B. zum Schutz von Dritten oder von
               Geschäftsgeheimnissen). Wir werden Sie ggf. entsprechend
               informieren.&nbsp;
            </p>

            <p>
               Wenn Sie mit unserem Umgang mit Ihren Rechten oder dem
               Datenschutz nicht einverstanden sind, teilen Sie das uns oder
               unseren Datenschutzbeauftragten (Ziff. 2) bitte mit. Insbesondere
               wenn Sie sich im EWR, im Vereinigten Königreich oder in der
               Schweiz befinden, haben Sie zudem das Recht, sich bei der
               Datenschutz-Aufsichtsbehörde Ihres Landes zu beschweren. Eine
               Liste der Behörden im EWR finden Sie hier:{" "}
               <a
                  href="https://edpb.europa.eu/about-edpb/board/members_en"
                  rel="noreferrer noopener"
                  target="_blank"
               >
                  https://edpb.europa.eu/about-edpb/board/members_en
               </a>
               . Die Aufsichtsbehörde des Vereinigten Königreichs erreichen Sie
               hier:{" "}
               <a
                  href="https://ico.org.uk/global/contact-us/"
                  rel="noreferrer noopener"
                  target="_blank"
               >
                  https://ico.org.uk/global/contact-us/
               </a>
               . Die Schweizer Aufsichtsbehörde erreichen Sie hier:{" "}
               <a
                  href="https://www.edoeb.admin.ch/edoeb/en/home/the-fdpic/contact.html"
                  rel="noreferrer noopener"
                  target="_blank"
               >
                  https://www.edoeb.admin.ch/edoeb/en/home/the-fdpic/contact.html
               </a>
               .&nbsp;
            </p>

            <p>
               Wenn Sie Ihre Profilinformationen aktualisieren möchten, können
               Sie dies tun, indem Sie die Informationen direkt im Abschnitt
               „Mein Profil“ Ihres Kontos ändern. Wenn Sie Ihre persönlichen
               Daten löschen oder Ihr Konto dauerhaft löschen möchten, können
               Sie dies tun, indem Sie uns per E-Mail unter
               privacy@careerfairy.io kontaktieren.&nbsp;
            </p>
         </div>

         <div>
            <ol start={12}>
               <li>
                  <p>
                     <strong>
                        Verwenden wir Online-Tracking- und
                        Online-Werbetechniken?
                     </strong>{" "}
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Auf unserer Website setzen wir verschiedene Techniken ein, mit
               denen wir und von uns beigezogenen Dritte Sie bei Ihrer Nutzung
               wiedererkennen und unter Umständen auch über mehrere Besuche
               hinweg verfolgen können. In diesem Abschnitt informieren wir Sie
               darüber.&nbsp;
            </p>

            <p>
               Im Kern geht es darum, dass wir die Zugriffe von Ihnen (über Ihr
               System) von Zugriffen anderer Benutzer unterscheiden können,
               damit wir die Funktionalität der Website sicherstellen und
               Auswertungen und Personalisierungen vornehmen können. Wir wollen
               dabei nicht auf Ihre Identität schliessen, auch wenn wir dies
               können, soweit wir oder von uns beigezogene Dritte Sie durch
               Kombination mit Registrierungsdaten identifizieren können. Auch
               ohne Registrierungsdaten sind die eingesetzten Techniken aber so
               ausgestaltet, dass Sie bei jedem Seitenaufruf als individueller
               Besucher erkannt werden, etwa indem unser Server (oder die Server
               der Dritten) Ihnen bzw. Ihrem Browser eine bestimmte
               Erkennungsnummer zuweist (sog &laquo;Cookie&raquo;).&nbsp;&nbsp;
            </p>

            <p>
               Wir verwenden solche Techniken auf unserer Website und erlauben
               bestimmten Dritten, dies ebenfalls zu tun. Je nach dem Zweck
               dieser Techniken fragen wir aber nach Ihrer Einwilligung, bevor
               diese zum Einsatz kommen. Sie können auf Ihre aktuellen
               Einstellungen
               <Button onClick={resetCookieConsent}>hier</Button> zugreifen. Sie
               können Ihren Browser so programmieren, dass er bestimmte Cookies
               oder Alternativtechniken blockiert, täuscht oder bestehende
               Cookies löscht. Sie können Ihren Browser auch mit Software
               erweitern, die das Tracking durch bestimmte Dritte sperrt.
               Weitere Angaben dazu finden Sie auf den Hilfeseiten Ihres
               Browsers (meist unter dem Stichwort &laquo;Datenschutz&raquo;)
               oder auf den Websites der Dritten, die wir unten aufführen.&nbsp;
            </p>

            <p>
               Es werden folgende Cookies (Techniken mit vergleichbaren
               Funktionsweisen wie das Fingerprinting sind hier mitgemeint)
               unterschieden:&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Notwendige Cookies:</strong> Einige Cookies sind
                     für das Funktionieren der Website als solche oder bestimmte
                     Funktionen notwendig. Sie stellen z.B. sicher, dass Sie
                     zwischen den Seiten wechseln können, ohne dass in einem
                     Formular eingegebene Angaben verloren gehen. Sie stellen
                     ausserdem sicher, dass Sie eingeloggt bleiben. Diese
                     Cookies bestehen nur temporär (&laquo;Session
                     Cookies&raquo;)»). Falls Sie sie blockieren, funktioniert
                     die Website möglicherweise nicht. Andere Cookies sind
                     notwendig, damit der Server von Ihnen getroffene Entscheide
                     oder Eingaben über eine Sitzung (d.h. einen Besuch der
                     Website) hinaus speichern kann, falls Sie diese Funktion
                     beanspruchen (z.B. gewählte Sprache, erteilte Einwilligung,
                     die Funktion für ein automatisches Einloggen etc.). Diese
                     Cookies haben ein Verfallsdatum von bis zu 24 Monaten.
                     &nbsp;&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Performance Cookies</strong>: Um unsere Website und
                     entsprechende Angebote zu optimieren und besser auf die
                     Bedürfnisse der Benutzer abzustimmen, nutzen wir Cookies,
                     um die Verwendung unserer Website aufzuzeichnen und zu
                     analysieren, unter Umständen auch über die Sitzung hinaus.
                     Das tun wir durch den Einsatz von Analyse-Diensten von
                     Drittanbietern. Diese haben wir unten aufgeführt. Bevor wir
                     solche Cookies einsetzen, bitten wir Sie um Ihre
                     Zustimmung. Sie können diese über die Cookie-Einstellungen{" "}
                     <Button onClick={resetCookieConsent}>hier</Button>.
                     jederzeit widerrufen. Performance Cookies haben ebenfalls
                     ein Verfallsdatum von bis zu 24 Monaten. Details finden Sie
                     auf den Websites der Drittanbieter.&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Marketing Cookies</strong>: Wir und unsere
                     Werbe-Vertragspartner haben ein Interesse daran, Werbung
                     zielgruppengenau zu steuern, d.h. möglichst nur denen
                     anzuzeigen, die wir ansprechen wollen. Unsere
                     Werbe-Vertragspartner haben wir unten aufgeführt. Zu diesem
                     Zweck setzen wir und unsere Werbe-Vertragspartner – falls
                     Sie einwilligen – ebenfalls Cookies ein, mit denen die
                     aufgerufenen Inhalte oder geschlossenen Verträge erfasst
                     werden können. Das ermöglicht es uns und unseren
                     Werbe-Vertragspartnern, Werbung anzuzeigen, bei der wir
                     davon ausgehen können, dass sie Sie interessiert, auf
                     unserer Website, aber auch auf anderen Websites, die
                     Werbung von uns bzw. unseren Werbe-Vertragspartnern
                     anzeigen. Diese Cookies haben je nach Situation eine
                     Verfalldauer von einigen Tagen bis zu 12 Monaten. Falls Sie
                     in die Verwendung dieser Cookies einwilligen, wird Ihnen
                     entsprechende Werbung angezeigt. Falls Sie nicht in diese
                     Cookies einwilligen, sehen Sie nicht weniger Werbung,
                     sondern einfach irgendwelche andere Werbung. &nbsp;&nbsp;
                  </p>
               </li>
               <li>
                  <p>
                     <strong>Kontobezogene Cookies</strong>&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Wenn Sie bei uns ein Konto erstellen, verwenden wir Cookies zur
               Verwaltung des Anmeldevorgangs und für die allgemeine Verwaltung.
               Diese Cookies werden in der Regel gelöscht, wenn Sie sich
               abmelden. In einigen Fällen bleiben sie jedoch möglicherweise
               bestehen, um Ihre Website-Einstellungen zu speichern, wenn Sie
               sich abmelden.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Anmeldebezogene Cookies</strong>&nbsp;
                  </p>
               </li>
            </ul>

            <p>
               Wir verwenden Cookies, wenn Sie eingeloggt sind, damit wir uns
               daran erinnern können. Dies verhindert, dass Sie sich jedes Mal
               neu anmelden müssen, wenn Sie eine neue Seite besuchen. Diese
               Cookies werden in der Regel entfernt oder gelöscht, wenn Sie sich
               abmelden, um sicherzustellen, dass Sie nur auf eingeschränkte
               Funktionen und Bereiche zugreifen können, wenn Sie angemeldet
               sind.&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Formularbezogene Cookies</strong>
                  </p>
               </li>
            </ul>

            <p>
               Wenn Sie Daten über ein Formular wie Kontaktseiten oder
               Kommentarformulare übermitteln, werden möglicherweise Cookies
               gesetzt, um Ihre Benutzerinformationen für zukünftige
               Korrespondenz zu speichern.&nbsp;
            </p>

            <p>&nbsp;</p>

            <p>
               Neben Marketing-Cookies verwenden wir weitere Techniken, um
               Online-Werbung auf anderen Websites zu steuern und dadurch
               Streuverluste zu reduzieren. Wir können bspw. die E-Mail-Adressen
               unserer Nutzer, Kunden und weiteren Personen, denen wir Werbung
               anzeigen wollen, an Betreiber von Werbeplattformen übermitteln
               (z.B. Social Media). Falls diese Personen dort mit derselben
               E-Mail-Adresse registriert sind (was die Werbeplattformen durch
               einen Abgleich feststellen), zeigen die Betreiber die von uns
               geschaltete Werbung zielgerichtet diesen Personen an.
               Personenbezogene E-Mail-Adressen von nicht bereits bekannten
               Personen erhalten die Betreiber dabei nicht. Bei bekannten
               E-Mail-Adressen erfahren sie aber, dass diese Personen mit uns in
               Verbindung stehen und welche Inhalte sie aufgerufen haben. &nbsp;
            </p>

            <p>
               Wir können auf unserer Website auch weitere Angebote Dritter
               einbinden, insbesondere von Social Media-Anbietern. Diese
               Angebote sind dabei standardmässig deaktiviert. Sobald Sie sie
               aktivieren (z.B. durch Anklicken eines Schalters), können die
               entsprechenden Anbieter feststellen, dass Sie sich auf unserer
               Website befinden. Haben Sie beim Social Media-Anbieter ein Konto,
               kann er Ihnen diese Angabe zuordnen und so Ihre Nutzung von
               Online-Angeboten verfolgen. Diese Social Media-Anbieter
               bearbeiten diese Daten in eigener Verantwortung.&nbsp;
            </p>

            <p>
               Derzeit verwenden wir Angebote der folgende Dienstleister und
               Werbe-Vertragspartner (soweit diese zur Werbesteuerung Daten von
               Ihnen bzw. bei Ihnen gesetzte Cookies verwenden):&nbsp;
            </p>

            <div
               className="uc-embed"
               // eslint-disable-next-line react/no-unknown-property
               uc-data="all"
               // eslint-disable-next-line react/no-unknown-property
               uc-embedding-type="category"
               // eslint-disable-next-line react/no-unknown-property
               uc-styling="true"
            ></div>
         </div>

         <div>
            <ol start={13}>
               <li>
                  <p>
                     <strong>
                        Welche Daten bearbeiten wir auf unseren Seiten in
                        sozialen Netzwerken?{" "}
                     </strong>
                     &nbsp;
                  </p>
               </li>
            </ol>

            <p>
               Wir können auf sozialen Netzwerken und anderen von Dritten
               betriebenen Plattformen Seiten und sonstige Online-Präsenzen
               betreiben («Fanpages», «Kanäle», «Profile» etc.) und dort die in
               Ziff. 3 und nachfolgend umschriebenen Daten über Sie erheben. Wir
               erhalten diese Daten von Ihnen und den Plattformen, wenn Sie über
               unsere Online-Präsenz mit uns in Kontakt kommen (z.B., wenn Sie
               mit uns kommunizieren, unsere Inhalte kommentieren oder unsere
               Präsenz besuchen). Gleichzeitig werten die Plattformen Ihre
               Nutzung unserer Online-Präsenzen aus und verknüpfen diese Daten
               mit weiteren, den Plattformen bekannten Daten über Sie (z.B. zu
               Ihrem Verhalten und Ihren Präferenzen). Sie bearbeiten diese
               Daten auch für eigene Zwecke in eigener Verantwortlichkeit,
               insbesondere für Marketing- und Marktforschungszwecke (z.B. um
               Werbung zu personalisieren) und um ihre Plattformen zu steuern
               (z.B. welche Inhalte sie Ihnen anzeigen).&nbsp;&nbsp;
            </p>

            <p>
               Wir bearbeiten diese Daten zu den in Ziff. 4 beschriebenen
               Zwecken, so insbesondere zur Kommunikation, für Marketingzwecke
               (einschliesslich Werbung auf diesen Plattformen, vgl. dazu Ziff.
               12) und zur Marktforschung. Zu den entsprechenden
               Rechtsgrundlagen finden Sie Angaben in Ziff. 5. Von Ihnen selbst
               veröffentlichte Inhalte (z.B. Kommentare zu einer Ankündigung)
               können wir selbst weiterverbreiten (z.B. in unserer Werbung auf
               der Plattform oder anderswo). Wir oder die Betreiber der
               Plattformen können Inhalte von oder zu Ihnen auch entsprechend
               den Nutzungsrichtlinien löschen oder einschränken (z.B.
               unangemessene Kommentare).&nbsp;&nbsp;
            </p>

            <p>
               Weitere Angaben zu den Bearbeitungen der Betreiber der
               Plattformen entnehmen Sie bitte den Datenschutzhinweisen der
               Plattformen. Dort erfahren Sie auch, in welchen Ländern diese
               ihre Daten bearbeiten, welche Auskunfts-, Lösch- und weiteren
               Betroffenenrechte Sie haben und wie Sie diese wahrnehmen oder
               weitere Informationen erhalten können. Derzeit nutzen wir
               folgende Plattformen:&nbsp;
            </p>

            <ul>
               <li>
                  <p>
                     <strong>Facebook</strong>: Hier betreiben wir die Seite
                     www.facebook.com/careerfairy. Die verantwortliche Stelle
                     für den Betrieb der Plattform ist für Benutzer aus Europa
                     Facebook Ireland Ltd., Dublin, Irland. Deren
                     Datenschutzhinweise sind unter www.facebook.com/policy
                     abrufbar. Einige Ihrer Daten werden dabei in die USA
                     übermittelt. Widerspruch bezüglich Werbung ist hier
                     möglich: www.facebook.com/settings?tab=ads. In Bezug auf
                     die Daten, die beim Besuch unserer Seite für die Erstellung
                     von «Page Insights» erhoben und bearbeitet werden, sind wir
                     mit Facebook Ireland Ltd., Dublin, Irland, gemeinsam
                     verantwortlich. Im Rahmen von Page Insights werden
                     Statistiken darüber erstellt, was Besucher auf unserer
                     Seite tun (Beiträge kommentieren, Inhalte weiterleiten,
                     etc.). Das ist auf{" "}
                     <a
                        rel="noreferrer noopener"
                        target="_blank"
                        href="www.facebook.com/legal/terms/information_about_page_insights_data"
                     >
                        Facebook Insights Data.
                     </a>
                     beschrieben. Es hilft uns zu verstehen, wie unsere Seite
                     genutzt wird und wie wir sie verbessern können. Wir
                     erhalten dabei nur anonyme, aggregierte Daten. Unsere
                     Verantwortlichkeiten betreffend Datenschutz haben wir
                     gemäss den Angaben auf{" "}
                     <a
                        rel="noreferrer noopener"
                        target="_blank"
                        href="www.facebook.com/legal/terms/page_controller_addendum"
                     >
                        Facebook Page Controller.
                     </a>{" "}
                     geregelt.
                  </p>
               </li>
            </ul>
         </div>

         <div>
            <ol start={14}>
               <li>
                  <p>
                     <strong>
                        Kann diese Datenschutzerklärung geändert werden? &nbsp;
                     </strong>
                  </p>
               </li>
            </ol>

            <p>
               Diese Datenschutzerklärung ist nicht Bestandteil eines Vertrags
               mit Ihnen. Wir können diese Datenschutzerklärung jederzeit
               anpassen. Die auf dieser Website veröffentlichte Version ist die
               jeweils aktuelle Fassung. &nbsp;
            </p>

            <p>Letzte Aktualisierung: 13.10.2023 &nbsp;</p>
         </div>
      </Box>
   )
}

export default withFirebase(DataProtection)
