import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { localhost, sepolia } from "wagmi/chains";

const projectId =
  (import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined)?.trim() ||
  "persona-shard-dev";

const sepoliaRpc =
  (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined)?.trim() ||
  "https://1rpc.io/sepolia";

export const config = getDefaultConfig({
  appName: "Persona Shard",
  projectId,
  chains: [sepolia, localhost],
  ssr: false,
  transports: {
    [sepolia.id]: http(sepoliaRpc, {
      timeout: 30000, // 30 second timeout
      retryCount: 3,
      retryDelay: 1000,
    }),
    [localhost.id]: http("http://127.0.0.1:8545", {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
});
