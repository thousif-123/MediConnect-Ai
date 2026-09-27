// Deterministic pre-AI Red Flag screening engine
// Enforces mandatory emergency protocol BEFORE any LLM evaluation

export interface RedFlagResult {
  isEmergency: boolean;
  matchedTriggers: string[];
  protocolMessage: string;
}

const EMERGENCY_KEYWORDS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(severe chest pain|crushing chest|chest pressure.*arm|left arm numbness.*chest|heart attack)\b/i,
    reason: 'Suspected acute cardiovascular event or myocardial infarction',
  },
  {
    pattern: /\b(cannot breathe|severe difficulty breathing|gasping for air|turning blue|suffocating)\b/i,
    reason: 'Acute respiratory distress or airway compromise',
  },
  {
    pattern: /\b(slurred speech|face drooping|sudden arm weakness|stroke symptoms|sudden paralysis|FAST)\b/i,
    reason: 'Suspected acute neurological event or stroke (FAST protocol)',
  },
  {
    pattern: /\b(loss of consciousness|passed out|unresponsive|fainted and not waking)\b/i,
    reason: 'Altered level of consciousness or syncope',
  },
  {
    pattern: /\b(uncontrollable bleeding|spurting blood|coughing up large amounts of blood|vomiting dark blood)\b/i,
    reason: 'Severe active hemorrhage',
  },
  {
    pattern: /\b(anaphylaxis|throat closing|severe swelling.*tongue|severe allergic reaction.*breathing)\b/i,
    reason: 'Acute anaphylaxis or airway angioedema',
  },
  {
    pattern: /\b(worst headache of life|thunderclap headache|sudden neck stiffness with fever and confusion)\b/i,
    reason: 'Possible subarachnoid hemorrhage or severe acute meningitis',
  },
  {
    pattern: /\b(suicidal|suicide|killing myself|harm myself|end my life)\b/i,
    reason: 'Acute psychiatric emergency / crisis',
  },
  {
    pattern: /\b(severe abdominal pain.*collapse|rigid abdomen.*vomiting blood|sudden tearing back pain)\b/i,
    reason: 'Acute surgical abdomen or aortic dissection indicator',
  },
];

export const evaluateRedFlags = (text: string): RedFlagResult => {
  const matchedTriggers: string[] = [];

  for (const { pattern, reason } of EMERGENCY_KEYWORDS) {
    if (pattern.test(text)) {
      matchedTriggers.push(reason);
    }
  }

  return {
    isEmergency: matchedTriggers.length > 0,
    matchedTriggers,
    protocolMessage:
      'CRITICAL: The symptoms described may indicate a life-threatening medical emergency. Immediately call 911 (or your local emergency services) or proceed to the nearest Emergency Room.',
  };
};
