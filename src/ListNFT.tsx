import React, { useState, useEffect } from "react";
import { parseEther, Address } from "viem";
import {
  useAccount,
  useWriteContract,
  useReadContract,
  useReadContracts,
  useAccountEffect,
} from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { BASE_URL, NFT_ADDRESS, NFT_MARKET_ADDRESS } from "./assets/config";
import { config } from "./wagmi";
import NFT_MARKET_ABI from "./abi/Market.json";
import NFT_ABI from "./abi/PixelBirds.json";
import {
  useReadAllListedNFTS,
  useReadNumOfNFTSContractStore,
} from "./utlis/store";

const ListNFT = () => {
  const { address, isConnected } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [price, setPrice] = useState("");
  const { data: transactionHash, writeContractAsync } = useWriteContract();
  const priceInWei = parseEther(price);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [ownedNFTs, setOwnedNFTs] = useState<string[]>([]);
  const { trigger: triggerToReadNumOfNFTSContract } =
    useReadNumOfNFTSContractStore();
  const {
    trigger: triggerToReadAllListedNFTS,
    triggerUpdate: updateAllListedNFTS,
  } = useReadAllListedNFTS();

  useAccountEffect({
    onDisconnect() {
      setStatusMessage("");
    },
  });

  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalanceOfNFTs,
  } = useReadContract({
    // blockTag: "latest",
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  const {
    data: NFTIds,
    isLoading: isNFTIdsLoading,
    refetch: refetchNFTsByIndex,
  } = useReadContracts({
    // blockTag: "latest",
    contracts: balance
      ? Array(Number(balance))
          .fill(0)
          .map((_, i) => ({
            address: NFT_ADDRESS as Address,
            abi: NFT_ABI as any,
            functionName: "tokenOfOwnerByIndex",
            args: [address, i],
          }))
      : [],
  });

  const { data: isApproved } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "getApproved",
    args: [selectedTokenId],
  });

  const { data: isListed, refetch: refetchIsNFTListed } = useReadContract({
    address: NFT_MARKET_ADDRESS,
    abi: NFT_MARKET_ABI,
    functionName: "isNFTListed",
    args: [NFT_ADDRESS, selectedTokenId],
  });

  useEffect(() => {
    if (!isBalanceLoading && !isNFTIdsLoading && NFTIds) {
      const updatedNFTIds = NFTIds as { result: string; status: string }[];
      setOwnedNFTs(updatedNFTIds.map((item) => item.result.toString()));
    }
  }, [isBalanceLoading, isNFTIdsLoading, NFTIds]);

  useEffect(() => {
    return () => {
      setOwnedNFTs([]);
      setSelectedTokenId("");
    };
  }, []);

  useEffect(() => {
    const toRefetch = async () => {
      await refetchBalanceOfNFTs();
      await refetchNFTsByIndex();
    };
    toRefetch();
  }, [triggerToReadNumOfNFTSContract]);

  useEffect(() => {
    refetchIsNFTListed();
  }, [triggerToReadAllListedNFTS]);

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl mb-4">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white text-center mb-8">
          Please connect your wallet
        </h2>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatusMessage("");

    if (isListed) {
      setStatusMessage("The NFT is already listed.");
      setIsProcessing(false);
      return;
    }

    if (
      !isApproved ||
      isApproved === "0x0000000000000000000000000000000000000000"
    ) {
      try {
        const transactionHash = await writeContractAsync({
          address: NFT_ADDRESS as Address,
          abi: NFT_ABI,
          functionName: "approve",
          args: [NFT_MARKET_ADDRESS, selectedTokenId],
        });

        if (transactionHash) {
          setStatusMessage("Approval processing...");
          await waitForTransactionReceipt(config, { hash: transactionHash });
          setStatusMessage("Approval succeed, listing...");
        }
      } catch (error) {
        console.error(error);
        setStatusMessage("Approval failed.");
        setIsProcessing(false);
      } finally {
      }
    }

    try {
      const transactionHash = await writeContractAsync({
        address: NFT_MARKET_ADDRESS,
        abi: NFT_MARKET_ABI,
        functionName: "listNFT",
        args: [NFT_ADDRESS, selectedTokenId, priceInWei],
      });

      if (transactionHash) {
        setStatusMessage("Listing your NFT...");
        await waitForTransactionReceipt(config, { hash: transactionHash }).then(
          (res) => {
            if (res.status === "success") {
              updateAllListedNFTS();
            }
          }
        );
      }
    } catch (error) {
      console.log(error);
      setStatusMessage("List failed.");
    } finally {
      setStatusMessage("Your NFT is listed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl mb-4">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
        List Your NFT
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="nftSelect"
            className="block text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            Select NFT
          </label>
          <select
            id="nftSelect"
            className="bg-gray-50 border border-gray-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={selectedTokenId}
            onChange={(e) => setSelectedTokenId(e.target.value)}
            required
          >
            <option value="">Select an NFT</option>
            {ownedNFTs.map((nft) => (
              <option key={nft} value={nft}>
                Token ID: {nft}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            Price ($OC)
          </label>
          <input
            id="price"
            type="text"
            className="bg-gray-50 border border-gray-300 text-slate-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={price}
            placeholder="10.0"
            onChange={(e) => setPrice(e.target.value)}
            required
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={
            isProcessing || ownedNFTs.length === 0 || (isListed as boolean)
          }
          className={`w-full font-bold py-2 px-4 rounded-sm focus:outline-hidden focus:shadow-outline ${isProcessing || ownedNFTs.length === 0 || isListed ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
        >
          {isProcessing
            ? "Listing..."
            : ownedNFTs.length === 0
              ? "No NFTs to List"
              : isListed
                ? "NFT Already Listed"
                : "List NFT"}
        </button>
        {statusMessage && (
          <div className="text-slate-900 dark:text-white text-balance">
            {statusMessage}
            {transactionHash && (
              <a
                href={`${BASE_URL}tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                View transaction
              </a>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default ListNFT;
