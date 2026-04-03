export type GuidanceQuestionId =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10";

export type GuidanceAreaKey =
  | "governance-risk-management"
  | "incident-management"
  | "business-continuity-disaster-recovery"
  | "supply-chain-security"
  | "security-in-network-information-systems"
  | "access-control-identity-management"
  | "vulnerability-patch-management"
  | "monitoring-detection-logging"
  | "cryptography-data-protection"
  | "awareness-training";

export type ComplianceLevelKey = "low" | "medium" | "high";

export type GuidanceLevelContent = {
  label: string;
  description: string;
  typicalGaps: string[];
  actions: string[];
};

export type GuidanceAreaDefinition = {
  key: GuidanceAreaKey;
  label: string;
  intro: string;
  questionWeights: Partial<Record<GuidanceQuestionId, number>>;
  levels: Record<ComplianceLevelKey, GuidanceLevelContent>;
};

export function getGuidanceAreaByKey(key: string) {
  return NIS2_AREA_GUIDANCE.find((area) => area.key === key);
}

export function getExpandedGuidanceBullets(area: GuidanceAreaDefinition) {
  return Array.from(
    new Set([
      ...area.levels.low.typicalGaps,
      ...area.levels.medium.typicalGaps,
      ...area.levels.high.typicalGaps,
      ...area.levels.low.actions,
      ...area.levels.medium.actions,
      ...area.levels.high.actions,
    ]),
  ).slice(0, 12);
}

export function getComplianceLevelKey(percentage: number): ComplianceLevelKey {
  if (percentage >= 75) {
    return "high";
  }

  if (percentage >= 45) {
    return "medium";
  }

  return "low";
}

export const NIS2_AREA_GUIDANCE: GuidanceAreaDefinition[] = [
  {
    key: "governance-risk-management",
    label: "Governance & Risk Management",
    intro:
      "Ledelsesforankring, risikovurdering, roller og dokumentation sætter retningen for resten af NIS2-arbejdet.",
    questionWeights: {
      "01": 1,
      "02": 1,
      "03": 1.5,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Governance og risikostyring ser ud til at være håndteret ad hoc uden tydelig ledelsesforankring eller en dokumenteret model.",
        typicalGaps: [
          "Ingen formaliseret risikovurdering eller opdateret risikoregister.",
          "Uklare roller, ansvar og beslutningsveje omkring cybersikkerhed.",
          "Manglende politikker og dokumentation der kan fremvises hurtigt.",
        ],
        actions: [
          "Udpeg en tydelig ansvarlig med mandat fra ledelsen.",
          "Gennemfør en dokumenteret risikovurdering af kritiske systemer, leverandører og driftsafhængigheder.",
          "Saml de vigtigste politikker og minimumskrav i et kort, styrbart governance-setup.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der er tegn på styring og governance, men modenheden virker ujævn og ikke fuldt forankret i den daglige drift.",
        typicalGaps: [
          "Risikovurderinger gennemføres, men ikke systematisk eller med tydelig opfølgning.",
          "Politikker findes, men er ikke fuldt implementeret eller revideret regelmæssigt.",
          "Ledelsen involveres sporadisk frem for gennem en fast rapporteringsrytme.",
        ],
        actions: [
          "Indfør en fast rytme for ledelsesrapportering og ejerskab af de vigtigste risici.",
          "Opdater politikker og standarder, så de afspejler de aktuelle drifts- og trusselsforhold.",
          "Knyt de vigtigste risici til konkrete ansvarlige, deadlines og beslutningspunkter.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Governance-sporet ser relativt modent ud, men det kræver fortsat vedligehold for at være troværdigt ved næste review eller audit.",
        typicalGaps: [
          "Dokumentation kan hurtigt blive forældet, hvis ejerskab og opfølgning glider.",
          "Ledelsesrapportering mister værdi, hvis den ikke afspejler aktuelle trusler og afhængigheder.",
          "Governance bliver ofte udfordret ved organisatoriske ændringer eller nye leverandører.",
        ],
        actions: [
          "Hold risikoregister og politikker opdateret efter større ændringer i systemer, leverandører og trusselsbillede.",
          "Test governance gennem interne reviews, auditforberedelse og board-ready rapportering.",
          "Sørg for at dokumentation kan findes og forklares hurtigt ved kunde- eller myndighedshenvendelser.",
        ],
      },
    },
  },
  {
    key: "incident-management",
    label: "Incident Management",
    intro:
      "Virksomheden skal kunne opdage, eskalere og styre hændelser hurtigt nok til at begrænse skade og håndtere rapporteringskrav.",
    questionWeights: {
      "05": 1.5,
      "06": 0.5,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Incident management virker ikke formaliseret endnu, og reaktionen på større hændelser vil sandsynligvis blive manuel og usammenhængende.",
        typicalGaps: [
          "Ingen incident response-plan med roller, eskalering og beslutningsflow.",
          "Manglende øvelse eller test af hændelsesprocessen.",
          "Usikkerhed om intern og ekstern rapportering ved alvorlige hændelser.",
        ],
        actions: [
          "Etabler en enkel incident response-plan med roller, kontaktliste og eskaleringskriterier.",
          "Lav playbooks for de få mest sandsynlige hændelser, fx ransomware, kompromitterede konti og driftsnedbrud.",
          "Afklar hvem der beslutter rapportering, ekstern kommunikation og eventuel inddragelse af specialister.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der er et hændelsesflow på plads, men det ser ikke fuldt testet eller operationelt robust ud endnu.",
        typicalGaps: [
          "Processen findes, men er ikke trænet gennem tabletop eller realistiske scenarier.",
          "Logning og dokumentation er kun delvist koblet til hændelseshåndtering.",
          "Eskalation og samarbejde på tværs af IT, ledelse og kommunikation er uklart.",
        ],
        actions: [
          "Kør en tabletop-øvelse og justér proces, roller og beslutningspunkter bagefter.",
          "Knyt logning og alarmering tydeligere til incident-processen, så triggere bliver konkrete.",
          "Dokumentér hvordan hændelser klassificeres, og hvornår de løftes til ledelsesniveau.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Hændelsesberedskabet ser relativt modent ud, men det skal holdes aktuelt og øvet for at være troværdigt under pres.",
        typicalGaps: [
          "Playbooks bliver hurtigt forældede, hvis systemlandskab eller leverandører ændrer sig.",
          "Response-kvalitet falder, hvis øvelser og træning ikke gentages.",
          "Koordinationen med monitorering, continuity og ekstern bistand kan stadig forbedres.",
        ],
        actions: [
          "Opdater playbooks og kontaktkæder løbende efter organisatoriske og tekniske ændringer.",
          "Planlæg faste øvelser og reviews af læring fra hændelser og næsten-hændelser.",
          "Sørg for at incident management hænger tæt sammen med logging, monitoring og continuity-planer.",
        ],
      },
    },
  },
  {
    key: "business-continuity-disaster-recovery",
    label: "Business Continuity & Disaster Recovery",
    intro:
      "NIS2 handler også om virksomhedens evne til at fortsætte eller genoprette drift, når noget går galt.",
    questionWeights: {
      "10": 1.5,
      "05": 0.5,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Continuity og recovery ser ud til at være utilstrækkeligt planlagt eller testet, hvilket øger risikoen for længere driftsforstyrrelser.",
        typicalGaps: [
          "Ingen operative BC- eller DR-planer for kritiske systemer.",
          "Backup-strategi er uklar eller ikke testet regelmæssigt.",
          "Afhængighed af enkelte personer, systemer eller leverandører er ikke håndteret.",
        ],
        actions: [
          "Identificér de vigtigste forretningskritiske systemer og definér acceptable nedetider.",
          "Dokumentér backup-, recovery- og continuity-forløb for de få vigtigste scenarier først.",
          "Test gendannelse i praksis, så virksomheden ved hvad der faktisk kan genoprettes og hvor hurtigt.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der findes nogle continuity- og recovery-elementer, men de virker ikke fuldt operationelle eller dokumenterede endnu.",
        typicalGaps: [
          "Backups findes, men testen af recovery er sporadisk eller begrænset.",
          "Planer er beskrevet, men ansvar og prioritering under en hændelse er ikke skarpt defineret.",
          "RTO/RPO eller tilsvarende forventninger er uklare for ledelsen.",
        ],
        actions: [
          "Opdater planer med klare ejere, prioriteter og beslutningspunkter.",
          "Gennemfør kontrollerede recovery-tests og dokumentér resultatet.",
          "Sæt konkrete mål for hvor hurtigt kritiske funktioner skal genetableres.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Continuity og recovery ser relativt modne ud, men de skal fortsat testes og tilpasses for at være pålidelige i praksis.",
        typicalGaps: [
          "Planer kan glide ud af sync med systemændringer og nye leverandører.",
          "Test bliver let for teoretiske, hvis de ikke udfordrer realistiske afhængigheder.",
          "Dokumentation for recovery-evne er ikke altid klar til at blive fremvist hurtigt.",
        ],
        actions: [
          "Kør regelmæssige failover- eller recovery-tests på de vigtigste systemer.",
          "Opdater continuity- og recovery-planer ved større ændringer i systemer eller leverandører.",
          "Dokumentér resultaterne af tests, så virksomheden kan vise faktisk recovery-evne.",
        ],
      },
    },
  },
  {
    key: "supply-chain-security",
    label: "Supply Chain Security",
    intro:
      "Kritiske leverandører, SaaS-platforme og outsourcingsforhold er et centralt NIS2-spor og skal håndteres mere systematisk end almindelig procurement.",
    questionWeights: {
      "04": 1.5,
      "03": 0.5,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Leverandørstyring ser ikke ud til at være formaliseret på en måde, der kan underbygge NIS2-kravene.",
        typicalGaps: [
          "Intet samlet overblik over kritiske leverandører og tredjepartsafhængigheder.",
          "Sikkerhedskrav er ikke tydeligt indarbejdet i kontrakter og due diligence.",
          "Opfølgning på ændringer hos leverandører sker kun sporadisk.",
        ],
        actions: [
          "Kortlæg hvilke leverandører der er driftskritiske, og hvilke systemer de påvirker.",
          "Definér minimumskrav til sikkerhed, dokumentation og hændelsesrapportering i kontrakter og onboarding.",
          "Etabler en enkel model for risikovurdering og periodisk opfølgning på de vigtigste tredjeparter.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der er tegn på leverandørstyring, men opfølgning, prioritering og dokumentation virker ikke fuldt konsistente endnu.",
        typicalGaps: [
          "Kun de mest oplagte leverandører vurderes, mens resten mangler segmentering.",
          "Kontraktkrav findes, men er ikke omsat til løbende kontrol og opfølgning.",
          "Afhængigheder og exit-risici er kun delvist afdækket.",
        ],
        actions: [
          "Segmentér leverandører efter kritikalitet og brug samme model konsekvent.",
          "Knyt kontraktkrav til faste kontrolpunkter, fx attestering, reviews og hændelseskrav.",
          "Dokumentér afhængigheder, nøglepersoner og exit-overvejelser for de vigtigste leverandører.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Leverandørstyringen ser relativt moden ud, men kræver fortsat opdatering, især når kontrakter og tekniske afhængigheder ændrer sig.",
        typicalGaps: [
          "Opdateringer af leverandørprofiler og risikobillede kan blive forsinkede.",
          "Kontrolsporet mister værdi, hvis evidens ikke samles systematisk.",
          "Kritiske ændringer hos leverandører kan være svære at opdage tidligt nok.",
        ],
        actions: [
          "Opdater leverandørvurderinger regelmæssigt og ved større ændringer.",
          "Overvåg ændringer hos nøgleleverandører, fx ejerskab, drift, certificeringer og hændelser.",
          "Sørg for at exit- og fallback-overvejelser er dokumenteret for de mest kritiske relationer.",
        ],
      },
    },
  },
  {
    key: "security-in-network-information-systems",
    label: "Security in Network & Information Systems",
    intro:
      "Det tekniske fundament omkring netværk, systemer, segmentering og sikre konfigurationer har stor betydning for reel modstandskraft.",
    questionWeights: {
      "06": 1,
      "07": 1,
      "08": 1,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Det tekniske sikkerhedsfundament virker tyndt, og der er tegn på for begrænset overblik over systemer, adgange og overvågning.",
        typicalGaps: [
          "Manglende segmentering eller utilstrækkelig sikring af kritiske miljøer.",
          "Uklart overblik over kritiske aktiver, systemejere og administrative konti.",
          "Sikre konfigurationer og løbende review fremstår ikke tilstrækkeligt operationaliseret.",
        ],
        actions: [
          "Identificér de vigtigste miljøer og systemer, og afgræns hvor de mest kritiske sikkerhedskontroller skal ligge først.",
          "Skab et mere pålideligt overblik over aktiver, ejere, adgang og kritiske afhængigheder.",
          "Prioritér hardening og sikre standardkonfigurationer på de vigtigste systemer før bredere udrulning.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "De basale tekniske kontroller er delvist på plads, men de fremstår ikke fuldt sammenhængende eller modne endnu.",
        typicalGaps: [
          "Noget segmentering og firewall-beskyttelse findes, men dækker ikke nødvendigvis alle kritiske områder.",
          "System- og adgangsoverblik er delvist manuelt og sårbart over for fejl.",
          "Tekniske reviews sker, men ikke altid som en gentagelig proces.",
        ],
        actions: [
          "Stram segmentering og kontroller omkring de mest kritiske systemer og administrative flader.",
          "Gør asset- og ejerskabsoverblikket mere driftssikkert og lettere at holde opdateret.",
          "Indfør faste reviews af konfigurationer, netværksarkitektur og administrative flader.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Det tekniske fundament ser relativt modent ud, men kræver fortsat review for at følge trusselsbillede og ændringer i miljøet.",
        typicalGaps: [
          "Arkitektur og hardening kan blive forældet, hvis de ikke revurderes løbende.",
          "Nye systemer og integrationer kan introducere svage led uden at blive fanget hurtigt nok.",
          "Penetrationstests og tekniske reviews kan blive for sjældne i forhold til ændringstempoet.",
        ],
        actions: [
          "Fortsæt med løbende review af segmentering, hardening og sikre standarder.",
          "Planlæg tekniske tests og penetrationstests af de mest kritiske miljøer.",
          "Sørg for at nye systemer og integrationer vurderes mod samme sikkerhedsprincipper som resten af miljøet.",
        ],
      },
    },
  },
  {
    key: "access-control-identity-management",
    label: "Access Control & Identity Management",
    intro:
      "Adgangsstyring, MFA og kontrol med privilegerede konti er blandt de enkleste og mest effektive spor at forbedre tidligt.",
    questionWeights: {
      "07": 1.5,
      "08": 0.5,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Adgangskontrollen ser utilstrækkelig ud, og der er risiko for for brede rettigheder, svage kontroller og uklare ejere.",
        typicalGaps: [
          "MFA er ikke tvunget på alle kritiske eller privilegerede konti.",
          "Der findes delte konti, uklare roller eller for brede rettigheder.",
          "Adgangsreviews og lifecycle-styring er ikke formaliseret.",
        ],
        actions: [
          "Tving MFA på administrative konti og andre kritiske adgangspunkter først.",
          "Kortlæg privilegerede konti, delte konti og de mest følsomme adgange.",
          "Indfør en enkel model for godkendelse, ændring og review af adgang.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der er adgangskontroller på plads, men de virker delvist manuelle og ujævnt implementeret på tværs af systemer.",
        typicalGaps: [
          "MFA er implementeret delvist, men ikke konsekvent på tværs af kritiske systemer.",
          "RBAC eller least privilege er kun gennemført i udvalgte miljøer.",
          "Adgangsreviews sker, men ikke i en ensartet kadence.",
        ],
        actions: [
          "Gør MFA og principper for privilegeret adgang ensartede på tværs af kritiske systemer.",
          "Få styr på roller, tildelingsprincipper og fjernelse af adgang ved jobskifte eller fratrædelse.",
          "Planlæg faste access reviews med dokumenteret opfølgning.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Access-sporet virker relativt modent, men det kræver fortsat disciplin for at undgå glidebaner i privilegier og undtagelser.",
        typicalGaps: [
          "Privilegerede undtagelser og midlertidige adgange kan vokse uden synlig nok opfølgning.",
          "Automatisering kan dække meget, men kræver kontrol af data og roller.",
          "Nye systemer kan falde uden for de fælles adgangsprincipper.",
        ],
        actions: [
          "Fortsæt med regelmæssige access reviews og monitorering af privilegerede konti.",
          "Gennemgå undtagelser, servicekonti og administrative workflows løbende.",
          "Sørg for at nye systemer kobles på samme identitets- og adgangsprincipper som resten af miljøet.",
        ],
      },
    },
  },
  {
    key: "vulnerability-patch-management",
    label: "Vulnerability & Patch Management",
    intro:
      "Virksomheden skal kunne finde, prioritere og lukke kendte sårbarheder hurtigt nok til at reducere reel eksponering.",
    questionWeights: {
      "08": 1,
      "10": 1,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Sårbarheds- og patcharbejdet virker ikke tilstrækkeligt struktureret, og det er uklart hvor hurtigt kritiske svagheder lukkes.",
        typicalGaps: [
          "Ingen tydelig scanning- eller patchproces for kritiske systemer.",
          "Manglende overblik over hvilke aktiver der skal patches først.",
          "Test og validering af ændringer sker kun sporadisk.",
        ],
        actions: [
          "Skab et opdateret overblik over de vigtigste aktiver og deres ejere.",
          "Definér en enkel proces for scanning, prioritering og lukning af kritiske sårbarheder.",
          "Aftal hvor hurtigt kritiske findings skal håndteres, og dokumentér opfølgningen.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der er tegn på patching og scanning, men modenheden virker ujævn på tværs af systemer og ejere.",
        typicalGaps: [
          "Scanninger gennemføres, men opfølgningen er ikke konsekvent risikobaseret.",
          "Patching sker, men uden klare SLA’er eller ensartede beslutningskriterier.",
          "Effekten af patching og remediation bliver ikke altid valideret efterfølgende.",
        ],
        actions: [
          "Gør prioriteringen mere risikobaseret og fokuser først på kritiske systemer og eksternt eksponerede flader.",
          "Indfør faste deadlines og ejerskab for kritiske findings.",
          "Review løbende om patching faktisk reducerer eksponeringen som forventet.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Sårbarheds- og patchsporet ser relativt modent ud, men det kræver stadig kontinuerlig tuning og prioritering.",
        typicalGaps: [
          "Scanning og patching kan blive for rutinepræget uden kobling til trusselsbillede.",
          "Særlige legacy-systemer eller undtagelser kan blive stående for længe.",
          "Rapporteringen kan fokusere for meget på volumener frem for faktisk risiko.",
        ],
        actions: [
          "Knyt sårbarhedsarbejdet tættere til asset-kritikalitet og aktuel threat intelligence.",
          "Review undtagelser og kompenserende kontroller regelmæssigt.",
          "Mål effektiviteten af remediation frem for kun antallet af lukkede findings.",
        ],
      },
    },
  },
  {
    key: "monitoring-detection-logging",
    label: "Monitoring, Detection & Logging",
    intro:
      "Logning og monitorering gør det muligt at opdage hændelser tidligt og skaber også vigtig dokumentation for næste beslutning og auditspor.",
    questionWeights: {
      "06": 1.5,
      "05": 0.5,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Overvågning og logning virker utilstrækkeligt centraliseret, hvilket svækker både detektion og efterfølgende analyse.",
        typicalGaps: [
          "Kritiske systemer logges ikke centralt eller konsekvent.",
          "Alarmering og detektion er begrænset eller stærkt manuel.",
          "Der mangler tydelig kobling mellem logning og hændelsesflow.",
        ],
        actions: [
          "Prioritér central logging på de vigtigste systemer først.",
          "Definér få, men værdifulde alarmeringsscenarier med klare ejere.",
          "Sørg for at logning og detektion understøtter incident-processen i praksis.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der er monitorering på plads, men dækning, kvalitet og opfølgning virker endnu ikke tilstrækkeligt modne.",
        typicalGaps: [
          "Kun udvalgte systemer er integreret i logning og overvågning.",
          "Use cases og detektionsregler er ikke opdateret i takt med miljøet.",
          "False positives og manglende prioritering reducerer effekten.",
        ],
        actions: [
          "Udvid monitoreringen til de mest forretningskritiske datakilder først.",
          "Review og forbedr detektionsregler baseret på realistiske scenarier og tidligere hændelser.",
          "Etabler tydelig prioritering og ansvar for opfølgning på alarmer.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Monitoring-sporet ser relativt modent ud, men effekten afhænger af løbende tuning, datakvalitet og prioritering.",
        typicalGaps: [
          "Detektionsregler kan blive forældede eller støjende over tid.",
          "Nye systemer og datakilder bliver ikke altid integreret hurtigt nok.",
          "Rapporteringen kan mangle fokus på det der faktisk reducerer respons-tid og opdagelsestid.",
        ],
        actions: [
          "Opdater detection rules løbende og reducer støj, så teamet reagerer hurtigere på reelle signaler.",
          "Integrér nye kritiske systemer og identitetskilder i samme monitoreringssetup.",
          "Brug erfaring fra hændelser til at forbedre use cases og prioritering af alarmer.",
        ],
      },
    },
  },
  {
    key: "cryptography-data-protection",
    label: "Cryptography & Data Protection",
    intro:
      "Kryptering, databeskyttelse og nøglestyring er ofte et mere modent spor, men bør stadig vurderes i lyset af adgang, politikker og kritiske dataflow.",
    questionWeights: {
      "02": 1,
      "07": 1,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Data protection-sporet ser ikke tydeligt dokumenteret eller tilstrækkeligt forankret ud i kontroller og minimumskrav.",
        typicalGaps: [
          "Manglende eller uklare krav til kryptering og håndtering af følsomme data.",
          "Nøglehåndtering og dataklassifikation er ikke tydeligt beskrevet.",
          "Adgangskontrol og databeskyttelse hænger ikke sammen som et samlet spor.",
        ],
        actions: [
          "Definér minimumskrav til kryptering i transit og at rest for kritiske data og systemer.",
          "Afklar hvor følsomme data ligger, hvem der har adgang, og hvordan nøgler eller secrets håndteres.",
          "Knyt data protection-krav tydeligere til politikker, adgangsstyring og tekniske kontroller.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der er elementer af databeskyttelse på plads, men modenheden virker ujævn og afhængig af enkelte systemer eller teams.",
        typicalGaps: [
          "Kryptering bruges nogle steder, men ikke efter en ensartet standard.",
          "Krav til key management og dataklassifikation er kun delvist operationaliseret.",
          "Review af databeskyttelseskrav ved nye systemer eller ændringer er ikke tydeligt formaliseret.",
        ],
        actions: [
          "Skab et tydeligere overblik over hvor kryptering er påkrævet, og hvilke standarder der gælder.",
          "Formalisér håndtering af nøgler, secrets og følsomme dataflow.",
          "Indfør review af data protection-krav ved nye leverandører, systemer og integrationer.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Data protection-sporet ser relativt modent ud, men det kræver fortsat review af standarder, key management og ændringer i datalandskabet.",
        typicalGaps: [
          "Ældre standarder og undtagelser kan blive stående for længe.",
          "Nye dataflow og integrationer kan falde uden for de fælles krav.",
          "Key rotation og evidens for kontroller kan være mindre modne end den overordnede policy tilsiger.",
        ],
        actions: [
          "Review krypteringsstandarder og key management-regler regelmæssigt.",
          "Sørg for at nye systemer og integrationer vurderes mod samme data protection-krav.",
          "Dokumentér evidens for nøglekontroller, så virksomheden kan vise hvordan data beskyttes i praksis.",
        ],
      },
    },
  },
  {
    key: "awareness-training",
    label: "Awareness & Training",
    intro:
      "Mennesker, roller og træning spiller en stor rolle for, om kontrollerne virker i praksis og om hændelser opdages og håndteres tidligt.",
    questionWeights: {
      "09": 1.5,
      "05": 0.5,
    },
    levels: {
      low: {
        label: "Lav compliance",
        description:
          "Awareness og træning fremstår ikke som et løbende program, hvilket gør virksomheden mere sårbar i hverdagen.",
        typicalGaps: [
          "Ingen regelmæssig security awareness eller rollebaseret træning.",
          "Medarbejdere og ledere kender ikke tydeligt deres ansvar ved hændelser.",
          "Effekten af træning bliver ikke fulgt op eller målt.",
        ],
        actions: [
          "Etabler et enkelt, løbende awareness-program med få prioriterede emner.",
          "Tilføj rollebaseret træning for ledelse, drift og personer med særligt ansvar.",
          "Knyt træningen tydeligere til hændelsesberedskab, phishing og daglige arbejdsgange.",
        ],
      },
      medium: {
        label: "Mellem compliance",
        description:
          "Der er træning i organisationen, men den virker sporadisk og ikke fuldt målrettet efter roller og reelle risici.",
        typicalGaps: [
          "Awareness gennemføres, men uden tydelig måling af effekt eller adfærd.",
          "Indholdet er ikke altid tilpasset kritiske roller og beslutningstagere.",
          "Læring fra hændelser og næsten-hændelser bruges ikke systematisk i træningen.",
        ],
        actions: [
          "Målret awareness efter de mest udsatte roller og de mest sandsynlige scenarier.",
          "Indfør lette KPI’er, fx deltagelse, phishing-resultater eller øvelseslæring.",
          "Brug læring fra hændelser til at opdatere træningsindholdet løbende.",
        ],
      },
      high: {
        label: "Høj compliance",
        description:
          "Awareness-sporet ser relativt modent ud, men effekten skal stadig dokumenteres og forbedres løbende.",
        typicalGaps: [
          "Generel træning kan miste relevans, hvis den ikke opdateres med nye scenarier og roller.",
          "Adfærdsdata og læring bliver ikke altid omsat til konkrete forbedringer.",
          "Ledelses- og specialistroller kan have behov for mere målrettet træning end resten af organisationen.",
        ],
        actions: [
          "Opdater indholdet løbende efter aktuelle trusler, hændelser og forretningsændringer.",
          "Brug målrettede træningsspor for kritiske roller og nøglepersoner.",
          "Mål effekt og brug resultaterne aktivt til at forbedre programmet næste gang.",
        ],
      },
    },
  },
];
