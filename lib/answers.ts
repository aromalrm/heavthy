import { DRAWS, FEATURED_BIOMARKERS, LATEST_DRAW, type Marker } from "./data";

export type Segment = string | { marker: string; label: string };

export type Answer = {
  id: string;
  segments: Segment[];
  next: string;
  cites: string[];
};

const APOB = "Apolipoprotein B (ApoB)";
const FERRITIN = "Ferritin";
const CRP = "High-sensitivity CRP";
const LPA = "Lipoprotein(a)";
const HEMOGLOBIN = "Hemoglobin";

const PRESET: Answer[] = [
  {
    id: "summary",
    segments: [
      "Your Jul 8 results are mostly steady: 14 of 17 are optimal. Two need attention. ",
      { marker: APOB, label: "ApoB" },
      " is 112 mg/dL against a target under 80, and ",
      { marker: FERRITIN, label: "ferritin" },
      " is 18 ng/mL, below the 30 to 150 range. The good news is ",
      { marker: CRP, label: "CRP" },
      ", which fell from 2.1 to 0.8 mg/L since October.",
    ],
    next: "Start with ApoB. Book a clinician review with your full lipid panel.",
    cites: [APOB, FERRITIN, CRP],
  },
  {
    id: "apob",
    segments: [
      { marker: APOB, label: "ApoB" },
      " counts the particles that carry cholesterol into artery walls. Yours has risen at every test, from 94 to 112 mg/dL, and the target is under 80. Two results argue against a bigger worry: your inherited particle, ",
      { marker: LPA, label: "Lp(a)" },
      ", is low at 24 nmol/L, and ",
      { marker: CRP, label: "CRP" },
      " keeps falling.",
    ],
    next: "Review ApoB with a clinician alongside LDL, triglycerides and family history.",
    cites: [APOB, LPA, CRP],
  },
  {
    id: "ferritin",
    segments: [
      { marker: FERRITIN, label: "Ferritin" },
      " estimates how much iron you have stored. Yours has fallen at every test: 34, 29, 23, now 18 ng/mL. ",
      { marker: HEMOGLOBIN, label: "Hemoglobin" },
      " is still normal at 13.5 g/dL, so this is an early signal worth confirming before you change anything.",
    ],
    next: "Add a full iron panel to your Oct 8 test before taking iron.",
    cites: [FERRITIN, HEMOGLOBIN],
  },
  {
    id: "crp",
    segments: [
      { marker: CRP, label: "CRP" },
      " is a general marker of inflammation. It moved from 2.1 to 0.8 mg/L across your four tests since October, into the lower-risk range. One result can be thrown by a cold, but a steady fall across four is a real trend.",
    ],
    next: "Keep the routine that changed it. Your protocol tracks sleep for this.",
    cites: [CRP],
  },
];

const PRESET_BY_QUESTION: Record<string, string> = {
  "summarise my latest results": "summary",
  "cholesterol particle count is your clearest priority": "apob",
  "could low ferritin explain feeling tired?": "ferritin",
  "your iron stores may be limiting energy": "ferritin",
  "iron and afternoon energy": "ferritin",
  "what changed my inflammation?": "crp",
  "inflammation has improved across three checks": "crp",
  "what does crp measure?": "crp",
};

const ALIASES: [RegExp, string][] = [
  [/lp\(a\)|lipoprotein\(a\)|\binherited\b/, LPA],
  [/\bapob\b|apolipoprotein|particle count|\bcholesterol\b/, APOB],
  [/\bferritin\b|\biron\b/, FERRITIN],
  [/\bcrp\b|\binflammation\b/, CRP],
  [/\ba1c\b|3-month|blood sugar average/, "Hemoglobin A1c"],
  [/\bglucose\b|fasting sugar/, "Fasting Glucose"],
  [/\binsulin\b/, "Fasting Insulin"],
  [/vitamin d\b/, "Vitamin D"],
  [/\btsh\b|\bthyroid\b/, "Thyroid Stimulating Hormone (TSH)"],
  [/\btestosterone\b/, "Total Testosterone"],
  [/\bhemoglobin\b|\boxygen\b/, HEMOGLOBIN],
  [/white blood|\bwbc\b|\bimmune\b/, "White Blood Cell Count"],
  [/\bhomocysteine\b/, "Homocysteine"],
  [/\bcreatinine\b/, "Creatinine"],
  [/\begfr\b|\bfiltration\b|\bkidneys?\b/, "Estimated GFR"],
  [/\balt\b|\bliver\b/, "Alanine Aminotransferase (ALT)"],
  [/\bcortisol\b|\bstress\b/, "Cortisol"],
];

export const SUGGESTED = [
  "Summarise my latest results",
  "What would bring my ApoB down?",
  "Could low ferritin explain feeling tired?",
  "What changed my inflammation?",
];

function findMarker(text: string) {
  const lower = text.toLowerCase();
  const direct = FEATURED_BIOMARKERS.find(
    (marker) =>
      lower.includes(marker.short.toLowerCase()) ||
      lower.includes(marker.name.toLowerCase()),
  );
  if (direct) return direct;
  const alias = ALIASES.find(([pattern]) => pattern.test(lower));
  return alias
    ? FEATURED_BIOMARKERS.find((marker) => marker.name === alias[1])
    : undefined;
}

function lowerFirst(text: string) {
  const trimmed = text.replace(/\.$/, "");
  const first = trimmed.split(" ")[0];
  return /[A-Z].*[A-Z]/.test(first)
    ? trimmed
    : trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

function trendSentence(marker: Marker) {
  const history = marker.history;
  if (history.length < 2) return "This is your first result for it.";
  const first = history[0];
  const last = history[history.length - 1];
  if (first === last) return `It has held at ${last} across your ${history.length} tests.`;
  return `It has ${last > first ? "risen" : "fallen"} from ${first} to ${last} across your ${history.length} tests.`;
}

function fromMarker(question: string, marker: Marker): Answer {
  const lower = question.toLowerCase();
  const mode = /how fast|change|lower|raise|improve|bring|move|what helps|what would/.test(lower)
    ? "change"
    : /relate|fit together|connect|compare|other/.test(lower)
      ? "relate"
      : /doctor|clinician|ask my|appointment/.test(lower)
        ? "clinician"
        : /why|cause|reason|explain|could|mean/.test(lower)
          ? "cause"
          : "read";
  const place =
    marker.status === "attention"
      ? `outside its ${marker.range} target`
      : marker.status === "inrange"
        ? `inside the ${marker.range} lab range and short of optimal`
        : `comfortably inside its ${marker.range} target`;
  const lead: Segment[] = [
    { marker: marker.name, label: marker.short },
    ` is ${marker.value}, ${place}. ${trendSentence(marker)} `,
  ];
  const next =
    marker.action ?? "Keep doing what you are doing, and recheck it at your next test.";
  if (mode === "change") {
    const habits = (marker.habits ?? []).slice(0, 2).map(lowerFirst);
    return {
      id: `${marker.name}-change`,
      segments: [
        ...lead,
        habits.length
          ? `Markers like this usually take a few months to move, so judge it test to test. What tends to help: ${habits.join("; ")}.`
          : "Markers like this usually take a few months to move, so judge it test to test.",
      ],
      next,
      cites: [marker.name],
    };
  }
  if (mode === "relate") {
    const peers = FEATURED_BIOMARKERS.filter(
      (item) => item.system === marker.system && item.name !== marker.name,
    ).slice(0, 3);
    const related: Segment[] = peers.length
      ? [
          `Read it next to the rest of your ${marker.system.toLowerCase()} results: `,
          ...peers.flatMap((item, index) => [
            { marker: item.name, label: item.short } as Segment,
            ` ${item.value}${index < peers.length - 1 ? ", " : "."}`,
          ]),
          " Together they say more than any one number.",
        ]
      : ["It is the only result in this system so far, so the trend matters most."];
    return {
      id: `${marker.name}-relate`,
      segments: [...lead, ...related],
      next,
      cites: [marker.name, ...peers.map((item) => item.name)],
    };
  }
  if (mode === "clinician") {
    const science = (marker.science ?? []).slice(0, 2).map(lowerFirst);
    return {
      id: `${marker.name}-clinician`,
      segments: [
        ...lead,
        science.length
          ? `Worth raising: ${science.join(", and ")}. Bring the trend as well as this number.`
          : "Bring the trend as well as this number, and ask what target fits your history.",
      ],
      next,
      cites: [marker.name],
    };
  }
  if (mode === "cause") {
    return {
      id: `${marker.name}-cause`,
      segments: [...lead, marker.whyItMatters ?? marker.plain],
      next,
      cites: [marker.name],
    };
  }
  return {
    id: `${marker.name}-read`,
    segments: [...lead, marker.plain],
    next,
    cites: [marker.name],
  };
}

export function answerFor(question: string, about?: string | null): Answer {
  const preset = PRESET_BY_QUESTION[question.trim().toLowerCase()];
  if (preset) return PRESET.find((item) => item.id === preset) ?? PRESET[0];
  const marker = findMarker(question) ?? (about ? findMarker(about) : undefined);
  return marker ? fromMarker(question, marker) : PRESET[0];
}

export function latestLabel() {
  return DRAWS[LATEST_DRAW].label;
}
