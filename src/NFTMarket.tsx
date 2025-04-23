import { useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import { formatEther } from "viem";
import { NFT_MARKET_ADDRESS } from "./assets/config";
import NFT_MARKET_ABI from "./abi/Market.json";
import NFTItem from "./NFTItem";
import { useReadAllListedNFTS } from "./utlis/store";

const NFTList = () => {
  const [nfts, setNfts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 3;
  const [isPrevPaginationDisabled, setIsPrevPaginationDisabled] =
    useState(false);
  const [isNextPaginationDisabled, setIsNextPaginationDisabled] =
    useState(true);
  const { trigger: triggerToReadAllListedNFTS } = useReadAllListedNFTS();

  const {
    data,
    isError,
    isLoading,
    refetch: refetchAllListedNFTS,
  } = useReadContract({
    address: NFT_MARKET_ADDRESS,
    abi: NFT_MARKET_ABI,
    functionName: "getAllListedNFTs",
    args: [BigInt(currentPage * pageSize), BigInt(pageSize)],
  });

  const { data: numOfTotalListedNFTS } = useReadContract({
    address: NFT_MARKET_ADDRESS,
    abi: NFT_MARKET_ABI,
    functionName: "getTotalListedNFTs",
  });

  useEffect(() => {
    if (data && Array.isArray(data) && data.length === 5) {
      const [nftContracts, tokenIds, sellers, prices, listedTime] = data;
      const formattedNFTs = nftContracts.map(
        (contract: any, index: string | number) => ({
          contract,
          tokenId: tokenIds[index],
          seller: sellers[index],
          price: formatEther(prices[index]),
          listedTime: listedTime[index],
        })
      );
      formattedNFTs.reverse();
      setNfts(formattedNFTs);
    }
  }, [data]);

  useEffect(() => {
    setIsPrevPaginationDisabled(currentPage === 0 ? true : false);
    setIsNextPaginationDisabled(
      Number(numOfTotalListedNFTS) <= (currentPage + 1) * pageSize
        ? true
        : false
    );
  }, [numOfTotalListedNFTS, currentPage]);

  useEffect(() => {
    refetchAllListedNFTS();
  }, [triggerToReadAllListedNFTS]);

  return (
    <div>
      <div className="bg-white dark:bg-slate-800 rounded-lg px-6 py-8 ring-1 ring-slate-900/5 shadow-xl">
        {isLoading ? (
          <div className="text-center text-gray-600 dark:text-gray-100">
            Loading...
          </div>
        ) : isError ? (
          <div className="text-center text-gray-600 dark:text-gray-100">
            Fail to load NFT list
          </div>
        ) : (
          <NFTItem nfts={nfts} />
        )}
        <div className="mt-6 flex justify-center">
          <span className="mx-3 text-slate-900 dark:text-gray-300 text-sm">
            Page: {currentPage + 1}
          </span>
          <button
            className={`px-4 py-1 mx-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-900 border border-gray-500 text-slate-900 dark:text-white hover:text-white text-xs rounded-lg transition-colors duration-200 ${isPrevPaginationDisabled ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}`}
            disabled={isPrevPaginationDisabled}
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          >
            Previous
          </button>
          <button
            className={`px-4 py-1 mx-1 bg-gray-50 dark:bg-gray-800 hover:bg-gray-900 border border-gray-500 text-slate-900 dark:text-white hover:text-white text-xs rounded-lg transition-colors duration-200 ${isNextPaginationDisabled ? "opacity-50 cursor-not-allowed" : "hover:cursor-pointer"}`}
            disabled={isNextPaginationDisabled}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NFTList;
