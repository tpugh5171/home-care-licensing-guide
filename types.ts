export interface LicenseInfo {
  licensingBody: string;
  licenseTypes: string[];
  keyRequirements: string[];
  officialResources: {
    name: string;
    url: string;
  }[];
}

export type ComparisonData = Record<string, LicenseInfo | null>;
