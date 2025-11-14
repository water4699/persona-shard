import { useReadContract, useWriteContract, useAccount } from "wagmi";
import { CONTRACT_CONFIG } from "../config/contracts";

export function useMentalHealthSurvey() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: hasSurvey, isLoading: hasSurveyLoading } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "hasSurveyResponse",
    account: address,
  });

  const { data: totalParticipants, isLoading: participantsLoading } =
    useReadContract({
      ...CONTRACT_CONFIG,
      functionName: "getTotalParticipants",
    });

  const { refetch: refetchEncryptedSurvey } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: "getAllResponses",
    account: address,
    query: {
      enabled: false,
    },
  });

  const submitSurvey = async (encryptedResponses: {
    q1: `0x${string}`;
    q1Proof: `0x${string}`;
    q2: `0x${string}`;
    q2Proof: `0x${string}`;
    q3: `0x${string}`;
    q3Proof: `0x${string}`;
    q4: `0x${string}`;
    q4Proof: `0x${string}`;
    q5: `0x${string}`;
    q5Proof: `0x${string}`;
  }) => {
    return writeContractAsync({
      ...CONTRACT_CONFIG,
      functionName: "submitSurvey",
      args: [
        encryptedResponses.q1,
        encryptedResponses.q1Proof,
        encryptedResponses.q2,
        encryptedResponses.q2Proof,
        encryptedResponses.q3,
        encryptedResponses.q3Proof,
        encryptedResponses.q4,
        encryptedResponses.q4Proof,
        encryptedResponses.q5,
        encryptedResponses.q5Proof,
      ],
    });
  };

  return {
    hasSurvey,
    totalParticipants,
    submitSurvey,
    refetchEncryptedSurvey,
    isLoading: hasSurveyLoading || participantsLoading,
  };
}
