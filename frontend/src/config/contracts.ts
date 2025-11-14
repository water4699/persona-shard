import { sepolia } from 'wagmi/chains'
import { CONTRACT_ADDRESS, MentalHealthSurveyABI } from '../abi/MentalHealthSurvey'

export const CONTRACT_CONFIG = {
  address: CONTRACT_ADDRESS as `0x${string}`,
  abi: MentalHealthSurveyABI,
  chainId: sepolia.id,
} as const

export const SUPPORTED_CHAINS = [sepolia]

