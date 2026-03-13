export type Language = "en" | "de"

export interface FilteredHelpTextItem {
  name: string
  values: Record<Language, string>
}

export interface FilteredHelpTextsResponse {
  status: boolean
  message: string
  data: FilteredHelpTextItem[]
}

export interface TriggerAiPromptItem {
  name: string
  values: Record<Language, string>
}

export interface SystemSettingsType {
  _id: string
  triggerAiPrompt?: TriggerAiPromptItem[]
}

export interface SystemSettingsResponse {
  status: boolean
  message: string
  data: {
    items: SystemSettingsType[]
  }
}