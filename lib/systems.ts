export type SystemStory = {
  system: string;
  group: "heart" | "metabolism" | "organs" | "vitality";
  story: string;
  focus: string;
};

export const SYSTEMS: SystemStory[] = [
  {
    system: "Heart & Vascular Health",
    group: "heart",
    story:
      "Your heart picture is mixed in a useful way. Lp(a) is reassuring, but ApoB is elevated at 112 mg/dL. ApoB counts artery-risk particles, so it can reveal risk that a normal-looking total cholesterol result may miss.",
    focus:
      "Review ApoB with the full lipid panel and personal history. Treat this as one connected pattern, not several unrelated warnings.",
  },
  {
    system: "Metabolic Health",
    group: "metabolism",
    story:
      "Your metabolism is stable and efficient. Your 3-month blood sugar average is 5.2% and glucose is 88 mg/dL. Together with fasting insulin, these markers tell a reassuring story about blood sugar control.",
    focus:
      "Maintain the habits supporting this pattern. There is no isolated metabolic number demanding action right now.",
  },
  {
    system: "Energy",
    group: "metabolism",
    story:
      "Your energy-related signals are reassuring. Hemoglobin and morning cortisol sit in range, while low stored iron elsewhere in the panel remains useful context for how you feel.",
    focus:
      "Review energy symptoms alongside ferritin, sleep and thyroid results. Do not assume fatigue has one cause based on a single marker.",
  },
  {
    system: "Thyroid Health",
    group: "metabolism",
    story:
      "Your thyroid signal tells a consistent story. TSH is 1.8 mIU/L and sits comfortably inside the laboratory range, with no current signal that thyroid regulation is disrupting metabolism or energy.",
    focus:
      "Maintain this baseline and interpret future thyroid results together. TSH, thyroid hormones and symptoms are more useful as a pattern than in isolation.",
  },
  {
    system: "Liver Health",
    group: "organs",
    story:
      "Your liver signal is stable. ALT is 21 U/L and remains comfortably inside the laboratory range, with no clear pattern of ongoing liver-cell stress.",
    focus:
      "Maintain the habits supporting liver health and watch the pattern over time. A coordinated change across several liver markers matters more than a small isolated shift.",
  },
  {
    system: "Kidney Health",
    group: "organs",
    story:
      "Your kidney-related picture is stable. eGFR and creatinine show no clear pattern demanding follow-up.",
    focus:
      "Keep blood pressure and hydration in a healthy pattern. Future trends are more informative than a small change between two tests.",
  },
  {
    system: "Inflammation",
    group: "vitality",
    story:
      "Your inflammation picture is reassuring and improving. High-sensitivity CRP moved from 2.1 to 0.8 mg/L across four checks, placing the latest result inside this panel's lower-risk range.",
    focus:
      "Protect the habits supporting this trend. Interpret sudden changes carefully because illness, injury and hard exercise can temporarily raise inflammation markers.",
  },
  {
    system: "Immune System",
    group: "vitality",
    story:
      "Your immune-cell picture is balanced. White blood cell count is 5.8 K/µL and remains inside the expected range, with no isolated signal in this panel demanding follow-up.",
    focus:
      "Use this as a baseline rather than a daily immune score. Infection, medication and recent stress can temporarily change white blood cell results.",
  },
  {
    system: "Sex Hormones",
    group: "vitality",
    story:
      "Your measured sex hormone signal sits within this panel's expected range. This result is most useful when read alongside cycle stage, symptoms, medications and life stage, because the same number can mean different things in different contexts.",
    focus:
      "Keep this as a stable baseline. If symptoms change, compare future results under similar testing conditions rather than reacting to one number.",
  },
  {
    system: "Nutrients",
    group: "vitality",
    story:
      "One nutrient signal is reassuring and one needs follow-up. Vitamin D is 42 ng/mL, while ferritin is low at 18 ng/mL, which means stored iron is the result in this group that deserves attention.",
    focus:
      "Confirm ferritin with the complete blood count and iron panel before considering supplements. The reason for low iron matters as much as the number.",
  },
  {
    system: "Brain Health",
    group: "vitality",
    story:
      "The blood-based signals connected to brain health are reassuring. Vitamin D, inflammation and hormone-related markers provide supportive context, while blood tests remain only one part of understanding cognition and brain health.",
    focus:
      "Maintain the basics that protect brain health over time: sleep, movement, blood-pressure control and adequate nutrients. Blood tests are only one part of the picture.",
  },
];

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function systemBySlug(slug: string) {
  return SYSTEMS.find((story) => slugify(story.system) === slug);
}
