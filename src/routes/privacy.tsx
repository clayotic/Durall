import { createFileRoute, Link } from "@tanstack/react-router";
import { Clause, ContactClause, ITEM, LINK, LIST, PolicyPage } from "@/components/durall/Policy";
import { seoHead } from "@/content/head";
import { useSite } from "@/content/site";

/* Change this whenever the policy below changes. */
const UPDATED = "5 October 2026";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seoHead({
      title: "Privacy Policy — Durall Systems",
      description:
        "What the Durall Systems website collects when you visit or write to us, how it is used, who helps us run it, and the choices you have.",
    }),
  component: PrivacyPage,
});

/**
 * The privacy policy. It describes what the site does today: the two
 * enquiry forms (content/enquiry.ts), applications by email, the host's
 * logs, and the outside services a page calls (fonts, the contact map,
 * films in articles). If any of that changes, this page has to change with
 * it, and so does UPDATED.
 *
 * The company's name and address come from the site settings, so they stay
 * the same here as in the footer.
 */
function PrivacyPage() {
  const { company, office } = useSite().settings;

  return (
    <PolicyPage
      updated={UPDATED}
      title="Privacy Policy"
      lede="What this website collects when you visit or write to us, what we do with it, and the choices you have."
    >
      <Clause title="Who we are">
        <p>
          This website is run by <strong>{company.legalName}</strong> (“Durall”, “we”),{" "}
          {office.lines.join(", ")}.
        </p>
        <p>
          This policy covers this website only. It does not cover the other websites it links to.
        </p>
      </Clause>

      <Clause title="What we collect">
        <ul className={LIST}>
          <li className={ITEM}>
            <strong>What you send us.</strong> When you use an enquiry form: your name and email
            address and, if you give them, your phone number, your practice or studio, the project’s
            type and location, and your message. We also record whether you ticked “Subscribe for
            updates”.
          </li>
          <li className={ITEM}>
            <strong>Job applications.</strong> Applications reach us by email, so we receive
            whatever you choose to send: usually a CV, a portfolio and your contact details.
          </li>
          <li className={ITEM}>
            <strong>What your browser sends.</strong> As with any website, the request for a page
            carries your IP address, the kind of browser and device you use, the page asked for and
            the time. Our hosting provider keeps these in its server logs.
          </li>
        </ul>
        <p>
          We do not run analytics, advertising or tracking scripts on this site, visitors have no
          accounts here, and we take no payments through it.
        </p>
      </Clause>

      <Clause title="How we use it">
        <ul className={LIST}>
          <li className={ITEM}>To answer your enquiry and prepare what you asked us for.</li>
          <li className={ITEM}>
            To send you updates, only if you ticked the box, and until you tell us to stop.
          </li>
          <li className={ITEM}>To consider your application for a role.</li>
          <li className={ITEM}>
            To keep the site and its forms working and safe. Your IP address is used for a few
            minutes to limit repeated messages from one place; it is not saved with your enquiry.
          </li>
          <li className={ITEM}>To keep the records the law requires of a business.</li>
        </ul>
        <p>
          We do not use your information for advertising, and no decision about you is made by a
          machine.
        </p>
      </Clause>

      <Clause title="Cookies">
        <p>
          The public pages of this site set no cookies and store nothing in your browser. The one
          cookie the site uses keeps Durall’s own team signed in to the site’s editing room, and is
          set only there.
        </p>
        <p>
          Where an article includes a film, it plays through YouTube’s privacy-enhanced mode or
          through Vimeo with tracking switched off. Those services may still store information in
          your browser once you press play.
        </p>
      </Clause>

      <Clause title="Services that help us run this site">
        <ul className={LIST}>
          <li className={ITEM}>
            <strong>Netlify</strong> hosts the website and keeps its server logs.
          </li>
          <li className={ITEM}>
            <strong>Supabase</strong> hosts the database where enquiries are stored.
          </li>
          <li className={ITEM}>
            <strong>Google Fonts</strong> supplies the typefaces. Your browser fetches them from
            Google’s servers, which see your IP address when it does.
          </li>
          <li className={ITEM}>
            <strong>OpenFreeMap</strong> supplies the map on the{" "}
            <Link to="/contact" className={LINK}>
              Contact
            </Link>{" "}
            page.
          </li>
          <li className={ITEM}>
            <strong>YouTube and Vimeo</strong> play films, where an article includes one.
          </li>
        </ul>
        <p>
          Some of these providers keep their servers outside India, so information may be processed
          there. Links to Google Maps, LinkedIn and Instagram take you to those services, where
          their own policies apply.
        </p>
      </Clause>

      <Clause title="Who sees it">
        <p>
          Enquiries are read by the members of the Durall team who answer them. We do not sell, rent
          or trade personal information. We pass it only to the providers named above, as far as
          they need it to do their work for us, and to the authorities where the law requires it.
        </p>
      </Clause>

      <Clause title="How long we keep it">
        <p>
          We keep an enquiry for as long as it takes to answer it and, if a project follows, for the
          life of that project and for as long afterwards as the law requires business records to be
          kept. Applications are kept for the hiring they were sent for; tell us if you would like
          yours kept on file.
        </p>
        <p>Ask us to delete something sooner and we will, unless the law requires us to keep it.</p>
      </Clause>

      <Clause title="Your choices">
        <p>You can ask us at any time:</p>
        <ul className={LIST}>
          <li className={ITEM}>for a copy of the information we hold about you;</li>
          <li className={ITEM}>to correct anything that is wrong or out of date;</li>
          <li className={ITEM}>to delete it;</li>
          <li className={ITEM}>to stop sending you updates;</li>
          <li className={ITEM}>to look into a concern about how we have handled it.</li>
        </ul>
        <p>
          Write to us at the address below and we will answer as soon as we reasonably can. These
          choices are in addition to any rights the law gives you over your personal information.
        </p>
      </Clause>

      <Clause title="Keeping it safe">
        <p>
          The site is served over an encrypted connection, and enquiries are held in a database that
          only signed-in members of the Durall team can open. No website can promise perfect
          security; if something goes wrong that affects your information, we will tell you.
        </p>
      </Clause>

      <Clause title="Children">
        <p>
          This site is written for architects, designers, developers and their clients. It is not
          directed at children, and we do not knowingly collect information from anyone under 18.
        </p>
      </Clause>

      <Clause title="Changes to this policy">
        <p>
          When we change how we handle information we will update this page and the date at the top
          of it.
        </p>
      </Clause>

      <ContactClause about="or request about your information" />
    </PolicyPage>
  );
}
