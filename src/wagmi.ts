import { http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  chains: [sepolia],
  appName: "My NFT MARKETPLACE",
  projectId: "33fa488190a8231c49e09467ae5bc1e7",
  transports: {
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/Q2Y58_UudzYcW1UW9zM2kJ2eo0w4aSe1"
    ),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
