// noinspection TypeScriptRedundantGenericType,JSUnusedGlobalSymbols
// noinspection JSUnusedGlobalSymbols

import type { AxiosRequestConfig } from 'axios'
// noinspection JSUnusedGlobalSymbols,TypeScriptRedundantGenericType
// noinspection TypeScriptRedundantGenericType
import axios from 'axios'
import { mean } from 'mathjs'
import * as qm from './qmHelpers.js'
import { Canvas, CanvasRenderingContext2D, createCanvas, loadImage} from "canvas"
import * as fs from "fs"
const fetch = require('node-fetch');
const FormData = require('form-data');
const storage = qm.storage
export function getAccessToken(): string | null {
  const queryParams = new URLSearchParams(window.location.search)
  let accessToken = queryParams.get("accessToken")
  if (accessToken) {
    storage.setItem("accessToken", accessToken)
  } else {
    accessToken = storage.getItem("accessToken") || null
  }
  return accessToken && accessToken.length > 0 ? accessToken : null
}
export function updateDataSourceButtonLink(button: Button): void {
  if (!button.link) {
    return
  }
  try {
    const url = new URL(button.link)
    url.searchParams.set("clientId", "quantimodo")
    url.searchParams.set("final_callback_url", window.location.href)
    button.link = url.href
  } catch (error) {
    debugger
    console.error(error)
    throw error
  }
}
function getApiOrigin() {
  return process.env.API_ORIGIN || "https://app.quantimo.do"
}
function getApiUrl(path = "", params?: any) {
  const apiOrigin = getApiOrigin()
  const urlObj = new URL(apiOrigin + path)
  urlObj.searchParams.append("clientId", "quantimodo")
  if (params) {
    for (const key in params) {
      urlObj.searchParams.append(key, params[key])
    }
  }
  return urlObj.href
}
export const getRequest = async (path: string, params?: Record<string, unknown>): Promise<any> => {
  //debugger
  const options: AxiosRequestConfig = {
    method: "GET",
    headers: {Accept: "application/json"},
  }
  const accessToken = getAccessToken()
  if (accessToken) {
    options.headers["Authorization"] = `Bearer ${accessToken}`
  }
  const response = await fetch(getApiUrl(path, params), options)
  if (!response.ok) {
    return {status: 0, result: []}
  }
  return response.json()
}
export const getDataSources = async (): Promise<any> => {
  return getRequest("/api/v3/connectors/list", {final_callback_url: window.location.href})
}
export type AppSettings = {
  additionalSettings?: Record<string, unknown>
  appDescription?: string
  appDesign?: Record<string, unknown>
  appDisplayName?: string
  appStatus?: Record<string, unknown>
  appType?: string
  buildEnabled?: string
  clientId?: string
  clientSecret?: string
  collaborators?: User[]
  createdAt?: string
  userId?: number
  users?: User[]
  redirectUri?: string
  companyName?: string
  homepageUrl?: string
  iconUrl?: string
  longDescription?: string
  splashScreen?: string
  textLogo?: string
}
export type AppSettingsResponse = {
  appSettings?: AppSettings
  description: string
  summary: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type AuthorizedClients = {
  apps: AppSettings[]
  individuals: AppSettings[]
  studies: AppSettings[]
}
export type Button = {
  accessibilityText?: string
  action?: Record<string, unknown>
  additionalInformation?: string
  color?: string
  confirmationText?: string
  functionName?: string
  parameters?: Record<string, unknown>
  html?: string
  id?: string
  image?: string
  ionIcon?: string
  link: string
  stateName?: string
  stateParams?: Record<string, unknown>
  successToastText?: string
  successAlertTitle?: string
  successAlertBody?: string
  text: string
  tooltip?: string
  webhookUrl?: string
}
export type Card = {
  actionSheetButtons?: Button[]
  avatar?: string
  avatarCircular?: string
  backgroundColor?: string
  buttons?: Button[]
  buttonsSecondary?: Button[]
  content?: string
  headerTitle?: string
  html?: string
  htmlContent?: string
  id: string
  image?: string
  inputFields?: InputField[]
  ionIcon?: string
  link?: string
  parameters?: Record<string, unknown>
  relatedCards?: Card[]
  selectedButton?: Button
  sharingBody?: string
  sharingButtons?: Button[]
  sharingTitle?: string
  subHeader?: string
  subTitle?: string
  title?: string
}
export type Chart = {
  highchartConfig?: Record<string, unknown>
  chartId?: string
  chartTitle?: string
  explanation?: string
  svgUrl?: string
  svg?: string
}
export type CommonResponse = {
  description: string
  summary: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type ConnectInstructions = {
  parameters?: Record<string, unknown>[]
  url: string
  usePopup?: boolean
}
export type ConversionStep = {
  operation: "ADD" | "MULTIPLY"
  value: number
}
export type Correlation = {
  averageDailyHighCause?: number
  averageDailyLowCause?: number
  averageEffect?: number
  averageEffectFollowingHighCause?: number
  averageEffectFollowingLowCause?: number
  averageForwardPearsonCorrelationOverOnsetDelays?: number
  averageReversePearsonCorrelationOverOnsetDelays?: number
  averageVote?: number
  causeChanges?: number
  causeDataSource?: DataSource
  causeUserVariableShareUserMeasurements?: number
  causeVariableCategoryId?: number
  causeVariableCategoryName?: string
  causeVariableCombinationOperation?: string
  causeVariableUnitAbbreviatedName?: string
  causeVariableId?: number
  causeVariableMostCommonConnectorId?: number
  causeVariableName: string
  confidenceInterval?: number
  confidenceLevel?: string
  correlationCoefficient?: number
  correlationIsContradictoryToOptimalValues?: boolean
  createdAt?: string
  criticalTValue?: number
  direction?: string
  durationOfAction?: number
  durationOfActionInHours?: number
  degreesOfFreedom?: number
  effectNumberOfProcessedDailyMeasurements?: number
  error?: string
  effectChanges?: number
  effectDataSource?: DataSource
  effectSize?: string
  effectUnit?: string
  effectUserVariableShareUserMeasurements?: number
  effectVariableCategoryId?: number
  effectVariableCategoryName?: string
  effectVariableCombinationOperation?: string
  effectVariableCommonAlias?: string
  effectVariableUnitAbbreviatedName?: string
  effectVariableUnitId?: number
  effectVariableUnitName?: string
  effectVariableId?: number
  effectVariableMostCommonConnectorId?: number
  effectVariableName: string
  experimentEndTime?: string
  experimentStartTime?: string
  forwardSpearmanCorrelationCoefficient?: number
  numberOfPairs?: number
  onsetDelay?: number
  onsetDelayInHours?: number
  onsetDelayWithStrongestPearsonCorrelation?: number
  onsetDelayWithStrongestPearsonCorrelationInHours?: number
  optimalPearsonProduct?: number
  outcomeFillingValue?: number
  outcomeMaximumAllowedValue?: number
  outcomeMinimumAllowedValue?: number
  pearsonCorrelationWithNoOnsetDelay?: number
  predictivePearsonCorrelation?: number
  predictivePearsonCorrelationCoefficient?: number
  predictorDataSources?: string
  predictorFillingValue?: number
  predictorMaximumAllowedValue?: number
  predictorMinimumAllowedValue?: number
  predictsHighEffectChange?: number
  predictsLowEffectChange?: number
  pValue?: number
  qmScore?: number
  reversePearsonCorrelationCoefficient?: number
  shareUserMeasurements?: boolean
  sharingDescription?: string
  sharingTitle?: string
  significantDifference?: boolean
  statisticalSignificance?: number
  strengthLevel?: string
  strongestPearsonCorrelationCoefficient?: number
  studyHtml?: StudyHtml
  studyImages?: StudyImages
  studyLinks?: StudyLinks
  studyText?: StudyText
  tValue?: number
  updatedAt?: string
  userId?: number
  userVote?: number
  valuePredictingHighOutcome?: number
  valuePredictingLowOutcome?: number
  outcomeDataSources?: string
  principalInvestigator?: string
  reverseCorrelation?: number
  averagePearsonCorrelationCoefficientOverOnsetDelays?: number
  causeNumberOfRawMeasurements?: number
  correlationsOverDurationsOfAction?: Correlation[]
  correlationsOverOnsetDelays?: Correlation[]
  correlationsOverDurationsOfActionChartConfig?: Record<string, unknown>
  correlationsOverOnsetDelaysChartConfig?: Record<string, unknown>
  numberOfUsers?: number
  rawCauseMeasurementSignificance?: number
  rawEffectMeasurementSignificance?: number
  reversePairsCount?: string
  voteStatisticalSignificance?: number
  aggregateQMScore?: number
  forwardPearsonCorrelationCoefficient?: number
  numberOfCorrelations?: number
  vote?: number
}
export type DataSource = {
  affiliate: boolean
  backgroundColor?: string
  buttons?: Button[]
  card?: Card
  clientId?: string
  connected?: boolean
  connectError?: string
  connectInstructions?: ConnectInstructions
  connectorId?: number
  connectStatus?: string
  count?: number
  createdAt?: string
  connectorClientId: string
  defaultVariableCategoryName: string
  displayName: string
  enabled: number
  getItUrl: string
  id: number
  image: string
  imageHtml: string
  lastSuccessfulUpdatedAt?: string
  lastUpdate?: number
  linkedDisplayNameHtml: string
  longDescription: string
  message?: string
  mobileConnectMethod?: string
  name: string
  platforms?: string[]
  premium?: boolean
  scopes?: string[]
  shortDescription: string
  spreadsheetUploadLink?: string
  totalMeasurementsInLastUpdate?: number
  updatedAt?: string
  updateRequestedAt?: string
  updateStatus?: string
  userId?: number
}
export type DeviceToken = {
  clientId?: string
  platform: string
  deviceToken: string
}
export type ErrorResponse = {
  message: string
}
export type Explanation = {
  description: string
  image: Image
  ionIcon: string
  startTracking: ExplanationStartTracking
  title: string
  html?: string
}
export type ExplanationStartTracking = {
  button: Button
  description: string
  title: string
}
export type InputField = {
  displayName: string
  helpText?: string
  hint?: string
  icon?: string
  id?: string
  image?: string
  key?: string
  labelLeft?: string
  labelRight?: string
  link?: string
  maxLength?: number
  maxValue?: number
  minLength?: number
  minValue?: number
  options?: string[]
  placeholder?: string
  postUrl?: string
  required?: boolean
  show?: boolean
  submitButton?: Button
  type:
    | "check_box"
    | "date"
    | "email"
    | "number"
    | "postal_code"
    | "select_option"
    | "string"
    | "switch"
    | "text_area"
    | "unit"
    | "variable_category"
  validationPattern?: string
  value?: string
}
export type GetConnectorsResponse = {
  connectors?: DataSource[]
  description: string
  summary: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type GetCorrelationsDataResponse = {
  correlations: Correlation[]
  explanation: Explanation
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type GetCorrelationsResponse = {
  data?: GetCorrelationsDataResponse
  description: string
  summary: string
  avatar?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type GetStudiesResponse = {
  studies?: Study[]
  description: string
  summary: string
  image?: Image
  avatar?: string
  ionIcon?: string
  startTracking?: ExplanationStartTracking
  title?: string
  html?: string
}
export type GetSharesResponse = {
  authorizedClients?: AuthorizedClients
  description: string
  summary: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type FeedResponse = {
  cards: Card[]
  description: string
  summary: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type GetTrackingReminderNotificationsResponse = {
  data?: TrackingReminderNotification[]
  description: string
  summary: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type Image = {
  height: string
  imageUrl: string
  width: string
}
export type JsonErrorResponse = {
  message?: string
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type Measurement = {
  card?: Card
  clientId?: string
  connectorId?: number
  createdAt?: string
  displayValueAndUnitString?: string
  iconIcon?: string
  id?: number
  inputType?: string
  ionIcon?: string
  manualTracking?: boolean
  maximumAllowedValue?: number
  minimumAllowedValue?: number
  note?: string
  noteObject?: Record<string, unknown>
  noteHtml?: Record<string, unknown>
  originalUnitId?: number
  originalValue?: number
  pngPath?: string
  pngUrl?: string
  productUrl?: string
  sourceName: string
  startDate?: string
  startTimeEpoch?: number
  startTimeString: string
  svgUrl?: string
  unitAbbreviatedName: string
  unitCategoryId?: number
  unitCategoryName?: string
  unitId?: number
  unitName?: string
  updatedAt?: string
  url?: string
  userVariableUnitAbbreviatedName?: string
  userVariableUnitCategoryId?: number
  userVariableUnitCategoryName?: string
  userVariableUnitId?: number
  userVariableUnitName?: string
  userVariableVariableCategoryId?: number
  userVariableVariableCategoryName?: string
  valence?: string
  value: number
  variableCategoryId?: number
  variableCategoryImageUrl?: string
  variableCategoryName?:
    | "Activity"
    | "Books"
    | "Causes of Illness"
    | "Cognitive Performance"
    | "Conditions"
    | "Emotions"
    | "Environment"
    | "Foods"
    | "Goals"
    | "Locations"
    | "Miscellaneous"
    | "Movies and TV"
    | "Music"
    | "Nutrients"
    | "Payments"
    | "Physical Activities"
    | "Physique"
    | "Sleep"
    | "Social Interactions"
    | "Software"
    | "Symptoms"
    | "Treatments"
    | "Vital Signs"
  variableDescription?: string
  variableId?: number
  variableName: string
  displayName?: string
}
export type MeasurementItem = {
  note?: string
  timestamp: number
  value: number
}
export type MeasurementSet = {
  combinationOperation?: "MEAN" | "SUM"
  measurementItems: MeasurementItem[]
  sourceName: string
  unitAbbreviatedName: string
  variableCategoryName?:
    | "Activity"
    | "Books"
    | "Causes of Illness"
    | "Cognitive Performance"
    | "Conditions"
    | "Emotions"
    | "Environment"
    | "Foods"
    | "Goals"
    | "Locations"
    | "Miscellaneous"
    | "Movies and TV"
    | "Music"
    | "Nutrients"
    | "Payments"
    | "Physical Activities"
    | "Physique"
    | "Sleep"
    | "Social Interactions"
    | "Software"
    | "Symptoms"
    | "Treatments"
    | "Vital Signs"
  variableName: string
  upc?: string
}
export type MeasurementUpdate = {
  id: number
  note?: string
  startTime?: number
  value?: number
}
export type Pair = {
  causeMeasurement: number
  causeMeasurementValue: number
  causeVariableUnitAbbreviatedName: string
  effectMeasurement: number
  effectMeasurementValue: number
  effectVariableUnitAbbreviatedName: string
  eventAt?: string
  eventAtUnixTime?: number
  startTimeString?: string
  timestamp: number
}
export type ParticipantInstruction = {
  instructionsForCauseVariable?: string
  instructionsForEffectVariable?: string
}
export type PostMeasurementsDataResponse = {
  userVariables?: UserVariable[]
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type PostMeasurementsResponse = {
  data?: PostMeasurementsDataResponse
  message?: string
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status: string
  success: boolean
  code?: number
  link?: string
  card?: Card
}
export type PostStudyPublishResponse = {
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type PostStudyCreateResponse = {
  study?: Study
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type PostTrackingRemindersDataResponse = {
  trackingReminderNotifications?: TrackingReminderNotification[]
  trackingReminders?: TrackingReminder[]
  userVariables?: UserVariable[]
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type PostTrackingRemindersResponse = {
  data?: PostTrackingRemindersDataResponse
  message?: string
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status: string
  success: boolean
  code?: number
  link?: string
  card?: Card
}
export type PostUserSettingsDataResponse = {
  purchaseId?: number
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type PostUserSettingsResponse = {
  data?: PostUserSettingsDataResponse
  message?: string
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status: string
  success: boolean
  code?: number
  link?: string
  card?: Card
}
export type ShareInvitationBody = {
  emailAddress: string
  name?: string
  emailSubject?: string
  emailBody?: string
  scopes?: string
}
export type Study = {
  type: string
  userId?: number
  id?: string
  causeVariable?: UserVariable
  causeVariableName?: string
  studyCharts?: StudyCharts
  effectVariable?: UserVariable
  effectVariableName?: string
  participantInstructions?: ParticipantInstruction
  statistics?: Correlation
  studyCard?: Card
  studyHtml?: StudyHtml
  studyImages?: StudyImages
  studyLinks?: StudyLinks
  studySharing?: StudySharing
  studyText?: StudyText
  studyVotes?: StudyVotes
  joined?: boolean
}
export type StudyCharts = {
  populationTraitScatterPlot?: Chart
  outcomeDistributionColumnChart?: Chart
  predictorDistributionColumnChart?: Chart
  correlationScatterPlot?: Chart
  pairsOverTimeLineChart?: Chart
}
export type StudyCreationBody = {
  causeVariableName: string
  effectVariableName: string
  studyTitle?: string
  type: "individual" | "group" | "global"
}
export type StudyHtml = {
  chartHtml: string
  downloadButtonsHtml?: string
  fullPageWithHead?: string
  fullStudyHtml: string
  fullStudyHtmlWithCssStyles?: string
  participantInstructionsHtml?: string
  statisticsTableHtml?: string
  studyAbstractHtml?: string
  studyHeaderHtml?: string
  studyImageHtml?: string
  studyMetaHtml?: string
  studyTextHtml?: string
  socialSharingButtonHtml?: string
  studySummaryBoxHtml?: string
}
export type StudyImages = {
  causeVariableImageUrl?: string
  causeVariableIonIcon?: string
  effectVariableImageUrl?: string
  effectVariableIonIcon?: string
  gaugeImage: string
  gaugeImageSquare: string
  gaugeSharingImageUrl?: string
  imageUrl: string
  robotSharingImageUrl?: string
  avatar?: string
}
export type StudyJoinResponse = {
  study?: Study
  trackingReminders?: TrackingReminder[]
  trackingReminderNotifications?: TrackingReminderNotification[]
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  link?: string
  card?: Card
}
export type StudyLinks = {
  studyJoinLink?: string
  studyLinkEmail: string
  studyLinkFacebook: string
  studyLinkGoogle: string
  studyLinkStatic: string
  studyLinkDynamic: string
  studyLinkTwitter: string
}
export type StudySharing = {
  shareUserMeasurements: boolean
  sharingDescription: string
  sharingTitle: string
}
export type StudyText = {
  averageEffectFollowingHighCauseExplanation?: string
  averageEffectFollowingLowCauseExplanation?: string
  valuePredictingHighOutcomeExplanation?: string
  valuePredictingLowOutcomeExplanation?: string
  dataAnalysis?: string
  dataSources?: string
  dataSourcesParagraphForCause?: string
  dataSourcesParagraphForEffect?: string
  lastCauseDailyValueSentenceExtended?: string
  lastCauseAndOptimalValueSentence?: string
  lastCauseDailyValueSentence?: string
  optimalDailyValueSentence?: string
  participantInstructions?: string
  predictorExplanation?: string
  significanceExplanation?: string
  studyAbstract: string
  studyDesign: string
  studyLimitations: string
  studyObjective: string
  studyResults: string
  studyTitle: string
  studyInvitation?: string
  studyQuestion?: string
  studyBackground?: string
}
export type StudyVotes = {
  averageVote: number
  userVote: number
}
export type TrackingReminder = {
  actionArray?: TrackingReminderNotificationAction[]
  availableUnits?: Unit[]
  bestStudyLink?: string
  bestStudyCard?: Card
  bestUserStudyLink?: string
  bestUserStudyCard?: Card
  bestPopulationStudyLink?: string
  bestPopulationStudyCard?: Card
  optimalValueMessage?: string
  commonOptimalValueMessage?: string
  userOptimalValueMessage?: string
  card?: Card
  clientId?: string
  combinationOperation?: "MEAN" | "SUM"
  createdAt?: string
  displayName?: string
  unitAbbreviatedName: string
  unitCategoryId?: number
  unitCategoryName?: string
  unitId?: number
  unitName?: string
  defaultValue?: number
  enabled?: boolean
  email?: boolean
  errorMessage?: string
  fillingValue?: number
  firstDailyReminderTime?: string
  frequencyTextDescription?: string
  frequencyTextDescriptionWithTime?: string
  id?: number
  inputType?: string
  instructions?: string
  ionIcon?: string
  lastTracked?: string
  lastValue?: number
  latestTrackingReminderNotificationReminderTime?: string
  localDailyReminderNotificationTimes?: string[]
  localDailyReminderNotificationTimesForAllReminders?: string[]
  manualTracking?: boolean
  maximumAllowedValue?: number
  minimumAllowedValue?: number
  nextReminderTimeEpochSeconds?: number
  notificationBar?: boolean
  numberOfRawMeasurements?: number
  numberOfUniqueValues?: number
  outcome?: boolean
  pngPath?: string
  pngUrl?: string
  productUrl?: string
  popUp?: boolean
  question?: string
  longQuestion?: string
  reminderEndTime?: string
  reminderFrequency: number
  reminderSound?: string
  reminderStartEpochSeconds?: number
  reminderStartTime?: string
  reminderStartTimeLocal?: string
  reminderStartTimeLocalHumanFormatted?: string
  repeating?: boolean
  secondDailyReminderTime?: string
  secondToLastValue?: number
  sms?: boolean
  startTrackingDate?: string
  stopTrackingDate?: string
  svgUrl?: string
  thirdDailyReminderTime?: string
  thirdToLastValue?: number
  trackingReminderId?: number
  trackingReminderImageUrl?: string
  upc?: string
  updatedAt?: string
  userId?: number
  userVariableUnitAbbreviatedName?: string
  userVariableUnitCategoryId?: number
  userVariableUnitCategoryName?: string
  userVariableUnitId?: number
  userVariableUnitName?: string
  userVariableVariableCategoryId?: number
  userVariableVariableCategoryName?: string
  valence?: string
  valueAndFrequencyTextDescription?: string
  valueAndFrequencyTextDescriptionWithTime?: string
  variableCategoryId?: number
  variableCategoryImageUrl?: string
  variableCategoryName:
    | "Activity"
    | "Books"
    | "Causes of Illness"
    | "Cognitive Performance"
    | "Conditions"
    | "Emotions"
    | "Environment"
    | "Foods"
    | "Goals"
    | "Locations"
    | "Miscellaneous"
    | "Movies and TV"
    | "Music"
    | "Nutrients"
    | "Payments"
    | "Physical Activities"
    | "Physique"
    | "Sleep"
    | "Social Interactions"
    | "Software"
    | "Symptoms"
    | "Treatments"
    | "Vital Signs"
  variableDescription?: string
  variableId?: number
  variableName: string
}
export type TrackingReminderNotification = {
  actionArray: TrackingReminderNotificationAction[]
  availableUnits: Unit[]
  bestStudyLink?: string
  bestStudyCard?: Card
  bestUserStudyLink?: string
  bestUserStudyCard?: Card
  bestPopulationStudyLink?: string
  bestPopulationStudyCard?: Card
  optimalValueMessage?: string
  commonOptimalValueMessage?: string
  userOptimalValueMessage?: string
  card?: Card
  clientId?: string
  combinationOperation?: "MEAN" | "SUM"
  createdAt?: string
  displayName?: string
  modifiedValue?: number
  unitAbbreviatedName?: string
  unitCategoryId?: number
  unitCategoryName?: string
  unitId?: number
  unitName?: string
  defaultValue?: number
  description?: string
  email?: boolean
  fillingValue: number
  iconIcon?: string
  id: number
  imageUrl?: string
  inputType?: string
  ionIcon?: string
  lastValue?: number
  manualTracking?: boolean
  maximumAllowedValue?: number
  minimumAllowedValue?: number
  mostCommonValue?: number
  notificationBar?: boolean
  notifiedAt?: string
  numberOfUniqueValues?: number
  outcome?: boolean
  pngPath?: string
  pngUrl?: string
  popUp?: boolean
  productUrl?: string
  question?: string
  longQuestion?: string
  reminderEndTime?: string
  reminderFrequency?: number
  reminderSound?: string
  reminderStartTime?: string
  reminderTime?: string
  secondMostCommonValue?: number
  secondToLastValue?: number
  sms?: boolean
  svgUrl?: string
  thirdMostCommonValue?: number
  thirdToLastValue?: number
  title?: string
  total?: number
  trackAllActions: TrackingReminderNotificationTrackAllAction[]
  trackingReminderId?: number
  trackingReminderImageUrl?: string
  trackingReminderNotificationId?: number
  trackingReminderNotificationTime?: string
  trackingReminderNotificationTimeEpoch?: number
  trackingReminderNotificationTimeLocal?: string
  trackingReminderNotificationTimeLocalHumanString?: string
  updatedAt?: string
  userId?: number
  userVariableUnitAbbreviatedName?: string
  userVariableUnitCategoryId?: number
  userVariableUnitCategoryName?: string
  userVariableUnitId?: number
  userVariableUnitName?: string
  userVariableVariableCategoryId?: number
  userVariableVariableCategoryName?: string
  valence?: string
  variableCategoryId?: number
  variableCategoryImageUrl?: string
  variableCategoryName?:
    | "Activity"
    | "Books"
    | "Causes of Illness"
    | "Cognitive Performance"
    | "Conditions"
    | "Emotions"
    | "Environment"
    | "Foods"
    | "Goals"
    | "Locations"
    | "Miscellaneous"
    | "Movies and TV"
    | "Music"
    | "Nutrients"
    | "Payments"
    | "Physical Activities"
    | "Physique"
    | "Sleep"
    | "Social Interactions"
    | "Software"
    | "Symptoms"
    | "Treatments"
    | "Vital Signs"
  variableId?: number
  variableImageUrl?: string
  variableName?: string
}
export type TrackingReminderNotificationAction = {
  action: string
  callback: string
  modifiedValue: number
  title: string
  longTitle?: string
  shortTitle?: string
}
export type TrackingReminderNotificationPost = {
  action: "skip" | "snooze" | "track"
  id: number
  modifiedValue?: number
}
export type TrackingReminderNotificationTrackAllAction = {
  action: string
  callback: string
  modifiedValue: number
  title: string
}
export type Unit = {
  abbreviatedName: string
  advanced?: number
  category:
    | "Distance"
    | "Duration"
    | "Energy"
    | "Frequency"
    | "Miscellany"
    | "Pressure"
    | "Proportion"
    | "Rating"
    | "Temperature"
    | "Volume"
    | "Weight"
    | "Count"
  categoryId?: number
  categoryName?: string
  conversionSteps: ConversionStep[]
  id?: number
  manualTracking?: number
  maximumAllowedValue?: number
  maximumValue: number
  minimumAllowedValue?: number
  minimumValue?: number
  name: string
  unitCategory: UnitCategory
}
export type UnitCategory = {
  id?: number
  name: string
  standardUnitAbbreviatedName?: string
}
export type User = {
  accessToken: string
  accessTokenExpires?: string
  accessTokenExpiresAtMilliseconds?: number
  administrator: boolean
  authorizedClients?: AuthorizedClients
  avatar?: string
  avatarImage?: string
  capabilities?: string
  card?: Card
  clientId?: string
  clientUserId?: string
  combineNotifications?: boolean
  createdAt?: string
  description?: string
  displayName: string
  earliestReminderTime?: string
  email: string
  firstName?: string
  getPreviewBuilds?: boolean
  hasAndroidApp?: boolean
  hasChromeExtension?: boolean
  hasIosApp?: boolean
  id: number
  lastActive?: string
  lastFour?: string
  lastName?: string
  lastSmsTrackingReminderNotificationId?: string
  latestReminderTime?: string
  loginName: string
  password?: string
  phoneNumber?: string
  phoneVerificationCode?: string
  primaryOutcomeVariableId?: number
  primaryOutcomeVariableName?: string
  pushNotificationsEnabled?: boolean
  refreshToken?: string
  roles?: string
  sendPredictorEmails?: boolean
  sendReminderNotificationEmails?: boolean
  shareAllData?: boolean
  smsNotificationsEnabled?: boolean
  stripeActive?: boolean
  stripeId?: string
  stripePlan?: string
  stripeSubscription?: string
  subscriptionEndsAt?: string
  subscriptionProvider?: string
  timeZoneOffset?: number
  trackLocation?: boolean
  updatedAt?: string
  userRegistered?: string
  userUrl?: string
}
export type UsersResponse = {
  users: User[]
  description?: string
  summary?: string
  errors?: ErrorResponse[]
  status?: string
  success?: boolean
  code?: number
  image?: Image
  avatar?: string
  ionIcon?: string
  html?: string
  link?: string
  card?: Card
}
export type UserTag = {
  conversionFactor: number
  taggedVariableId: number
  tagVariableId: number
}
export type UserVariable = {
  fetchStatus?: string
  actionArray?: TrackingReminderNotificationAction[]
  alias?: string
  availableUnits?: Unit[]
  bestStudyLink?: string
  bestStudyCard?: Card
  bestUserStudyLink?: string
  bestUserStudyCard?: Card
  bestPopulationStudyLink?: string
  bestPopulationStudyCard?: Card
  optimalValueMessage?: string
  commonOptimalValueMessage?: string
  userOptimalValueMessage?: string
  card?: Card
  causeOnly?: boolean
  charts?: VariableCharts
  chartsLinkDynamic?: string
  chartsLinkEmail?: string
  chartsLinkFacebook?: string
  chartsLinkGoogle?: string
  chartsLinkStatic?: string
  chartsLinkTwitter?: string
  childCommonTagVariables?: UserVariable[]
  childUserTagVariables?: UserVariable[]
  clientId?: string
  combinationOperation?: "MEAN" | "SUM"
  commonAlias?: string
  commonTaggedVariables?: UserVariable[]
  commonTagVariables?: UserVariable[]
  createdAt?: string
  dataSourceNames?: string
  dataSources?: DataSource[]
  description?: string
  displayName?: string
  durationOfAction?: number
  durationOfActionInHours?: number
  earliestFillingTime?: number
  earliestMeasurementTime?: number
  earliestSourceTime?: number
  errorMessage?: string
  experimentEndTime?: string
  experimentStartTime?: string
  fillingType?: "none" | "zero-filling" | "value-filling"
  fillingValue?: number
  iconIcon?: string
  id: number
  imageUrl?: string
  informationalUrl?: string
  ingredientOfCommonTagVariables?: UserVariable[]
  ingredientCommonTagVariables?: UserVariable[]
  ingredientOfUserTagVariables?: UserVariable[]
  ingredientUserTagVariables?: UserVariable[]
  inputType?: string
  ionIcon?: string
  joinedCommonTagVariables?: UserVariable[]
  joinedUserTagVariables?: UserVariable[]
  joinWith?: number
  kurtosis?: number
  lastProcessedDailyValue?: number
  lastSuccessfulUpdateTime?: string
  lastValue?: number
  latestFillingTime?: number
  latestMeasurementTime?: number
  latestSourceTime?: number
  latestUserMeasurementTime?: number
  latitude?: number
  location?: string
  longitude?: number
  manualTracking?: boolean
  maximumAllowedDailyValue?: number
  maximumAllowedValue?: number
  maximumRecordedDailyValue?: number
  maximumRecordedValue?: number
  mean?: number
  measurementsAtLastAnalysis?: number
  median?: number
  minimumAllowedValue?: number
  minimumAllowedDailyValue?: number
  minimumNonZeroValue?: number
  minimumRecordedValue?: number
  mostCommonConnectorId?: number
  mostCommonOriginalUnitId?: number
  mostCommonUnitId?: number
  mostCommonValue?: number
  name: string
  numberOfAggregateCorrelationsAsCause?: number
  numberOfAggregateCorrelationsAsEffect?: number
  numberOfChanges?: number
  numberOfCorrelations?: number
  numberOfCorrelationsAsCause?: number
  numberOfCorrelationsAsEffect?: number
  numberOfProcessedDailyMeasurements?: number
  numberOfRawMeasurements?: number
  numberOfTrackingReminders?: number
  numberOfUniqueDailyValues?: number
  numberOfUniqueValues?: number
  numberOfUserCorrelationsAsCause?: number
  numberOfUserCorrelationsAsEffect?: number
  numberOfUserVariables?: number
  onsetDelay?: number
  onsetDelayInHours?: number
  outcome?: boolean
  outcomeOfInterest?: boolean
  parentCommonTagVariables?: UserVariable[]
  parentUserTagVariables?: UserVariable[]
  pngPath?: string
  pngUrl?: string
  predictorOfInterest?: number
  price?: number
  productUrl?: string
  public?: boolean
  question?: string
  longQuestion?: string
  rawMeasurementsAtLastAnalysis?: number
  secondMostCommonValue?: number
  secondToLastValue?: number
  shareUserMeasurements?: boolean
  skewness?: number
  standardDeviation?: number
  status?: string
  subtitle?: string
  svgUrl?: string
  tags?: string[]
  thirdMostCommonValue?: number
  thirdToLastValue?: number
  trackingInstructions?: string
  trackingInstructionsCard?: Card
  unit?: Unit
  unitAbbreviatedName?: string
  unitCategoryId?: number
  unitCategoryName?: string
  unitId?: number
  unitName?: string
  upc?: string
  updated?: number
  updatedAt?: string
  updatedTime?: string
  url: string
  userId: number
  userTaggedVariables?: UserVariable[]
  userTagVariables?: UserVariable[]
  userVariableUnitAbbreviatedName?: string
  userVariableUnitCategoryId?: number
  userVariableUnitCategoryName?: string
  userVariableUnitId?: number
  userVariableUnitName?: string
  variableCategory?: VariableCategory
  joinedVariables?: UserVariable[]
  valence?: string
  variableCategoryId?: number
  variableCategoryName?:
    | "Activity"
    | "Books"
    | "Causes of Illness"
    | "Cognitive Performance"
    | "Conditions"
    | "Emotions"
    | "Environment"
    | "Foods"
    | "Goals"
    | "Locations"
    | "Miscellaneous"
    | "Movies and TV"
    | "Music"
    | "Nutrients"
    | "Payments"
    | "Physical Activities"
    | "Physique"
    | "Sleep"
    | "Social Interactions"
    | "Software"
    | "Symptoms"
    | "Treatments"
    | "Vital Signs"
  variableId: number
  variableName?: string
  variance?: number
  wikipediaTitle?: string
}
export type UserVariableDelete = {
  variableId: number
}
export type VariableCategory = {
  appType?: string
  causeOnly?: boolean
  combinationOperation?: string
  createdTime?: string
  unitAbbreviatedName?: string
  unitId?: number
  durationOfAction?: number
  fillingValue?: number
  helpText?: string
  id?: number
  imageUrl?: string
  ionIcon?: string
  manualTracking?: boolean
  maximumAllowedValue?: string
  measurementSynonymSingularLowercase?: string
  minimumAllowedValue?: string
  moreInfo?: string
  name: string
  onsetDelay?: number
  outcome?: boolean
  pngPath?: string
  pngUrl?: string
  public?: boolean
  svgPath?: string
  svgUrl?: string
  updated?: number
  updatedTime?: string
  variableCategoryName?:
    | "Activity"
    | "Books"
    | "Causes of Illness"
    | "Cognitive Performance"
    | "Conditions"
    | "Emotions"
    | "Environment"
    | "Foods"
    | "Goals"
    | "Locations"
    | "Miscellaneous"
    | "Movies and TV"
    | "Music"
    | "Nutrients"
    | "Payments"
    | "Physical Activities"
    | "Physique"
    | "Sleep"
    | "Social Interactions"
    | "Software"
    | "Symptoms"
    | "Treatments"
    | "Vital Signs"
  variableCategoryNameSingular?: string
}
export type VariableCharts = {
  hourlyColumnChart?: Chart
  monthlyColumnChart?: Chart
  distributionColumnChart?: Chart
  weekdayColumnChart?: Chart
  lineChartWithoutSmoothing?: Chart
  lineChartWithSmoothing?: Chart
}
export type Vote = {
  causeVariableId: number
  clientId: string
  createdAt?: string
  effectVariableId: number
  id?: number
  updatedAt?: string
  userId: number
  value: "up" | "down" | "none"
  type?: "causality" | "usefulness"
}
export type AxiosConfig = {
  paramsSerializer?: AxiosRequestConfig["paramsSerializer"]
}
const SLEEP_EFFICIENCY = "Sleep Efficiency"
const DAILY_STEP_COUNT = "Daily Step Count"
export function calculateVariableScore(uv: UserVariable): number | null {
  let lastValue: number|undefined = uv.lastValue
  if (uv.unitName === "Percent") {
    return lastValue || null
  }
  let minimumRecordedValue: number|undefined = uv.minimumRecordedValue
  let maximumRecordedValue: number|undefined = uv.maximumRecordedValue
  if (!lastValue || !minimumRecordedValue || !maximumRecordedValue) {
    return null
  }
  return ((lastValue - minimumRecordedValue) / (maximumRecordedValue - minimumRecordedValue)) * 100
}
export async function getUserVariable(variableName: string): Promise<UserVariable | null> {
  const data = await qm.api.getAsync("/api/v1/userVariables", {name: variableName})
  if (data.length === 0) {
    return null
  }
  const variable = data[0]
  return variable
}
export async function getLifeForceScore(): Promise<number> {
  const scores = [50]
  const variableNames = [DAILY_STEP_COUNT, SLEEP_EFFICIENCY]
  for (const variableName of variableNames) {
    const variable = await getUserVariable(variableName)
    if (!variable) {
      continue
    }
    const score = calculateVariableScore(variable)
    if (score !== null) {
      scores.push(score)
    }
  }
  return mean(scores)
}
function getNftPortApiKey(): string {
  if (!process.env.NFTPORT_API_KEY) {
    throw new Error("NFTPORT_API_KEY not set")
  }
  return process.env.NFTPORT_API_KEY
}
export async function getContractAddress(): Promise<string> {
  const options = {
    method: "GET",
    headers: {"Content-Type": "application/json", Authorization: getNftPortApiKey()},
  }
  const response = await fetch("https://api.nftport.xyz/v0/contracts/transaction_hash?chain=polygon", options)
  let data = response.json()
  return data
}
export async function deployNftContract(): Promise<string> {
  const options = {
    method: "POST",
    headers: {"Content-Type": "application/json", Authorization: getNftPortApiKey()},
    body: {
      "chain": "polygon",
      "name": "Polypunks",
      "symbol": "PP",
      "owner_address": "Your wallet address here",
      "metadata_updatable": true
    }
  }
  const response = await fetch("https://api.nftport.xyz/v0/contracts", options)
  return getContractAddress()
}
export async function mintNFTForUserVariable(recipientAddress: string, userVariable: UserVariable): Promise<any> {
  const form = new FormData()
  form.append("file", "")
  const data = JSON.parse(JSON.stringify(userVariable))
  data.image = generateVariableNftImage(userVariable.name)
  debugger
  const key = process.env.REACT_APP_NFTPORT_API_KEY
  if (!key) {
    throw new Error("Please set REACT_APP_NFTPORT_API_KEY to create NFTs")
  }
  const options: AxiosRequestConfig = {
    method: "POST",
    url: "https://api.nftport.xyz/v0/mints/easy/urls",
    params: {
      chain: "polygon",
      description: "A JSON file containing " + userVariable.name + " Data",
      mint_to_address: recipientAddress,
      name: userVariable.name + " Data",
      file_url: getApiUrl("/api/v3/variables", {accessToken: getAccessToken()}),
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: key,
    },
    data: form,
  }
  return axios.request(options)
}
const width = 1264
const height = 1264
const titleFont = "50pt Comic Sans MS"
const scoreFont = "30pt Comic Sans MS"
export const slugify = (string: string): string => {
  return string
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
}
function addEnergyBars(context: CanvasRenderingContext2D, numberOfRectangles: number) {
  // Add Energy Bar
  context.fillStyle = '#58378C'
  context.fillRect(441.55, 1041.95, (651 / 100) * numberOfRectangles, 68)
}

function addTitleText(context: CanvasRenderingContext2D, variableName: string) {
  // Add Title Text
  context.font = titleFont
  context.textBaseline = 'top'
  context.fillStyle = 'black'
  context.fillText(variableName, 61, 28)
}

function addScoreText(context: CanvasRenderingContext2D, variableName: string) {
  // Add Score Text
  context.font = scoreFont
  context.fillText(variableName, 400, 948)
}

function addBoxText(context: CanvasRenderingContext2D, text: string) {
  const boxFont = "60pt Comic Sans MS"
  context.font = boxFont
  context.fillText(text, 140, 970)
}

async function addScoreImage(url: string, context: any) {
  const smallImageData = await loadImage(url)
  context.drawImage(smallImageData, 113.01, 922.06, 220.7, 220.7)
}

async function addBackgroundImage(canvas: Canvas, backgroundImg?: string) {
  if (!backgroundImg) {
    backgroundImg = 'https://static.quantimo.do/humanfs/human-fs-nft-background.png'
  }
  let backgroundImage = await loadImage(backgroundImg)
  // @ts-ignore
  if(typeof backgroundImg.image !== 'undefined'){
    // @ts-ignore
    backgroundImage = backgroundImg.image
  }
  const context = canvas.getContext('2d')
  context.drawImage(backgroundImage, 0, 0, width, height)
  return context
}

async function generateVariableNftImage(
  variableName: string,
  score?: number | undefined | null,
  backgroundImg?: string | undefined,
): Promise<string> {
  const canvas = createCanvas(width, height)
  const variable = await getUserVariable(variableName)
  if (!variable) {
    throw new Error('Could not find variable named ' + variableName)
  }
  if (!score) {
    score = calculateVariableScore(variable)
  }
  const context = await addBackgroundImage(canvas, backgroundImg)
  if(score){
    await addScoreImage(variable.url, context)
    addEnergyBars(context, score)
  }
  addTitleText(context, variableName)
  addScoreText(context, variableName)
  return canvas.toDataURL('image/png')
}
export async function generateLifeForceNftImage(backgroundImg?: string | undefined): Promise<string> {
  const canvas = await generateLifeForceCanvas(backgroundImg)
  let data = canvas.toDataURL('image/png')
  let str = data.toString()
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("./digital-twin.png", buffer);
  return str;
}
export async function generateDataGemImage(backgroundImg?: string | undefined): Promise<string> {
  const canvas = await generateLifeForceCanvas(backgroundImg)
  let data = canvas.toDataURL('image/png')
  let str = data.toString()
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync("./data-gem.png", buffer);
  return str;
}
export async function generateLifeForceCanvas(backgroundImg?: string | undefined): Promise<Canvas> {
  const canvas = createCanvas(width, height)
  const context = await addBackgroundImage(canvas, backgroundImg)
  let lifeForceScore = await getLifeForceScore()
  addEnergyBars(context, lifeForceScore)
  addTitleText(context, 'Your Digital Twin')
  addScoreText(context, 'Life Force Score')
  lifeForceScore = Math.round(lifeForceScore)
  addBoxText(context, lifeForceScore + '%')
  return canvas
}
export async function generateDataGemCanvas(variableName: string, backgroundImg?: string | undefined): Promise<Canvas> {
  const canvas = createCanvas(width, height)
  const context = await addBackgroundImage(canvas, backgroundImg)
  let lifeForceScore = await getLifeForceScore()
  addEnergyBars(context, lifeForceScore)
  addTitleText(context, variableName + ' Data Gem')
  addScoreText(context, 'Life Force Score')
  lifeForceScore = Math.round(lifeForceScore)
  addBoxText(context, lifeForceScore + '%')
  return canvas
}

export async function uploadLifeForceImage(): Promise<string> {
  const imageData = await generateLifeForceNftImage()
  fs.writeSync(fs.openSync('image.png', 'w'), imageData)
  const form = new FormData();
  const fileStream = fs.createReadStream('image.png');
  form.append('file', fileStream);

  const options = {
    method: 'POST',
    body: form,
    headers: {
      'Authorization': getNftPortApiKey(),
    },
  };

  var response = await fetch('https://api.nftport.xyz/v0/files', options)
  var data = await response.json()
  return data
}

export async function getContracts(): Promise<any> {

}
