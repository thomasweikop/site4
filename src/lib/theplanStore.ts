import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type TheplanOutreachLead = {
  vendorKey: string;
  company: string;
  website: string;
  domain: string;
  primaryType: string;
  secondaryTypes: string;
  adjacentTypes: string;
  sectorFit: string;
  sizeFit: string;
  priceBand: string;
  qualificationScoreInitial: number;
  bestFor: string;
  recommendedRole: string;
  bestMatchAreas: string;
  recommendedWhen: string;
  websiteSummaryDa: string;
  websiteSignalTags: string[];
  sourceUrls: string[];
  warmSignalLine: string;
  personalizedOpening: string;
  reasonForOutreach: string;
  suggestedEmailSubject: string;
  suggestedLinkedInOpening: string;
};

export type TheplanContactEnrichment = {
  vendorKey: string;
  company: string;
  website: string;
  domain: string;
  primaryType: string;
  bestFor: string;
  recommendedRole: string;
  genericEmails: string[];
  allEmails: string[];
  phoneNumbers: string[];
  linkedinUrls: string[];
  contactPageUrls: string[];
  titleSnippets: string[];
  homepageScanned: boolean;
  pagesScannedCount: number;
  blockerRiskAssessment: boolean;
  blockerIncidentResponse: boolean;
  blockerMfaAccess: boolean;
  confidence: "high" | "medium" | "low" | "none";
};

export type TheplanWarmSignal = {
  vendorKey: string;
  company: string;
  website: string;
  domain: string;
  primaryType: string;
  qualificationScoreInitial: number;
  bestMatchAreas: string;
  warmSignalTier: "A" | "B" | "C";
  warmSignalScore: number;
  outreachChannel: "email-first" | "linkedin-first" | "manual-research";
  primaryEmail: string;
  primaryLinkedinUrl: string;
  primaryPhone: string;
  contactConfidence: TheplanContactEnrichment["confidence"];
  whyNow: string;
  warmSignalLine: string;
  personalizedOpening: string;
  suggestedEmailSubject: string;
  suggestedLinkedInOpening: string;
};

export type TheplanDraft = {
  vendorKey: string;
  company: string;
  website: string;
  domain: string;
  primaryType: string;
  warmSignalTier: "A" | "B" | "C";
  warmSignalScore: number;
  outreachChannel: "email-first" | "linkedin-first" | "manual-research";
  primaryContact: string;
  contactConfidence: TheplanContactEnrichment["confidence"];
  companyDescription: string;
  reasonToWrite: string;
  firstLineEmail: string;
  suggestedSubject: string;
  emailDraft: string;
  followUpDraft: string;
  linkedInDraft: string;
};

export type TheplanDataset = {
  leads: TheplanOutreachLead[];
  contacts: TheplanContactEnrichment[];
  warmSignals: TheplanWarmSignal[];
  drafts: TheplanDraft[];
};

const root = process.cwd();
const outreachPath = resolve(root, "exports/theplan_outreach_leads.json");
const contactsPath = resolve(root, "exports/theplan_contact_enrichment.json");

function readJsonFile<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) {
    return fallback;
  }

  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function compact(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function pickPrimaryEmail(contact: TheplanContactEnrichment) {
  return contact.genericEmails[0] || contact.allEmails[0] || "";
}

function pickPrimaryLinkedin(contact: TheplanContactEnrichment) {
  return contact.linkedinUrls[0] || "";
}

function pickPrimaryPhone(contact: TheplanContactEnrichment) {
  return contact.phoneNumbers[0] || "";
}

function computeWarmSignalScore(
  lead: TheplanOutreachLead,
  contact: TheplanContactEnrichment,
) {
  let score = 0;
  score += Math.min(40, Number(lead.qualificationScoreInitial || 0) / 2);
  if (contact.confidence === "high") score += 30;
  if (contact.confidence === "medium") score += 18;
  if (contact.genericEmails.length > 0) score += 16;
  else if (contact.allEmails.length > 0) score += 10;
  if (contact.linkedinUrls.length > 0) score += 8;
  if (contact.phoneNumbers.length > 0) score += 6;
  return Math.round(score);
}

function classifyWarmSignalTier(score: number): "A" | "B" | "C" {
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  return "C";
}

function classifyOutreachChannel(
  contact: TheplanContactEnrichment,
): "email-first" | "linkedin-first" | "manual-research" {
  if (contact.genericEmails.length > 0 || contact.allEmails.length > 0) {
    return "email-first";
  }
  if (contact.linkedinUrls.length > 0) {
    return "linkedin-first";
  }
  return "manual-research";
}

function buildWhyNow(
  lead: TheplanOutreachLead,
  contact: TheplanContactEnrichment,
) {
  return [
    "Allerede nævnt i ComplyChecks specialistoverblik",
    lead.bestMatchAreas ? `Matcher især ${lead.bestMatchAreas}` : "",
    contact.confidence === "high"
      ? "Kontaktpunkt fundet med høj sikkerhed"
      : contact.confidence === "medium"
        ? "Kontaktspor fundet og klar til første outreach"
        : "Kræver let manuel validering før outreach",
  ]
    .filter(Boolean)
    .join(" | ");
}

function buildDescription(lead: TheplanOutreachLead) {
  if (lead.websiteSummaryDa) {
    return compact(lead.websiteSummaryDa);
  }
  if (lead.bestFor) {
    return compact(lead.bestFor);
  }
  return `${lead.company} indgår i ComplyChecks specialistoverblik relateret til NIS2.`;
}

function buildFirstLine(lead: TheplanOutreachLead) {
  const opening = compact(lead.personalizedOpening || "");
  if (!opening) {
    return `Jeg skriver, fordi ${lead.company} allerede indgår i vores specialistoverblik relateret til NIS2.`;
  }
  return opening.endsWith(".") ? opening : `${opening}.`;
}

function buildEmailDraft(lead: TheplanOutreachLead) {
  return [
    `Hej ${lead.company},`,
    "",
    buildFirstLine(lead),
    "",
    "I er allerede nævnt i ComplyChecks specialistoverblik relateret til NIS2, og vi vil gerne validere, at jeres profil står skarpt for de virksomheder, der søger relevante specialistspor.",
    "",
    lead.bestMatchAreas
      ? `Lige nu matcher vi jer især på: ${lead.bestMatchAreas}.`
      : "",
    lead.websiteSummaryDa
      ? `Vores nuværende læsning er: ${compact(lead.websiteSummaryDa)}`
      : "",
    "",
    "Hvis det giver mening, sender jeg gerne et kort preview af jeres nuværende profil og et forslag til, hvordan den kan styrkes.",
    "",
    "Bedste hilsner",
    "Christian",
    "Team ComplyCheck.dk",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFollowUpDraft(lead: TheplanOutreachLead) {
  return [
    `Hej ${lead.company},`,
    "",
    "Jeg følger lige kort op på min tidligere besked.",
    "I er allerede med i vores specialistoverblik relateret til NIS2, og jeg sender gerne et kort preview, hvis det er relevant.",
    "",
    "Bedste hilsner",
    "Christian",
    "Team ComplyCheck.dk",
  ].join("\n");
}

function buildLinkedInDraft(lead: TheplanOutreachLead) {
  return compact(
    `Hej, jeg skriver kort fordi ${lead.company} allerede indgår i vores specialistoverblik relateret til NIS2. Jeg vil gerne validere, at jeres profil står skarpt og sende et kort preview, hvis det er relevant.`,
  );
}

function buildWarmSignals(
  leads: TheplanOutreachLead[],
  contacts: TheplanContactEnrichment[],
) {
  const contactsByVendorKey = new Map(
    contacts.map((item) => [item.vendorKey, item]),
  );

  return leads
    .map((lead) => {
      const contact =
        contactsByVendorKey.get(lead.vendorKey) ??
        ({
          vendorKey: lead.vendorKey,
          company: lead.company,
          website: lead.website,
          domain: lead.domain,
          primaryType: lead.primaryType,
          bestFor: lead.bestFor,
          recommendedRole: lead.recommendedRole,
          genericEmails: [],
          allEmails: [],
          phoneNumbers: [],
          linkedinUrls: [],
          contactPageUrls: [],
          titleSnippets: [],
          homepageScanned: false,
          pagesScannedCount: 0,
          blockerRiskAssessment: false,
          blockerIncidentResponse: false,
          blockerMfaAccess: false,
          confidence: "none",
        } satisfies TheplanContactEnrichment);

      const warmSignalScore = computeWarmSignalScore(lead, contact);

      return {
        vendorKey: lead.vendorKey,
        company: lead.company,
        website: lead.website,
        domain: lead.domain,
        primaryType: lead.primaryType,
        qualificationScoreInitial: lead.qualificationScoreInitial,
        bestMatchAreas: lead.bestMatchAreas,
        warmSignalTier: classifyWarmSignalTier(warmSignalScore),
        warmSignalScore,
        outreachChannel: classifyOutreachChannel(contact),
        primaryEmail: pickPrimaryEmail(contact),
        primaryLinkedinUrl: pickPrimaryLinkedin(contact),
        primaryPhone: pickPrimaryPhone(contact),
        contactConfidence: contact.confidence,
        whyNow: buildWhyNow(lead, contact),
        warmSignalLine: lead.warmSignalLine,
        personalizedOpening: lead.personalizedOpening,
        suggestedEmailSubject: lead.suggestedEmailSubject,
        suggestedLinkedInOpening: lead.suggestedLinkedInOpening,
      } satisfies TheplanWarmSignal;
    })
    .sort((left, right) => right.warmSignalScore - left.warmSignalScore);
}

function buildDrafts(
  leads: TheplanOutreachLead[],
  contacts: TheplanContactEnrichment[],
  warmSignals: TheplanWarmSignal[],
) {
  const contactsByVendorKey = new Map(
    contacts.map((item) => [item.vendorKey, item]),
  );
  const warmSignalsByVendorKey = new Map(
    warmSignals.map((item) => [item.vendorKey, item]),
  );

  return leads
    .map((lead) => {
      const contact = contactsByVendorKey.get(lead.vendorKey);
      const warmSignal = warmSignalsByVendorKey.get(lead.vendorKey);

      return {
        vendorKey: lead.vendorKey,
        company: lead.company,
        website: lead.website,
        domain: lead.domain,
        primaryType: lead.primaryType,
        warmSignalTier: warmSignal?.warmSignalTier ?? "C",
        warmSignalScore: warmSignal?.warmSignalScore ?? 0,
        outreachChannel: warmSignal?.outreachChannel ?? "manual-research",
        primaryContact:
          warmSignal?.primaryEmail ||
          contact?.genericEmails[0] ||
          contact?.allEmails[0] ||
          warmSignal?.primaryLinkedinUrl ||
          contact?.linkedinUrls[0] ||
          "",
        contactConfidence: contact?.confidence ?? "none",
        companyDescription: buildDescription(lead),
        reasonToWrite: `${lead.company} er allerede med i ComplyChecks specialistoverblik, og vi vil gerne sikre, at jeres profil er retvisende, opdateret og tydelig for virksomheder, der leder efter relevant NIS2-hjælp.`,
        firstLineEmail: buildFirstLine(lead),
        suggestedSubject:
          warmSignal?.suggestedEmailSubject ?? lead.suggestedEmailSubject,
        emailDraft: buildEmailDraft(lead),
        followUpDraft: buildFollowUpDraft(lead),
        linkedInDraft: buildLinkedInDraft(lead),
      } satisfies TheplanDraft;
    })
    .sort((left, right) => right.warmSignalScore - left.warmSignalScore);
}

export async function getTheplanDataset(): Promise<TheplanDataset> {
  const leads = readJsonFile<TheplanOutreachLead[]>(outreachPath, []);
  const contacts = readJsonFile<TheplanContactEnrichment[]>(contactsPath, []);
  const warmSignals = buildWarmSignals(leads, contacts);
  const drafts = buildDrafts(leads, contacts, warmSignals);

  return {
    leads,
    contacts,
    warmSignals,
    drafts,
  };
}
