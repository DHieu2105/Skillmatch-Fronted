export interface Skill {
  skill_id: number;
  skill_name: string;
  category: string;
  description: string;
}

export interface StudentSkill extends Skill {
  level: string;
  source: string;
}

export interface SkillCreate {
  skill_id: number;
  level: string;
  source: string;
}

export interface SkillUpdate {
  level: string;
  source: string;
}

export type StudentSkillForm = SkillCreate;

export const skillOptions: Skill[] = [
  { skill_id: 1, skill_name: "Python", category: "Programming Language", description: "" },
  { skill_id: 2, skill_name: "FastAPI", category: "Framework", description: "" },
  { skill_id: 3, skill_name: "JavaScript", category: "Programming Language", description: "" },
  { skill_id: 4, skill_name: "React", category: "Framework", description: "" },
  { skill_id: 5, skill_name: "SQL", category: "Database", description: "" },
  { skill_id: 6, skill_name: "Java", category: "Programming Language", description: "" },
  { skill_id: 7, skill_name: "C++", category: "Programming Language", description: "" },
  { skill_id: 8, skill_name: "Docker", category: "DevOps", description: "" },
  { skill_id: 9, skill_name: "Git", category: "DevOps", description: "" },
  { skill_id: 10, skill_name: "Machine Learning", category: "Data Science", description: "" },
];
