// Strip to alphanumeric lowercase for flexible matching
const normalize = (str = "") =>
  String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const isFlexibleMatch = (resumeSkill, jobSkill) => {
  const a = normalize(resumeSkill);
  const b = normalize(jobSkill);
  if (!a || !b) return false;
  // Exact match or substring inclusion in either direction
  return a === b || a.includes(b) || b.includes(a);
};

export const calculateATSScore = (resume, job) => {
  const resumeSkills = Array.isArray(resume?.skills)
    ? resume.skills.filter(Boolean)
    : [];

  const requiredSkills = Array.isArray(job?.requiredSkills)
    ? job.requiredSkills.filter(Boolean)
    : [];

  // No requirements => perfect match by definition
  if (requiredSkills.length === 0) {
    return { score: 100, matchedSkills: [], missingSkills: [] };
  }

  const matchedSkills = [];
  const missingSkills = [];

  for (const reqSkill of requiredSkills) {
    const found = resumeSkills.some((rs) => isFlexibleMatch(rs, reqSkill));
    if (found) {
      matchedSkills.push(reqSkill);
    } else {
      missingSkills.push(reqSkill);
    }
  }

  const score = Math.round(
    (matchedSkills.length / requiredSkills.length) * 100,
  );

  return {
    score,
    matchedSkills,
    missingSkills,
  };
};
