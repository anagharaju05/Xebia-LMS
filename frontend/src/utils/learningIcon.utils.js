import {
  Bot,
  Braces,
  ChartNoAxesCombined,
  CloudCog,
  Code2,
  Database,
  Layers3,
  Network,
  Palette,
  ServerCog,
  ShieldCheck,
  Smartphone,
  Workflow
} from "lucide-react";

const ICON_RULES = [
  { terms: ["ai", "machine learning", "neural", "llm"], icon: Bot },
  { terms: ["security", "auth", "jwt", "owasp"], icon: ShieldCheck },
  { terms: ["cloud", "devops", "kubernetes", "docker", "deployment"], icon: CloudCog },
  { terms: ["data", "analytics", "python", "visualization"], icon: ChartNoAxesCombined },
  { terms: ["database", "sql", "repository", "persistence"], icon: Database },
  { terms: ["mobile", "android", "ios", "flutter"], icon: Smartphone },
  { terms: ["design", "ui", "ux", "figma"], icon: Palette },
  { terms: ["architecture", "system design", "microservice", "gateway"], icon: Network },
  { terms: ["backend", "spring", "java", "api", "server"], icon: ServerCog },
  { terms: ["react", "typescript", "frontend", "web"], icon: Code2 },
  { terms: ["graphql", "schema", "resolver"], icon: Workflow },
  { terms: ["module", "curriculum", "lesson"], icon: Layers3 }
];

export function getLearningIcon(...values) {
  const searchableText = values.filter(Boolean).join(" ").toLowerCase();
  return ICON_RULES.find((rule) => rule.terms.some((term) => searchableText.includes(term)))?.icon || Braces;
}
