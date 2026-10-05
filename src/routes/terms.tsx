import { createFileRoute, Link } from "@tanstack/react-router";
import { Clause, ContactClause, ITEM, LINK, LIST, PolicyPage } from "@/components/durall/Policy";
import { seoHead } from "@/content/head";
import { useSite } from "@/content/site";

/* Change this whenever the terms below change. */
const UPDATED = "5 October 2026";

export const Route = createFileRoute("/terms")({
  head: () =>
    seoHead({
      title: "Terms of Use — Durall Systems",
      description:
        "The terms on which the Durall Systems website is offered: what it is for, who owns what is on it, and how it may be used.",
    }),
  component: TermsPage,
});

/**
 * The terms of use, for a site that informs and takes enquiries: it sells
 * nothing and visitors have no accounts, so there is nothing here about
 * orders, payment or membership. A project is governed by its own
 * agreement, and the page says so.
 */
function TermsPage() {
  const { company } = useSite().settings;

  return (
    <PolicyPage
      updated={UPDATED}
      title="Terms of Use"
      lede="The terms on which this website is offered, and what you can and cannot do with what is on it."
    >
      <Clause title="About these terms">
        <p>
          This website is run by <strong>{company.legalName}</strong> (“Durall”, “we”). By using it
          you agree to these terms. If you do not agree to them, please do not use the site.
        </p>
        <p>
          They cover this website only. Any project we take on with you is governed by its own
          written agreement, not by this page.
        </p>
      </Clause>

      <Clause title="What this site is for">
        <p>
          The site describes Durall’s work, the systems we supply and the projects we have been part
          of. It is general information. Nothing on it is an offer, a quotation, a specification or
          professional advice, and sending us an enquiry does not create a contract between us.
        </p>
      </Clause>

      <Clause title="Technical information">
        <p>
          The dimensions, performance figures, drawings and details shown here are indicative. What
          can be achieved depends on the system, the opening, the site and the standards that apply
          to it.
        </p>
        <p>
          Do not design, specify or build from this site. Ask us, and rely only on what we confirm
          for your project in writing.
        </p>
      </Clause>

      <Clause title="Who owns what">
        <ul className={LIST}>
          <li className={ITEM}>
            The text, drawings and design of this site belong to Durall or to those who have
            licensed them to us.
          </li>
          <li className={ITEM}>
            Photographs remain the property of their photographers or of the practices credited
            beside them.
          </li>
          <li className={ITEM}>
            The buildings shown are the work of the architects and designers credited with them.
          </li>
          <li className={ITEM}>
            The names and logos of our partners and of other companies are their owners’ trade
            marks.
          </li>
        </ul>
        <p>
          You are welcome to view the site, to link to it, and to quote short passages with a credit
          to Durall. You may not otherwise copy it, republish it or use what is on it commercially
          without our written permission.
        </p>
      </Clause>

      <Clause title="Using the site fairly">
        <p>You agree not to:</p>
        <ul className={LIST}>
          <li className={ITEM}>
            try to get into parts of the site, or the systems behind it, that are not open to you;
          </li>
          <li className={ITEM}>
            disrupt it, overload it, or collect what is on it in bulk by automated means;
          </li>
          <li className={ITEM}>
            send anything unlawful, misleading or abusive through its forms, or use them to
            advertise;
          </li>
          <li className={ITEM}>pass yourself off as someone else.</li>
        </ul>
      </Clause>

      <Clause title="What you send us">
        <p>
          Send us only information and documents you are entitled to share, and make sure they are
          accurate. We use them to answer you, as set out in our{" "}
          <Link to="/privacy" className={LINK}>
            Privacy Policy
          </Link>
          .
        </p>
      </Clause>

      <Clause title="Links to other websites">
        <p>
          The site links to other websites, among them those of our partners, of the architects we
          work with, and of map and social services. We do not control them and are not responsible
          for what they contain or for how they treat your information.
        </p>
      </Clause>

      <Clause title="Accuracy and availability">
        <p>
          We work to keep the site accurate and available, but we offer it as it is. We do not
          promise that it is free of errors or that it will always be online, and we may change or
          remove any part of it without notice.
        </p>
      </Clause>

      <Clause title="Our liability">
        <p>
          As far as the law allows, Durall is not liable for any loss that comes from using this
          site or from relying on what is on it. Nothing in these terms limits a liability that the
          law does not allow to be limited.
        </p>
      </Clause>

      <Clause title="The law that applies">
        <p>
          These terms are governed by the laws of India, and any dispute about them or about the
          site is for the courts of Mumbai.
        </p>
      </Clause>

      <Clause title="Changes to these terms">
        <p>
          When these terms change we will update this page and the date at the top of it. Using the
          site after that means you accept them as changed.
        </p>
      </Clause>

      <ContactClause about="about these terms" />
    </PolicyPage>
  );
}
