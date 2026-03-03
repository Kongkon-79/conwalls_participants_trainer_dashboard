export interface AiApiResponse {
  status: boolean;
  message: string;
  data: SystemSetting;
}

export interface SystemSetting {
  _id: string;
  helpTexts: HelpText[];
  roleTypes: RoleType[];
  categoryTypes: CategoryType[];
  measureTypes: MeasureType[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface HelpText {
  name: string;
  values: LocalizedText;
}

export interface MeasureType {
  name: string;
  values: LocalizedText;
}

export interface RoleType {
  name: string;
}

export interface CategoryType {
  name: string;
}

export interface LocalizedText {
  de: string;
  en: string;
}

// types/system-setting.ts

export interface LocalizedText {
  de: string;
  en: string;
}

export interface HelpText {
  name: string;
  values: LocalizedText;
}

export interface MeasureType {
  name: string;
  values: LocalizedText;
}

export interface RoleType {
  name: string;
}

export interface CategoryType {
  name: string;
}

export interface SystemSetting {
  _id: string;
  helpTexts: HelpText[];
  roleTypes: RoleType[];
  categoryTypes: CategoryType[];
  measureTypes: MeasureType[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SystemSettingResponse {
  status: boolean;
  message: string;
  data: SystemSetting;
}

