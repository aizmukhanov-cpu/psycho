import About from "@/components/About";
import Faq from "@/components/Faq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Format from "@/components/Format";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MonthlyTopic from "@/components/MonthlyTopic";
import Pricing from "@/components/Pricing";
import { getContent } from "@/lib/content";

export default async function Home() {
  const c = await getContent();
  return (
    <>
      <Header clubName={c.clubName} contactUrl={c.contactUrl} />
      <main>
        <Hero hero={c.hero} venue={c.venue} contactUrl={c.contactUrl} />
        <About />
        <Format contactUrl={c.contactUrl} />
        <MonthlyTopic topics={c.topics} contactUrl={c.contactUrl} nextMeeting={c.nextMeeting} venue={c.venue} venueUrl={c.venueUrl} />
        <Pricing plans={c.plans} includes={c.planIncludes} contactUrl={c.contactUrl} />
        <Faq faqs={c.faqs} />
        <FinalCta contactUrl={c.contactUrl} contactLabel={c.contactLabel} />
      </main>
      <Footer clubName={c.clubName} contactUrl={c.contactUrl} />
    </>
  );
}
