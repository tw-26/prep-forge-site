// Reads the Citizen Ready app's content modules and writes plain JSON for the website.
// Run through scripts/export-uscis-data.mjs, which uses the app's own tsx so workspace imports resolve.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const appDir = process.env.USCIS_APP_DIR;
const outDir = process.env.USCIS_DATA_OUT;

if (!appDir || !outDir) {
  throw new Error("USCIS_APP_DIR and USCIS_DATA_OUT must be set.");
}

const load = (relativePath: string) => import(pathToFileURL(join(appDir, relativePath)).href);

const questionsModule = await load("content/questions.ts");
const civicsModule = await load("content/current-civics-data.ts");
const spanishModule = await load("content/spanish-translations.ts");
const officeModule = await load("content/current-office-data.ts");
const federalModule = await load("content/current-federal-data.ts");
const copyModule = await load("i18n/copy.ts");

const { resolveUscisQuestions } = questionsModule;
const {
  getDynamicChoicesForQuestion,
  getRepresentativeDistricts,
  isNonStateJurisdictionCode,
  stateProfiles
} = civicsModule;
const { getLocalizedQuizText, translateEnglishLabelToSpanish } = spanishModule;
const { currentOfficeData, currentOfficeDataSource } = officeModule;
const { currentFederalDataSource, currentFederalOffices } = federalModule;
const { uscisCopy } = copyModule;

type Choice = { id: string; isCorrect: boolean; label: string };
type Question = {
  answerRequirement: { count: number; strategy: "all" | "any" };
  answerSource: { kind: string; office?: string; jurisdictionLevel?: string };
  choices?: Choice[];
  explanation: string;
  id: string;
  officialAnswers: { id: string; label: string }[];
  prompt: string;
  source: { document: string; questionNumber: number; version: string };
  tags: string[];
  topic: string;
};

// Without a profile, current-office questions (President, Speaker, ...) still resolve their choices.
const questions: Question[] = resolveUscisQuestions();

// Distractor labels the app's Spanish table does not cover yet (the app shows them in English too).
const missingSpanishLabels: Record<string, string> = {
  "A local mayor": "Un alcalde local",
  "One of your U.S. senators": "Uno de sus senadores de EE. UU.",
  "The lieutenant governor": "El vicegobernador",
  "The Senate": "El Senado",
  "The state attorney general": "El fiscal general del estado",
  "The state governor": "El gobernador del estado",
  "Your state governor": "El gobernador de su estado",
  "Your U.S. representative": "Su representante de EE. UU."
};

function exportChoices(question: Question, choices: Choice[] | undefined) {
  if (!choices) {
    return { en: null, es: null };
  }

  const spanish = getLocalizedQuizText({ ...question, choices }, "es");

  return {
    en: choices.map((choice) => ({ label: choice.label, correct: choice.isCorrect })),
    es: choices.map((choice) => {
      const label = spanish.choices[choice.id]?.primary ?? choice.label;
      return { label: label === choice.label ? missingSpanishLabels[label] ?? label : label, correct: choice.isCorrect };
    })
  };
}

const exportedQuestions = questions.map((question) => {
  const spanish = getLocalizedQuizText(question, "es");
  const choices = exportChoices(question, question.choices);

  return {
    number: question.source.questionNumber,
    id: question.id,
    topic: question.topic,
    kind: question.answerSource.kind,
    office: question.answerSource.office ?? null,
    jurisdictionLevel: question.answerSource.jurisdictionLevel ?? null,
    count: question.answerRequirement.count,
    strategy: question.answerRequirement.strategy,
    tags: question.tags,
    en: {
      prompt: question.prompt,
      answers: question.officialAnswers.map((answer) => answer.label),
      explanation: question.explanation,
      choices: choices.en
    },
    es: {
      prompt: spanish.prompt.primary,
      answers: question.officialAnswers.map((answer) => translateEnglishLabelToSpanish(answer.label)),
      explanation: spanish.explanation,
      choices: choices.es
    }
  };
});

const topicIds = Object.keys(uscisCopy.en.topicsById);
const topicOrder = Array.from(new Set(exportedQuestions.map((question) => question.topic)));
const topics = topicOrder
  .filter((topicId) => topicIds.includes(topicId))
  .map((topicId) => ({
    id: topicId,
    en: uscisCopy.en.topicsById[topicId],
    es: uscisCopy.es.topicsById[topicId]
  }));

// Pre-computed state answers, so the website uses the exact same choices as the app.
const jurisdictionQuestions = questions.filter(
  (question) => question.answerSource.kind === "jurisdiction"
);

const jurisdictions = Object.entries(stateProfiles as Record<string, { name: string; capital?: string }>).map(
  ([stateCode, profile]) => {
    const office = (currentOfficeData as Record<string, {
      governor?: string;
      representatives: Record<string, string>;
      senators: string[];
      vacantRepresentativeDistricts?: number[];
    }>)[stateCode];
    const districts: number[] = getRepresentativeDistricts(stateCode);
    const stateChoices: Record<string, unknown> = {};
    const districtChoices: Record<string, unknown> = {};

    for (const question of jurisdictionQuestions) {
      const key = String(question.source.questionNumber);

      if (question.answerSource.jurisdictionLevel === "district" && districts.length > 1) {
        districtChoices[key] = Object.fromEntries(
          districts.map((district) => [
            String(district),
            exportChoices(
              question,
              getDynamicChoicesForQuestion(question, {
                stateCode,
                congressionalDistrict: String(district)
              }) ?? undefined
            )
          ])
        );
        continue;
      }

      stateChoices[key] = exportChoices(
        question,
        getDynamicChoicesForQuestion(question, {
          stateCode,
          congressionalDistrict: districts.length === 1 ? String(districts[0]) : undefined
        }) ?? undefined
      );
    }

    return {
      code: stateCode,
      name: profile.name,
      capital: profile.capital ?? null,
      isState: !isNonStateJurisdictionCode(stateCode),
      governor: office?.governor ?? null,
      senators: office?.senators ?? [],
      representatives: office?.representatives ?? {},
      vacantDistricts: office?.vacantRepresentativeDistricts ?? [],
      districts,
      choices: stateChoices,
      districtChoices
    };
  }
);

const meta = {
  sourceDocument: questions[0]?.source.document,
  version: questions[0]?.source.version,
  questionCount: questions.length,
  federalOfficesUpdated: currentFederalDataSource.lastUpdated,
  stateOfficesUpdated: currentOfficeDataSource.lastUpdated,
  updateUrl: currentFederalDataSource.updateUrl,
  federalOffices: Object.fromEntries(
    Object.entries(currentFederalOffices as Record<string, { label: string }>).map(
      ([key, value]) => [key, value.label]
    )
  )
};

if (exportedQuestions.length !== 128) {
  throw new Error(`Expected 128 questions, exported ${exportedQuestions.length}.`);
}

function write(fileName: string, data: unknown) {
  const filePath = join(outDir!, fileName);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data)}\n`);
  console.log(`Wrote ${filePath}`);
}

write("uscis-questions.json", { meta, topics, questions: exportedQuestions });

// The generator needs every state at once; the quiz loads one state file on demand.
write("uscis-jurisdictions.json", {
  meta,
  jurisdictions: jurisdictions.map(({ choices, districtChoices, ...rest }) => rest)
});

for (const jurisdiction of jurisdictions) {
  write(`uscis-states/${jurisdiction.code}.json`, {
    code: jurisdiction.code,
    districts: jurisdiction.districts,
    choices: jurisdiction.choices,
    districtChoices: jurisdiction.districtChoices
  });
}
