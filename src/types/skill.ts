export interface Skill {
  skill_id: number;
  skill_name: string;
  category: string;
  description: string;
}

export interface SkillCatalogCreate {
  skill_name: string;
  category: string;
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
