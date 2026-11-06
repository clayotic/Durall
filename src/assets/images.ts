/**
 * The site's photography, vendored and encoded to WebP.
 *
 * These used to be `*.asset.json` sidecars pointing at Lovable's asset CDN.
 * That CDN serves the untouched original — no WebP or AVIF on `Accept`, no
 * automatic resizing — so the 27 images the site uses shipped as 34.8 MB of
 * PNG, 4.06 MB of it the hero backdrop alone. Re-encoded here they come to
 * 3.22 MB including every responsive variant.
 *
 * Each entry carries `width`/`height` so `<img>` can reserve its box, and the
 * ones whose displayed width really varies carry a `srcSet` as well. Spread an
 * entry onto an `<img>` and add `alt`, `sizes` and `className`:
 *
 *   <img {...IMAGES.heroParikrama} alt="…" sizes="100vw" className="…" />
 *
 * The `.asset.json` files are left in place, unimported. If Lovable re-uploads
 * an image, it lands there rather than here, so re-run the encode step in that
 * case instead of expecting the two to stay in sync on their own.
 */

// The first frame of the home page's opening film (public/video/hero-*).
import heroFilm960 from "./hero-film-960w.webp";
import heroFilm1440 from "./hero-film-1440w.webp";
import heroFilm1920 from "./hero-film.webp";
import heroParikrama960 from "./hero-parikrama-960w.webp";
import heroParikrama1440 from "./hero-parikrama-1440w.webp";
import heroParikrama1920 from "./hero-parikrama.webp";
import heroAbout640 from "./hero-about-640w.webp";
import heroAbout960 from "./hero-about-960w.webp";
import heroAbout1280 from "./hero-about-1280w.webp";
import heroAbout1600 from "./hero-about-1600w.webp";
import heroAbout1920 from "./hero-about-1920w.webp";
import heroAbout2560 from "./hero-about-2560w.webp";
import heroPartners960 from "./hero-partners-960w.webp";
import heroPartners1440 from "./hero-partners-1440w.webp";
import heroPartners1920 from "./hero-partners.webp";
import heroProjects640 from "./hero-projects-640w.webp";
import heroProjects960 from "./hero-projects-960w.webp";
import heroProjects1280 from "./hero-projects-1280w.webp";
import heroProjects1600 from "./hero-projects-1600w.webp";
import heroProjects1920 from "./hero-projects-1920w.webp";
import heroProjects2560 from "./hero-projects-2560w.webp";
import heroCareers960 from "./hero-careers-960w.webp";
import heroCareers1440 from "./hero-careers-1440w.webp";
import heroCareers1920 from "./hero-careers.webp";
import logoDurallWhite from "./logo-durall-white.webp";
import philosophyPavilion880 from "./philosophy-pavilion-880w.webp";
import philosophyPavilion1440 from "./philosophy-pavilion-1440w.webp";
import philosophyPavilion2048 from "./philosophy-pavilion-2048w.webp";
import philosophyPavilion1130 from "./philosophy-pavilion-1130w.webp";

import projectPatina640 from "./project-patina-640w.webp";
import projectPatina from "./project-patina.webp";
import projectPatina930 from "./project-patina-930w.webp";
import projectSentosa640 from "./project-sentosa-640w.webp";
import projectSentosa from "./project-sentosa.webp";
import projectSentosa930 from "./project-sentosa-930w.webp";
import projectChiltron640 from "./project-chiltron-640w.webp";
import projectChiltron from "./project-chiltron.webp";
import projectChiltron930 from "./project-chiltron-930w.webp";
import projectJuhu640 from "./project-juhu-640w.webp";
import projectJuhu from "./project-juhu.webp";
import projectJuhu930 from "./project-juhu-930w.webp";
import projectBangalore640 from "./project-bangalore-640w.webp";
import projectBangalore from "./project-bangalore.webp";
import projectBangalore930 from "./project-bangalore-930w.webp";
import projectBanyan640 from "./project-banyan-640w.webp";
import projectBanyan from "./project-banyan.webp";
import projectBanyan930 from "./project-banyan-930w.webp";

import cardParikrama480 from "./card-parikrama-480w.webp";
import cardParikrama from "./card-parikrama.webp";
import cardParikrama610 from "./card-parikrama-610w.webp";
import cardPatina480 from "./card-patina-480w.webp";
import cardPatina from "./card-patina.webp";
import cardPatina610 from "./card-patina-610w.webp";
import cardChiltron480 from "./card-chiltron-480w.webp";
import cardChiltron from "./card-chiltron.webp";
import cardChiltron620 from "./card-chiltron-620w.webp";
import cardJuhu480 from "./card-juhu-480w.webp";
import cardJuhu from "./card-juhu.webp";
import cardJuhu610 from "./card-juhu-610w.webp";
import cardRitz480 from "./card-ritz-480w.webp";
import cardRitz from "./card-ritz.webp";
import cardRitz620 from "./card-ritz-620w.webp";

import homePatina480 from "./home-patina-480w.webp";
import homePatina from "./home-patina.webp";
import homePatina1040 from "./home-patina-1040w.webp";
import homePatina610 from "./home-patina-610w.webp";
import homeChiltern480 from "./home-chiltern-480w.webp";
import homeChiltern from "./home-chiltern.webp";
import homeChiltern1040 from "./home-chiltern-1040w.webp";
import homeChiltern610 from "./home-chiltern-610w.webp";
import homeJuhu480 from "./home-juhu-480w.webp";
import homeJuhu from "./home-juhu.webp";
import homeJuhu610 from "./home-juhu-610w.webp";
import homeRitz640 from "./home-ritz-640w.webp";
import homeRitz from "./home-ritz-1336w.webp";
import homeRitz920 from "./home-ritz-920w.webp";
/* The home page's Insights section, beside the newest article (November 2026). */
import homeInsights640 from "./insights/home-blogs-640w.webp";
import homeInsights1080 from "./insights/home-blogs-1080w.webp";
import homeInsights from "./insights/home-blogs-1600w.webp";
import homeInsights830 from "./insights/home-blogs-830w.webp";

import stageDiscover from "./stage-discover.webp";
// The home page's five stages (November 2026): Parikrama House, and SPASM's
// model and drawings of it for Design and Fabricate.
import stageParikrama800 from "./stage-parikrama-800w.webp";
import stageParikrama from "./stage-parikrama-1600w.webp";
import stageParikrama1130 from "./stage-parikrama-1130w.webp";
import stageDesign960 from "./stage-design-960w.webp";
import stageDesign from "./stage-design-1600w.webp";
import stageDesign1240 from "./stage-design-1240w.webp";
import stageEngineer800 from "./stage-engineer-800w.webp";
import stageEngineer from "./stage-engineer-1600w.webp";
import stageEngineer1130 from "./stage-engineer-1130w.webp";
import stageFabricate960 from "./stage-fabricate-960w.webp";
import stageFabricate from "./stage-fabricate-1600w.webp";
import stageFabricate1240 from "./stage-fabricate-1240w.webp";
import stageInstall800 from "./stage-install-800w.webp";
import stageInstall from "./stage-install-1600w.webp";
import stageInstall1130 from "./stage-install-1130w.webp";

import aboutVilla800 from "./about-villa-800w.webp";
import aboutVilla from "./about-villa-1600w.webp";
import aboutVilla1130 from "./about-villa-1130w.webp";
import aboutLake800 from "./about-lake-800w.webp";
import aboutLake from "./about-lake-1600w.webp";
import aboutLake1130 from "./about-lake-1130w.webp";
import aboutPlateLeft from "./about-plate-left.webp";
import aboutPlateRight from "./about-plate-right.webp";
import aboutLineHouse from "./about-line-house.webp";
import aboutDurallMark from "./about-durall-mark.webp";

// A dotted map drawn from Natural Earth's public-domain land outline: vector,
// so it stays sharp at any size.
import partnersWorldMap from "./partners-world-map.svg";

import parikramaPalms960 from "./parikrama/palms-960w.webp";
import parikramaPalms1440 from "./parikrama/palms-1440w.webp";
import parikramaPalms from "./parikrama/palms-1674w.webp";
import parikramaPalmGrove640 from "./parikrama/palm-grove-640w.webp";
import parikramaPalmGrove960 from "./parikrama/palm-grove-960w.webp";
import parikramaPalmGrove1280 from "./parikrama/palm-grove-1280w.webp";
import parikramaReflectingPool640 from "./parikrama/reflecting-pool-640w.webp";
import parikramaReflectingPool960 from "./parikrama/reflecting-pool-960w.webp";
import parikramaReflectingPool1280 from "./parikrama/reflecting-pool-1280w.webp";
import parikramaReflectingPool1500 from "./parikrama/reflecting-pool-1500w.webp";
/* Parikrama's photographs are the architects' own (SPASM Design; photographs by
 * Umang Shah), kept whole at their full size. The opening's dusk view was
 * enlarged from 1500px with an upscaler, so it is sharp across a large screen. */
import parikramaDusk640 from "./parikrama/dusk-640w.webp";
import parikramaDusk960 from "./parikrama/dusk-960w.webp";
import parikramaDusk1280 from "./parikrama/dusk-1280w.webp";
import parikramaDusk1600 from "./parikrama/dusk-1600w.webp";
import parikramaDusk1920 from "./parikrama/dusk-1920w.webp";
import parikramaDusk2560 from "./parikrama/dusk-2560w.webp";
import parikramaPavilion640 from "./parikrama/pavilion-640w.webp";
import parikramaPavilion960 from "./parikrama/pavilion-960w.webp";
import parikramaPavilion1280 from "./parikrama/pavilion-1280w.webp";
import parikramaPavilion1500 from "./parikrama/pavilion-1500w.webp";
import parikramaLiving640 from "./parikrama/living-640w.webp";
import parikramaLiving960 from "./parikrama/living-960w.webp";
import parikramaLiving1280 from "./parikrama/living-1280w.webp";
import parikramaLiving1500 from "./parikrama/living-1500w.webp";
import parikramaGarden640 from "./parikrama/garden-640w.webp";
import parikramaGarden from "./parikrama/garden-1010w.webp";
import parikramaGarden800 from "./parikrama/garden-800w.webp";
import parikramaGrove800 from "./parikrama/grove-800w.webp";
import parikramaGrove from "./parikrama/grove-1232w.webp";
import parikramaGrove990 from "./parikrama/grove-990w.webp";
import parikramaSteps560 from "./parikrama/steps-560w.webp";
import parikramaSteps from "./parikrama/steps-886w.webp";
import parikramaSteps700 from "./parikrama/steps-700w.webp";
import parikramaBedroom640 from "./parikrama/bedroom-640w.webp";
import parikramaBedroom960 from "./parikrama/bedroom-960w.webp";
import parikramaBedroom1280 from "./parikrama/bedroom-1280w.webp";
import parikramaDining640 from "./parikrama/dining-640w.webp";
import parikramaDining960 from "./parikrama/dining-960w.webp";
import parikramaDining1280 from "./parikrama/dining-1280w.webp";
import sentosaLibrary480 from "./parikrama/sentosa-library-480w.webp";
import sentosaLibrary from "./parikrama/sentosa-library-768w.webp";
import sentosaLibrary610 from "./parikrama/sentosa-library-610w.webp";
import projectRitz from "./project-ritz.webp";

import expStageDiscover from "./expertise/stage-discover.webp";
import expStageDesign from "./expertise/stage-design.svg";
import expStageEngineer from "./expertise/stage-engineer.webp";
import expStageFabricate from "./expertise/stage-fabricate.webp";
import expStageInstall from "./expertise/stage-install.webp";
import expDetailDoor from "./expertise/detail-door.webp";
import secretGardens240 from "./expertise/secret-gardens-240w.webp";
import secretGardens from "./expertise/secret-gardens.webp";
import secretGardens330 from "./expertise/secret-gardens-330w.webp";
import secretGardens460 from "./expertise/secret-gardens-460w.webp";
import secretGardens650 from "./expertise/secret-gardens-650w.webp";
import patinaPool240 from "./expertise/patina-pool-240w.webp";
import patinaPool from "./expertise/patina-pool.webp";
import patinaPool330 from "./expertise/patina-pool-330w.webp";
import patinaPool460 from "./expertise/patina-pool-460w.webp";
import patinaPool650 from "./expertise/patina-pool-650w.webp";
import patinaAerial from "./expertise/patina-aerial.webp";
import ritzVillas from "./expertise/ritz-villas.webp";
import juhuFacade240 from "./expertise/juhu-facade-240w.webp";
import juhuFacade from "./expertise/juhu-facade.webp";
import juhuFacade330 from "./expertise/juhu-facade-330w.webp";
import juhuFacade460 from "./expertise/juhu-facade-460w.webp";
import juhuFacade650 from "./expertise/juhu-facade-650w.webp";
import mandalaHouse from "./expertise/mandala-house.webp";
import mandalaCourt from "./expertise/mandala-court.webp";

import logoAdl from "./partners/adl.webp";
import logoAfw from "./partners/afw.webp";
import logoAgor from "./partners/agor.webp";
import logoBedmar from "./partners/bedmar.webp";
import logoBrombal from "./partners/brombal.webp";
import logoEcoid from "./partners/ecoid.svg";
import logoGlasmarte from "./partners/glasmarte.svg";
import logoJofebar from "./partners/jofebar.svg";
import logoMeshtec from "./partners/meshtec.webp";
import logoNomadic from "./partners/nomadic.webp";
import logoPalagina from "./partners/palagina.webp";
import logoRenson from "./partners/renson.svg";
import logoResplendent from "./partners/resplendent.svg";
import logoSom from "./partners/som.webp";

/* Project photography, from Durall's own project folders (October 2026):
 * one folder per project under ./projects, each photograph in two or three
 * widths. */
import gardensDusk960 from "./projects/secret-gardens/dusk-960w.webp";
import gardensDusk1440 from "./projects/secret-gardens/dusk-1440w.webp";
import gardensDusk from "./projects/secret-gardens/dusk-1920w.webp";
import gardensStair800 from "./projects/secret-gardens/stair-800w.webp";
import gardensStair from "./projects/secret-gardens/stair-1600w.webp";
import gardensStair1130 from "./projects/secret-gardens/stair-1130w.webp";
import gardensSwing800 from "./projects/secret-gardens/swing-800w.webp";
import gardensSwing from "./projects/secret-gardens/swing-1600w.webp";
import gardensSwing1130 from "./projects/secret-gardens/swing-1130w.webp";
import gardensPavilion800 from "./projects/secret-gardens/pavilion-800w.webp";
import gardensPavilion from "./projects/secret-gardens/pavilion-1600w.webp";
import gardensPavilion1130 from "./projects/secret-gardens/pavilion-1130w.webp";
import gardensBedroom800 from "./projects/secret-gardens/bedroom-800w.webp";
import gardensBedroom from "./projects/secret-gardens/bedroom-1600w.webp";
import gardensBedroom1130 from "./projects/secret-gardens/bedroom-1130w.webp";
import gardensGlass640 from "./projects/secret-gardens/glass-640w.webp";
import gardensGlass from "./projects/secret-gardens/glass-1125w.webp";
import gardensGlass850 from "./projects/secret-gardens/glass-850w.webp";
import gardensGlassClose640 from "./projects/secret-gardens/glass-close-640w.webp";
import gardensGlassClose from "./projects/secret-gardens/glass-close-1125w.webp";
import gardensGlassClose850 from "./projects/secret-gardens/glass-close-850w.webp";
import gardensWindow640 from "./projects/secret-gardens/window-640w.webp";
import gardensWindow from "./projects/secret-gardens/window-1200w.webp";
import gardensWindow880 from "./projects/secret-gardens/window-880w.webp";
import mandalaDusk960 from "./projects/mandala/dusk-960w.webp";
import mandalaDusk1440 from "./projects/mandala/dusk-1440w.webp";
import mandalaDusk from "./projects/mandala/dusk-1500w.webp";
import mandalaDining800 from "./projects/mandala/dining-800w.webp";
import mandalaDining from "./projects/mandala/dining-1500w.webp";
import mandalaDining1100 from "./projects/mandala/dining-1100w.webp";
import mandalaLiving800 from "./projects/mandala/living-800w.webp";
import mandalaLiving from "./projects/mandala/living-1500w.webp";
import mandalaLiving1100 from "./projects/mandala/living-1100w.webp";
import mandalaPool800 from "./projects/mandala/pool-800w.webp";
import mandalaPool from "./projects/mandala/pool-1032w.webp";
import mandalaNight800 from "./projects/mandala/night-800w.webp";
import mandalaNight from "./projects/mandala/night-903w.webp";
import sentosaShelves960 from "./projects/sentosa/shelves-960w.webp";
import sentosaShelves1440 from "./projects/sentosa/shelves-1440w.webp";
import sentosaShelves from "./projects/sentosa/shelves-1500w.webp";
import sentosaBedroom640 from "./projects/sentosa/bedroom-640w.webp";
import sentosaBedroom960 from "./projects/sentosa/bedroom-960w.webp";
import sentosaBedroom1280 from "./projects/sentosa/bedroom-1280w.webp";
import sentosaBedroom1600 from "./projects/sentosa/bedroom-1600w.webp";
import sentosaBedroom1920 from "./projects/sentosa/bedroom-1920w.webp";
import sentosaBedroom2560 from "./projects/sentosa/bedroom-2560w.webp";
import sentosaLiving640 from "./projects/sentosa/living-640w.webp";
import sentosaLiving from "./projects/sentosa/living-1200w.webp";
import sentosaLiving880 from "./projects/sentosa/living-880w.webp";
import sentosaLounge640 from "./projects/sentosa/lounge-640w.webp";
import sentosaLounge from "./projects/sentosa/lounge-1200w.webp";
import sentosaLounge880 from "./projects/sentosa/lounge-880w.webp";
import sentosaShadow640 from "./projects/sentosa/shadow-640w.webp";
import sentosaShadow from "./projects/sentosa/shadow-1200w.webp";
import sentosaShadow880 from "./projects/sentosa/shadow-880w.webp";
import chilternPond960 from "./projects/chiltern/pond-960w.webp";
import chilternPond1440 from "./projects/chiltern/pond-1440w.webp";
import chilternPond from "./projects/chiltern/pond-1920w.webp";
import chilternLiving800 from "./projects/chiltern/living-800w.webp";
import chilternLiving from "./projects/chiltern/living-1600w.webp";
import chilternLiving1130 from "./projects/chiltern/living-1130w.webp";
import chilternPool640 from "./projects/chiltern/pool-640w.webp";
import chilternPool from "./projects/chiltern/pool-1200w.webp";
import chilternPool880 from "./projects/chiltern/pool-880w.webp";
import chilternCorner640 from "./projects/chiltern/corner-640w.webp";
import chilternCorner from "./projects/chiltern/corner-1200w.webp";
import chilternCorner880 from "./projects/chiltern/corner-880w.webp";
import chilternBedroom800 from "./projects/chiltern/bedroom-800w.webp";
import chilternBedroom from "./projects/chiltern/bedroom-1600w.webp";
import chilternBedroom1130 from "./projects/chiltern/bedroom-1130w.webp";
import chilternLounge800 from "./projects/chiltern/lounge-800w.webp";
import chilternLounge from "./projects/chiltern/lounge-1600w.webp";
import chilternLounge1130 from "./projects/chiltern/lounge-1130w.webp";
import chilternStudy800 from "./projects/chiltern/study-800w.webp";
import chilternStudy from "./projects/chiltern/study-1600w.webp";
import chilternStudy1130 from "./projects/chiltern/study-1130w.webp";
import juhuAerial640 from "./projects/juhu/aerial-640w.webp";
import juhuAerial960 from "./projects/juhu/aerial-960w.webp";
import juhuAerial1280 from "./projects/juhu/aerial-1280w.webp";
import juhuAerial1600 from "./projects/juhu/aerial-1600w.webp";
import juhuAerial1920 from "./projects/juhu/aerial-1920w.webp";
import juhuAerial2560 from "./projects/juhu/aerial-2560w.webp";
import juhuCourt640 from "./projects/juhu/court-640w.webp";
import juhuCourt from "./projects/juhu/court-1104w.webp";
import juhuCourt840 from "./projects/juhu/court-840w.webp";
import juhuShutters640 from "./projects/juhu/shutters-640w.webp";
import juhuShutters from "./projects/juhu/shutters-904w.webp";
import juhuGlazing640 from "./projects/juhu/glazing-640w.webp";
import juhuGlazing from "./projects/juhu/glazing-904w.webp";
import juhuTerrace640 from "./projects/juhu/terrace-640w.webp";
import juhuTerrace from "./projects/juhu/terrace-1200w.webp";
import juhuTerrace880 from "./projects/juhu/terrace-880w.webp";
import juhuLiving640 from "./projects/juhu/living-640w.webp";
import juhuLiving960 from "./projects/juhu/living-960w.webp";
import juhuLiving1280 from "./projects/juhu/living-1280w.webp";
import juhuLiving1600 from "./projects/juhu/living-1600w.webp";
import juhuLiving1920 from "./projects/juhu/living-1920w.webp";
import juhuLiving2560 from "./projects/juhu/living-2560w.webp";
import juhuDusk640 from "./projects/juhu/dusk-640w.webp";
import juhuDusk from "./projects/juhu/dusk-1168w.webp";
import juhuDusk860 from "./projects/juhu/dusk-860w.webp";
import ritzAerial640 from "./projects/ritz/aerial-640w.webp";
import ritzAerial960 from "./projects/ritz/aerial-960w.webp";
import ritzAerial1280 from "./projects/ritz/aerial-1280w.webp";
import ritzAerial1600 from "./projects/ritz/aerial-1600w.webp";
import ritzAerial1920 from "./projects/ritz/aerial-1920w.webp";
import ritzAerial2560 from "./projects/ritz/aerial-2560w.webp";
import ritzVilla800 from "./projects/ritz/villa-800w.webp";
import ritzVilla from "./projects/ritz/villa-1600w.webp";
import ritzVilla1130 from "./projects/ritz/villa-1130w.webp";
import ritzPool800 from "./projects/ritz/pool-800w.webp";
import ritzPool from "./projects/ritz/pool-1600w.webp";
import ritzPool1130 from "./projects/ritz/pool-1130w.webp";
import ritzBedroom800 from "./projects/ritz/bedroom-800w.webp";
import ritzBedroom from "./projects/ritz/bedroom-1600w.webp";
import ritzBedroom1130 from "./projects/ritz/bedroom-1130w.webp";
import ritzBeach800 from "./projects/ritz/beach-800w.webp";
import ritzBeach from "./projects/ritz/beach-1600w.webp";
import ritzBeach1130 from "./projects/ritz/beach-1130w.webp";
import ritzEvening800 from "./projects/ritz/evening-800w.webp";
import ritzEvening from "./projects/ritz/evening-1600w.webp";
import ritzEvening1130 from "./projects/ritz/evening-1130w.webp";
import ritzGarden800 from "./projects/ritz/garden-800w.webp";
import ritzGarden from "./projects/ritz/garden-1600w.webp";
import ritzGarden1130 from "./projects/ritz/garden-1130w.webp";
import ritzRing640 from "./projects/ritz/ring-640w.webp";
import ritzRing from "./projects/ritz/ring-1200w.webp";
import ritzRing880 from "./projects/ritz/ring-880w.webp";
import ritzShore640 from "./projects/ritz/shore-640w.webp";
import ritzShore from "./projects/ritz/shore-1200w.webp";
import ritzShore880 from "./projects/ritz/shore-880w.webp";
import ritzDeck800 from "./projects/ritz/deck-800w.webp";
import ritzDeck from "./projects/ritz/deck-1600w.webp";
import ritzDeck1130 from "./projects/ritz/deck-1130w.webp";
import ritzSpa800 from "./projects/ritz/spa-800w.webp";
import ritzSpa from "./projects/ritz/spa-1600w.webp";
import ritzSpa1130 from "./projects/ritz/spa-1130w.webp";
import patinaPavilion960 from "./projects/patina/pavilion-960w.webp";
import patinaPavilion1440 from "./projects/patina/pavilion-1440w.webp";
import patinaPavilion from "./projects/patina/pavilion-1920w.webp";
import patinaSuite800 from "./projects/patina/suite-800w.webp";
import patinaSuite from "./projects/patina/suite-1600w.webp";
import patinaSuite1130 from "./projects/patina/suite-1130w.webp";
import patinaTerrace800 from "./projects/patina/terrace-800w.webp";
import patinaTerrace from "./projects/patina/terrace-1600w.webp";
import patinaTerrace1130 from "./projects/patina/terrace-1130w.webp";
import patinaVillaPool800 from "./projects/patina/villa-pool-800w.webp";
import patinaVillaPool from "./projects/patina/villa-pool-1600w.webp";
import patinaVillaPool1130 from "./projects/patina/villa-pool-1130w.webp";
import patinaBeach800 from "./projects/patina/beach-800w.webp";
import patinaBeach from "./projects/patina/beach-1600w.webp";
import patinaBeach1130 from "./projects/patina/beach-1130w.webp";
import patinaBar800 from "./projects/patina/bar-800w.webp";
import patinaBar from "./projects/patina/bar-1600w.webp";
import patinaBar1130 from "./projects/patina/bar-1130w.webp";
import patinaLounge800 from "./projects/patina/lounge-800w.webp";
import patinaLounge from "./projects/patina/lounge-1600w.webp";
import patinaLounge1130 from "./projects/patina/lounge-1130w.webp";
import patinaRestaurant800 from "./projects/patina/restaurant-800w.webp";
import patinaRestaurant from "./projects/patina/restaurant-1600w.webp";
import patinaRestaurant1130 from "./projects/patina/restaurant-1130w.webp";
import patinaIsland640 from "./projects/patina/island-640w.webp";
import patinaIsland from "./projects/patina/island-1200w.webp";
import patinaIsland880 from "./projects/patina/island-880w.webp";
import patinaWaterVillas640 from "./projects/patina/water-villas-640w.webp";
import patinaWaterVillas from "./projects/patina/water-villas-1200w.webp";
import patinaWaterVillas880 from "./projects/patina/water-villas-880w.webp";
import patinaShore800 from "./projects/patina/shore-800w.webp";
import patinaShore from "./projects/patina/shore-1440w.webp";
import patinaShore1070 from "./projects/patina/shore-1070w.webp";
import carmichaelSkyline960 from "./projects/carmichael/skyline-960w.webp";
import carmichaelSkyline1440 from "./projects/carmichael/skyline-1440w.webp";
import carmichaelSkyline from "./projects/carmichael/skyline-1920w.webp";
import carmichaelScreens800 from "./projects/carmichael/screens-800w.webp";
import carmichaelScreens from "./projects/carmichael/screens-1600w.webp";
import carmichaelScreens1130 from "./projects/carmichael/screens-1130w.webp";
import carmichaelFacade800 from "./projects/carmichael/facade-800w.webp";
import carmichaelFacade from "./projects/carmichael/facade-1600w.webp";
import carmichaelFacade1130 from "./projects/carmichael/facade-1130w.webp";
// Durall’s factory floor and drawings, for the Premium Glazing Series (Insights).
import insightsProfileCut640 from "./insights/profile-cut-640w.webp";
import insightsProfileCut960 from "./insights/profile-cut-960w.webp";
import insightsProfileCut1280 from "./insights/profile-cut-1280w.webp";
import insightsYard640 from "./insights/yard-640w.webp";
import insightsYard from "./insights/yard-1117w.webp";
import insightsYard850 from "./insights/yard-850w.webp";
import insightsAssemblyAbove640 from "./insights/assembly-above-640w.webp";
import insightsAssemblyAbove from "./insights/assembly-above-1080w.webp";
import insightsAssemblyAbove830 from "./insights/assembly-above-830w.webp";
import insightsFabrication640 from "./insights/fabrication-640w.webp";
import insightsFabrication1080 from "./insights/fabrication-1080w.webp";
import insightsFabrication from "./insights/fabrication-1669w.webp";
import insightsFabrication830 from "./insights/fabrication-830w.webp";
import insightsFabrication1340 from "./insights/fabrication-1340w.webp";
import insightsCutting640 from "./insights/cutting-640w.webp";
import insightsCutting1080 from "./insights/cutting-1080w.webp";
import insightsCutting from "./insights/cutting-1670w.webp";
import insightsCutting830 from "./insights/cutting-830w.webp";
import insightsCutting1340 from "./insights/cutting-1340w.webp";
import insightsParikramaWide640 from "./insights/parikrama-wide-640w.webp";
import insightsParikramaWide from "./insights/parikrama-wide-1289w.webp";
import insightsParikramaWide910 from "./insights/parikrama-wide-910w.webp";
import insightsGlazing640 from "./insights/glazing-640w.webp";
import insightsGlazing1080 from "./insights/glazing-1080w.webp";
import insightsGlazing from "./insights/glazing-1672w.webp";
import insightsGlazing830 from "./insights/glazing-830w.webp";
import insightsGlazing1340 from "./insights/glazing-1340w.webp";
import insightsProfilesStaged640 from "./insights/profiles-staged-640w.webp";
import insightsProfilesStaged from "./insights/profiles-staged-1120w.webp";
import insightsProfilesStaged850 from "./insights/profiles-staged-850w.webp";
import insightsProfileStock640 from "./insights/profile-stock-640w.webp";
import insightsProfileStock from "./insights/profile-stock-1080w.webp";
import insightsProfileStock830 from "./insights/profile-stock-830w.webp";
import insightsParikramaIntent640 from "./insights/parikrama-intent-640w.webp";
import insightsParikramaIntent960 from "./insights/parikrama-intent-960w.webp";
import insightsParikramaIntent1098 from "./insights/parikrama-intent-1098w.webp";
import insightsBanner640 from "./insights/banner-640w.webp";
import insightsBanner1280 from "./insights/banner-1280w.webp";
import insightsBanner from "./insights/banner-1768w.webp";
import insightsBanner910 from "./insights/banner-910w.webp";
import insightsHall640 from "./insights/hall-640w.webp";
import insightsHall960 from "./insights/hall-960w.webp";
import insightsHall1280 from "./insights/hall-1280w.webp";
import insightsHall1600 from "./insights/hall-1600w.webp";
import insightsSection from "./insights/section-1300w.webp";
import insightsMachiningCentre640 from "./insights/machining-centre-640w.webp";
import insightsMachiningCentre1080 from "./insights/machining-centre-1080w.webp";
import insightsMachiningCentre from "./insights/machining-centre-1672w.webp";
import insightsMachiningCentre830 from "./insights/machining-centre-830w.webp";
import insightsMachiningCentre1340 from "./insights/machining-centre-1340w.webp";
import insightsAssembly640 from "./insights/assembly-640w.webp";
import insightsAssembly1080 from "./insights/assembly-1080w.webp";
import insightsAssembly from "./insights/assembly-1672w.webp";
import insightsAssembly830 from "./insights/assembly-830w.webp";
import insightsAssembly1340 from "./insights/assembly-1340w.webp";
import insightsScreenCarried640 from "./insights/screen-carried-640w.webp";
import insightsScreenCarried from "./insights/screen-carried-900w.webp";
import insightsGlassStaged640 from "./insights/glass-staged-640w.webp";
import insightsGlassStaged from "./insights/glass-staged-1080w.webp";
import insightsGlassStaged830 from "./insights/glass-staged-830w.webp";
import insightsMachining640 from "./insights/machining-640w.webp";
import insightsMachining1080 from "./insights/machining-1080w.webp";
import insightsMachining from "./insights/machining-1672w.webp";
import insightsMachining830 from "./insights/machining-830w.webp";
import insightsMachining1340 from "./insights/machining-1340w.webp";
import insightsInspection640 from "./insights/inspection-640w.webp";
import insightsInspection960 from "./insights/inspection-960w.webp";
import insightsInspection1280 from "./insights/inspection-1280w.webp";
import insightsInspection1600 from "./insights/inspection-1600w.webp";
import insightsInspection1920 from "./insights/inspection-1920w.webp";
import insightsPacking640 from "./insights/packing-640w.webp";
import insightsPacking1080 from "./insights/packing-1080w.webp";
import insightsPacking from "./insights/packing-1671w.webp";
import insightsPacking830 from "./insights/packing-830w.webp";
import insightsPacking1340 from "./insights/packing-1340w.webp";

export type ImageAsset = {
  src: string;
  width: number;
  height: number;
  srcSet?: string;
};

const one = (src: string, width: number, height: number): ImageAsset => ({
  src,
  width,
  height,
});

/** Builds a srcSet from [url, width] pairs; the last pair is the default src. */
const set = (variants: ReadonlyArray<readonly [string, number]>, height: number): ImageAsset => {
  const largest = variants[variants.length - 1]!;
  return {
    src: largest[0],
    width: largest[1],
    height,
    srcSet: variants.map(([url, w]) => `${url} ${w}w`).join(", "),
  };
};

export const IMAGES = {
  heroFilm: set(
    [
      [heroFilm960, 960],
      [heroFilm1440, 1440],
      [heroFilm1920, 1920],
    ],
    1274,
  ),
  heroParikrama: set(
    [
      [heroParikrama960, 960],
      [heroParikrama1440, 1440],
      [heroParikrama1920, 1920],
    ],
    1287,
  ),
  heroAbout: set(
    [
      [heroAbout640, 640],
      [heroAbout960, 960],
      [heroAbout1280, 1280],
      [heroAbout1600, 1600],
      [heroAbout1920, 1920],
      [heroAbout2560, 2560],
    ],
    1290,
  ),
  heroPartners: set(
    [
      [heroPartners960, 960],
      [heroPartners1440, 1440],
      [heroPartners1920, 1920],
    ],
    964,
  ),
  heroProjects: set(
    [
      [heroProjects640, 640],
      [heroProjects960, 960],
      [heroProjects1280, 1280],
      [heroProjects1600, 1600],
      [heroProjects1920, 1920],
      [heroProjects2560, 2560],
    ],
    1275,
  ),
  /* House of Secret Gardens at night. Cut taller than the Careers hero
   * shows at desktop (it is focused low, see routes/careers.tsx) so a phone,
   * where the hero is taller than wide, still has picture to fill it. */
  heroCareers: set(
    [
      [heroCareers960, 960],
      [heroCareers1440, 1440],
      [heroCareers1920, 1920],
    ],
    1140,
  ),
  /** The white wordmark from the design, for the header and footer. */
  logoDurallWhite: one(logoDurallWhite, 1200, 180),
  philosophyPavilion: set(
    [
      [philosophyPavilion880, 880],
      [philosophyPavilion1130, 1130],
      [philosophyPavilion1440, 1440],
      [philosophyPavilion2048, 2048],
    ],
    1301,
  ),

  projectPatina: set(
    [
      [projectPatina640, 640],
      [projectPatina930, 930],
      [projectPatina, 1360],
    ],
    907,
  ),
  projectSentosa: set(
    [
      [projectSentosa640, 640],
      [projectSentosa930, 930],
      [projectSentosa, 1360],
    ],
    907,
  ),
  projectChiltron: set(
    [
      [projectChiltron640, 640],
      [projectChiltron930, 930],
      [projectChiltron, 1360],
    ],
    907,
  ),
  projectJuhu: set(
    [
      [projectJuhu640, 640],
      [projectJuhu930, 930],
      [projectJuhu, 1360],
    ],
    907,
  ),
  projectBangalore: set(
    [
      [projectBangalore640, 640],
      [projectBangalore930, 930],
      [projectBangalore, 1360],
    ],
    907,
  ),
  projectBanyan: set(
    [
      [projectBanyan640, 640],
      [projectBanyan930, 930],
      [projectBanyan, 1360],
    ],
    907,
  ),
  // The architects' cover photograph again: the same files as parikramaPavilion.
  projectFeatured: set(
    [
      [parikramaPavilion640, 640],
      [parikramaPavilion960, 960],
      [parikramaPavilion1280, 1280],
      [parikramaPavilion1500, 1500],
    ],
    1000,
  ),

  /* The project and article photographs, cut from the thumb-*.webp exports
   * to the photograph alone: the exports carry a drop shadow baked into
   * their edges. */
  cardParikrama: set(
    [
      [cardParikrama480, 480],
      [cardParikrama610, 610],
      [cardParikrama, 780],
    ],
    780,
  ),
  cardPatina: set(
    [
      [cardPatina480, 480],
      [cardPatina610, 610],
      [cardPatina, 780],
    ],
    780,
  ),
  cardChiltron: set(
    [
      [cardChiltron480, 480],
      [cardChiltron620, 620],
      [cardChiltron, 804],
    ],
    780,
  ),
  cardJuhu: set(
    [
      [cardJuhu480, 480],
      [cardJuhu610, 610],
      [cardJuhu, 780],
    ],
    780,
  ),
  cardRitz: set(
    [
      [cardRitz480, 480],
      [cardRitz620, 620],
      [cardRitz, 792],
    ],
    780,
  ),

  /* The home page's five project cards, from the design's "Selected work"
   * frame, cut square to the framing drawn there. */
  // The architects' cover photograph, the same files as parikramaPavilion.
  homeParikrama: set(
    [
      [parikramaPavilion640, 640],
      [parikramaPavilion960, 960],
      [parikramaPavilion1280, 1280],
      [parikramaPavilion1500, 1500],
    ],
    1000,
  ),
  homePatina: set(
    [
      [homePatina480, 480],
      [homePatina610, 610],
      [homePatina, 780],
      [homePatina1040, 1040],
    ],
    1040,
  ),
  homeChiltern: set(
    [
      [homeChiltern480, 480],
      [homeChiltern610, 610],
      [homeChiltern, 780],
      [homeChiltern1040, 1040],
    ],
    1040,
  ),
  homeJuhu: set(
    [
      [homeJuhu480, 480],
      [homeJuhu610, 610],
      [homeJuhu, 780],
    ],
    780,
  ),
  homeRitz: set(
    [
      [homeRitz640, 640],
      [homeRitz920, 920],
      [homeRitz, 1336],
    ],
    891,
  ),
  homeInsights: set(
    [
      [homeInsights640, 640],
      [homeInsights830, 830],
      [homeInsights1080, 1080],
      [homeInsights, 1600],
    ],
    1372,
  ),

  stageDiscover: one(stageDiscover, 760, 967),
  stageParikrama: set(
    [
      [stageParikrama800, 800],
      [stageParikrama1130, 1130],
      [stageParikrama, 1600],
    ],
    965,
  ),
  stageDesign: set(
    [
      [stageDesign960, 960],
      [stageDesign1240, 1240],
      [stageDesign, 1600],
    ],
    892,
  ),
  stageEngineer: set(
    [
      [stageEngineer800, 800],
      [stageEngineer1130, 1130],
      [stageEngineer, 1600],
    ],
    1073,
  ),
  stageFabricate: set(
    [
      [stageFabricate960, 960],
      [stageFabricate1240, 1240],
      [stageFabricate, 1600],
    ],
    1132,
  ),
  stageInstall: set(
    [
      [stageInstall800, 800],
      [stageInstall1130, 1130],
      [stageInstall, 1600],
    ],
    1005,
  ),

  aboutVilla: set(
    [
      [aboutVilla800, 800],
      [aboutVilla1130, 1130],
      [aboutVilla, 1600],
    ],
    1066,
  ),
  aboutLake: set(
    [
      [aboutLake800, 800],
      [aboutLake1130, 1130],
      [aboutLake, 1600],
    ],
    1067,
  ),
  aboutPlateLeft: one(aboutPlateLeft, 462, 523),
  aboutPlateRight: one(aboutPlateRight, 438, 523),
  aboutLineHouse: one(aboutLineHouse, 578, 404),
  aboutDurallMark: one(aboutDurallMark, 394, 122),

  partnersWorldMap: one(partnersWorldMap, 1400, 474),

  /* Parikrama — Murud House, the first project detail page. Palms, garden,
   * grove and steps were brought over from its own Lovable project (1px-
   * feathered PNG exports, cropped to their opaque area); the rest are the
   * architects' originals (see the imports). */
  parikramaPalms: set(
    [
      [parikramaPalms960, 960],
      [parikramaPalms1440, 1440],
      [parikramaPalms, 1674],
    ],
    942,
  ),
  /* From the client's Drive (PARIKRAMA folder): the house low among the
   * palms (IMG_9944), and SPASM's veranda along its reflecting pool (08). */
  parikramaPalmGrove: set(
    [
      [parikramaPalmGrove640, 640],
      [parikramaPalmGrove960, 960],
      [parikramaPalmGrove1280, 1280],
    ],
    780,
  ),
  parikramaReflectingPool: set(
    [
      [parikramaReflectingPool640, 640],
      [parikramaReflectingPool960, 960],
      [parikramaReflectingPool1280, 1280],
      [parikramaReflectingPool1500, 1500],
    ],
    1000,
  ),
  parikramaDusk: set(
    [
      [parikramaDusk640, 640],
      [parikramaDusk960, 960],
      [parikramaDusk1280, 1280],
      [parikramaDusk1600, 1600],
      [parikramaDusk1920, 1920],
      [parikramaDusk2560, 2560],
    ],
    1711,
  ),
  parikramaPavilion: set(
    [
      [parikramaPavilion640, 640],
      [parikramaPavilion960, 960],
      [parikramaPavilion1280, 1280],
      [parikramaPavilion1500, 1500],
    ],
    1000,
  ),
  // The veranda. It stands under both of the names the two smaller cuts of
  // this room had, which stored pages still refer to.
  parikramaVeranda: set(
    [
      [parikramaLiving640, 640],
      [parikramaLiving960, 960],
      [parikramaLiving1280, 1280],
      [parikramaLiving1500, 1500],
    ],
    1000,
  ),
  parikramaGarden: set(
    [
      [parikramaGarden640, 640],
      [parikramaGarden800, 800],
      [parikramaGarden, 1010],
    ],
    1263,
  ),
  parikramaGrove: set(
    [
      [parikramaGrove800, 800],
      [parikramaGrove990, 990],
      [parikramaGrove, 1232],
    ],
    821,
  ),
  parikramaBedroom: set(
    [
      [parikramaBedroom640, 640],
      [parikramaBedroom960, 960],
      [parikramaBedroom1280, 1280],
    ],
    818,
  ),
  parikramaSteps: set(
    [
      [parikramaSteps560, 560],
      [parikramaSteps700, 700],
      [parikramaSteps, 886],
    ],
    886,
  ),
  parikramaDining: set(
    [
      [parikramaDining640, 640],
      [parikramaDining960, 960],
      [parikramaDining1280, 1280],
    ],
    898,
  ),
  parikramaVerandaOpen: set(
    [
      [parikramaLiving640, 640],
      [parikramaLiving960, 960],
      [parikramaLiving1280, 1280],
      [parikramaLiving1500, 1500],
    ],
    1000,
  ),
  parikramaPavilionOpen: set(
    [
      [parikramaPavilion640, 640],
      [parikramaPavilion960, 960],
      [parikramaPavilion1280, 1280],
      [parikramaPavilion1500, 1500],
    ],
    1000,
  ),
  parikramaBedroomEvening: set(
    [
      [parikramaBedroom640, 640],
      [parikramaBedroom960, 960],
      [parikramaBedroom1280, 1280],
    ],
    818,
  ),
  /* Cut from inside thumb-ritz's feathered border (the thumbnail is a
   * rounded, faded export); the only photograph of the project on file. */
  projectRitz: one(projectRitz, 794, 782),
  sentosaLibrary: set(
    [
      [sentosaLibrary480, 480],
      [sentosaLibrary610, 610],
      [sentosaLibrary, 768],
    ],
    473,
  ),

  /* The Expertise page. The five stages are the design's own crops of
   * larger photographs (the second is a drawing), so each fills its tall
   * frame the way it was composed. */
  expStageDiscover: one(expStageDiscover, 331, 505),
  expStageDesign: one(expStageDesign, 249, 380),
  expStageEngineer: one(expStageEngineer, 589, 898),
  expStageFabricate: one(expStageFabricate, 400, 610),
  expStageInstall: one(expStageInstall, 404, 617),
  /** The glass door at Chiltern House, behind the sill drawing. */
  expDetailDoor: one(expDetailDoor, 465, 516),
  /* "What we're trusted with": the projects' photographs, the small files
   * for the thumbnails in the list. */
  secretGardens: set(
    [
      [secretGardens240, 240],
      [secretGardens330, 330],
      [secretGardens460, 460],
      [secretGardens650, 650],
      [secretGardens, 900],
    ],
    898,
  ),
  patinaPool: set(
    [
      [patinaPool240, 240],
      [patinaPool330, 330],
      [patinaPool460, 460],
      [patinaPool650, 650],
      [patinaPool, 900],
    ],
    675,
  ),
  patinaAerial: one(patinaAerial, 900, 652),
  ritzVillas: one(ritzVillas, 480, 138),
  juhuFacade: set(
    [
      [juhuFacade240, 240],
      [juhuFacade330, 330],
      [juhuFacade460, 460],
      [juhuFacade650, 650],
      [juhuFacade, 900],
    ],
    1045,
  ),
  mandalaHouse: one(mandalaHouse, 480, 329),
  /** The left of the same photograph, as the design crops it for the slideshow. */
  mandalaCourt: one(mandalaCourt, 544, 617),

  /* Partner and practice logos (partners page), each at its own file's
   * dimensions. How tall each is drawn is set per partner in the content. */
  logoGlasmarte: one(logoGlasmarte, 185, 35),
  logoJofebar: one(logoJofebar, 330, 115),
  logoMeshtec: one(logoMeshtec, 352, 77),
  logoAgor: one(logoAgor, 148, 95),
  logoAdl: one(logoAdl, 92, 40),
  logoPalagina: one(logoPalagina, 600, 152),
  logoBrombal: one(logoBrombal, 600, 56),
  logoRenson: one(logoRenson, 172, 30),
  logoBedmar: one(logoBedmar, 499, 39),
  logoAfw: one(logoAfw, 600, 380),
  logoEcoid: one(logoEcoid, 114, 23),
  logoNomadic: one(logoNomadic, 249, 249),
  logoSom: one(logoSom, 600, 208),
  logoResplendent: one(logoResplendent, 701, 193),

  /* Project pages: hero, gallery and section photographs for each project. */
  gardensDusk: set(
    [
      [gardensDusk960, 960],
      [gardensDusk1440, 1440],
      [gardensDusk, 1920],
    ],
    1282,
  ),
  gardensStair: set(
    [
      [gardensStair800, 800],
      [gardensStair1130, 1130],
      [gardensStair, 1600],
    ],
    1067,
  ),
  gardensSwing: set(
    [
      [gardensSwing800, 800],
      [gardensSwing1130, 1130],
      [gardensSwing, 1600],
    ],
    1019,
  ),
  gardensPavilion: set(
    [
      [gardensPavilion800, 800],
      [gardensPavilion1130, 1130],
      [gardensPavilion, 1600],
    ],
    1067,
  ),
  gardensBedroom: set(
    [
      [gardensBedroom800, 800],
      [gardensBedroom1130, 1130],
      [gardensBedroom, 1600],
    ],
    1068,
  ),
  gardensGlass: set(
    [
      [gardensGlass640, 640],
      [gardensGlass850, 850],
      [gardensGlass, 1125],
    ],
    1116,
  ),
  gardensGlassClose: set(
    [
      [gardensGlassClose640, 640],
      [gardensGlassClose850, 850],
      [gardensGlassClose, 1125],
    ],
    1122,
  ),
  gardensWindow: set(
    [
      [gardensWindow640, 640],
      [gardensWindow880, 880],
      [gardensWindow, 1200],
    ],
    1213,
  ),
  mandalaDusk: set(
    [
      [mandalaDusk960, 960],
      [mandalaDusk1440, 1440],
      [mandalaDusk, 1500],
    ],
    803,
  ),
  mandalaDining: set(
    [
      [mandalaDining800, 800],
      [mandalaDining1100, 1100],
      [mandalaDining, 1500],
    ],
    751,
  ),
  mandalaLiving: set(
    [
      [mandalaLiving800, 800],
      [mandalaLiving1100, 1100],
      [mandalaLiving, 1500],
    ],
    803,
  ),
  mandalaPool: set(
    [
      [mandalaPool800, 800],
      [mandalaPool, 1032],
    ],
    708,
  ),
  mandalaNight: set(
    [
      [mandalaNight800, 800],
      [mandalaNight, 903],
    ],
    565,
  ),
  sentosaShelves: set(
    [
      [sentosaShelves960, 960],
      [sentosaShelves1440, 1440],
      [sentosaShelves, 1500],
    ],
    901,
  ),
  sentosaBedroom: set(
    [
      [sentosaBedroom640, 640],
      [sentosaBedroom960, 960],
      [sentosaBedroom1280, 1280],
      [sentosaBedroom1600, 1600],
      [sentosaBedroom1920, 1920],
      [sentosaBedroom2560, 2560],
    ],
    1711,
  ),
  sentosaLiving: set(
    [
      [sentosaLiving640, 640],
      [sentosaLiving880, 880],
      [sentosaLiving, 1200],
    ],
    1500,
  ),
  sentosaLounge: set(
    [
      [sentosaLounge640, 640],
      [sentosaLounge880, 880],
      [sentosaLounge, 1200],
    ],
    1798,
  ),
  sentosaShadow: set(
    [
      [sentosaShadow640, 640],
      [sentosaShadow880, 880],
      [sentosaShadow, 1200],
    ],
    1798,
  ),
  chilternPond: set(
    [
      [chilternPond960, 960],
      [chilternPond1440, 1440],
      [chilternPond, 1920],
    ],
    1280,
  ),
  chilternLiving: set(
    [
      [chilternLiving800, 800],
      [chilternLiving1130, 1130],
      [chilternLiving, 1600],
    ],
    1200,
  ),
  chilternPool: set(
    [
      [chilternPool640, 640],
      [chilternPool880, 880],
      [chilternPool, 1200],
    ],
    1800,
  ),
  chilternCorner: set(
    [
      [chilternCorner640, 640],
      [chilternCorner880, 880],
      [chilternCorner, 1200],
    ],
    1600,
  ),
  chilternBedroom: set(
    [
      [chilternBedroom800, 800],
      [chilternBedroom1130, 1130],
      [chilternBedroom, 1600],
    ],
    798,
  ),
  chilternLounge: set(
    [
      [chilternLounge800, 800],
      [chilternLounge1130, 1130],
      [chilternLounge, 1600],
    ],
    825,
  ),
  chilternStudy: set(
    [
      [chilternStudy800, 800],
      [chilternStudy1130, 1130],
      [chilternStudy, 1600],
    ],
    1078,
  ),
  juhuAerial: set(
    [
      [juhuAerial640, 640],
      [juhuAerial960, 960],
      [juhuAerial1280, 1280],
      [juhuAerial1600, 1600],
      [juhuAerial1920, 1920],
      [juhuAerial2560, 2560],
    ],
    2598,
  ),
  juhuCourt: set(
    [
      [juhuCourt640, 640],
      [juhuCourt840, 840],
      [juhuCourt, 1104],
    ],
    1356,
  ),
  juhuShutters: set(
    [
      [juhuShutters640, 640],
      [juhuShutters, 904],
    ],
    1356,
  ),
  juhuGlazing: set(
    [
      [juhuGlazing640, 640],
      [juhuGlazing, 904],
    ],
    1356,
  ),
  juhuTerrace: set(
    [
      [juhuTerrace640, 640],
      [juhuTerrace880, 880],
      [juhuTerrace, 1200],
    ],
    1310,
  ),
  juhuLiving: set(
    [
      [juhuLiving640, 640],
      [juhuLiving960, 960],
      [juhuLiving1280, 1280],
      [juhuLiving1600, 1600],
      [juhuLiving1920, 1920],
      [juhuLiving2560, 2560],
    ],
    2636,
  ),
  juhuDusk: set(
    [
      [juhuDusk640, 640],
      [juhuDusk860, 860],
      [juhuDusk, 1168],
    ],
    1356,
  ),
  // From the client's 4096px file (Drive, "Ritz carlton maldives").
  ritzAerial: set(
    [
      [ritzAerial640, 640],
      [ritzAerial960, 960],
      [ritzAerial1280, 1280],
      [ritzAerial1600, 1600],
      [ritzAerial1920, 1920],
      [ritzAerial2560, 2560],
    ],
    1919,
  ),
  ritzVilla: set(
    [
      [ritzVilla800, 800],
      [ritzVilla1130, 1130],
      [ritzVilla, 1600],
    ],
    1067,
  ),
  ritzPool: set(
    [
      [ritzPool800, 800],
      [ritzPool1130, 1130],
      [ritzPool, 1600],
    ],
    1045,
  ),
  ritzBedroom: set(
    [
      [ritzBedroom800, 800],
      [ritzBedroom1130, 1130],
      [ritzBedroom, 1600],
    ],
    899,
  ),
  ritzBeach: set(
    [
      [ritzBeach800, 800],
      [ritzBeach1130, 1130],
      [ritzBeach, 1600],
    ],
    900,
  ),
  ritzEvening: set(
    [
      [ritzEvening800, 800],
      [ritzEvening1130, 1130],
      [ritzEvening, 1600],
    ],
    1031,
  ),
  ritzGarden: set(
    [
      [ritzGarden800, 800],
      [ritzGarden1130, 1130],
      [ritzGarden, 1600],
    ],
    1062,
  ),
  ritzRing: set(
    [
      [ritzRing640, 640],
      [ritzRing880, 880],
      [ritzRing, 1200],
    ],
    1436,
  ),
  ritzShore: set(
    [
      [ritzShore640, 640],
      [ritzShore880, 880],
      [ritzShore, 1200],
    ],
    1444,
  ),
  ritzDeck: set(
    [
      [ritzDeck800, 800],
      [ritzDeck1130, 1130],
      [ritzDeck, 1600],
    ],
    1067,
  ),
  ritzSpa: set(
    [
      [ritzSpa800, 800],
      [ritzSpa1130, 1130],
      [ritzSpa, 1600],
    ],
    1202,
  ),
  patinaPavilion: set(
    [
      [patinaPavilion960, 960],
      [patinaPavilion1440, 1440],
      [patinaPavilion, 1920],
    ],
    1440,
  ),
  patinaSuite: set(
    [
      [patinaSuite800, 800],
      [patinaSuite1130, 1130],
      [patinaSuite, 1600],
    ],
    1200,
  ),
  patinaTerrace: set(
    [
      [patinaTerrace800, 800],
      [patinaTerrace1130, 1130],
      [patinaTerrace, 1600],
    ],
    1181,
  ),
  patinaVillaPool: set(
    [
      [patinaVillaPool800, 800],
      [patinaVillaPool1130, 1130],
      [patinaVillaPool, 1600],
    ],
    1200,
  ),
  patinaBeach: set(
    [
      [patinaBeach800, 800],
      [patinaBeach1130, 1130],
      [patinaBeach, 1600],
    ],
    1200,
  ),
  patinaBar: set(
    [
      [patinaBar800, 800],
      [patinaBar1130, 1130],
      [patinaBar, 1600],
    ],
    1190,
  ),
  patinaLounge: set(
    [
      [patinaLounge800, 800],
      [patinaLounge1130, 1130],
      [patinaLounge, 1600],
    ],
    1202,
  ),
  patinaRestaurant: set(
    [
      [patinaRestaurant800, 800],
      [patinaRestaurant1130, 1130],
      [patinaRestaurant, 1600],
    ],
    1196,
  ),
  patinaIsland: set(
    [
      [patinaIsland640, 640],
      [patinaIsland880, 880],
      [patinaIsland, 1200],
    ],
    1200,
  ),
  patinaWaterVillas: set(
    [
      [patinaWaterVillas640, 640],
      [patinaWaterVillas880, 880],
      [patinaWaterVillas, 1200],
    ],
    1600,
  ),
  patinaShore: set(
    [
      [patinaShore800, 800],
      [patinaShore1070, 1070],
      [patinaShore, 1440],
    ],
    1043,
  ),
  carmichaelSkyline: set(
    [
      [carmichaelSkyline960, 960],
      [carmichaelSkyline1440, 1440],
      [carmichaelSkyline, 1920],
    ],
    1020,
  ),
  carmichaelScreens: set(
    [
      [carmichaelScreens800, 800],
      [carmichaelScreens1130, 1130],
      [carmichaelScreens, 1600],
    ],
    1067,
  ),
  carmichaelFacade: set(
    [
      [carmichaelFacade800, 800],
      [carmichaelFacade1130, 1130],
      [carmichaelFacade, 1600],
    ],
    1062,
  ),
  // Insights: the Premium Glazing Series.
  insightsProfileCut: set(
    [
      [insightsProfileCut640, 640],
      [insightsProfileCut960, 960],
      [insightsProfileCut1280, 1280],
    ],
    2276,
  ),
  insightsYard: set(
    [
      [insightsYard640, 640],
      [insightsYard850, 850],
      [insightsYard, 1117],
    ],
    1500,
  ),
  insightsAssemblyAbove: set(
    [
      [insightsAssemblyAbove640, 640],
      [insightsAssemblyAbove830, 830],
      [insightsAssemblyAbove, 1080],
    ],
    1600,
  ),
  insightsFabrication: set(
    [
      [insightsFabrication640, 640],
      [insightsFabrication830, 830],
      [insightsFabrication1080, 1080],
      [insightsFabrication1340, 1340],
      [insightsFabrication, 1669],
    ],
    942,
  ),
  insightsCutting: set(
    [
      [insightsCutting640, 640],
      [insightsCutting830, 830],
      [insightsCutting1080, 1080],
      [insightsCutting1340, 1340],
      [insightsCutting, 1670],
    ],
    941,
  ),
  insightsParikramaWide: set(
    [
      [insightsParikramaWide640, 640],
      [insightsParikramaWide910, 910],
      [insightsParikramaWide, 1289],
    ],
    860,
  ),
  insightsProfile: set(
    [
      [insightsProfileCut640, 640],
      [insightsProfileCut960, 960],
      [insightsProfileCut1280, 1280],
    ],
    2276,
  ),
  insightsGlazing: set(
    [
      [insightsGlazing640, 640],
      [insightsGlazing830, 830],
      [insightsGlazing1080, 1080],
      [insightsGlazing1340, 1340],
      [insightsGlazing, 1672],
    ],
    941,
  ),
  insightsProfilesStaged: set(
    [
      [insightsProfilesStaged640, 640],
      [insightsProfilesStaged850, 850],
      [insightsProfilesStaged, 1120],
    ],
    1404,
  ),
  insightsProfileStock: set(
    [
      [insightsProfileStock640, 640],
      [insightsProfileStock830, 830],
      [insightsProfileStock, 1080],
    ],
    950,
  ),
  insightsParikramaIntent: set(
    [
      [insightsParikramaIntent640, 640],
      [insightsParikramaIntent960, 960],
      [insightsParikramaIntent1098, 1098],
    ],
    1000,
  ),
  insightsBanner: set(
    [
      [insightsBanner640, 640],
      [insightsBanner910, 910],
      [insightsBanner1280, 1280],
      [insightsBanner, 1768],
    ],
    1175,
  ),
  insightsHall: set(
    [
      [insightsHall640, 640],
      [insightsHall960, 960],
      [insightsHall1280, 1280],
      [insightsHall1600, 1600],
    ],
    2287,
  ),
  insightsSection: one(insightsSection, 1300, 235),
  insightsMachiningCentre: set(
    [
      [insightsMachiningCentre640, 640],
      [insightsMachiningCentre830, 830],
      [insightsMachiningCentre1080, 1080],
      [insightsMachiningCentre1340, 1340],
      [insightsMachiningCentre, 1672],
    ],
    941,
  ),
  insightsAssembly: set(
    [
      [insightsAssembly640, 640],
      [insightsAssembly830, 830],
      [insightsAssembly1080, 1080],
      [insightsAssembly1340, 1340],
      [insightsAssembly, 1672],
    ],
    941,
  ),
  insightsScreenCarried: set(
    [
      [insightsScreenCarried640, 640],
      [insightsScreenCarried, 900],
    ],
    1020,
  ),
  insightsGlassStaged: set(
    [
      [insightsGlassStaged640, 640],
      [insightsGlassStaged830, 830],
      [insightsGlassStaged, 1080],
    ],
    700,
  ),
  insightsMachining: set(
    [
      [insightsMachining640, 640],
      [insightsMachining830, 830],
      [insightsMachining1080, 1080],
      [insightsMachining1340, 1340],
      [insightsMachining, 1672],
    ],
    941,
  ),
  insightsInspection: set(
    [
      [insightsInspection640, 640],
      [insightsInspection960, 960],
      [insightsInspection1280, 1280],
      [insightsInspection1600, 1600],
      [insightsInspection1920, 1920],
    ],
    1084,
  ),
  insightsPacking: set(
    [
      [insightsPacking640, 640],
      [insightsPacking830, 830],
      [insightsPacking1080, 1080],
      [insightsPacking1340, 1340],
      [insightsPacking, 1671],
    ],
    941,
  ),
} as const satisfies Record<string, ImageAsset>;
