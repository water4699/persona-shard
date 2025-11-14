export const MentalHealthSurveyABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "SurveySubmitted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "StressIndexCalculated",
    type: "event"
  },
  // Functions
  {
    inputs: [
      { internalType: "euint32", name: "_q1", type: "bytes32" },
      { internalType: "bytes", name: "_q1Proof", type: "bytes" },
      { internalType: "euint32", name: "_q2", type: "bytes32" },
      { internalType: "bytes", name: "_q2Proof", type: "bytes" },
      { internalType: "euint32", name: "_q3", type: "bytes32" },
      { internalType: "bytes", name: "_q3Proof", type: "bytes" },
      { internalType: "euint32", name: "_q4", type: "bytes32" },
      { internalType: "bytes", name: "_q4Proof", type: "bytes" },
      { internalType: "euint32", name: "_q5", type: "bytes32" },
      { internalType: "bytes", name: "_q5Proof", type: "bytes" }
    ],
    name: "submitSurvey",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getStressIndex",
    outputs: [{ internalType: "euint32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "hasSurveyResponse",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTotalParticipants",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getAllResponses",
    outputs: [
      { internalType: "euint32", name: "q1", type: "bytes32" },
      { internalType: "euint32", name: "q2", type: "bytes32" },
      { internalType: "euint32", name: "q3", type: "bytes32" },
      { internalType: "euint32", name: "q4", type: "bytes32" },
      { internalType: "euint32", name: "q5", type: "bytes32" },
      { internalType: "euint32", name: "index", type: "bytes32" },
      { internalType: "uint256", name: "time", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const

export const CONTRACT_ADDRESS = "0x214664770c723B1694F43E1F26613fdbA957D6F4"

