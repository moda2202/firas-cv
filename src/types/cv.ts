export type Certificate = {
  name: string;
  issuer: string;
  status: string;
  period?: string;
  logoUrl?: string;
  imageUrl?: string;
};

export type Language = {
  name: string;
  level: string;
};

export type Education = {
  program: string;
  school: string;
  location: string;
  period: string;
  highlights: string[];
};

export type WorkExperience = {
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};

export type Project = {
  name: string;
  description: string;
};

export type Cv = {
  profile: {
    fullName: string;
    title: string;
    location: string;
    phone: string;
    email: string;
    githubUsername: string;
    avatarUrl?: string; // ✅ NEW
    links?: {
      github?: string;
      linkedin?: string;
    };
  };
  summary: string;
  languages: Language[];
  certificates: Certificate[];
  drivingLicense?: {
    typeB?: boolean;
    truckCard?: boolean;
  };
  interests: string[];
  education: Education[];
  itCompetences?: {
    languagesAndFrameworks: string[];
    databases: string[];
    toolsAndPlatforms: string[];
    aiChatbots: string[];
  };
  workExperience: WorkExperience[];
  projects: Project[];
};
