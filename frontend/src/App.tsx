import { useMemo, useState, useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Activity, Lock, ShieldCheck } from "lucide-react";
import { BrowserProvider, ethers } from "ethers";
import { useAccount, usePublicClient } from "wagmi";
import GradientMesh from "./components/visuals/GradientMesh";
import FeatureGrid from "./components/sections/FeatureGrid";
import SurveyForm from "./components/sections/SurveyForm";
import ResultsPanel from "./components/sections/ResultsPanel";
import FaqSection from "./components/sections/FaqSection";
import Footer from "./components/sections/Footer";
import Header from "./components/sections/Header";
import HeroBanner from "./components/sections/HeroBanner";
import { calculateStressIndex } from "./lib/stress";
import type { DecryptedSurvey, EncryptionArtifacts, SurveyResponses } from "./types/survey";
import { useFhevm } from "./fhevm/useFhevm";
import { FhevmDecryptionSignature } from "./fhevm/FhevmDecryptionSignature";
import { GenericStringInMemoryStorage } from "./fhevm/GenericStringStorage";
import { useMentalHealthSurvey } from "./hooks/useMentalHealthSurvey";
import { CONTRACT_CONFIG } from "./config/contracts";

const HANDLE_COUNT = 6;

function encodePreview(responses: SurveyResponses) {
  const encoded = JSON.stringify(responses);
  try {
    return btoa(unescape(encodeURIComponent(encoded))).slice(0, 40);
  } catch {
    return encoded.slice(0, 40);
  }
}

function toHexString(value: unknown): `0x${string}` {
  console.log("Converting to hex:", value, typeof value);

  if (typeof value === "string") {
    return value.startsWith("0x") ? (value as `0x${string}`) : (`0x${value}` as `0x${string}`);
  }
  if (value instanceof Uint8Array) {
    return ethers.hexlify(value) as `0x${string}`;
  }
  if (typeof value === "object" && value !== null) {
    // Handle possible FHEVM handle objects
    if ("toString" in value) {
      const str = value.toString();
      return str.startsWith("0x") ? (str as `0x${string}`) : (`0x${str}` as `0x${string}`);
    }
  }
  if (typeof value === "bigint") {
    return ethers.hexlify(value) as `0x${string}`;
  }

  console.error("Cannot convert to hex string:", value);
  throw new Error(`Invalid handle format: ${typeof value}`);
}

function parseEncryptedSurvey(data: unknown) {
  console.log("Raw data from contract:", data);

  // Handle wagmi returned data structure
  let dataArray: unknown[];
  if (Array.isArray(data)) {
    dataArray = data;
  } else if (data && typeof data === 'object') {
    // If it's an object format, try to convert to array
    dataArray = Object.values(data);
  } else {
    throw new Error("Invalid data format received from contract");
  }

  console.log("Parsed data array:", dataArray);

  if (dataArray.length < 7) {
    console.warn(`Expected 7 values but got ${dataArray.length}. Data may not be ready yet.`);
    return { handles: [], timestampMs: Date.now() };
  }

  try {
    // Contract returns: q1, q2, q3, q4, q5, index, timestamp
    // We need first 6 as handles, last one as timestamp
    const [h1, h2, h3, h4, h5, h6, timestampRaw] = dataArray.slice(0, 7);

    console.log("Extracted values:", { h1, h2, h3, h4, h5, h6, timestampRaw });

    const handles = [h1, h2, h3, h4, h5, h6].map(toHexString);
    console.log("Converted handles:", handles);

    const timestampSeconds =
      typeof timestampRaw === "bigint" ? Number(timestampRaw) :
      typeof timestampRaw === "string" ? parseInt(timestampRaw) :
      Number(timestampRaw);

    const timestampMs = Number.isFinite(timestampSeconds)
      ? timestampSeconds * 1000
      : Date.now();

    console.log("Final result:", { handles, timestampMs });

    return { handles, timestampMs };
  } catch (error) {
    console.error("Error parsing encrypted survey data:", error);
    throw new Error("Failed to parse encrypted survey data. The data format may be unexpected.");
  }
}

function readDecryptedValue(result: Record<string, unknown>, handle: string): number {
  const variants = [
    handle,
    handle.toLowerCase(),
    handle.toUpperCase(),
    handle.replace(/^0x/, ""),
    handle.replace(/^0x/, "").toLowerCase(),
  ];
  for (const key of variants) {
    if (key in result) {
      const value = result[key];
      if (typeof value === "number") return value;
      if (typeof value === "bigint") return Number(value);
      if (typeof value === "string") {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
  }
  throw new Error("The relayer did not return a decrypted value for one of the handles. Please retry in a few seconds.");
}

export default function App() {
  const { isConnected, address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const provider = typeof window !== "undefined" ? (window.ethereum as ethers.Eip1193Provider) : undefined;
  const signatureStorage = useMemo(() => new GenericStringInMemoryStorage(), []);

  const { instance, status: fhevmStatus, error: fhevmError } = useFhevm({
    provider,
    chainId,
    enabled: isConnected && !!provider,
  });

  const { submitSurvey, refetchEncryptedSurvey } = useMentalHealthSurvey();

  const [artifacts, setArtifacts] = useState<EncryptionArtifacts | null>(null);
  const [decrypted, setDecrypted] = useState<DecryptedSurvey | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [encryptionStatus, setEncryptionStatus] = useState<string | null>(null);
  const [decryptionStatus, setDecryptionStatus] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const encryptStartTime = useRef<number | null>(null);
  const decryptStartTime = useRef<number | null>(null);

  // Monitor long-running encryption state to prevent UI freeze
  useEffect(() => {
    if (isEncrypting) {
      encryptStartTime.current = Date.now();
    } else {
      encryptStartTime.current = null;
    }
  }, [isEncrypting]);

  // Force reset state if encryption takes longer than 5 minutes
  useEffect(() => {
    if (isEncrypting && encryptStartTime.current) {
      const timeoutId = setTimeout(() => {
        const elapsed = Date.now() - encryptStartTime.current!;
        if (elapsed > 300000) { // 5 minutes
          console.warn("Encryption operation timed out after 5 minutes, resetting state");
          setIsEncrypting(false);
          setEncryptionStatus(null);
          setSubmitError("Operation timed out. Please refresh the page and try again.");
        }
      }, 300000);

      return () => clearTimeout(timeoutId);
    }
  }, [isEncrypting]);

  // Monitor long-running decryption state
  useEffect(() => {
    if (isDecrypting) {
      decryptStartTime.current = Date.now();
    } else {
      decryptStartTime.current = null;
    }
  }, [isDecrypting]);

  // Force reset state if decryption takes longer than 5 minutes
  useEffect(() => {
    if (isDecrypting && decryptStartTime.current) {
      const timeoutId = setTimeout(() => {
        const elapsed = Date.now() - decryptStartTime.current!;
        if (elapsed > 300000) { // 5 minutes
          console.warn("Decryption operation timed out after 5 minutes, resetting state");
          setIsDecrypting(false);
          setDecryptionStatus(null);
          setDecryptError("Decryption timed out. Please try again.");
        }
      }, 300000);

      return () => clearTimeout(timeoutId);
    }
  }, [isDecrypting]);

  const fheStatusMessage = useMemo(() => {
    if (fhevmError) {
      return fhevmError.message;
    }
    if (!isConnected) {
      return "Connect your wallet to initialize the FHE engine.";
    }
    if (fhevmStatus !== "ready") {
      return `FHE engine status: ${fhevmStatus}`;
    }
    return null;
  }, [fhevmStatus, fhevmError, isConnected]);

  const handleCancel = () => {
    console.log("Cancelling encryption operation");
    setIsEncrypting(false);
    setEncryptionStatus(null);
    setSubmitError("Operation cancelled by user.");
  };

  const handleRetry = async () => {
    console.log("Retrying submission...");
    setSubmitError(null);
    setEncryptionStatus("Retrying submission...");
    // Here you can add additional retry logic, such as refreshing data or reinitializing
  };

  const handleCancelDecrypt = () => {
    console.log("Cancelling decryption operation");
    setIsDecrypting(false);
    setDecryptionStatus(null);
    setDecryptError("Decryption cancelled by user.");
  };

  const handleSubmit = async (responses: SurveyResponses) => {
    if (!instance || !address) {
      const message =
        !isConnected
          ? "Connect your wallet to submit encrypted survey data."
          : "FHE engine is not ready yet. Please wait for initialization.";
      setSubmitError(message);
      throw new Error(message);
    }

    setSubmitError(null);
    setEncryptionStatus("Encrypting responses with fully homomorphic encryption…");
    setIsEncrypting(true);
    setDecrypted(null);
    setDecryptionStatus(null);

    try {
      const contractAddress = CONTRACT_CONFIG.address;
      const userAddress = address as `0x${string}`;

      // Batch encryption: encrypt all values at once to reduce network requests
      const input = instance.createEncryptedInput(contractAddress, userAddress);
      input.add32(responses.q1);
      input.add32(responses.q2);
      input.add32(responses.q3);
      input.add32(responses.q4);
      input.add32(responses.q5);

      const encrypted = await input.encrypt();

      const encryptedValues = [
        {
          handle: toHexString(encrypted.handles[0]),
          proof: toHexString(encrypted.inputProof),
        },
        {
          handle: toHexString(encrypted.handles[1]),
          proof: toHexString(encrypted.inputProof),
        },
        {
          handle: toHexString(encrypted.handles[2]),
          proof: toHexString(encrypted.inputProof),
        },
        {
          handle: toHexString(encrypted.handles[3]),
          proof: toHexString(encrypted.inputProof),
        },
        {
          handle: toHexString(encrypted.handles[4]),
          proof: toHexString(encrypted.inputProof),
        },
      ];

      setEncryptionStatus("Submitting encrypted payload to the on-chain contract…");
      const txHash = await submitSurvey({
        q1: encryptedValues[0].handle,
        q1Proof: encryptedValues[0].proof,
        q2: encryptedValues[1].handle,
        q2Proof: encryptedValues[1].proof,
        q3: encryptedValues[2].handle,
        q3Proof: encryptedValues[2].proof,
        q4: encryptedValues[3].handle,
        q4Proof: encryptedValues[3].proof,
        q5: encryptedValues[4].handle,
        q5Proof: encryptedValues[4].proof,
      });

      if (!publicClient) {
        throw new Error("Unable to confirm transaction. Please try again after reconnecting your wallet.");
      }

      setEncryptionStatus("Waiting for transaction confirmation…");
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Check if user already has survey response after transaction confirmation
      setEncryptionStatus("Verifying survey submission…");
      let hasResponse = false;
      for (let checkAttempt = 1; checkAttempt <= 3; checkAttempt++) {
        try {
          const { data } = await refetchEncryptedSurvey();
          if (data) {
            const { handles } = parseEncryptedSurvey(data);
            if (handles.length >= 5) {
              hasResponse = true;
              break;
            }
          }
          if (checkAttempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          // Ignore check errors and continue waiting
        }
      }

      // If no response yet, wait longer for relayer to process data
      if (!hasResponse) {
        setEncryptionStatus("Waiting for relayer to process encrypted data…");
        await new Promise(resolve => setTimeout(resolve, 8000)); // Wait 8 seconds
      }

      // Add exponential backoff retry mechanism to handle relayer delays and ensure state management
      setEncryptionStatus("Fetching encrypted handles from the contract…");

      const maxRetries = 10;
      const maxTotalTime = 120000; // Maximum total wait time 2 minutes
      const startTime = Date.now();
      let lastError: Error | null = null;
      let validHandles: string[] | null = null;
      let validTimestampMs: number | null = null;
      let success = false;

      // Use Promise.race to add overall timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Operation timed out after 2 minutes. Please try again later."));
        }, maxTotalTime);
      });

      const retryPromise = (async () => {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          // Check if timed out
          if (Date.now() - startTime > maxTotalTime) {
            throw new Error("Operation timed out. Please try again later.");
          }

          try {
            console.log(`Attempt ${attempt}: Calling refetchEncryptedSurvey for address:`, address);

            // First try direct contract call, bypass wagmi hook cache issues
            let data;
            console.log(`Attempt ${attempt}: Trying direct contract call...`);
            try {
              if (publicClient && address) {
                const contractData = await publicClient.readContract({
                  address: CONTRACT_CONFIG.address,
                  abi: CONTRACT_CONFIG.abi,
                  functionName: 'getAllResponses',
                  account: address as `0x${string}`,
                });
                console.log(`Attempt ${attempt}: Direct contract call result:`, contractData);
                data = contractData;
              }
            } catch (directCallError) {
              console.warn(`Attempt ${attempt}: Direct contract call failed:`, directCallError);
            }

            // If direct call fails, try wagmi hook as fallback
            if (data === undefined) {
              console.log(`Attempt ${attempt}: Falling back to wagmi hook...`);
              const result = await refetchEncryptedSurvey();
              console.log(`Attempt ${attempt}: refetchEncryptedSurvey result:`, result);
              data = result.data;
            }

            console.log(`Attempt ${attempt}: Contract data:`, data);
            console.log(`Attempt ${attempt}: Data type:`, typeof data, Array.isArray(data) ? 'Array' : 'Not Array');

            if (data) {
              const { handles, timestampMs } = parseEncryptedSurvey(data);
              console.log(`Attempt ${attempt}: Parsed handles:`, handles);

              // Validate handle count - contract returns 7 values, we need 6 handles
              if (handles.length === 6 && handles.every(h => h && h.startsWith('0x'))) {
                setEncryptionStatus("Encrypted handles retrieved successfully.");
                validHandles = handles;
                validTimestampMs = timestampMs;
                success = true;
                return; // Success, exit loop
              }
            }

            if (attempt < maxRetries) {
              // Improved waiting strategy: longer wait for first few attempts, exponential backoff for later ones
              let delayMs: number;
              if (attempt <= 3) {
                // First 3 retries wait longer because relayer may need more time
                delayMs = 8000; // 8 seconds
              } else {
                // Later attempts use exponential backoff
                delayMs = Math.min(1000 * Math.pow(1.5, attempt - 1), 15000); // Maximum 15 seconds
              }
              setEncryptionStatus(`Waiting for relayer... (${attempt}/${maxRetries}, next retry in ${Math.round(delayMs/1000)}s)`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
              console.error("All retry attempts failed. Last contract data:", data);

              // Final check: try to confirm if user has survey response
              console.log("Final check: Attempting to verify if user has survey response...");
              try {
                const hasResponseCheck = await refetchEncryptedSurvey();
                console.log("Final hasResponse check result:", hasResponseCheck);
              } catch (finalCheckError) {
                console.error("Final check also failed:", finalCheckError);
              }

              throw new Error("Unable to retrieve encrypted handles after all retry attempts. This may be due to:\n• Relayer network congestion\n• Blockchain network delays\n• FHE computation processing time\n\nThe encrypted data was successfully submitted to the blockchain. Please try again in 2-3 minutes. If the issue persists, check your transaction on Etherscan to confirm it was successful.");
            }
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxRetries) {
              // Use exponential backoff even when errors occur
              const delayMs = Math.min(1000 * Math.pow(1.5, attempt - 1), 10000);
              setEncryptionStatus(`Retrying after error... (${attempt}/${maxRetries}, next retry in ${Math.round(delayMs/1000)}s)`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
          }
        }

        // If loop ends normally but no success, throw error
        if (!success) {
          throw lastError || new Error("Failed to retrieve encrypted handles after all retries.");
        }
      })();

      // Wait for retry to complete or timeout
      await Promise.race([retryPromise, timeoutPromise]);

      if (!validHandles || !validTimestampMs) {
        throw new Error("Unexpected error: handles not available after successful operation.");
      }

      const handles = validHandles;
      const timestampMs = validTimestampMs;

      const payloadPreview = encodePreview(responses);
      setArtifacts({ handles, payloadPreview, timestamp: timestampMs });
      setEncryptionStatus("Encrypted responses stored on-chain. You can now request decryption.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit encrypted survey responses.";
      setSubmitError(message);
      setEncryptionStatus(null);
      throw new Error(message);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleDecrypt = async () => {
    if (!instance || !address) {
      setDecryptError(
        !isConnected
          ? "Connect your wallet before requesting decryption."
          : "FHE engine is not ready yet."
      );
      return;
    }

    setDecryptError(null);
    setDecryptionStatus("Preparing decryption request…");
    setIsDecrypting(true);

    try {
      let currentArtifacts = artifacts;
      if (!currentArtifacts || currentArtifacts.handles.length === 0) {
        const { data } = await refetchEncryptedSurvey();
        if (!data) {
          throw new Error("No encrypted survey data found. Please submit your responses first.");
        }
        const parsed = parseEncryptedSurvey(data);
        currentArtifacts = {
          handles: parsed.handles,
          payloadPreview: artifacts?.payloadPreview ?? "",
          timestamp: parsed.timestampMs,
        };
        setArtifacts(currentArtifacts);
      }

      const handles = currentArtifacts.handles;
      if (!handles.length) {
        throw new Error("No encrypted handles available for decryption.");
      }

      if (!provider) {
        throw new Error("Browser provider unavailable. Please ensure MetaMask (or another wallet) is installed.");
      }

      const browserProvider = new BrowserProvider(provider);
      setDecryptionStatus("Requesting EIP-712 signature for decryption…");
      const signer = await browserProvider.getSigner();

      const signature = await FhevmDecryptionSignature.loadOrSign(
        instance,
        [CONTRACT_CONFIG.address],
        signer,
        signatureStorage
      );

      if (!signature) {
        throw new Error("Unable to generate a decryption signature. Please approve the signature request and try again.");
      }

      setDecryptionStatus("Calling the FHEVM relayer to decrypt your responses…");

      // Add decryption retry mechanism using exponential backoff strategy
      const decryptMaxRetries = 5;
      let decryptResult: Record<string, unknown> | null = null;
      let decryptError: Error | null = null;

      for (let decryptAttempt = 1; decryptAttempt <= decryptMaxRetries; decryptAttempt++) {
        try {
          const delayMs = Math.min(1000 * Math.pow(1.3, decryptAttempt - 1), 8000); // Maximum 8 seconds
          setDecryptionStatus(`Decrypting responses... (attempt ${decryptAttempt}/${decryptMaxRetries})`);

          const result = await instance.userDecrypt(
            handles.map((handle) => ({
              handle,
              contractAddress: CONTRACT_CONFIG.address,
            })),
            signature.privateKey,
            signature.publicKey,
            signature.signature.replace(/^0x/, ""),
            signature.contractAddresses,
            signature.userAddress,
            signature.startTimestamp.toString(),
            signature.durationDays.toString()
          );

          // Validate decryption result
          const valueMap = result as Record<string, unknown>;
          const testValues = handles.map((handle) => readDecryptedValue(valueMap, handle));

          if (testValues.length >= 5) {
            decryptResult = valueMap;
            break;
          }
        } catch (error) {
          decryptError = error instanceof Error ? error : new Error(String(error));
          if (decryptAttempt < decryptMaxRetries) {
            const delayMs = Math.min(1000 * Math.pow(1.3, decryptAttempt - 1), 8000);
            setDecryptionStatus(`Retrying decryption... (${decryptAttempt}/${decryptMaxRetries}, next retry in ${Math.round(delayMs/1000)}s)`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }

      if (!decryptResult) {
        throw decryptError || new Error("Failed to decrypt responses after multiple attempts. The relayer may be experiencing delays.");
      }

      const values = handles.map((handle) => readDecryptedValue(decryptResult, handle));

      if (values.length < HANDLE_COUNT) {
        throw new Error("Incomplete decrypted data returned by the relayer. Please retry.");
      }

      const [q1, q2, q3, q4, q5, stressIndexValue] = values.map((value) =>
        Math.round(Number(value))
      );
      const responses: SurveyResponses = { q1, q2, q3, q4, q5 };
      const stressIndex = Number.isFinite(stressIndexValue)
        ? stressIndexValue
        : calculateStressIndex(responses);

      setDecrypted({
        ...responses,
        stressIndex,
        timestamp: currentArtifacts.timestamp ?? Date.now(),
      });
      setDecryptionStatus("Decryption complete. The plaintext metrics are now visible.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Decryption failed. Please try again.";
      setDecryptError(message);
      setDecryptionStatus(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const stats = useMemo(
    () => [
      {
        label: "Encrypted Handles",
        value: artifacts?.handles.length
          ? `${artifacts.handles.length} handles`
          : "Awaiting submission",
        icon: Lock,
      },
      {
        label: "Stress Calculations",
        value: decrypted ? `${decrypted.stressIndex}` : "Pending",
        icon: Activity,
      },
      {
        label: "Wallet",
        value: isConnected && address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Disconnected",
        icon: ShieldCheck,
      },
    ],
    [artifacts, decrypted, isConnected, address]
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <GradientMesh />
      <Header>
        <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
      </Header>
      <main className="relative z-10">
        <HeroBanner stats={stats} />
        <div className="mx-auto mt-12 grid max-w-6xl gap-10 px-6 pb-24 md:grid-cols-[1.1fr_0.9fr]">
          <SurveyForm
            onSubmit={handleSubmit}
            encryptionPreview={artifacts?.payloadPreview ?? null}
            isWalletConnected={isConnected}
            isFheReady={fhevmStatus === "ready"}
            isEncrypting={isEncrypting}
            statusMessage={encryptionStatus ?? fheStatusMessage}
            submitError={submitError}
            onCancel={handleCancel}
            onRetry={handleRetry}
          />
          <ResultsPanel
            onDecrypt={handleDecrypt}
            decrypted={decrypted}
            isWalletConnected={isConnected}
            handles={artifacts?.handles ?? []}
            isDecrypting={isDecrypting}
            decryptError={decryptError}
            statusMessage={decryptionStatus ?? fheStatusMessage ?? encryptionStatus ?? undefined}
            onCancelDecrypt={handleCancelDecrypt}
          />
        </div>
        <FeatureGrid />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}

