export interface JobSkill {
  job_id: number;
  skill_id: number;
  requirement_type: string;
  level: string;
}

export interface JobSkillCreate {
  skill_id: number;
  requirement_type: string;
  level: string;
}
