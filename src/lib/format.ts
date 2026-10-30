/**
 * Cleans test/seed suffixes like "[Recommendation QA 5368f814]" from job titles
 */
export function cleanJobTitle(title?: string | null): string {
  if (!title) return "";
  return title
    .replace(/\s*\[\s*Recommendation[^\]]*\]/gi, "")
    .replace(/\s*\(\s*Recommendation[^)]*\)/gi, "")
    .replace(/\s*\[\s*QA[^\]]*\]/gi, "")
    .replace(/\s*-\s*Recommendation[^\n]*/gi, "")
    .replace(/\s*Recommendation\s+QA\s+[a-f0-9]+/gi, "")
    .trim();
}

