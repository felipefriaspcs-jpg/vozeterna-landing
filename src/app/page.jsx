
"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import { motion } from "motion/react";
import { LuArrowRight, LuCircleCheckBig, LuQuote, LuHeart, LuCheck, LuTimerReset, LuLock, LuHandCoins } from "react-icons/lu";
import { FaFacebookF, FaInstagram, FaYoutube, FaLinkedinIn } from "react-icons/fa";

const FORMS = {
  en: {
    family: "https://tally.so/r/Xxy6pP",
    funeral: "https://tally.so/r/rjW8X2",
  },
  es: {
    family: "https://tally.so/r/zxv5d0",
    funeral: "https://tally.so/r/D4y6bR",
  },
};

const prices = {
  USD: ["$9", "$19", "$49"],
  MXN: ["$159 MXN", "$349 MXN", "$899 MXN"],
};

const copy = {
  en: {
    navHow: "How It Works",
    navFamilies: "For Families",
    navFuneral: "For Funeral Homes",
    navPricing: "Pricing",
    navAbout: "About",
    start: "Start Family Vault",

    eyebrow: "BILINGUAL LEGACY & MEMORIAL PLATFORM",
    heroTitle: "A private family vault for voices, stories, photos, and memorial pages.",
    heroText: "VozEterna helps family members, friends, funeral homes, and future premium users preserve meaningful memories, invite trusted people, and share only what they intentionally approve.",
    primaryCta: "Start Family Vault",
    secondaryCta: "Request Demo",
    partnerCta: "Partner with VozEterna",
    signIn: "Sign In",
    inviteSignInPrefix: "Already have access?",
    inviteSignInAction: "Sign in",
    trust: "Private by default - English and Spanish - QR memorial ready",

    features: [
      ["play", "Guided Video & Audio Recording", "Easy step-by-step prompts help capture life stories, values, prayers, recipes, and final messages."],
      ["lock", "Private Family Vault", "Securely store and organize memories only your family can access."],
      ["qr", "QR Memorial Pages", "Beautiful tribute pages to share stories and keep the memory alive."],
      ["heart", "Social Legacy Planner", "Plan wishes for social accounts, assets, and special instructions."],
    ],

    howEyebrow: "HOW IT WORKS",
    howTitle: "Three simple steps to preserve a voice forever.",
    howText: "VozEterna guides families through recording, organizing, and sharing memories in a secure legacy experience built for real people, not complicated software.",
    steps: [
      ["Record", "Invite a loved one to answer guided prompts by video or audio. Capture stories, prayers, advice, recipes, and final messages."],
      ["Preserve", "Store recordings, photos, notes, and social legacy wishes inside a private family vault with simple permissions."],
      ["Share", "Create a beautiful QR memorial page that can be shared with family, printed on programs, or used by funeral-home partners."],
      ["Keep Their Legacy Alive", "Families can continue adding memories, guestbook messages, photos, and tributes over time."],
    ],

    miniTitle: "VozEterna",
    miniSubtitle: "Family Legacy Flow",
    miniPrivate: "PRIVATE",
    miniRecording: "Recording Memory",
    miniQuestion: "What do you want your grandchildren to remember?",
    miniVault: "Private Vault",
    miniVaultMeta: "12 recordings - 48 photos",
    miniMemorial: "QR Memorial",
    miniMemorialMeta: "Ready to share",
    miniCta: "Start with the Founder Kit",

    familiesTitle: "For Families",
    familiesBullets: [
      "Preserve what matters most.",
      "Save stories, prayers, recipes, messages, and memories.",
      "Create a lasting legacy for children and generations.",
      "Peace of mind knowing their voice lives on.",
    ],

    funeralTitle: "For Funeral Homes",
    funeralBullets: [
      "Offer more. Serve better.",
      "Offer digital tribute packages families love.",
      "QR links, family upload pages, and sharing tools.",
      "White-label platform that strengthens your brand.",
    ],

    loved: "LOVED BY FAMILIES",
    testimonials: [
      ["Maria G.", "Austin, TX", "Recording my mom's stories was such a gift. My kids will always hear her voice and know her heart."],
      ["James R.", "Phoenix, AZ", "VozEterna made it easy to capture our dad's legacy. The QR page brought our family together."],
      ["Sarah L.", "Funeral Director, CA", "This adds real value. Families love having a beautiful way to remember."],
    ],

    bilingualTitle: "Built for families in English and Spanish",
    bilingualText: "Because love and legacy speak every language. Create, capture, and connect in the language that feels like home.",
    bilingualSide: "Because love and legacy speak all languages.",

    betaTitle: "Founder Beta Notice:",
    betaText: "VozEterna is currently accepting early customers. Some services are delivered manually while the full platform is being built.",

    pricingEyebrow: "Choose the legacy plan that fits your family.",
    viewPrices: "View prices in:",
    popular: "MOST POPULAR",
    month: "/mo",
    plans: [
      ["Starter", "Perfect for one person starting their family legacy.", ["Up to 2 Legacy Vaults", "Guided voice recordings", "Private storage, 5GB included", "Basic family sharing", "QR memorial link"], "Start Preserving"],
      ["Family Legacy", "For families who want to preserve and share more memories together.", ["Up to 10 Legacy Vaults", "Unlimited guided recordings", "Private storage, 50GB included", "QR memorial pages", "Family comments and sharing", "Legacy planner"], "Start Your Legacy"],
      ["Funeral Home Partner", "For funeral homes and service providers helping families preserve memories.", ["Up to 25 Family Legacy Vaults", "Digital tribute packages", "Family upload pages", "QR memorial pages", "Partner branding", "Priority support"], "Partner With Us"],
    ],

    finalTitle: "Do not wait until all you have left is photos.",
    finalText: "Capture their voice, their story, and their legacy while you still can.",
    finalCta: "Start Your Legacy Today",

    footerCompany: "COMPANY",
    footerSupport: "SUPPORT",
    footerResources: "RESOURCES",
    footerContact: "CONTACT",
    about: "About Us",
    careers: "Careers",
    press: "Press",
    help: "Help Center",
    privacy: "Privacy Policy",
    terms: "Terms",
    blog: "Blog",
    guides: "Guides",
    contact: "Contact",
    location: "Guadalajara, Jalisco, Mexico",
  },

  es: {
    navHow: "Como Funciona",
    navFamilies: "Para Familias",
    navFuneral: "Para Funerarias",
    navPricing: "Precios",
    navAbout: "Acerca de",
    start: "Iniciar Boveda Familiar",

    eyebrow: "PLATAFORMA BILINGUE DE LEGADO Y MEMORIA",
    heroTitle: "Una boveda familiar privada para voces, historias, fotos y paginas memoriales.",
    heroText: "VozEterna ayuda a familiares, amigos, funerarias y futuros usuarios premium a preservar recuerdos, invitar personas de confianza y compartir solo lo aprobado intencionalmente.",
    primaryCta: "Iniciar Boveda Familiar",
    secondaryCta: "Solicitar Demo",
    partnerCta: "Aliarse con VozEterna",
    signIn: "Iniciar sesión",
    inviteSignInPrefix: "¿Ya tienes acceso?",
    inviteSignInAction: "Inicia sesión",
    trust: "Privado por defecto - Espanol e ingles - Memorial con QR listo",

    features: [
      ["play", "Grabacion Guiada en Video y Audio", "Preguntas faciles paso a paso para capturar historias de vida, valores, oraciones, recetas y mensajes finales."],
      ["lock", "Boveda Familiar Privada", "Guarda y organiza recuerdos importantes con acceso seguro solo para tu familia."],
      ["qr", "Paginas Memoriales con QR", "Hermosas paginas de homenaje para compartir historias y mantener viva la memoria."],
      ["heart", "Planificador de Legado Social", "Planea deseos para cuentas sociales, bienes, instrucciones especiales y recuerdos digitales."],
    ],

    howEyebrow: "COMO FUNCIONA",
    howTitle: "Tres pasos sencillos para preservar una voz para siempre.",
    howText: "VozEterna guia a las familias para grabar, organizar y compartir recuerdos en una experiencia segura, creada para personas reales, no para software complicado.",
    steps: [
      ["Grabar", "Invita a un ser querido a responder preguntas guiadas por video o audio. Captura historias, oraciones, consejos, recetas y mensajes finales."],
      ["Preservar", "Guarda grabaciones, fotos, notas y deseos de legado digital dentro de una boveda familiar privada con permisos sencillos."],
      ["Compartir", "Crea una hermosa pagina memorial con QR que se puede compartir con la familia, imprimir en programas o usar con funerarias aliadas."],
      ["Mantener Vivo Su Legado", "Las familias pueden seguir agregando recuerdos, mensajes, fotos y homenajes con el tiempo."],
    ],

    miniTitle: "VozEterna",
    miniSubtitle: "Flujo de Legado Familiar",
    miniPrivate: "PRIVADO",
    miniRecording: "Grabando Recuerdo",
    miniQuestion: "Que quieres que recuerden tus nietos?",
    miniVault: "Boveda Privada",
    miniVaultMeta: "12 grabaciones - 48 fotos",
    miniMemorial: "Memorial QR",
    miniMemorialMeta: "Listo para compartir",
    miniCta: "Iniciar con el Kit Fundador",

    familiesTitle: "Para Familias",
    familiesBullets: [
      "Preserva lo que mas importa.",
      "Guarda historias, oraciones, recetas, mensajes y recuerdos.",
      "Crea un legado duradero para hijos y generaciones.",
      "Tranquilidad al saber que su voz sigue viva.",
    ],

    funeralTitle: "Para Funerarias",
    funeralBullets: [
      "Ofrece mas. Sirve mejor.",
      "Ofrece paquetes de homenaje digital que las familias valoran.",
      "Enlaces QR, paginas de carga familiar y herramientas para compartir.",
      "Plataforma de marca blanca que fortalece tu marca.",
    ],

    loved: "AMADO POR FAMILIAS",
    testimonials: [
      ["Maria G.", "Austin, TX", "Grabar las historias de mi mama fue un regalo. Mis hijos siempre podran escuchar su voz y conocer su corazon."],
      ["James R.", "Phoenix, AZ", "VozEterna hizo facil capturar el legado de nuestro papa. La pagina con QR acerco a toda la familia."],
      ["Sarah L.", "Directora Funeraria, CA", "Esto agrega valor real. A las familias les encanta tener una forma hermosa de recordar."],
    ],

    bilingualTitle: "Creado para familias en espanol e ingles",
    bilingualText: "Porque el amor y el legado hablan todos los idiomas. Crea, captura y conecta en el idioma que se siente como casa.",
    bilingualSide: "Porque el amor y el legado hablan todos los idiomas.",

    betaTitle: "Aviso de Beta Fundador:",
    betaText: "VozEterna actualmente acepta clientes tempranos. Algunos servicios se entregan manualmente mientras se construye la plataforma completa.",

    pricingEyebrow: "Elige el plan sucesorio que mejor se adapte a tu familia.",
    viewPrices: "Ver precios en:",
    popular: "MAS POPULAR",
    month: "/mes",
    plans: [
      ["Inicial", "Perfecto para una persona que comienza a crear el legado familiar.", ["Hasta 2 bóvedas de legado", "Grabaciones de voz guiadas", "Almacenamiento privado, 5 GB incluidos", "Compartir con la familia", "Enlace QR conmemorativo"], "Comienza a preservar"],
      ["Legado familiar", "Para familias que desean preservar y compartir más recuerdos juntas.", ["Hasta 10 bóvedas de legado", "Grabaciones guiadas ilimitadas", "Almacenamiento privado, 50 GB incluidos", "Páginas conmemorativas QR", "Comentarios y compartición familiar", "Planificador de legado"], "Comienza tu legado"],
      ["Socio de funerarias", "Para funerarias y proveedores de servicios que ayudan a las familias a preservar recuerdos.", ["Hasta 25 bóvedas de legado familiar", "Paquetes de homenaje digital", "Páginas de carga familiar", "Páginas conmemorativas QR", "Marca de socio", "Soporte prioritario"], "Asóciate con nosotros"],
    ],

    finalTitle: "No esperes hasta que lo unico que quede sean fotos.",
    finalText: "Captura su voz, su historia y su legado mientras aun puedes.",
    finalCta: "Inicia Tu Legado Hoy",

    footerCompany: "COMPANIA",
    footerSupport: "SOPORTE",
    footerResources: "RECURSOS",
    footerContact: "CONTACTO",
    about: "Acerca de",
    careers: "Carreras",
    press: "Prensa",
    help: "Centro de Ayuda",
    privacy: "Politica de Privacidad",
    terms: "Terminos",
    blog: "Blog",
    guides: "Guias",
    contact: "Contacto",
    location: "Guadalajara, Jalisco, Mexico",
  },
};

function Icon({ type }) {
  if (type === "play") return <svg viewBox="0 0 40 40"><rect x="5" y="8" width="30" height="24" rx="4" /><path d="M17 15l9 5-9 5z" /></svg>;
  if (type === "lock") return <svg viewBox="0 0 40 40"><path d="M12 18h16v14H12z" /><path d="M15 18v-4a5 5 0 0 1 10 0v4" /></svg>;
  if (type === "qr") return <svg viewBox="0 0 40 40"><path d="M8 8h9v9H8zM23 8h9v9h-9zM8 23h9v9H8zM24 24h3v3h-3zM29 29h3v3h-3zM23 31h3v3h-3z" /></svg>;
  return <svg viewBox="0 0 40 40"><path d="M20 31s-11-6.7-11-15a6 6 0 0 1 11-3.3A6 6 0 0 1 31 16c0 8.3-11 15-11 15z" /></svg>;
}

function Cta({ children, href, variant = "primary" }) {
  const safeHref = href || "#pricing";
  const external = safeHref.startsWith("http");
  return (
    <a className={"btn " + variant} href={safeHref} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
      {children}
    </a>
  );
}

function Switchers({ language, setLanguage, currency, setCurrency }) {
  return (
    <div className="items-center gap-2 hidden xl:flex">
      <div className="segmented">
        <button type="button" className={language === "es" ? "active" : ""} onClick={() => setLanguage("es")}>ES</button>
        <button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
      </div>
      <div className="segmented">
        <button type="button" className={currency === "USD" ? "active" : ""} onClick={() => setCurrency("USD")}>USD</button>
        <button type="button" className={currency === "MXN" ? "active" : ""} onClick={() => setCurrency("MXN")}>MXN</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState("es");
  const [currency, setCurrency] = useState("MXN");
  const [scrolled, setScrolled] = useState(false);
  const t = copy[language];
  const familyForm = FORMS[language].family;
  const funeralForm = FORMS[language].funeral;

  const featureImgs = [
    '/images/recording.png',
    '/images/private.png',
    '/images/qr.png',
    '/images/social.png',
  ];

  const quoteAvatars = [
    '/images/avatar-1.jpg',
    '/images/avatar-2.jpg',
    '/images/avatar-3.jpg',
  ]

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    onScroll(); // Initialize on mount
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main>
      <header className={`${scrolled ? 'shadow-md bg-white/20 backdrop-blur-md ' : ''} w-full fixed top-0 z-50 transition-all`}>
        <div className="header">
          <Link className="brand" href="#">
            <Image src="/brand/logo-emblem.png" alt="VozEterna logo" width={120} height={48} className="w-auto h-auto" priority />
            <span className="hidden 2xl:block">VozEtherna</span>
          </Link>

          <nav>
            <Link href="#how">{t.navHow}</Link>
            <Link href="#families">{t.navFamilies}</Link>
            <Link href="#funeral">{t.navFuneral}</Link>
            <Link href="#pricing">{t.navPricing}</Link>
            <Link href="#about">{t.navAbout}</Link>
          </nav>

          <div className="headerRight">
            <Switchers language={language} setLanguage={setLanguage} currency={currency} setCurrency={setCurrency} />
            {/* <Cta href="/mobile?auth=signin" variant="signin">{t.signIn}</Cta> */}
            <Link className="btn gold w-60" href={familyForm}>{t.start}</Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container mx-auto px-5">
          <div className="flex flex-col items-center text-center xl:items-start xl:text-left xl:max-w-2xl gap-y-4">
            <motion.p initial={{ transform: "translate(0, 20px)", opacity: 0 }} animate={{ transform: "translate(0, 0)", opacity: 1, transition: { duration: 1 } }} className="eyebrow">{t.eyebrow}</motion.p>
            <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1, delay: 1 } }} className="font-annapurna">{t.heroTitle}</motion.h1>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1, delay: 1 } }} className="flex items-center gap-4 my-4">
              <div className="w-20 h-0.5 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-20 h-0.5 rounded-full bg-primary" />
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.3, delay: 1.3 } }} className="lede">{t.heroText}</motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.3, delay: 1.6 } }} className="heroActions">
              <Cta href={familyForm}>{t.primaryCta}</Cta>
              {/* <Cta href={familyForm} variant="secondary">{t.secondaryCta}</Cta> */}
              <Cta href={funeralForm} variant="gold">{t.partnerCta}</Cta>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.3, delay: 1.9 } }} className="inviteSignIn">
              {t.inviteSignInPrefix} <a href="/mobile?auth=signin">{t.inviteSignInAction}</a>
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.3, delay: 2.2 } }} className="trust">{t.trust}</motion.p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }} className="heroImage">
          <Image src="/images/hero-family.png" alt="Family recording memories together" width={1448} height={1086} priority />
        </motion.div>
      </section>

      <section className="features">
        {t.features.map(([icon, title, text], i) => (
          <motion.article className="feature" key={title} initial={{ transform: "translate(0, 20px)", opacity: 0 }} whileInView={{ transform: "translate(0, 0)", opacity: 1, transition: { delay: i * 0.1 + 0.3 } }} viewport={{ once: true }}>
            <div className="h-20 mb-4">
              <Image src={featureImgs[i]} alt={title} width={500} height={200} className="h-20 w-auto object-contain" alt="" />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </motion.article>
        ))}
      </section>

      <section className="how" id="how">
        <div className="howCopy">
          <h2 className="section-label">{t.howEyebrow}</h2>
          {/* <h2>{t.howTitle}</h2>
          <p>{t.howText}</p> */}

          <div className="steps">
            {t.steps.map(([title, text], i) => (
              <Fragment key={i}>
                {i > 0 && <LuArrowRight size={20} className="opacity-20 mt-16" />}
                <motion.div className={i === 0 ? "step active" : "step"} key={title} initial={{ transform: "translate(0, 20px)", opacity: 0 }} whileInView={{ transform: "translate(0, 0)", opacity: 1, transition: { delay: i * 0.1 + 0.3 } }} viewport={{ once: true }}>
                  <div className="flex gap-2 h-12 xl:h-6">
                    <span>{i + 1}</span>
                    <h4>{title}</h4>
                  </div>
                  <div>
                    <p>{text}</p>
                  </div>
                </motion.div>
              </Fragment>
            ))}
          </div>
        </div>

        {/* <div className="howPreview">
          <div className="previewTop">
            <div>
              <strong>{t.miniTitle}</strong>
              <span>{t.miniSubtitle}</span>
            </div>
            <em>{t.miniPrivate}</em>
          </div>
          <div className="recordingCard">
            <div className="wave">|||</div>
            <h3>{t.miniRecording}</h3>
            <p>{t.miniQuestion}</p>
          </div>
          <div className="previewGrid">
            <div><strong>{t.miniVault}</strong><span>{t.miniVaultMeta}</span></div>
            <div><strong>{t.miniMemorial}</strong><span>{t.miniMemorialMeta}</span></div>
          </div>
          <a className="howMiniCta" href={familyForm} target="_blank" rel="noopener noreferrer">{t.miniCta}</a>
        </div> */}
      </section>

      <section className="audiences">
        <article className="audience dark" id="families">
          <div className="audience-content">
            <motion.div className="audience-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1, transition: { delay: 0.3 } }} viewport={{ once: true }}>
              <div className="audience-header-icon">
                <Image src="/images/family.png" width={40} height={40} alt={t.funeralTitle} />
              </div>
              <div className="audience-header-title">
                <h2>{t.funeralTitle}</h2>
                <p>{t.funeralBullets[0]}</p>
              </div>
            </motion.div>
            <div className="audience-list">
              {t.familiesBullets.slice(1).map((item, i) => (
                <motion.div className="audience-item" key={item} initial={{ transform: "translate(20px, 0)", opacity: 0 }} whileInView={{ transform: "translate(0, 0)", opacity: 1, transition: { delay: i * 0.3 + 0.3 } }} viewport={{ once: true }}>
                  <LuCircleCheckBig size={28} />
                  <p>{item}</p>
                </motion.div>)
              )}
            </div>
          </div>
          <Image src="/images/family-memory.png" alt="Family preserving memories" width={1586} height={992} />
        </article>

        <article className="audience bg-primary/10" id="funeral">
          <div className="audience-content">
            <motion.div className="audience-header" initial={{ opacity: 0 }} whileInView={{ opacity: 1, transition: { delay: 0.3 } }} viewport={{ once: true }}>
              <div className="audience-header-icon">
                <Image src="/images/home.svg" width={40} height={40} alt={t.funeralTitle} />
              </div>
              <div className="audience-header-title">
                <h2>{t.funeralTitle}</h2>
                <p>{t.funeralBullets[0]}</p>
              </div>
            </motion.div>
            <div className="audience-list">
              {t.funeralBullets.slice(1).map((item, i) => (
                <motion.div className="audience-item" key={item} initial={{ transform: "translate(20px, 0)", opacity: 0 }} whileInView={{ transform: "translate(0, 0)", opacity: 1, transition: { delay: i * 0.3 + 0.3 } }} viewport={{ once: true }}>
                  <LuCircleCheckBig size={28} />
                  <p>{item}</p>
                </motion.div>)
              )}
            </div>
          </div>
          <Image src="/images/funeral-dashboard.png" alt="Funeral home dashboard" width={210} height={130} />
        </article>
      </section>

      <section className="quotes">
        <div className="flex justify-center">
          <h2 className="section-label">{t.loved}</h2>
        </div>
        <div className="flex flex-col lg:flex-row justify-center gap-8 mt-4">
          {t.testimonials.map(([name, location, quote], i) => (
            <article className="quote" key={name}>
              <div className="flex gap-4 items-start h-24">
                <LuQuote className="fill-primary stroke-primary rotate-180" size={24} />
                <motion.blockquote className="pt-2 flex-1" initial={{ transform: "translate(0, 20px)", opacity: 0 }} whileInView={{ transform: "translate(0, 0)", opacity: 1, transition: { delay: i * 0.3 + 0.3 } }} viewport={{ once: true }}>{quote}</motion.blockquote>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <img src={quoteAvatars[i]} className="w-16 h-16 rounded-full" />
                </div>
                <div className="">
                  <strong>- {name}</strong>
                  <span>{location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          <div className="w-3 h-3 rounded-full cursor-pointer hover:bg-primary transition-colors bg-primary" />
          <div className="w-3 h-3 rounded-full cursor-pointer hover:bg-primary transition-colors bg-muted" />
          <div className="w-3 h-3 rounded-full cursor-pointer hover:bg-primary transition-colors bg-muted" />
        </div>
      </section>

      <section className="" id="about">
        <div className="lg:flex bg-primary/10 rounded-3xl">
          <div className="flex-1 flex items-center gap-10 p-4">
            <Image src="/images/en-es.svg" alt="" width={160} height={160} />
            <div className="flex-1 space-y-2">
              <h2 className="text-3xl font-semibold max-w-100">{t.bilingualTitle}</h2>
              <p>{t.bilingualText}</p>
            </div>
          </div>

          <div className="flex-1 flex p-4 lg:p-0">
            <img src="/images/bilingual-family.png" alt="Bilingual family using VozEterna" className="h-40 lg:h-full w-40 lg:w-[50%] object-cover rounded-full lg:rounded-none lg:mask-[linear-gradient(to_left,transparent,black_25%)]" />
            <div className="flex-1 px-8 flex flex-col justify-center gap-6">
              <p className="text-xl font-semibold">{t.bilingualSide}</p>
              <div className="flex items-center gap-4 opacity-70">
                <div className="h-0.5 w-20 bg-primary" />
                <LuHeart size={24} className="fill-primary stroke-primary" />
                <div className="h-0.5 w-20 bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="border border-primary bg-primary/30 rounded-xl px-8 py-4 animate-pulse">
          <strong>{t.betaTitle}</strong> {t.betaText}
        </div>
      </section>

      <section id="pricing">
        <div className="flex justify-center">
          <h2 className="section-label">{t.pricingEyebrow}</h2>
        </div>

        {/* <div className="pricingControls">
          <span>{t.viewPrices}</span>
          <Switchers language={language} setLanguage={setLanguage} currency={currency} setCurrency={setCurrency} />
        </div> */}

        <div className="mt-4 flex flex-col 2xl:flex-row items-center gap-10 justify-center">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {t.plans.map(([name, description, items, cta], i) => (
              <motion.article className="shadow-primary shadow-md w-84 rounded-2xl overflow-hidden" key={name} initial={{ transform: "scale(0.8)", opacity: 0 }} whileInView={{ transform: "scale(1)", opacity: 1 }} viewport={{ once: true }}>
                {i === 1 && <div className="bg-navy text-white text-center text-sm py-1.5 font-semibold bg-pattern">{t.popular}</div>}
                <div className="flex flex-col items-center bg-white px-4 pt-8 pb-4">
                  <h3 className="text-2xl font-semibold">{name}</h3>
                  <p className="text-center text-xs leading-tight mt-2">{description}</p>
                  <div className="flex flex-wrap justify-center items-center gap-x-8 py-4">
                    <div>
                      <strong className="text-5xl mr-4">{prices[currency][i]}</strong>
                      <span className="font-semibold">{t.month}</span>
                    </div>
                    <p className="text-sm text-muted">Billed annually</p>
                  </div>
                  <ul className="h-40 mb-6 space-y-2">
                    {items.map((item) => <li className="flex items-center gap-3" key={item}>
                      <LuCheck size={12} />
                      <span className="text-sm font-semibold">{item}</span></li>
                    )}
                  </ul>
                  <Link href={i === 2 ? funeralForm : familyForm} className={`btn btn-pricing ${i === 1 ? "primary" : "secondary"}`}>{cta}</Link>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="flex flex-col md:flex-row 2xl:flex-col items-start gap-8">
            <motion.div className="flex items-center gap-4" initial={{ transform: "translate(0, 20px)", opacity: 0 }} whileInView={{ transform: "translate(0, 0)", opacity: 1, transition: { delay: 0.3 } }} viewport={{ once: true }}>
              <div className="w-10 h-10 rounded-full border-2 border-primary flex justify-center items-center">
                <LuTimerReset size={20} />
              </div>
              <p className="font-semibold">Cancel anytime</p>
            </motion.div>
            <motion.div className="flex items-center gap-4" initial={{ transform: "translate(0, 20px)", opacity: 0 }} whileInView={{ transform: "translate(0, 0)", opacity: 1, transition: { delay: 0.6 } }} viewport={{ once: true }}>
              <div className="w-10 h-10 rounded-full border-2 border-primary flex justify-center items-center">
                <LuLock size={20} />
              </div>
              <p className="font-semibold">Secure & private</p>
            </motion.div>
            <motion.div className="flex items-center gap-4" initial={{ transform: "translate(0, 20px)", opacity: 0 }} whileInView={{ transform: "translate(0, 0)", opacity: 1, transition: { delay: 0.9 } }} viewport={{ once: true }}>
              <div className="w-10 h-10 rounded-full border-2 border-primary flex justify-center items-center">
                <LuHandCoins size={20} />
              </div>
              <p className="font-semibold">30-day money back guarantee</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col lg:flex-row rounded-3xl bg-navy px-20 relative">
          <div className="flex items-center gap-8 flex-1 py-10">
            <div className="w-16">
              <img src="/brand/logo-emblem.png" className="w-16" alt="" />
            </div>
            <div className="text-white space-y-2 flex-1 max-w-140">
              <h2 className="text-3xl">{t.finalTitle}</h2>
              <p>{t.finalText}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center relative py-10">
            <div className="relative flex justify-center lg:justify-end items-center flex-1 z-10">
              <Cta href={familyForm} variant="gold">{t.finalCta}</Cta>
            </div>
            <div className="absolute h-full w-[80%] top-0 left-0">
              <img src="/images/old-photo.png" alt="Old family photo being preserved" className="absolute right-0 xl:relative h-full w-[80%] object-cover mask-[radial-gradient(circle,black,transparent_95%,transparent)]" />
            </div>
          </div>
        </div>
      </section>

      <footer className="pb-4">
        <div className="flex flex-col xl:flex-row items-center justify-between px-20 gap-10">
          <Link href="/">
            <Image src="/brand/logo-primary.png" alt="VozEterna logo" width={640} height={390} className="w-60" />
          </Link>
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <strong>{t.footerCompany}</strong>
              <Link href="/about">{t.about}</Link>
              <Link href="/careers">{t.careers}</Link>
              <Link href="/press">{t.press}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <strong>{t.footerSupport}</strong>
              <Link href="/help-center">{t.help}</Link>
              <Link href="/privacy-policy">{t.privacy}</Link>
              <Link href="/terms">{t.terms}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <strong>{t.footerResources}</strong>
              <Link href="/blog">{t.blog}</Link>
              <Link href="/guides">{t.guides}</Link>
              <Link href="/contact">{t.contact}</Link>
            </div>
            <div className="flex flex-col gap-2">
              <strong>{t.footerContact}</strong>
              <Link href="mailto:hello@vozeterna.com">hello@vozeterna.com</Link>
              <Link href="#">{t.location}</Link>
            </div>
          </div>
          <div className="space-y-4">
            <div className="uppercase text-center font-bold">Follow us</div>
            <div className="flex items-center justify-center gap-4">
              <Link href="#" className="bg-navy rounded-full w-8 h-8 flex items-center justify-center hover:shadow-md shadow-soft hover:-translate-y-0.5 transition-all">
                <FaFacebookF color="white" />
              </Link>
              <Link href="#" className="bg-navy rounded-full w-8 h-8 flex items-center justify-center hover:shadow-md shadow-soft hover:-translate-y-0.5 transition-all">
                <FaInstagram color="white" />
              </Link>
              <Link href="#" className="bg-navy rounded-full w-8 h-8 flex items-center justify-center hover:shadow-md shadow-soft hover:-translate-y-0.5 transition-all">
                <FaYoutube color="white" />
              </Link>
              <Link href="#" className="bg-navy rounded-full w-8 h-8 flex items-center justify-center hover:shadow-md shadow-soft hover:-translate-y-0.5 transition-all">
                <FaLinkedinIn color="white" />
              </Link>
            </div>
          </div>
        </div>
        <p className="text-center mt-10">©2026 VozEterna. All rights reserved.</p>
      </footer>
    </main>
  );
}

