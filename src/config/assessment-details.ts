// GENERATED FILE — DO NOT EDIT BY HAND.
// Source: scripts/seed/data/*.json
// Regenerate: npx tsx scripts/catalogue/generate-details.ts
//
// Display-only metadata for the assessment detail page. Carries no question
// content, so importing it costs the bundle nothing but a few KB of prose.

export interface AssessmentDetailSection {
  key: string;
  name: string;
  description: string | null;
  questionCount: number;
  timeLimitSeconds: number | null;
}

export interface AssessmentDetailDimension {
  key: string;
  label: string;
  description: string | null;
  contributesToBrainProfile: boolean;
}

export interface AssessmentDetailBand {
  title: string;
  minScore: number;
  maxScore: number;
}

export interface AssessmentDetail {
  sections: AssessmentDetailSection[];
  dimensions: AssessmentDetailDimension[];
  bands: AssessmentDetailBand[];
  questionTypes: string[];
  sourceNote: string | null;
}

export const ASSESSMENT_DETAILS: Record<string, AssessmentDetail> = {
  "abstract-reasoning-pro": {
    "sections": [
      {
        "key": "matrix-reasoning",
        "name": "Matrix Reasoning",
        "description": "3x3 grids following a rule across shape, color, rotation, and count.",
        "questionCount": 20,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "abstract-reasoning",
        "label": "Abstract Reasoning",
        "description": "Non-verbal pattern reasoning across simultaneously-varying attributes.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "pattern_question"
    ],
    "sourceNote": "Every grid and answer option is a real, programmatically generated and rendered SVG (embedded as data URIs in question.media and option.imageUrl — no external asset pipeline needed) — not a text description standing in for an image, which is what blocked this assessment in earlier batches. Each item's rule (which attribute varies by row/column/diagonal) is applied in code to derive the correct cell, and every item was verified programmatically (exactly one option matches the derived correct attributes) before being included; several were also spot-checked visually by rendering to PNG. Raven's Progressive Matrices itself is a copyrighted, commercially published instrument (its current edition), so these are original grids implementing the same paradigm and rule families (constant-in-a-row/column, pairwise progression, distribution-of-three), not reproductions of the actual published matrices."
  },
  "attention-control-test": {
    "sections": [
      {
        "key": "flanker-trials",
        "name": "Flanker Trials",
        "description": "Identify the direction of the CENTER arrow only, ignoring the arrows around it.",
        "questionCount": 30,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "attention-control",
        "label": "Attention Control",
        "description": "Speed and accuracy identifying the target while ignoring flanking distractors.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "timed_choice"
    ],
    "sourceNote": "Original flanker trials implementing the Eriksen Flanker Task's published paradigm (a center target flanked by congruent or incongruent distractors, response speed and accuracy both scored) — rendered as plain-text arrow strings rather than Stroop's colored-word format (the catalogue originally described this as \"Stroop-style\"), since flanker trials are genuinely renderable as text/unicode with no image pipeline needed, while an authentic Stroop task needs real colored-text rendering this platform doesn't have yet. Scoring uses timed_choice's response-time weighting (src/lib/scoring/engine.ts) — each question's 3-second time limit is deliberately tight, matching the task's speed-under-interference design; a correct answer given instantly scores full credit, decaying to a 50% floor at the time limit, never to zero (it was still correct)."
  },
  "auditory-processing-speed": {
    "sections": [
      {
        "key": "digit-span-forward",
        "name": "Digit Span Forward",
        "description": "Listen to a spoken digit sequence, then recall it in the same order.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "digit-span-backward",
        "name": "Digit Span Backward",
        "description": "Listen to a spoken digit sequence, then recall it in reverse order.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "auditory-discrimination",
        "name": "Auditory Discrimination",
        "description": "Quickly judge whether two spoken words are the same or different.",
        "questionCount": 10,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "auditory-processing",
        "label": "Auditory Processing",
        "description": "Composite score across digit span (forward and backward) and auditory discrimination.",
        "contributesToBrainProfile": true
      },
      {
        "key": "digit-span-forward",
        "label": "Digit Span Forward",
        "description": "Auditory working memory — recalling a spoken sequence in order.",
        "contributesToBrainProfile": false
      },
      {
        "key": "digit-span-backward",
        "label": "Digit Span Backward",
        "description": "Auditory working memory under mental manipulation — recalling a spoken sequence in reverse.",
        "contributesToBrainProfile": false
      },
      {
        "key": "auditory-discrimination",
        "label": "Auditory Discrimination",
        "description": "Speed and accuracy distinguishing same vs. minimally different spoken words.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "sequence",
      "timed_choice"
    ],
    "sourceNote": "Original digit sequences and word pairs implementing two real, named auditory paradigms (WAIS/WMS Digit Span forward/backward; Wepman's Auditory Discrimination Test's minimal-pair format) — both are copyrighted, commercially administered clinical instruments (Pearson; the Wepman test's publisher), so their actual stimuli/norms aren't reproduced here. This is the first assessment on the platform to use real audio: every sequence and word pair plays through the browser's Web Speech API (QuestionMediaBlock.tsx, a `speech:<text>` media URL) as actual synthesized speech, not a text description standing in for sound — the exact capability that was missing when this assessment was first scoped as blocked. Digit Span items use the `sequence` question type (tap the digits back in order — forward or reverse); auditory discrimination items use time-weighted `timed_choice`, both scored via the engine's existing mechanisms (see README \"Engine fixes\")."
  },
  "career-aptitude-profile": {
    "sections": [
      {
        "key": "realistic",
        "name": "Realistic",
        "description": "Hands-on, mechanical, and physical work.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "investigative",
        "name": "Investigative",
        "description": "Analytical, scientific, and research-oriented work.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "artistic",
        "name": "Artistic",
        "description": "Creative, expressive, and design-driven work.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "social",
        "name": "Social",
        "description": "Helping, teaching, and supporting other people.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "enterprising",
        "name": "Enterprising",
        "description": "Leading, persuading, and business-oriented work.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "conventional",
        "name": "Conventional",
        "description": "Organized, detail-oriented, structured work.",
        "questionCount": 5,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "engagement",
        "label": "Interest Engagement",
        "description": "Overall engagement across all six RIASEC types — how strongly you responded across the board, not which type dominates.",
        "contributesToBrainProfile": false
      },
      {
        "key": "realistic",
        "label": "Realistic",
        "description": "Interest in hands-on, mechanical, physical work.",
        "contributesToBrainProfile": false
      },
      {
        "key": "investigative",
        "label": "Investigative",
        "description": "Interest in analytical, scientific, research-oriented work.",
        "contributesToBrainProfile": false
      },
      {
        "key": "artistic",
        "label": "Artistic",
        "description": "Interest in creative, expressive, design-driven work.",
        "contributesToBrainProfile": false
      },
      {
        "key": "social",
        "label": "Social",
        "description": "Interest in helping, teaching, supporting roles.",
        "contributesToBrainProfile": false
      },
      {
        "key": "enterprising",
        "label": "Enterprising",
        "description": "Interest in leading, persuading, business-oriented work.",
        "contributesToBrainProfile": false
      },
      {
        "key": "conventional",
        "label": "Conventional",
        "description": "Interest in organized, detail-oriented, structured work.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Undifferentiated Profile",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Mildly Differentiated",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Differentiated Profile",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Strongly Differentiated",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Highly Concentrated Profile",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "likert_scale"
    ],
    "sourceNote": "Original self-report items written to implement Holland's published RIASEC structure (Realistic, Investigative, Artistic, Social, Enterprising, Conventional) — the O*NET Interest Profiler itself (and its exact item wording) is a U.S. Department of Labor instrument with its own copyright/attribution terms, so its actual items are not reproduced here; this uses the same six-type theoretical model with original statements. Deliberately excluded from the Brain Profile aggregate: RIASEC measures vocational interest, not cognitive ability, so it isn't comparable to the other assessments' dimension scores the way Palmistry is excluded for a different reason (no real scoring at all)."
  },
  "cognitive-flexibility-index": {
    "sections": [
      {
        "key": "card-sorting",
        "name": "Card Sorting",
        "description": "Sort cards under the four key cards by an unstated, shifting rule.",
        "questionCount": 1,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "cognitive-flexibility",
        "label": "Cognitive Flexibility",
        "description": "Set-shifting ability — finding a hidden sorting rule and adapting when it changes, measured live via category completions and resistance to perseverative errors.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "custom_interactive"
    ],
    "sourceNote": "This is a genuinely live, adaptive implementation of WCST's mechanic, not a static approximation — the correct answer isn't fixed at authoring time, it's a hidden rule the runner tracks and shifts after 6 consecutive correct sorts, exactly like the real test. That required a real interactive component (src/components/questions/WCSTGameQuestion.tsx, a single `custom_interactive` question tagged \"wcst\") rather than seed content, since the standard question-and-answer runner has no way to give live feedback or branch on prior answers within an assessment. Parameterized after the published WCST-64 short form (64 cards, 4 categories) rather than the full 128-card/6-category version, to keep the session length realistic. The component computes its own normalized 0-1 performance score (category completion weighted 70%, resistance to perseverative errors weighted 30%) and reports it through the engine's generic custom_interactive scoring path (src/lib/scoring/engine.ts) — the same mechanism any future live interactive game would use, not a WCST-specific hack. The genuine published WCST is a commercially distributed clinical instrument (PAR Inc.) with its own card deck and norms; this uses an original 4-color/4-shape/4-count card set implementing the same paradigm."
  },
  "creative-assessment": {
    "sections": [
      {
        "key": "core-assessment",
        "name": "Core Creative Assessment",
        "description": "Closed-form items covering visual pattern recognition, ideation, problem solving, flexibility, and innovation, each scored deterministically.",
        "questionCount": 13,
        "timeLimitSeconds": null
      },
      {
        "key": "creative-expression",
        "name": "Creative Expression",
        "description": "Open-ended written prompts that surface divergent thinking and imaginative expression. These responses are AI-interpreted and do not contribute to the deterministic score.",
        "questionCount": 2,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "creative",
        "label": "Creative",
        "description": "Overall composite creativity score aggregating visual creativity, ideation, problem solving, flexibility, and innovation.",
        "contributesToBrainProfile": true
      },
      {
        "key": "visual-creativity",
        "label": "Visual Creativity",
        "description": "Pattern recognition and aesthetic sense, measured through visual pattern completion and image-selection items.",
        "contributesToBrainProfile": false
      },
      {
        "key": "ideation",
        "label": "Ideation",
        "description": "Idea generation and divergent thinking, measured through alternative-uses and brainstorming items.",
        "contributesToBrainProfile": false
      },
      {
        "key": "problem-solving",
        "label": "Problem Solving",
        "description": "Creative and analytical approaches to solving constrained or contradictory problems.",
        "contributesToBrainProfile": false
      },
      {
        "key": "flexibility",
        "label": "Flexibility",
        "description": "Adaptability and openness to changing approach, especially after negative feedback or a failed first attempt.",
        "contributesToBrainProfile": false
      },
      {
        "key": "innovation",
        "label": "Innovation",
        "description": "Novel thinking and risk-taking when facing seemingly impossible challenges.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "image_choice",
      "multiple_choice",
      "open_creative",
      "slider"
    ],
    "sourceNote": "Ported verbatim from airostudio/Creative-Assessment (questions.js) — 15 real questions (13 closed-form, 2 open-ended). Per platform policy, the two open_creative questions never feed the deterministic score; they're passed to the AI interpretation layer only."
  },
  "creative-divergent-thinking": {
    "sections": [
      {
        "key": "remote-associates",
        "name": "Remote Associates",
        "description": "Find the single word that connects three given words.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "alternative-uses",
        "name": "Alternative Uses",
        "description": "Generate as many different uses as you can for an everyday object.",
        "questionCount": 5,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "convergent-creativity",
        "label": "Remote Associates (Convergent Creativity)",
        "description": "Finding the single connecting concept across three unrelated words.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice",
      "open_creative"
    ],
    "sourceNote": "The 5 Remote Associates Test items are original word triads written to implement Mednick's compound-word-association format, hand-verified for validity (each connecting word forms a real compound/phrase with all three given words) rather than reused from Mednick's original item bank, which this platform can't verify reproducing correctly from memory. The 5 Alternative Uses Task prompts follow Guilford's original open-ended format directly — there's no fixed answer key to reproduce, so no adaptation was needed there. Following the same policy as Creative Assessment: the open_creative items never feed the deterministic score; they're passed to the AI interpretation layer only (src/lib/ai/interpretation.ts), same policy documented there."
  },
  "critical-thinking-depth": {
    "sections": [
      {
        "key": "inference",
        "name": "Inference",
        "description": "Judging the degree of truth or falsity of inferences drawn from a set of facts, without assuming anything beyond what's stated.",
        "questionCount": 4,
        "timeLimitSeconds": null
      },
      {
        "key": "assumptions",
        "name": "Recognition of Assumptions",
        "description": "Identifying the unstated assumption that a claim depends on.",
        "questionCount": 4,
        "timeLimitSeconds": null
      },
      {
        "key": "deduction",
        "name": "Deduction",
        "description": "Determining whether a conclusion follows necessarily from given premises, using formal validity rather than real-world plausibility.",
        "questionCount": 4,
        "timeLimitSeconds": null
      },
      {
        "key": "interpretation",
        "name": "Interpretation",
        "description": "Weighing evidence to decide whether a proposed conclusion follows beyond reasonable doubt.",
        "questionCount": 4,
        "timeLimitSeconds": null
      },
      {
        "key": "argument-evaluation",
        "name": "Evaluation of Arguments",
        "description": "Distinguishing strong arguments (directly related to the question, addressing the most important considerations) from weak ones.",
        "questionCount": 4,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "critical-thinking",
        "label": "Critical Thinking",
        "description": "Composite score across all five Watson-Glaser skills.",
        "contributesToBrainProfile": true
      },
      {
        "key": "inference",
        "label": "Inference",
        "description": "Judging the truth-value of conclusions from stated facts alone.",
        "contributesToBrainProfile": false
      },
      {
        "key": "assumptions",
        "label": "Recognition of Assumptions",
        "description": "Spotting the specific unstated assumption a claim relies on.",
        "contributesToBrainProfile": false
      },
      {
        "key": "deduction",
        "label": "Deduction",
        "description": "Judging formal validity independent of real-world plausibility.",
        "contributesToBrainProfile": false
      },
      {
        "key": "interpretation",
        "label": "Interpretation",
        "description": "Weighing whether a conclusion is supported beyond reasonable doubt.",
        "contributesToBrainProfile": false
      },
      {
        "key": "argument-evaluation",
        "label": "Evaluation of Arguments",
        "description": "Telling strong, relevant arguments from weak or irrelevant ones.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Original items written to implement the Watson-Glaser Critical Thinking Appraisal's published five-skill structure (Inference, Recognition of Assumptions, Deduction, Interpretation, Evaluation of Arguments) — the Watson-Glaser itself is a copyrighted, commercially licensed instrument (Pearson TalentLens), so its actual passages/items are not reproduced here. What's ported is the paradigm: the same five discrete skills, the same 'given only what's stated, not what's plausible' discipline, with original scenarios."
  },
  "decision-making-under-pressure": {
    "sections": [
      {
        "key": "quick-reflection",
        "name": "Quick Reflection",
        "description": "Problems with a fast, appealing, wrong answer and a correct one that takes a moment longer to reach.",
        "questionCount": 10,
        "timeLimitSeconds": null
      },
      {
        "key": "scenario-judgment",
        "name": "Scenario Judgment",
        "description": "Realistic snap decisions made with incomplete information.",
        "questionCount": 5,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "decision-making",
        "label": "Decision Making Under Pressure",
        "description": "Composite score across quick-reflection problems and scenario judgment.",
        "contributesToBrainProfile": true
      },
      {
        "key": "quick-reflection",
        "label": "Quick Reflection",
        "description": "Ability to override a fast, wrong intuitive answer in favor of a correct one.",
        "contributesToBrainProfile": false
      },
      {
        "key": "scenario-judgment",
        "label": "Scenario Judgment",
        "description": "Choosing the soundest immediate action under incomplete information.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Original items written in the Cognitive Reflection Test's paradigm (an appealing, fast, wrong intuitive answer vs. a correct answer requiring a moment of reflection) rather than reusing Frederick's original three items (the bat-and-ball, widget-machine, and lily-pad problems) — those are now so widely circulated in pop psychology and social media that many test-takers have already seen them, which is a documented limitation of the original CRT in research (published 'CRT-2'/extended batteries exist specifically to work around this by using fresh surface content with the same underlying structure, which is what this does). The five-item scenario-judgment section extends the same 'resist the fast wrong instinct' principle to realistic snap decisions rather than math/logic puzzles."
  },
  "emotional-intelligence": {
    "sections": [
      {
        "key": "perceiving_emotions",
        "name": "Perceiving Emotions",
        "description": "The ability to identify emotions in faces, pictures, voices, and cultural artifacts.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "using_emotions",
        "name": "Using Emotions",
        "description": "The ability to harness emotions to facilitate various cognitive activities.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "understanding_emotions",
        "name": "Understanding Emotions",
        "description": "The ability to comprehend emotional language and appreciate complicated relationships among emotions.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "managing_emotions",
        "name": "Managing Emotions",
        "description": "The ability to regulate emotions in ourselves and in others.",
        "questionCount": 5,
        "timeLimitSeconds": null
      },
      {
        "key": "self_perception",
        "name": "Self-Perception",
        "description": "Understanding your own emotions, confidence, and self-regard.",
        "questionCount": 4,
        "timeLimitSeconds": null
      },
      {
        "key": "self_expression",
        "name": "Self-Expression",
        "description": "How you express emotions and assert yourself appropriately.",
        "questionCount": 4,
        "timeLimitSeconds": null
      },
      {
        "key": "interpersonal",
        "name": "Interpersonal",
        "description": "Your ability to develop and maintain relationships and show empathy.",
        "questionCount": 4,
        "timeLimitSeconds": null
      },
      {
        "key": "decision_making",
        "name": "Decision Making",
        "description": "How you use emotional information in the decision-making process.",
        "questionCount": 4,
        "timeLimitSeconds": null
      },
      {
        "key": "stress_management",
        "name": "Stress Management",
        "description": "Your ability to cope with challenges and regulate emotions under pressure.",
        "questionCount": 4,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "perceiving_emotions",
        "label": "Perceiving Emotions",
        "description": "The ability to identify emotions in faces, pictures, voices, and cultural artifacts.",
        "contributesToBrainProfile": true
      },
      {
        "key": "using_emotions",
        "label": "Using Emotions",
        "description": "The ability to harness emotions to facilitate various cognitive activities.",
        "contributesToBrainProfile": true
      },
      {
        "key": "understanding_emotions",
        "label": "Understanding Emotions",
        "description": "The ability to comprehend emotional language and appreciate complicated relationships among emotions.",
        "contributesToBrainProfile": true
      },
      {
        "key": "managing_emotions",
        "label": "Managing Emotions",
        "description": "The ability to regulate emotions in ourselves and in others.",
        "contributesToBrainProfile": true
      },
      {
        "key": "self_perception",
        "label": "Self-Perception",
        "description": "Understanding your own emotions, confidence, and self-regard.",
        "contributesToBrainProfile": true
      },
      {
        "key": "self_expression",
        "label": "Self-Expression",
        "description": "How you express emotions and assert yourself appropriately.",
        "contributesToBrainProfile": true
      },
      {
        "key": "interpersonal",
        "label": "Interpersonal",
        "description": "Your ability to develop and maintain relationships and show empathy.",
        "contributesToBrainProfile": true
      },
      {
        "key": "decision_making",
        "label": "Decision Making",
        "description": "How you use emotional information in the decision-making process.",
        "contributesToBrainProfile": true
      },
      {
        "key": "stress_management",
        "label": "Stress Management",
        "description": "Your ability to cope with challenges and regulate emotions under pressure.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing Emotional Intelligence",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average Emotional Intelligence",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong Emotional Intelligence",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong Emotional Intelligence",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional Emotional Intelligence",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "likert_scale",
      "multiple_choice",
      "slider"
    ],
    "sourceNote": "Ported verbatim from airostudio/Emotional-Intelligence (public/js/test-questions.js) — 40 real questions across the 9 real EQ facets. A few items reference face images or an original slider mechanic not directly portable as multiple_choice/likert_scale text; those are noted per-question via 'instructions'/'scoringNotes' rather than silently dropped."
  },
  "executive-function-profiling": {
    "sections": [
      {
        "key": "inhibit",
        "name": "Inhibit",
        "description": "Impulse control — resisting an urge or stopping a response.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "shift",
        "name": "Shift",
        "description": "Cognitive flexibility — moving between tasks or adapting to change.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "emotional-control",
        "name": "Emotional Control",
        "description": "Modulating emotional responses appropriately.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "initiate",
        "name": "Initiate",
        "description": "Starting tasks or activities independently.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "working-memory",
        "name": "Working Memory",
        "description": "Holding and manipulating information during a task.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "plan-organize",
        "name": "Plan/Organize",
        "description": "Anticipating future events and setting goals or steps.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "task-monitor",
        "name": "Task Monitor",
        "description": "Checking your own work for errors or progress.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "self-monitor",
        "name": "Self-Monitor",
        "description": "Awareness of your own impact on others.",
        "questionCount": 3,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "executive-function",
        "label": "Executive Function",
        "description": "Composite score across all eight control processes.",
        "contributesToBrainProfile": true
      },
      {
        "key": "inhibit",
        "label": "Inhibit",
        "description": "Impulse control and response inhibition.",
        "contributesToBrainProfile": false
      },
      {
        "key": "shift",
        "label": "Shift",
        "description": "Cognitive flexibility and adapting to change.",
        "contributesToBrainProfile": false
      },
      {
        "key": "emotional-control",
        "label": "Emotional Control",
        "description": "Modulating emotional responses appropriately.",
        "contributesToBrainProfile": false
      },
      {
        "key": "initiate",
        "label": "Initiate",
        "description": "Starting tasks independently.",
        "contributesToBrainProfile": false
      },
      {
        "key": "working-memory",
        "label": "Working Memory",
        "description": "Holding and manipulating information during a task.",
        "contributesToBrainProfile": false
      },
      {
        "key": "plan-organize",
        "label": "Plan/Organize",
        "description": "Anticipating and structuring steps toward a goal.",
        "contributesToBrainProfile": false
      },
      {
        "key": "task-monitor",
        "label": "Task Monitor",
        "description": "Checking your own work as you go.",
        "contributesToBrainProfile": false
      },
      {
        "key": "self-monitor",
        "label": "Self-Monitor",
        "description": "Awareness of your impact on others.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "likert_scale"
    ],
    "sourceNote": "Original self-report items written to implement the BRIEF's published eight-scale structure (Inhibit, Shift, Emotional Control, Initiate, Working Memory, Plan/Organize, Task Monitor, Self-Monitor; the ninth scale, Organization of Materials, was left out as more about physical workspace tidiness than a distinct control process worth a digital self-report item) — the BRIEF itself (PAR Inc.) is a copyrighted, clinically normed, commercially administered instrument, so its actual items and norms are not reproduced here. Self-report inherently measures perceived executive function, not directly observed behavior the way a performance-based task (e.g. an N-back or Stroop) would — that's a real limitation of the self-report format itself, not specific to this adaptation."
  },
  "fluid-intelligence-peak": {
    "sections": [
      {
        "key": "novel-matrices",
        "name": "Novel Matrices",
        "description": "3x3 grids, weighted toward distribution-of-three (Latin square) rules where every row and column contains the same three values.",
        "questionCount": 25,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "fluid-intelligence",
        "label": "Fluid Intelligence",
        "description": "Novel non-verbal reasoning, weighted toward distribution-of-three and multi-attribute rule types.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "pattern_question"
    ],
    "sourceNote": "Same real-SVG generation and programmatic verification approach as Abstract Reasoning Pro (see that file's sourceNote) — every grid is genuinely rendered, every correct answer is derived from the rule in code and checked to be the sole matching option before inclusion. The distribution-of-three (Latin square) rule family is weighted more heavily here than in Abstract Reasoning Pro specifically because it's a structurally different, less immediately obvious rule than 'this attribute is constant along a row/column' — closer to genuinely novel-pattern reasoning than a straightforward progression."
  },
  "full-iq-estimation-report": {
    "sections": [
      {
        "key": "acknowledgment",
        "name": "Before You Continue",
        "description": "A one-step confirmation before generating your composite.",
        "questionCount": 1,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "iq-composite",
        "label": "Full-Scale Composite Estimate",
        "description": "Average of your Logical, Verbal, Spatial, and Memory Brain Profile scores — not scored from a new test.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Not Enough Data Yet",
        "minScore": 0,
        "maxScore": 5
      },
      {
        "title": "Estimated range: below 90",
        "minScore": 6,
        "maxScore": 30
      },
      {
        "title": "Estimated range: 90-100",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Estimated range: 100-115",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Estimated range: 115-130",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Estimated range: 130+",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Structurally different from every other assessment on the platform: it's not scored from its own responses at all. Its engine (src/lib/assessment-engine/engines/composite-report.tsx) reads the user's existing brain_profile_dimensions rows for the four cognitive-ability axes (logical, verbal, spatial, memory) and averages them, ignoring the single acknowledgment question's answer entirely. If fewer than 3 of those 4 domains have real completed-assessment data, it returns the sentinel score 0, which lands in a dedicated \"not enough data\" result range rather than presenting a fabricated result from sparse or absent data — no shortcut around that gate. IMPORTANT: this is an estimate for self-reflection, explicitly not a validated psychometric IQ score — this platform has no standardization sample or clinical norming behind it, unlike a real administered IQ test (WAIS, Stanford-Binet, etc.). The result-range titles say \"estimated range,\" and the 45-minute duration in the catalogue reflects the time to complete the underlying assessments it draws from, not this report screen itself."
  },
  "intelligence-profile": {
    "sections": [
      {
        "key": "logical",
        "name": "Logical Reasoning",
        "description": "Pattern detection and deductive inference.",
        "questionCount": 0,
        "timeLimitSeconds": null
      },
      {
        "key": "numerical",
        "name": "Numerical Intelligence",
        "description": "Arithmetic, percentages, and sequences.",
        "questionCount": 0,
        "timeLimitSeconds": null
      },
      {
        "key": "memory",
        "name": "Memory",
        "description": "Word recall.",
        "questionCount": 0,
        "timeLimitSeconds": null
      },
      {
        "key": "verbal",
        "name": "Verbal Reasoning",
        "description": "Vocabulary and word precision.",
        "questionCount": 0,
        "timeLimitSeconds": null
      },
      {
        "key": "spatial",
        "name": "Spatial Intelligence",
        "description": "Visual matrix pattern completion.",
        "questionCount": 0,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "logical",
        "label": "Logical",
        "description": "Pattern detection and deductive inference.",
        "contributesToBrainProfile": true
      },
      {
        "key": "numerical",
        "label": "Numerical",
        "description": "Arithmetic, percentages, ratios, and sequences.",
        "contributesToBrainProfile": true
      },
      {
        "key": "memory",
        "label": "Memory",
        "description": "Word and sequence recall.",
        "contributesToBrainProfile": true
      },
      {
        "key": "verbal",
        "label": "Verbal",
        "description": "Vocabulary and word precision.",
        "contributesToBrainProfile": true
      },
      {
        "key": "spatial",
        "label": "Spatial",
        "description": "Visual matrix pattern completion.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [],
    "sourceNote": "Deliberately does NOT port the old airostudio/brainyak repo's 15 'pattern recognition' questions: that repo's data/questions.ts hardcodes correctAnswer:0 for every single question regardless of the actual image content (see src/store/testStore.ts's isCorrect check against that fixed value) — the app's IQ score was cosmetic, not a real assessment. Shipping that would mean the platform's own flagship silently scored on fabricated correctness. Instead, this assessment reuses real, legitimately-scored questions from the sibling single-domain assessments via the shared question library (see reuseQuestionKeys) — the architecture's intended way to compose a multi-domain assessment, per the Question Library principle in the platform spec."
  },
  "language-acquisition": {
    "sections": [
      {
        "key": "grammar-classification",
        "name": "Word Classification",
        "description": "Classifying novel words as following or breaking the pattern shown in the study examples.",
        "questionCount": 20,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "implicit-learning",
        "label": "Implicit Pattern Learning",
        "description": "Ability to extract and generalize structure from exposure alone, without explicit rule instruction.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Uses an original finite-state grammar built for this assessment (letters B, F, G, K, S; a valid word is B, then zero or more FG/GF pairs, then K, then S) rather than Reber's exact 1967 grammar, which this platform can't verify reproducing correctly from memory without risking an inconsistent (and therefore incorrectly-scored) rule set — every example and test item below was hand-verified against this platform's own grammar definition. What's ported from Reber is the paradigm itself: implicit exposure to grammatical strings, then classification of novel strings as consistent or inconsistent with the pattern, without ever stating the rule outright."
  },
  "logical-reasoning": {
    "sections": [
      {
        "key": "abstract-reasoning",
        "name": "Abstract Pattern Reasoning",
        "description": "Visual and numeric pattern-recognition questions where you identify the next item in a sequence based on shape, color, rotation, quantity, or spectrum progression.",
        "questionCount": 6,
        "timeLimitSeconds": null
      },
      {
        "key": "deductive-reasoning",
        "name": "Deductive Reasoning",
        "description": "Verbal logic questions testing your ability to draw valid conclusions from given premises, including syllogisms and identification of logical fallacies.",
        "questionCount": 9,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "logical",
        "label": "Logical Reasoning",
        "description": "Overall composite measure of logical reasoning ability, combining abstract pattern recognition and deductive inference performance.",
        "contributesToBrainProfile": true
      },
      {
        "key": "pattern-detection",
        "label": "Pattern Detection",
        "description": "Ability to recognize and extrapolate visual and numeric patterns.",
        "contributesToBrainProfile": false
      },
      {
        "key": "deduction",
        "label": "Deductive Inference",
        "description": "Ability to draw valid conclusions from premises, including recognizing invalid inferences.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice",
      "pattern_question"
    ],
    "sourceNote": "Ported from airostudio/logical-reasoning (lib/testQuestions.ts). 15 real questions total (6 abstract-pattern, 9 deductive) — short of the catalogue's nominal ~20, not padded with invented ones. The 6 abstract-pattern questions carry the source repo's real SVG artwork (public/images/patterns/pattern-{1..6}.svg), embedded inline as base64 data URIs so no external asset hosting is needed."
  },
  "memory-palace-challenge": {
    "sections": [
      {
        "key": "round-1",
        "name": "Route 1: Home",
        "description": "A 5-stop route through a house.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "round-2",
        "name": "Route 2: Cottage Garden",
        "description": "A 6-stop route through a garden and cottage.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "round-3",
        "name": "Route 3: Office Building",
        "description": "A 7-stop route through an office building.",
        "questionCount": 3,
        "timeLimitSeconds": null
      },
      {
        "key": "round-4",
        "name": "Route 4: Mountain Trail",
        "description": "An 8-stop route along a hiking trail.",
        "questionCount": 3,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "loci-memory",
        "label": "Memory Palace Recall",
        "description": "Composite score across ordered recall and position-probe accuracy.",
        "contributesToBrainProfile": true
      },
      {
        "key": "sequence-recall",
        "label": "Ordered Recall",
        "description": "Recalling the full route's items in exact serial order.",
        "contributesToBrainProfile": false
      },
      {
        "key": "position-accuracy",
        "label": "Position Accuracy",
        "description": "Correctly identifying what was at a specific stop.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice",
      "sequence"
    ],
    "sourceNote": "The Method of Loci is a technique, not a single copyrighted test, so there's no proprietary instrument being adapted here — these four routes and their items are original content built to implement the technique faithfully. Ordered recall is scored via the `sequence` question type, which stores each item's correct 1-indexed route position in its `value` field and credits it only when placed in that exact position (src/lib/scoring/engine.ts) — previously this question type wasn't scored at all; that gap is fixed as of this assessment. Each round also includes two position-probe questions (\"what was at stop 3?\"), a genuine supplementary measure used alongside full serial recall in memory research, not padding."
  },
  "memory-recall": {
    "sections": [
      {
        "key": "islt",
        "name": "ISLT Shopping List",
        "description": "International Shopping List Test — participants study a 12-item shopping list, then attempt to recognize the items from a mixed grid of targets and distractors.",
        "questionCount": 1,
        "timeLimitSeconds": 30
      },
      {
        "key": "adas",
        "name": "ADAS-Cog Word Recall",
        "description": "Alzheimer's Disease Assessment Scale-Cognitive word list test — 10 words are shown sequentially, then freely recalled by typing.",
        "questionCount": 1,
        "timeLimitSeconds": 30
      },
      {
        "key": "lm",
        "name": "Logical Memory Test",
        "description": "Wechsler-style Logical Memory subtest — a short news-style story is read, then comprehension/recall questions are answered about its details.",
        "questionCount": 5,
        "timeLimitSeconds": 45
      },
      {
        "key": "skt",
        "name": "SKT Speed Test",
        "description": "Syndrom-Kurztest-inspired speed naming and object recognition task — 8 objects are named as quickly as possible, then recognized from a mixed grid.",
        "questionCount": 9,
        "timeLimitSeconds": null
      },
      {
        "key": "sage",
        "name": "SAGE Assessment",
        "description": "Self-Administered Gerocognitive Exam-inspired mixed cognitive screen covering orientation, calculation, pattern recognition, language, visual, reasoning, and memory items.",
        "questionCount": 8,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "memory",
        "label": "Memory",
        "description": "Composite memory score aggregating immediate recall, delayed/story recall, sequence memory, and general cognitive screening performance across all sub-tests.",
        "contributesToBrainProfile": true
      },
      {
        "key": "immediate-recall",
        "label": "Immediate Recall",
        "description": "Ability to encode and immediately recognize/recall newly presented items (ISLT shopping list recognition, ADAS-Cog free word recall).",
        "contributesToBrainProfile": false
      },
      {
        "key": "delayed-recall",
        "label": "Delayed / Story Recall",
        "description": "Ability to retain and answer detail-oriented questions about a short narrative after a 45-second delay.",
        "contributesToBrainProfile": false
      },
      {
        "key": "sequence-memory",
        "label": "Sequence & Object Memory",
        "description": "Speed of object naming and subsequent recognition of a sequentially presented object set.",
        "contributesToBrainProfile": false
      },
      {
        "key": "sage-composite",
        "label": "General Cognitive Screen",
        "description": "Broad cognitive screening performance across orientation, calculation, pattern, language, visual, reasoning, and memory items.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "memory_recall",
      "memory_recognition",
      "multiple_choice",
      "timed_choice"
    ],
    "sourceNote": "Ported verbatim from airostudio/Memory-Recall-Test (public/js/app.js) — a plain HTML/JS app. All study lists, the story text, and object/emoji items are real. sage-orientation's correct day-of-week depends on runtime state in the source app and is left without a fixed answer here. memory_recall/memory_recognition scoring: islt-shopping-list and skt-object-recall are now memory_recognition (study phase then a recognition grid, answered as multiple_select, scored via the existing option-based path); adas-word-recall stays memory_recall (free recall), scored by a dedicated engine branch comparing typed entries against its options' ground-truth values. All 24 questions in this assessment now score correctly."
  },
  "metrics": {
    "sections": [
      {
        "key": "arithmetic",
        "name": "Mental Arithmetic",
        "description": "Quick calculation without a calculator.",
        "questionCount": 4,
        "timeLimitSeconds": 20
      },
      {
        "key": "percentages",
        "name": "Percentages",
        "description": "Calculating and reasoning about percentage changes and proportions.",
        "questionCount": 4,
        "timeLimitSeconds": 30
      },
      {
        "key": "ratios",
        "name": "Ratios & Proportions",
        "description": "Scaling quantities and comparing rates.",
        "questionCount": 4,
        "timeLimitSeconds": 30
      },
      {
        "key": "sequences",
        "name": "Number Sequences",
        "description": "Identifying the rule governing a sequence of numbers.",
        "questionCount": 4,
        "timeLimitSeconds": 30
      },
      {
        "key": "data-interpretation",
        "name": "Data Interpretation",
        "description": "Reading and reasoning about numbers presented in tables.",
        "questionCount": 4,
        "timeLimitSeconds": 45
      }
    ],
    "dimensions": [
      {
        "key": "numerical",
        "label": "Numerical Intelligence",
        "description": "Composite measure of numerical reasoning across mental arithmetic, percentages, ratios, sequences, and data interpretation.",
        "contributesToBrainProfile": true
      },
      {
        "key": "arithmetic",
        "label": "Mental Arithmetic",
        "description": "Speed and accuracy of unaided calculation.",
        "contributesToBrainProfile": false
      },
      {
        "key": "percentages",
        "label": "Percentages",
        "description": "Ability to calculate and reason about percentage change.",
        "contributesToBrainProfile": false
      },
      {
        "key": "ratios",
        "label": "Ratios & Proportions",
        "description": "Ability to scale quantities and compare rates.",
        "contributesToBrainProfile": false
      },
      {
        "key": "sequences",
        "label": "Number Sequences",
        "description": "Ability to detect the rule governing a numeric sequence.",
        "contributesToBrainProfile": false
      },
      {
        "key": "data-interpretation",
        "label": "Data Interpretation",
        "description": "Ability to extract and reason about figures from tabular data.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "No existing repo covered numerical/metrics content, so this question bank is authored fresh rather than ported."
  },
  "numerical-agility": {
    "sections": [
      {
        "key": "arithmetic",
        "name": "Arithmetic & Percentages",
        "description": "Direct computation under time pressure — no calculator, mental math only.",
        "questionCount": 6,
        "timeLimitSeconds": null
      },
      {
        "key": "ratios",
        "name": "Ratios & Proportions",
        "description": "Scaling quantities and rates correctly under time pressure.",
        "questionCount": 6,
        "timeLimitSeconds": null
      },
      {
        "key": "number-series",
        "name": "Number Series",
        "description": "Identifying the rule governing a sequence of numbers and extrapolating it.",
        "questionCount": 6,
        "timeLimitSeconds": null
      },
      {
        "key": "word-problems",
        "name": "Word Problems",
        "description": "Translating a real-world scenario into the right calculation.",
        "questionCount": 6,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "numerical-agility",
        "label": "Numerical Agility",
        "description": "Composite score across arithmetic, ratios, number series, and word problems, all under a single overall time limit.",
        "contributesToBrainProfile": true
      },
      {
        "key": "arithmetic",
        "label": "Arithmetic & Percentages",
        "description": "Speed and accuracy on direct computation.",
        "contributesToBrainProfile": false
      },
      {
        "key": "ratios",
        "label": "Ratios & Proportions",
        "description": "Correctly scaling quantities and rates.",
        "contributesToBrainProfile": false
      },
      {
        "key": "number-series",
        "label": "Number Series",
        "description": "Identifying numeric patterns and extrapolating them.",
        "contributesToBrainProfile": false
      },
      {
        "key": "word-problems",
        "label": "Word Problems",
        "description": "Translating scenarios into correct calculations.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Original items written to implement the Wonderlic's published numerical item types (arithmetic, percentages/ratios, number series, word problems) under the same speed-over-power design — the Wonderlic itself is a copyrighted, commercially licensed instrument (Wonderlic Inc.), so its actual items and norms are not reproduced here. Only the numerical subset is used (the full Wonderlic also has verbal/vocabulary items, out of scope for a numerical-specific assessment) and this version is untimed-per-item with a single overall 10-minute clock, matching how the real test is administered (one clock for the whole set, not per-question)."
  },
  "palmistry": {
    "sections": [
      {
        "key": "context",
        "name": "About You",
        "description": "A few questions to personalise your reading.",
        "questionCount": 4,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [],
    "bands": [],
    "questionTypes": [
      "multiple_choice",
      "text_input"
    ],
    "sourceNote": "No existing repo covers palmistry (it needs vision-model integration this platform doesn't have live keys for yet). Built fresh per spec: capture flow + a handful of context questions that feed the AI reading. No scoring dimensions, result ranges, or brain-profile contribution — Palmistry is deliberately excluded from the cognitive score."
  },
  "phonological-awareness": {
    "sections": [
      {
        "key": "elision",
        "name": "Elision",
        "description": "Removing a sound from a spoken word to form a different, real word.",
        "questionCount": 8,
        "timeLimitSeconds": null
      },
      {
        "key": "blending",
        "name": "Blending Words",
        "description": "Synthesizing individual sounds into a whole word.",
        "questionCount": 8,
        "timeLimitSeconds": null
      },
      {
        "key": "sound-matching",
        "name": "Sound Matching",
        "description": "Identifying which word shares an initial or final sound with a target word.",
        "questionCount": 8,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "phonological-awareness",
        "label": "Phonological Awareness",
        "description": "Composite score across elision, blending, and sound matching.",
        "contributesToBrainProfile": true
      },
      {
        "key": "elision",
        "label": "Elision",
        "description": "Ability to remove a phonological segment from a word.",
        "contributesToBrainProfile": false
      },
      {
        "key": "blending",
        "label": "Blending",
        "description": "Ability to synthesize separate sounds into a word.",
        "contributesToBrainProfile": false
      },
      {
        "key": "sound-matching",
        "label": "Sound Matching",
        "description": "Ability to identify shared initial/final sounds across words.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Original items written to implement the CTOPP-2's published subtest structure (Elision, Blending Words, Sound Matching) — the CTOPP-2 itself is a copyrighted, commercially normed instrument (PRO-ED), so its actual stimulus words and norms are not reproduced here. Known adaptation: the real CTOPP-2 is administered by a clinician reading sounds aloud and recording a spoken response; without audio infrastructure, every item here is presented and answered as text (e.g. 'say cat without the /k/ sound' as a written prompt with multiple-choice answers) rather than a true auditory task. That measures phonemic manipulation ability but not auditory perception specifically — worth building a real audio version if TTS/audio-recording is ever added."
  },
  "social-cognition-assessment": {
    "sections": [
      {
        "key": "non-literal-language",
        "name": "Non-Literal Language",
        "description": "Understanding lies, white lies, jokes, irony, and figures of speech — statements that aren't literally true but make sense once you understand why they were said.",
        "questionCount": 10,
        "timeLimitSeconds": null
      },
      {
        "key": "social-reasoning",
        "name": "Social Reasoning",
        "description": "Understanding misunderstandings, persuasion, and pretense — situations that require tracking what someone else believes or intends, separate from what's actually true.",
        "questionCount": 10,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "social-cognition",
        "label": "Social Cognition",
        "description": "Composite score across non-literal language and social reasoning.",
        "contributesToBrainProfile": true
      },
      {
        "key": "non-literal-language",
        "label": "Non-Literal Language",
        "description": "Correctly interpreting lies, jokes, irony, and figurative speech.",
        "contributesToBrainProfile": false
      },
      {
        "key": "social-reasoning",
        "label": "Social Reasoning",
        "description": "Tracking beliefs, intentions, and misunderstandings distinct from objective reality.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Original vignettes written to implement Happé's Strange Stories Task paradigm (non-literal-language types documented in Happé 1994 and White, Hill, Happé & Frith 2009: lie, white lie, joke, pretense, misunderstanding, persuasion, appearance/reality, figure of speech, irony) — the original published stories are not reproduced. Known adaptation: the real task scores open verbal explanations on a 0/1/2 mental-state scale via trained coders; this version uses forced-choice answers (the correct mentalistic explanation vs. a literal/physical-state distractor and an unrelated distractor) so it can be scored deterministically without human coding — this measures the same core skill (attributing the right mental state) but is an easier recognition task than free explanation."
  },
  "spatial-intelligence": {
    "sections": [
      {
        "key": "matrix-reasoning",
        "name": "Matrix Pattern Reasoning",
        "description": "A set of 3x3 visual matrices where shapes progress by rule across rows and columns; one cell is missing and must be completed by selecting the correct shape from six options.",
        "questionCount": 10,
        "timeLimitSeconds": 600
      }
    ],
    "dimensions": [
      {
        "key": "spatial",
        "label": "Spatial Intelligence",
        "description": "Composite measure of non-verbal visual pattern reasoning across shape, fill, size, color, quantity, and compound transformation rules in matrix-completion puzzles.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "pattern_question"
    ],
    "sourceNote": "Ported from airostudio/spacial-intelligence (lib/questions.ts, lib/scoring.ts, components/MatrixCell.tsx) — 10 real questions, short of the catalogue's nominal ~18, not padded with invented ones. Matrices are procedurally rendered (not static images); each question's svgSourceNote documents what's needed to regenerate the visual from the real source props. The single-item sub-categories the source used (Shape Sequence, Pattern Fill, Size Progression, Color Rotation, Inner Pattern, Quantity, Diagonal Logic, Shape Toggle, Compound Rules, Matrix Symmetry) are noted in questionText rather than modeled as separate scoring sub-dimensions, since each appears in only one question."
  },
  "speed-processing-index": {
    "sections": [
      {
        "key": "same-different",
        "name": "Same or Different",
        "description": "Judge whether two strings are identical.",
        "questionCount": 10,
        "timeLimitSeconds": null
      },
      {
        "key": "arithmetic-check",
        "name": "Arithmetic Check",
        "description": "Judge whether a simple arithmetic statement is true or false.",
        "questionCount": 10,
        "timeLimitSeconds": null
      },
      {
        "key": "number-comparison",
        "name": "Number Comparison",
        "description": "Judge the relationship between two numbers.",
        "questionCount": 10,
        "timeLimitSeconds": null
      },
      {
        "key": "category-check",
        "name": "Category Check",
        "description": "Judge whether a word belongs to a stated category.",
        "questionCount": 10,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "processing-speed",
        "label": "Processing Speed",
        "description": "Speed and accuracy on simple, low-difficulty judgments.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "timed_choice"
    ],
    "sourceNote": "Original items across four simple judgment types (same/different string matching, arithmetic verification, number comparison, category membership) implementing the simple/choice reaction-time paradigm from Jensen's processing-speed research — a well-established research tradition, not a single commercial test, so there's no proprietary item bank being adapted. Scoring uses timed_choice's response-time weighting (src/lib/scoring/engine.ts): a 2-second time limit per item, tight on purpose since the whole point is that these tasks should be nearly instant — a correct answer given immediately scores full credit, decaying to a 50% floor at the time limit."
  },
  "verbal-intelligence": {
    "sections": [
      {
        "key": "vocabulary",
        "name": "Vocabulary",
        "description": "Assesses knowledge of word meanings and verbal comprehension of individual terms.",
        "questionCount": 8,
        "timeLimitSeconds": null
      },
      {
        "key": "comprehension",
        "name": "Comprehension",
        "description": "Assesses practical judgment, reasoning about social conventions, and understanding of common sayings.",
        "questionCount": 8,
        "timeLimitSeconds": null
      },
      {
        "key": "similarities",
        "name": "Similarities",
        "description": "Assesses abstract verbal reasoning by identifying conceptual relationships between two items.",
        "questionCount": 8,
        "timeLimitSeconds": null
      },
      {
        "key": "general-information",
        "name": "General Information",
        "description": "Assesses fund of general knowledge across geography, history, science, and the arts.",
        "questionCount": 8,
        "timeLimitSeconds": null
      },
      {
        "key": "arithmetic-reasoning",
        "name": "Arithmetic Reasoning",
        "description": "Assesses numerical reasoning and the ability to solve word problems involving calculation and logic.",
        "questionCount": 8,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "verbal-intelligence",
        "label": "Verbal Intelligence",
        "description": "Composite score reflecting overall verbal intellectual functioning across vocabulary, comprehension, similarities, general information, and arithmetic reasoning.",
        "contributesToBrainProfile": true
      },
      {
        "key": "vocabulary",
        "label": "Vocabulary",
        "description": "Knowledge of word meanings.",
        "contributesToBrainProfile": false
      },
      {
        "key": "comprehension",
        "label": "Comprehension",
        "description": "Practical and social judgment reasoning.",
        "contributesToBrainProfile": false
      },
      {
        "key": "similarities",
        "label": "Similarities",
        "description": "Abstract verbal conceptual reasoning.",
        "contributesToBrainProfile": false
      },
      {
        "key": "general-information",
        "label": "General Information",
        "description": "Breadth of general knowledge.",
        "contributesToBrainProfile": false
      },
      {
        "key": "arithmetic-reasoning",
        "label": "Arithmetic Reasoning",
        "description": "Numerical word-problem reasoning.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Ported verbatim from airostudio/verbalize — 40 real questions across the 5 real WAIS-inspired subtests found in the source."
  },
  "verbal-reasoning-mastery": {
    "sections": [
      {
        "key": "text-completion",
        "name": "Text Completion",
        "description": "Choosing the word that best completes a sentence in context.",
        "questionCount": 10,
        "timeLimitSeconds": null
      },
      {
        "key": "sentence-equivalence",
        "name": "Sentence Equivalence",
        "description": "Choosing two words that both complete the sentence equivalently.",
        "questionCount": 10,
        "timeLimitSeconds": null
      },
      {
        "key": "reading-comprehension",
        "name": "Reading Comprehension",
        "description": "Answering inference and detail questions about short passages.",
        "questionCount": 10,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "verbal",
        "label": "Verbal Reasoning",
        "description": "Composite score across text completion, sentence equivalence, and reading comprehension.",
        "contributesToBrainProfile": true
      },
      {
        "key": "text-completion",
        "label": "Text Completion",
        "description": "Using context and vocabulary to complete a sentence's meaning.",
        "contributesToBrainProfile": false
      },
      {
        "key": "sentence-equivalence",
        "label": "Sentence Equivalence",
        "description": "Recognizing which of several words are semantically equivalent in context.",
        "contributesToBrainProfile": false
      },
      {
        "key": "reading-comprehension",
        "label": "Reading Comprehension",
        "description": "Drawing correct inferences from a short passage.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice",
      "multiple_select"
    ],
    "sourceNote": "Original items written to implement the GRE Verbal Reasoning measure's published three-part structure (Text Completion, Sentence Equivalence, Reading Comprehension) — the GRE itself is a copyrighted, commercially administered test (ETS), so its actual passages/items/norms are not reproduced here. Known adaptation: Sentence Equivalence scoring here awards partial credit per correct option selected (summing each selected option's points), rather than the real GRE's all-or-nothing rule (both correct or zero credit) — the underlying skill measured is the same, the credit model is simpler for a self-scored deterministic engine."
  },
  "verbal-reasoning": {
    "sections": [
      {
        "key": "deductive",
        "name": "Deductive Reasoning",
        "description": "Apply top-down logic to premises and identify the conclusion that must be true.",
        "questionCount": 6,
        "timeLimitSeconds": null
      },
      {
        "key": "critical",
        "name": "Critical Reasoning",
        "description": "Evaluate arguments for assumptions, flaws, and the evidence that strengthens or weakens them.",
        "questionCount": 6,
        "timeLimitSeconds": null
      },
      {
        "key": "reading",
        "name": "Reading Comprehension",
        "description": "Extract meaning, tone, and supported inference from dense, unfamiliar material at speed.",
        "questionCount": 6,
        "timeLimitSeconds": null
      },
      {
        "key": "precision",
        "name": "Verbal Precision",
        "description": "Select the exact word or relationship that a context demands — efficiency under time pressure.",
        "questionCount": 6,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "verbal",
        "label": "Verbal Reasoning",
        "description": "Composite measure of speed and accuracy in deductive logic, argument evaluation, reading comprehension, and word precision.",
        "contributesToBrainProfile": true
      },
      {
        "key": "deductive",
        "label": "Deductive Reasoning",
        "description": "Ability to derive conclusions that must be true from stated premises.",
        "contributesToBrainProfile": false
      },
      {
        "key": "critical",
        "label": "Critical Reasoning",
        "description": "Ability to identify assumptions, flaws, strengtheners, and weakeners in arguments.",
        "contributesToBrainProfile": false
      },
      {
        "key": "reading",
        "label": "Reading Comprehension",
        "description": "Ability to extract purpose, tone, and supported inference from passages.",
        "contributesToBrainProfile": false
      },
      {
        "key": "precision",
        "label": "Verbal Precision",
        "description": "Ability to select the exact word or relationship a context demands.",
        "contributesToBrainProfile": false
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "multiple_choice"
    ],
    "sourceNote": "Ported verbatim from airostudio/VerbRea (src/lib/questions.ts) — 24 real questions across the 4 real categories."
  },
  "visuospatial-rotation": {
    "sections": [
      {
        "key": "rotation-trials",
        "name": "Rotation Trials",
        "description": "Identify the option that is a true rotation of the target shape, not a mirrored version.",
        "questionCount": 18,
        "timeLimitSeconds": null
      }
    ],
    "dimensions": [
      {
        "key": "mental-rotation",
        "label": "Mental Rotation",
        "description": "Ability to mentally rotate a shape and distinguish a true rotation from a mirrored look-alike.",
        "contributesToBrainProfile": true
      }
    ],
    "bands": [
      {
        "title": "Developing",
        "minScore": 0,
        "maxScore": 30
      },
      {
        "title": "Average",
        "minScore": 31,
        "maxScore": 50
      },
      {
        "title": "Strong",
        "minScore": 51,
        "maxScore": 70
      },
      {
        "title": "Very Strong",
        "minScore": 71,
        "maxScore": 85
      },
      {
        "title": "Exceptional",
        "minScore": 86,
        "maxScore": 100
      }
    ],
    "questionTypes": [
      "visual_rotation"
    ],
    "sourceNote": "Every target and option is a real, programmatically generated and rendered SVG (asymmetric 2D polygons, embedded as data URIs — no external asset pipeline needed), verified visually by rendering to PNG during authoring. Two adaptations from the original Vandenberg & Kuse test, both noted transparently: (1) it uses original 2D asymmetric polygons rather than the original's 3D cube-block figures, since 2D shapes with a genuine chirality (mirroring produces a different-handed shape than any rotation) test the same core rotation-vs-mirror discrimination without needing 3D rendering/projection — a simplification used by several digital cognitive-test platforms; (2) each item is single-correct-answer multiple choice rather than the original's \"select the 2 of 4 matches,\" a common adaptation for deterministic auto-scoring. Distractors are generated three ways per item — wrong rotation amount, mirrored at the correct angle, and mirrored at a wrong angle — so guessing based on rotation alone or mirroring alone isn't enough."
  },
};

export function getAssessmentDetail(slug: string): AssessmentDetail | undefined {
  return ASSESSMENT_DETAILS[slug];
}
