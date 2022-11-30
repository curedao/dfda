// noinspection TypeScriptRedundantGenericType,JSUnusedGlobalSymbols
// noinspection JSUnusedGlobalSymbols

import type { AxiosInstance, AxiosRequestConfig } from 'axios'
// noinspection JSUnusedGlobalSymbols,TypeScriptRedundantGenericType
// noinspection TypeScriptRedundantGenericType
import axios from 'axios';
import { Canvas, createCanvas, loadImage } from 'canvas';
import { mean } from 'mathjs';
import {
    MutationFunction, QueryClient, useMutation, UseMutationOptions, UseMutationResult, useQuery,
    useQueryClient, UseQueryOptions, UseQueryResult
} from 'react-query';

export function getAccessToken(): string | null {
  const queryParams = new URLSearchParams(window.location.search)
  let accessToken = queryParams.get('accessToken')
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken)
  } else {
    accessToken = localStorage.getItem('accessToken') || null
  }
  return accessToken && accessToken.length > 0 ? accessToken : null
}

export function updateDataSourceButtonLink(button: Button): void {
  if (!button.link) {
    return
  }
  try {
    const url = new URL(button.link)
    url.searchParams.set('clientId', 'quantimodo')
    url.searchParams.set('final_callback_url', window.location.href)
    button.link = url.href
  } catch (error) {
    debugger
    console.error(error)
    throw new Error(error)
  }
}

function getUrl(path: string, params?: any) {
  const urlObj = new URL('https://app.quantimo.do' + path)
  urlObj.searchParams.append('clientId', 'quantimodo')
  if (params) {
    for (const key in params) {
      urlObj.searchParams.append(key, params[key])
    }
  }
  return urlObj.href
}

export const getRequest = async (path: string, params?: Record<string, unknown>): Promise<any> => {
  //debugger
  const options = {
    method: 'GET',
    headers: { Accept: 'application/json' },
  }
  const accessToken = getAccessToken()
  if (accessToken) {
    options.headers['Authorization'] = `Bearer ${accessToken}`
  }
  const response = await fetch(getUrl(path, params), options)
  if (!response.ok) {
    return { status: 0, result: [] }
  }
  return response.json()
}

export const getDataSources = async (): Promise<any> => {
  return getRequest('/api/v3/connectors/list', { final_callback_url: window.location.href })
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
  operation: 'ADD' | 'MULTIPLY'
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
    | 'check_box'
    | 'date'
    | 'email'
    | 'number'
    | 'postal_code'
    | 'select_option'
    | 'string'
    | 'switch'
    | 'text_area'
    | 'unit'
    | 'variable_category'
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
    | 'Activity'
    | 'Books'
    | 'Causes of Illness'
    | 'Cognitive Performance'
    | 'Conditions'
    | 'Emotions'
    | 'Environment'
    | 'Foods'
    | 'Goals'
    | 'Locations'
    | 'Miscellaneous'
    | 'Movies and TV'
    | 'Music'
    | 'Nutrients'
    | 'Payments'
    | 'Physical Activities'
    | 'Physique'
    | 'Sleep'
    | 'Social Interactions'
    | 'Software'
    | 'Symptoms'
    | 'Treatments'
    | 'Vital Signs'
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
  combinationOperation?: 'MEAN' | 'SUM'
  measurementItems: MeasurementItem[]
  sourceName: string
  unitAbbreviatedName: string
  variableCategoryName?:
    | 'Activity'
    | 'Books'
    | 'Causes of Illness'
    | 'Cognitive Performance'
    | 'Conditions'
    | 'Emotions'
    | 'Environment'
    | 'Foods'
    | 'Goals'
    | 'Locations'
    | 'Miscellaneous'
    | 'Movies and TV'
    | 'Music'
    | 'Nutrients'
    | 'Payments'
    | 'Physical Activities'
    | 'Physique'
    | 'Sleep'
    | 'Social Interactions'
    | 'Software'
    | 'Symptoms'
    | 'Treatments'
    | 'Vital Signs'
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
  type: 'individual' | 'group' | 'global'
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
  combinationOperation?: 'MEAN' | 'SUM'
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
    | 'Activity'
    | 'Books'
    | 'Causes of Illness'
    | 'Cognitive Performance'
    | 'Conditions'
    | 'Emotions'
    | 'Environment'
    | 'Foods'
    | 'Goals'
    | 'Locations'
    | 'Miscellaneous'
    | 'Movies and TV'
    | 'Music'
    | 'Nutrients'
    | 'Payments'
    | 'Physical Activities'
    | 'Physique'
    | 'Sleep'
    | 'Social Interactions'
    | 'Software'
    | 'Symptoms'
    | 'Treatments'
    | 'Vital Signs'
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
  combinationOperation?: 'MEAN' | 'SUM'
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
    | 'Activity'
    | 'Books'
    | 'Causes of Illness'
    | 'Cognitive Performance'
    | 'Conditions'
    | 'Emotions'
    | 'Environment'
    | 'Foods'
    | 'Goals'
    | 'Locations'
    | 'Miscellaneous'
    | 'Movies and TV'
    | 'Music'
    | 'Nutrients'
    | 'Payments'
    | 'Physical Activities'
    | 'Physique'
    | 'Sleep'
    | 'Social Interactions'
    | 'Software'
    | 'Symptoms'
    | 'Treatments'
    | 'Vital Signs'
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
  action: 'skip' | 'snooze' | 'track'
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
    | 'Distance'
    | 'Duration'
    | 'Energy'
    | 'Frequency'
    | 'Miscellany'
    | 'Pressure'
    | 'Proportion'
    | 'Rating'
    | 'Temperature'
    | 'Volume'
    | 'Weight'
    | 'Count'
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
  combinationOperation?: 'MEAN' | 'SUM'
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
  fillingType?: 'none' | 'zero-filling' | 'value-filling'
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
    | 'Activity'
    | 'Books'
    | 'Causes of Illness'
    | 'Cognitive Performance'
    | 'Conditions'
    | 'Emotions'
    | 'Environment'
    | 'Foods'
    | 'Goals'
    | 'Locations'
    | 'Miscellaneous'
    | 'Movies and TV'
    | 'Music'
    | 'Nutrients'
    | 'Payments'
    | 'Physical Activities'
    | 'Physique'
    | 'Sleep'
    | 'Social Interactions'
    | 'Software'
    | 'Symptoms'
    | 'Treatments'
    | 'Vital Signs'
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
    | 'Activity'
    | 'Books'
    | 'Causes of Illness'
    | 'Cognitive Performance'
    | 'Conditions'
    | 'Emotions'
    | 'Environment'
    | 'Foods'
    | 'Goals'
    | 'Locations'
    | 'Miscellaneous'
    | 'Movies and TV'
    | 'Music'
    | 'Nutrients'
    | 'Payments'
    | 'Physical Activities'
    | 'Physique'
    | 'Sleep'
    | 'Social Interactions'
    | 'Software'
    | 'Symptoms'
    | 'Treatments'
    | 'Vital Signs'
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
  value: 'up' | 'down' | 'none'
  type?: 'causality' | 'usefulness'
}
export type AxiosConfig = {
  paramsSerializer?: AxiosRequestConfig['paramsSerializer']
}
export type Config = {
  mutations?: MutationConfigs
  axios?: AxiosConfig
}
export function initialize(axios: AxiosInstance, config?: Config): any {
  const requests = makeRequests(axios, config?.axios)
  const queryIds = makeQueryIds()
  return {
    requests,
    queryIds,
    queries: makeQueries(requests, queryIds),
    mutations: makeMutations(requests, config?.mutations),
  }
}
function useRapiniMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationFn: MutationFunction<TData, TVariables>,
  config?: (
    queryClient: QueryClient,
  ) => Pick<UseMutationOptions<TData, TError, TVariables, TContext>, 'onSuccess' | 'onSettled' | 'onError'>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { onSuccess, onError, onSettled, ...rest } = options ?? {}
  const queryClient = useQueryClient()
  const conf = config?.(queryClient)
  const mutationOptions: typeof options = {
    onSuccess: (data: TData, variables: TVariables, context?: TContext) => {
      conf?.onSuccess?.(data, variables, context)
      onSuccess?.(data, variables, context)
    },
    onError: (error: TError, variables: TVariables, context?: TContext) => {
      conf?.onError?.(error, variables, context)
      onError?.(error, variables, context)
    },
    onSettled: (data: TData | undefined, error: TError | null, variables: TVariables, context?: TContext) => {
      conf?.onSettled?.(data, error, variables, context)
      onSettled?.(data, error, variables, context)
    },
    ...rest,
  }
  return useMutation(mutationFn, mutationOptions)
}
function nullIfUndefined<T>(value: T): T | null {
  return typeof value === 'undefined' ? null : value
}
function makeQueryIds() {
  return {
    getUnits: () => ['getUnits'] as const,
    getUserVariables: (
      name?: string,
      id?: number,
      upc?: string,
      joinVariableId?: number,
      parentUserTagVariableId?: number,
      childUserTagVariableId?: number,
      ingredientUserTagVariableId?: number,
      ingredientOfUserTagVariableId?: number,
      commonOnly?: boolean,
      userOnly?: boolean,
      refresh?: boolean,
    ) =>
      [
        'getUserVariables',
        nullIfUndefined(name),
        nullIfUndefined(id),
        nullIfUndefined(upc),
        nullIfUndefined(joinVariableId),
        nullIfUndefined(parentUserTagVariableId),
        nullIfUndefined(childUserTagVariableId),
        nullIfUndefined(ingredientUserTagVariableId),
        nullIfUndefined(ingredientOfUserTagVariableId),
        nullIfUndefined(commonOnly),
        nullIfUndefined(userOnly),
        nullIfUndefined(refresh),
      ] as const,
    getMeasurements: (id?: number) => ['getMeasurements', nullIfUndefined(id)] as const,
    getAppSettings: () => ['getAppSettings'] as const,
    getMobileConnectPage: () => ['getMobileConnectPage'] as const,
    getConnectors: () => ['getConnectors'] as const,
    connectConnector: () => ['connectConnector'] as const,
    disconnectConnector: () => ['disconnectConnector'] as const,
    updateConnector: () => ['updateConnector'] as const,
    getCorrelations: (commonOnly?: boolean) => ['getCorrelations', nullIfUndefined(commonOnly)] as const,
    getFeed: () => ['getFeed'] as const,
    getIntegrationJs: () => ['getIntegrationJs'] as const,
    getNotificationPreferences: () => ['getNotificationPreferences'] as const,
    getOauthAuthorizationCode: () => ['getOauthAuthorizationCode'] as const,
    getAccessToken: () => ['getAccessToken'] as const,
    getShares: () => ['getShares'] as const,
    getStudies: () => ['getStudies'] as const,
    getOpenStudies: () => ['getOpenStudies'] as const,
    getStudiesJoined: () => ['getStudiesJoined'] as const,
    getStudiesCreated: () => ['getStudiesCreated'] as const,
    getTrackingReminderNotifications: () => ['getTrackingReminderNotifications'] as const,
    getTrackingReminders: () => ['getTrackingReminders'] as const,
    getUnitCategories: () => ['getUnitCategories'] as const,
    getUser: () => ['getUser'] as const,
    getUsers: () => ['getUsers'] as const,
    getVariableCategories: () => ['getVariableCategories'] as const,
    getStudy: () => ['getStudy'] as const,
  } as const
}
function makeRequests(axios: AxiosInstance, config?: AxiosConfig) {
  return {
    getUnits: () =>
      axios
        .request<Unit[]>({
          method: 'get',
          url: `/v3/units`,
        })
        .then((res) => res.data),
    getUserVariables: (
      name?: string,
      id?: number,
      upc?: string,
      joinVariableId?: number,
      parentUserTagVariableId?: number,
      childUserTagVariableId?: number,
      ingredientUserTagVariableId?: number,
      ingredientOfUserTagVariableId?: number,
      commonOnly?: boolean,
      userOnly?: boolean,
      refresh?: boolean,
    ) =>
      axios
        .request<UserVariable[]>({
          method: 'get',
          url: `/v3/variables`,
          params: {
            ...(name !== undefined ? { name } : undefined),
            ...(id !== undefined ? { id } : undefined),
            ...(upc !== undefined ? { upc } : undefined),
            ...(joinVariableId !== undefined ? { joinVariableId } : undefined),
            ...(parentUserTagVariableId !== undefined ? { parentUserTagVariableId } : undefined),
            ...(childUserTagVariableId !== undefined ? { childUserTagVariableId } : undefined),
            ...(ingredientUserTagVariableId !== undefined ? { ingredientUserTagVariableId } : undefined),
            ...(ingredientOfUserTagVariableId !== undefined ? { ingredientOfUserTagVariableId } : undefined),
            ...(commonOnly !== undefined ? { commonOnly } : undefined),
            ...(userOnly !== undefined ? { userOnly } : undefined),
            ...(refresh !== undefined ? { refresh } : undefined),
          },
          paramsSerializer: config?.paramsSerializer,
        })
        .then((res) => res.data),
    postUserVariables: (payload: UserVariable[]) =>
      axios
        .request<CommonResponse>({
          method: 'post',
          url: `/v3/variables`,
          data: payload,
        })
        .then((res) => res.data),
    getMeasurements: (id?: number) =>
      axios
        .request<Measurement[]>({
          method: 'get',
          url: `/v3/measurements`,
          params: {
            ...(id !== undefined ? { id } : undefined),
          },
          paramsSerializer: config?.paramsSerializer,
        })
        .then((res) => res.data),
    postMeasurements: (payload: MeasurementSet[]) =>
      axios
        .request<PostMeasurementsResponse>({
          method: 'post',
          url: `/v3/measurements/post`,
          data: payload,
        })
        .then((res) => res.data),
    updateMeasurement: (payload: MeasurementUpdate) =>
      axios
        .request<CommonResponse>({
          method: 'post',
          url: `/v3/measurements/update`,
          data: payload,
        })
        .then((res) => res.data),
    deleteMeasurement: () =>
      axios
        .request<CommonResponse>({
          method: 'delete',
          url: `/v3/measurements/delete`,
        })
        .then((res) => res.data),
    getAppSettings: () =>
      axios
        .request<AppSettingsResponse>({
          method: 'get',
          url: `/v3/appSettings`,
        })
        .then((res) => res.data),
    measurementExportRequest: () =>
      axios
        .request<number>({
          method: 'post',
          url: `/v2/measurements/exportRequest`,
        })
        .then((res) => res.data),
    getMobileConnectPage: () =>
      axios
        .request<unknown>({
          method: 'get',
          url: `/v3/connect/mobile`,
        })
        .then((res) => res.data),
    getConnectors: () =>
      axios
        .request<GetConnectorsResponse>({
          method: 'get',
          url: `/v3/connectors/list`,
        })
        .then((res) => res.data),
    connectConnector: (connectorName) =>
      axios
        .request<unknown>({
          method: 'get',
          url: `/v3/connectors/${connectorName}/connect`,
        })
        .then((res) => res.data),
    disconnectConnector: (connectorName) =>
      axios
        .request<unknown>({
          method: 'get',
          url: `/v3/connectors/${connectorName}/disconnect`,
        })
        .then((res) => res.data),
    updateConnector: (connectorName) =>
      axios
        .request<unknown>({
          method: 'get',
          url: `/v3/connectors/${connectorName}/update`,
        })
        .then((res) => res.data),
    getCorrelations: (commonOnly?: boolean) =>
      axios
        .request<GetCorrelationsResponse>({
          method: 'get',
          url: `/v3/correlations`,
          params: {
            ...(commonOnly !== undefined ? { commonOnly } : undefined),
          },
          paramsSerializer: config?.paramsSerializer,
        })
        .then((res) => res.data),
    postDeviceToken: (payload: DeviceToken) =>
      axios
        .request<unknown>({
          method: 'post',
          url: `/v3/deviceTokens`,
          data: payload,
        })
        .then((res) => res.data),
    getFeed: () =>
      axios
        .request<FeedResponse>({
          method: 'get',
          url: `/v3/feed`,
        })
        .then((res) => res.data),
    postFeed: (payload: Card[]) =>
      axios
        .request<FeedResponse>({
          method: 'post',
          url: `/v3/feed`,
          data: payload,
        })
        .then((res) => res.data),
    getIntegrationJs: () =>
      axios
        .request<unknown>({
          method: 'get',
          url: `/v3/integration.js`,
        })
        .then((res) => res.data),
    getNotificationPreferences: () =>
      axios
        .request<unknown>({
          method: 'get',
          url: `/v3/notificationPreferences`,
        })
        .then((res) => res.data),
    getOauthAuthorizationCode: () =>
      axios
        .request<unknown>({
          method: 'get',
          url: `/v3/oauth2/authorize`,
        })
        .then((res) => res.data),
    getAccessToken: () =>
      axios
        .request<unknown>({
          method: 'get',
          url: `/v3/oauth2/token`,
        })
        .then((res) => res.data),
    getShares: () =>
      axios
        .request<GetSharesResponse>({
          method: 'get',
          url: `/v3/shares`,
        })
        .then((res) => res.data),
    deleteShare: (clientIdToRevoke: string, reason?: string) =>
      axios
        .request<User>({
          method: 'post',
          url: `/v3/shares/delete`,
          params: {
            clientIdToRevoke,
            ...(reason !== undefined ? { reason } : undefined),
          },
          paramsSerializer: config?.paramsSerializer,
        })
        .then((res) => res.data),
    inviteShare: (payload: ShareInvitationBody) =>
      axios
        .request<User>({
          method: 'post',
          url: `/v3/shares/invite`,
          data: payload,
        })
        .then((res) => res.data),
    getStudies: () =>
      axios
        .request<GetStudiesResponse>({
          method: 'get',
          url: `/v3/studies`,
        })
        .then((res) => res.data),
    getOpenStudies: () =>
      axios
        .request<GetStudiesResponse>({
          method: 'get',
          url: `/v3/studies/open`,
        })
        .then((res) => res.data),
    getStudiesJoined: () =>
      axios
        .request<GetStudiesResponse>({
          method: 'get',
          url: `/v3/studies/joined`,
        })
        .then((res) => res.data),
    getStudiesCreated: () =>
      axios
        .request<GetStudiesResponse>({
          method: 'get',
          url: `/v3/studies/created`,
        })
        .then((res) => res.data),
    publishStudy: () =>
      axios
        .request<PostStudyPublishResponse>({
          method: 'post',
          url: `/v3/study/publish`,
        })
        .then((res) => res.data),
    joinStudy: () =>
      axios
        .request<StudyJoinResponse>({
          method: 'post',
          url: `/v3/study/join`,
        })
        .then((res) => res.data),
    createStudy: (payload: StudyCreationBody) =>
      axios
        .request<PostStudyCreateResponse>({
          method: 'post',
          url: `/v3/study/create`,
          data: payload,
        })
        .then((res) => res.data),
    getTrackingReminderNotifications: () =>
      axios
        .request<GetTrackingReminderNotificationsResponse>({
          method: 'get',
          url: `/v3/trackingReminderNotifications`,
        })
        .then((res) => res.data),
    postTrackingReminderNotifications: (payload: TrackingReminderNotificationPost[]) =>
      axios
        .request<CommonResponse>({
          method: 'post',
          url: `/v3/trackingReminderNotifications`,
          data: payload,
        })
        .then((res) => res.data),
    getTrackingReminders: () =>
      axios
        .request<TrackingReminder[]>({
          method: 'get',
          url: `/v3/trackingReminders`,
        })
        .then((res) => res.data),
    postTrackingReminders: (payload: TrackingReminder[]) =>
      axios
        .request<PostTrackingRemindersResponse>({
          method: 'post',
          url: `/v3/trackingReminders`,
          data: payload,
        })
        .then((res) => res.data),
    deleteTrackingReminder: () =>
      axios
        .request<CommonResponse>({
          method: 'delete',
          url: `/v3/trackingReminders/delete`,
        })
        .then((res) => res.data),
    getUnitCategories: () =>
      axios
        .request<UnitCategory[]>({
          method: 'get',
          url: `/v3/unitCategories`,
        })
        .then((res) => res.data),
    getUser: () =>
      axios
        .request<User>({
          method: 'get',
          url: `/v3/user`,
        })
        .then((res) => res.data),
    getUsers: () =>
      axios
        .request<UsersResponse>({
          method: 'get',
          url: `/v3/users`,
        })
        .then((res) => res.data),
    deleteUser: (reason: string) =>
      axios
        .request<CommonResponse>({
          method: 'delete',
          url: `/v3/user/delete`,
          params: {
            reason,
          },
          paramsSerializer: config?.paramsSerializer,
        })
        .then((res) => res.data),
    postUserSettings: (payload: User) =>
      axios
        .request<PostUserSettingsResponse>({
          method: 'post',
          url: `/v3/userSettings`,
          data: payload,
        })
        .then((res) => res.data),
    postUserTags: (payload: UserTag) =>
      axios
        .request<CommonResponse>({
          method: 'post',
          url: `/v3/userTags`,
          data: payload,
        })
        .then((res) => res.data),
    deleteUserTag: () =>
      axios
        .request<CommonResponse>({
          method: 'delete',
          url: `/v3/userTags/delete`,
        })
        .then((res) => res.data),
    deleteUserVariable: () =>
      axios
        .request<unknown>({
          method: 'delete',
          url: `/v3/userVariables/delete`,
        })
        .then((res) => res.data),
    resetUserVariableSettings: (payload: UserVariableDelete) =>
      axios
        .request<unknown>({
          method: 'post',
          url: `/v3/userVariables/reset`,
          data: payload,
        })
        .then((res) => res.data),
    getVariableCategories: () =>
      axios
        .request<VariableCategory[]>({
          method: 'get',
          url: `/v3/variableCategories`,
        })
        .then((res) => res.data),
    postVote: (payload: Vote) =>
      axios
        .request<CommonResponse>({
          method: 'post',
          url: `/v3/votes`,
          data: payload,
        })
        .then((res) => res.data),
    deleteVote: () =>
      axios
        .request<CommonResponse>({
          method: 'delete',
          url: `/v3/votes/delete`,
        })
        .then((res) => res.data),
    getStudy: () =>
      axios
        .request<Study>({
          method: 'get',
          url: `/v4/study`,
        })
        .then((res) => res.data),
  } as const
}
function makeQueries(requests: ReturnType<typeof makeRequests>, queryIds: ReturnType<typeof makeQueryIds>) {
  return {
    useGetUnits: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getUnits>>,
          unknown,
          Awaited<ReturnType<typeof requests.getUnits>>,
          ReturnType<typeof queryIds['getUnits']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getUnits>>, unknown> =>
      useQuery(queryIds.getUnits(), () => requests.getUnits(), options),
    useGetVariables: (
      name?: string,
      id?: number,
      upc?: string,
      joinVariableId?: number,
      parentUserTagVariableId?: number,
      childUserTagVariableId?: number,
      ingredientUserTagVariableId?: number,
      ingredientOfUserTagVariableId?: number,
      commonOnly?: boolean,
      userOnly?: boolean,
      refresh?: boolean,
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getUserVariables>>,
          unknown,
          Awaited<ReturnType<typeof requests.getUserVariables>>,
          ReturnType<typeof queryIds['getUserVariables']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getUserVariables>>, unknown> =>
      useQuery(
        queryIds.getUserVariables(
          name,
          id,
          upc,
          joinVariableId,
          parentUserTagVariableId,
          childUserTagVariableId,
          ingredientUserTagVariableId,
          ingredientOfUserTagVariableId,
          commonOnly,
          userOnly,
          refresh,
        ),
        () =>
          requests.getUserVariables(
            name,
            id,
            upc,
            joinVariableId,
            parentUserTagVariableId,
            childUserTagVariableId,
            ingredientUserTagVariableId,
            ingredientOfUserTagVariableId,
            commonOnly,
            userOnly,
            refresh,
          ),
        options,
      ),
    useGetMeasurements: (
      id?: number,
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getMeasurements>>,
          unknown,
          Awaited<ReturnType<typeof requests.getMeasurements>>,
          ReturnType<typeof queryIds['getMeasurements']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getMeasurements>>, unknown> =>
      useQuery(queryIds.getMeasurements(id), () => requests.getMeasurements(id), options),
    useGetAppSettings: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getAppSettings>>,
          unknown,
          Awaited<ReturnType<typeof requests.getAppSettings>>,
          ReturnType<typeof queryIds['getAppSettings']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getAppSettings>>, unknown> =>
      useQuery(queryIds.getAppSettings(), () => requests.getAppSettings(), options),
    useGetMobileConnectPage: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getMobileConnectPage>>,
          unknown,
          Awaited<ReturnType<typeof requests.getMobileConnectPage>>,
          ReturnType<typeof queryIds['getMobileConnectPage']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getMobileConnectPage>>, unknown> =>
      useQuery(queryIds.getMobileConnectPage(), () => requests.getMobileConnectPage(), options),
    useGetConnectors: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getConnectors>>,
          unknown,
          Awaited<ReturnType<typeof requests.getConnectors>>,
          ReturnType<typeof queryIds['getConnectors']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getConnectors>>, unknown> =>
      useQuery(queryIds.getConnectors(), () => requests.getConnectors(), options),
    useConnectConnector: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.connectConnector>>,
          unknown,
          Awaited<ReturnType<typeof requests.connectConnector>>,
          ReturnType<typeof queryIds['connectConnector']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.connectConnector>>, unknown> =>
      useQuery(queryIds.connectConnector(), (connectorName) => requests.connectConnector(connectorName), options),
    useDisconnectConnector: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.disconnectConnector>>,
          unknown,
          Awaited<ReturnType<typeof requests.disconnectConnector>>,
          ReturnType<typeof queryIds['disconnectConnector']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.disconnectConnector>>, unknown> =>
      useQuery(queryIds.disconnectConnector(), (connectorName) => requests.disconnectConnector(connectorName), options),
    useUpdateConnector: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.updateConnector>>,
          unknown,
          Awaited<ReturnType<typeof requests.updateConnector>>,
          ReturnType<typeof queryIds['updateConnector']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.updateConnector>>, unknown> =>
      useQuery(queryIds.updateConnector(), (connectorName) => requests.updateConnector(connectorName), options),
    useGetCorrelations: (
      commonOnly?: boolean,
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getCorrelations>>,
          unknown,
          Awaited<ReturnType<typeof requests.getCorrelations>>,
          ReturnType<typeof queryIds['getCorrelations']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getCorrelations>>, unknown> =>
      useQuery(queryIds.getCorrelations(commonOnly), () => requests.getCorrelations(commonOnly), options),
    useGetFeed: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getFeed>>,
          unknown,
          Awaited<ReturnType<typeof requests.getFeed>>,
          ReturnType<typeof queryIds['getFeed']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getFeed>>, unknown> =>
      useQuery(queryIds.getFeed(), () => requests.getFeed(), options),
    useGetIntegrationJs: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getIntegrationJs>>,
          unknown,
          Awaited<ReturnType<typeof requests.getIntegrationJs>>,
          ReturnType<typeof queryIds['getIntegrationJs']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getIntegrationJs>>, unknown> =>
      useQuery(queryIds.getIntegrationJs(), () => requests.getIntegrationJs(), options),
    useGetNotificationPreferences: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getNotificationPreferences>>,
          unknown,
          Awaited<ReturnType<typeof requests.getNotificationPreferences>>,
          ReturnType<typeof queryIds['getNotificationPreferences']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getNotificationPreferences>>, unknown> =>
      useQuery(queryIds.getNotificationPreferences(), () => requests.getNotificationPreferences(), options),
    useGetOauthAuthorizationCode: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getOauthAuthorizationCode>>,
          unknown,
          Awaited<ReturnType<typeof requests.getOauthAuthorizationCode>>,
          ReturnType<typeof queryIds['getOauthAuthorizationCode']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getOauthAuthorizationCode>>, unknown> =>
      useQuery(queryIds.getOauthAuthorizationCode(), () => requests.getOauthAuthorizationCode(), options),
    useGetAccessToken: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getAccessToken>>,
          unknown,
          Awaited<ReturnType<typeof requests.getAccessToken>>,
          ReturnType<typeof queryIds['getAccessToken']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getAccessToken>>, unknown> =>
      useQuery(queryIds.getAccessToken(), () => requests.getAccessToken(), options),
    useGetShares: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getShares>>,
          unknown,
          Awaited<ReturnType<typeof requests.getShares>>,
          ReturnType<typeof queryIds['getShares']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getShares>>, unknown> =>
      useQuery(queryIds.getShares(), () => requests.getShares(), options),
    useGetStudies: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getStudies>>,
          unknown,
          Awaited<ReturnType<typeof requests.getStudies>>,
          ReturnType<typeof queryIds['getStudies']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getStudies>>, unknown> =>
      useQuery(queryIds.getStudies(), () => requests.getStudies(), options),
    useGetOpenStudies: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getOpenStudies>>,
          unknown,
          Awaited<ReturnType<typeof requests.getOpenStudies>>,
          ReturnType<typeof queryIds['getOpenStudies']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getOpenStudies>>, unknown> =>
      useQuery(queryIds.getOpenStudies(), () => requests.getOpenStudies(), options),
    useGetStudiesJoined: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getStudiesJoined>>,
          unknown,
          Awaited<ReturnType<typeof requests.getStudiesJoined>>,
          ReturnType<typeof queryIds['getStudiesJoined']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getStudiesJoined>>, unknown> =>
      useQuery(queryIds.getStudiesJoined(), () => requests.getStudiesJoined(), options),
    useGetStudiesCreated: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getStudiesCreated>>,
          unknown,
          Awaited<ReturnType<typeof requests.getStudiesCreated>>,
          ReturnType<typeof queryIds['getStudiesCreated']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getStudiesCreated>>, unknown> =>
      useQuery(queryIds.getStudiesCreated(), () => requests.getStudiesCreated(), options),
    useGetTrackingReminderNotifications: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getTrackingReminderNotifications>>,
          unknown,
          Awaited<ReturnType<typeof requests.getTrackingReminderNotifications>>,
          ReturnType<typeof queryIds['getTrackingReminderNotifications']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getTrackingReminderNotifications>>, unknown> =>
      useQuery(queryIds.getTrackingReminderNotifications(), () => requests.getTrackingReminderNotifications(), options),
    useGetTrackingReminders: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getTrackingReminders>>,
          unknown,
          Awaited<ReturnType<typeof requests.getTrackingReminders>>,
          ReturnType<typeof queryIds['getTrackingReminders']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getTrackingReminders>>, unknown> =>
      useQuery(queryIds.getTrackingReminders(), () => requests.getTrackingReminders(), options),
    useGetUnitCategories: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getUnitCategories>>,
          unknown,
          Awaited<ReturnType<typeof requests.getUnitCategories>>,
          ReturnType<typeof queryIds['getUnitCategories']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getUnitCategories>>, unknown> =>
      useQuery(queryIds.getUnitCategories(), () => requests.getUnitCategories(), options),
    useGetUser: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getUser>>,
          unknown,
          Awaited<ReturnType<typeof requests.getUser>>,
          ReturnType<typeof queryIds['getUser']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getUser>>, unknown> =>
      useQuery(queryIds.getUser(), () => requests.getUser(), options),
    useGetUsers: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getUsers>>,
          unknown,
          Awaited<ReturnType<typeof requests.getUsers>>,
          ReturnType<typeof queryIds['getUsers']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getUsers>>, unknown> =>
      useQuery(queryIds.getUsers(), () => requests.getUsers(), options),
    useGetVariableCategories: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getVariableCategories>>,
          unknown,
          Awaited<ReturnType<typeof requests.getVariableCategories>>,
          ReturnType<typeof queryIds['getVariableCategories']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getVariableCategories>>, unknown> =>
      useQuery(queryIds.getVariableCategories(), () => requests.getVariableCategories(), options),
    useGetStudy: (
      options?: Omit<
        UseQueryOptions<
          Awaited<ReturnType<typeof requests.getStudy>>,
          unknown,
          Awaited<ReturnType<typeof requests.getStudy>>,
          ReturnType<typeof queryIds['getStudy']>
        >,
        'queryKey' | 'queryFn'
      >,
    ): UseQueryResult<Awaited<ReturnType<typeof requests.getStudy>>, unknown> =>
      useQuery(queryIds.getStudy(), () => requests.getStudy(), options),
  } as const
}
type MutationConfigs = {
  usePostUserVariables?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postUserVariables']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postUserVariables']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePostMeasurements?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postMeasurements']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postMeasurements']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useUpdateMeasurement?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['updateMeasurement']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['updateMeasurement']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useDeleteMeasurement?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['deleteMeasurement']>>,
      unknown,
      unknown,
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useMeasurementExportRequest?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['measurementExportRequest']>>,
      unknown,
      unknown,
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePostDeviceToken?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postDeviceToken']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postDeviceToken']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePostFeed?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postFeed']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postFeed']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useDeleteShare?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<Awaited<ReturnType<ReturnType<typeof makeRequests>['deleteShare']>>, unknown, unknown, unknown>,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useInviteShare?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['inviteShare']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['inviteShare']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePublishStudy?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<Awaited<ReturnType<ReturnType<typeof makeRequests>['publishStudy']>>, unknown, unknown, unknown>,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useJoinStudy?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<Awaited<ReturnType<ReturnType<typeof makeRequests>['joinStudy']>>, unknown, unknown, unknown>,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useCreateStudy?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['createStudy']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['createStudy']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePostTrackingReminderNotifications?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postTrackingReminderNotifications']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postTrackingReminderNotifications']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePostTrackingReminders?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postTrackingReminders']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postTrackingReminders']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useDeleteTrackingReminder?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['deleteTrackingReminder']>>,
      unknown,
      unknown,
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useDeleteUser?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<Awaited<ReturnType<ReturnType<typeof makeRequests>['deleteUser']>>, unknown, unknown, unknown>,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePostUserSettings?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postUserSettings']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postUserSettings']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePostUserTags?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postUserTags']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postUserTags']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useDeleteUserTag?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['deleteUserTag']>>,
      unknown,
      unknown,
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useDeleteUserVariable?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['deleteUserVariable']>>,
      unknown,
      unknown,
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useResetUserVariableSettings?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['resetUserVariableSettings']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['resetUserVariableSettings']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  usePostVote?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<
      Awaited<ReturnType<ReturnType<typeof makeRequests>['postVote']>>,
      unknown,
      Parameters<ReturnType<typeof makeRequests>['postVote']>[0],
      unknown
    >,
    'onSuccess' | 'onSettled' | 'onError'
  >
  useDeleteVote?: (
    queryClient: QueryClient,
  ) => Pick<
    UseMutationOptions<Awaited<ReturnType<ReturnType<typeof makeRequests>['deleteVote']>>, unknown, unknown, unknown>,
    'onSuccess' | 'onSettled' | 'onError'
  >
}
function makeMutations(requests: ReturnType<typeof makeRequests>, config?: Config['mutations']) {
  return {
    usePostUserVariables: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postUserVariables>>,
          unknown,
          Parameters<typeof requests.postUserVariables>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postUserVariables>>,
        unknown,
        Parameters<typeof requests.postUserVariables>[0]
      >((payload) => requests.postUserVariables(payload), config?.usePostUserVariables, options),
    usePostMeasurements: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postMeasurements>>,
          unknown,
          Parameters<typeof requests.postMeasurements>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postMeasurements>>,
        unknown,
        Parameters<typeof requests.postMeasurements>[0]
      >((payload) => requests.postMeasurements(payload), config?.usePostMeasurements, options),
    useUpdateMeasurement: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.updateMeasurement>>,
          unknown,
          Parameters<typeof requests.updateMeasurement>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.updateMeasurement>>,
        unknown,
        Parameters<typeof requests.updateMeasurement>[0]
      >((payload) => requests.updateMeasurement(payload), config?.useUpdateMeasurement, options),
    useDeleteMeasurement: (
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.deleteMeasurement>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.deleteMeasurement>>, unknown, unknown>(
        () => requests.deleteMeasurement(),
        config?.useDeleteMeasurement,
        options,
      ),
    useMeasurementExportRequest: (
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.measurementExportRequest>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.measurementExportRequest>>, unknown, unknown>(
        () => requests.measurementExportRequest(),
        config?.useMeasurementExportRequest,
        options,
      ),
    usePostDeviceToken: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postDeviceToken>>,
          unknown,
          Parameters<typeof requests.postDeviceToken>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postDeviceToken>>,
        unknown,
        Parameters<typeof requests.postDeviceToken>[0]
      >((payload) => requests.postDeviceToken(payload), config?.usePostDeviceToken, options),
    usePostFeed: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postFeed>>,
          unknown,
          Parameters<typeof requests.postFeed>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postFeed>>,
        unknown,
        Parameters<typeof requests.postFeed>[0]
      >((payload) => requests.postFeed(payload), config?.usePostFeed, options),
    useDeleteShare: (
      clientIdToRevoke: string,
      reason?: string,
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.deleteShare>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.deleteShare>>, unknown, unknown>(
        () => requests.deleteShare(clientIdToRevoke, reason),
        config?.useDeleteShare,
        options,
      ),
    useInviteShare: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.inviteShare>>,
          unknown,
          Parameters<typeof requests.inviteShare>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.inviteShare>>,
        unknown,
        Parameters<typeof requests.inviteShare>[0]
      >((payload) => requests.inviteShare(payload), config?.useInviteShare, options),
    usePublishStudy: (
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.publishStudy>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.publishStudy>>, unknown, unknown>(
        () => requests.publishStudy(),
        config?.usePublishStudy,
        options,
      ),
    useJoinStudy: (
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.joinStudy>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.joinStudy>>, unknown, unknown>(
        () => requests.joinStudy(),
        config?.useJoinStudy,
        options,
      ),
    useCreateStudy: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.createStudy>>,
          unknown,
          Parameters<typeof requests.createStudy>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.createStudy>>,
        unknown,
        Parameters<typeof requests.createStudy>[0]
      >((payload) => requests.createStudy(payload), config?.useCreateStudy, options),
    usePostTrackingReminderNotifications: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postTrackingReminderNotifications>>,
          unknown,
          Parameters<typeof requests.postTrackingReminderNotifications>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postTrackingReminderNotifications>>,
        unknown,
        Parameters<typeof requests.postTrackingReminderNotifications>[0]
      >(
        (payload) => requests.postTrackingReminderNotifications(payload),
        config?.usePostTrackingReminderNotifications,
        options,
      ),
    usePostTrackingReminders: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postTrackingReminders>>,
          unknown,
          Parameters<typeof requests.postTrackingReminders>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postTrackingReminders>>,
        unknown,
        Parameters<typeof requests.postTrackingReminders>[0]
      >((payload) => requests.postTrackingReminders(payload), config?.usePostTrackingReminders, options),
    useDeleteTrackingReminder: (
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.deleteTrackingReminder>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.deleteTrackingReminder>>, unknown, unknown>(
        () => requests.deleteTrackingReminder(),
        config?.useDeleteTrackingReminder,
        options,
      ),
    useDeleteUser: (
      reason: string,
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.deleteUser>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.deleteUser>>, unknown, unknown>(
        () => requests.deleteUser(reason),
        config?.useDeleteUser,
        options,
      ),
    usePostUserSettings: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postUserSettings>>,
          unknown,
          Parameters<typeof requests.postUserSettings>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postUserSettings>>,
        unknown,
        Parameters<typeof requests.postUserSettings>[0]
      >((payload) => requests.postUserSettings(payload), config?.usePostUserSettings, options),
    usePostUserTags: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postUserTags>>,
          unknown,
          Parameters<typeof requests.postUserTags>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postUserTags>>,
        unknown,
        Parameters<typeof requests.postUserTags>[0]
      >((payload) => requests.postUserTags(payload), config?.usePostUserTags, options),
    useDeleteUserTag: (
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.deleteUserTag>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.deleteUserTag>>, unknown, unknown>(
        () => requests.deleteUserTag(),
        config?.useDeleteUserTag,
        options,
      ),
    useDeleteUserVariable: (
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.deleteUserVariable>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.deleteUserVariable>>, unknown, unknown>(
        () => requests.deleteUserVariable(),
        config?.useDeleteUserVariable,
        options,
      ),
    useResetUserVariableSettings: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.resetUserVariableSettings>>,
          unknown,
          Parameters<typeof requests.resetUserVariableSettings>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.resetUserVariableSettings>>,
        unknown,
        Parameters<typeof requests.resetUserVariableSettings>[0]
      >((payload) => requests.resetUserVariableSettings(payload), config?.useResetUserVariableSettings, options),
    usePostVote: (
      options?: Omit<
        UseMutationOptions<
          Awaited<ReturnType<typeof requests.postVote>>,
          unknown,
          Parameters<typeof requests.postVote>[0],
          unknown
        >,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<
        Awaited<ReturnType<typeof requests.postVote>>,
        unknown,
        Parameters<typeof requests.postVote>[0]
      >((payload) => requests.postVote(payload), config?.usePostVote, options),
    useDeleteVote: (
      options?: Omit<
        UseMutationOptions<Awaited<ReturnType<typeof requests.deleteVote>>, unknown, unknown, unknown>,
        'mutationFn'
      >,
    ) =>
      useRapiniMutation<Awaited<ReturnType<typeof requests.deleteVote>>, unknown, unknown>(
        () => requests.deleteVote(),
        config?.useDeleteVote,
        options,
      ),
  } as const
}

export const getAxios = (): AxiosInstance => {
  const accessToken = getAccessToken()
  const headers = {
    Accept: 'application/vnd.GitHub.v3+json',
    //'Authorization': 'token <your-token-here> -- https://docs.GitHub.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token'
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  return axios.create({
    baseURL: 'https://app.quantimo.do/api/',
    timeout: 30000,
    headers: headers,
  })
}

export const getQueries = (): any => {
  const config = digitalTwinApi()
  return config.queries
}

export const digitalTwinApi = (): { requests: any; queries: any } => {
  return initialize(getAxios())
}

export async function getUser(): Promise<User | null> {
  const { requests } = digitalTwinApi()
  const user = await requests.getUser()
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
  }
  return user || null
}

const SLEEP_EFFICIENCY = 'Sleep Efficiency'
const DAILY_STEP_COUNT = 'Daily Step Count'

export async function getVariable(variableName: string): Promise<UserVariable | null> {
  const { requests } = digitalTwinApi()
  // let variable: UserVariable
  // let cached = storage.getItem(variableName)
  // if (cached) {
  //   return variable
  // }
  const variables = await requests.getUserVariables(variableName)
  const variable = variables[0] || null
  if (variable) {
    localStorage.setItem(variableName, variable)
  }
  return variable
}

export async function findVariableCategory(nameOrId: string): Promise<VariableCategory> {
  const { requests } = digitalTwinApi()
  const cats = await requests.getVariableCategories()
  return cats.find(function (cat) {
    return cat.id === nameOrId || cat.name === nameOrId || cat.synonyms.indexOf(nameOrId) > -1
  })
}

export function calculateVariableScore(uv: UserVariable): number | null {
  if (uv.unitName === 'Percent') {
    return uv.lastValue || null
  }
  if (!uv.lastValue || !uv.minimumRecordedValue || !uv.maximumRecordedValue) {
    return null
  }
  return ((uv.lastValue - uv.minimumRecordedValue) / (uv.maximumRecordedValue - uv.minimumRecordedValue)) * 100
}

export async function getLifeForceScore(): Promise<number> {
  const scores = [50]
  const variableNames = [DAILY_STEP_COUNT, SLEEP_EFFICIENCY]
  for (const variableName of variableNames) {
    const variable = await getVariable(variableName)
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

export async function getUserVariables(): Promise<UserVariable[]> {
  const { requests } = digitalTwinApi()
  return requests.getUserVariables()
}

export async function mintNFTForUserVariable(recipientAddress: string, userVariable: UserVariable): Promise<any> {
  const form = new FormData()
  form.append('file', '')
  const data = JSON.parse(JSON.stringify(userVariable))

  data.image = generateVariableNftImage(userVariable.name)
  debugger
  const key = process.env.REACT_APP_NFTPORT_API_KEY
  if (!key) {
    throw new Error('Please set REACT_APP_NFTPORT_API_KEY to create NFTs')
  }
  let url: string = 'https://api.nftport.xyz/v0/mints/easy/urls';
  const options = {
    url: url,
    params: {
      chain: 'polygon',
      description: 'A JSON file containing ' + userVariable.name + ' Data',
      mint_to_address: recipientAddress,
      name: userVariable.name + ' Data',
      file_url: 'https://app.quantimo.do/api/v3/variables?accessToken=' + getAccessToken(),
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: key,
    },
    data: form,
  }

  return axios.post(url, options)
}

const width = 1264
const height = 1264
const titleFont = '50pt Comic Sans MS'
const scoreFont = '30pt Comic Sans MS'

export const slugify = (string: string): string => {
  return string
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

function addEnergyBars(context, numberOfRectangles) {
  // Add Energy Bar
  context.fillStyle = '#58378C'
  context.fillRect(441.55, 1041.95, (651 / 100) * numberOfRectangles, 68)
}

function addTitleText(context, variableName) {
  // Add Title Text
  context.font = titleFont
  context.textBaseline = 'top'
  context.fillStyle = 'black'
  context.fillText(variableName, 61, 28)
}

function addScoreText(context, variableName) {
  // Add Score Text
  context.font = scoreFont
  context.fillText(variableName, 400, 948)
}

async function addScoreImage(url: string, context: any) {
  const smallImageData = await loadImage(url)
  context.drawImage(smallImageData, 113.01, 922.06, 220.7, 220.7)
}

async function addBackgroundImage(canvas: Canvas, backgroundImg?: string) {
  if (!backgroundImg) {
    backgroundImg = 'https://static.quantimo.do/humanfs/human-fs-nft-background.png'
  }
  const backgroundImage = await loadImage(backgroundImg)
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
  const variable = await getVariable(variableName)
  if (!variable) {
    throw new Error('Could not find variable named ' + variableName)
  }
  if (!score) {
    score = calculateVariableScore(variable)
  }
  const context = await addBackgroundImage(canvas, backgroundImg)
  await addScoreImage(variable.url, context)
  addEnergyBars(context, score)
  addTitleText(context, variableName)
  addScoreText(context, variableName)
  return canvas.toDataURL('image/png')
}
export async function generateLifeForceNftImage(backgroundImg: string | undefined): Promise<string> {
  const canvas = createCanvas(width, height)
  const context = await addBackgroundImage(canvas, backgroundImg)
  addEnergyBars(context, getLifeForceScore())
  addTitleText(context, 'Life Force')
  addScoreText(context, 'Life Force')
  return canvas.toDataURL('image/png')
}
