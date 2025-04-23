import { useState, useEffect } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useAccount } from "wagmi";
import { NFT_BASE_URL, BASE_URL } from "./assets/config";
import BuyButton from "./components/BuyButton";
import RemoveButton from "./components/RemoveButton";

const NFTItem = ({ nfts: initialNfts }: { nfts: any[] }) => {
  const { address, isConnected } = useAccount();
  const [nfts, setNfts] = useState(initialNfts);

  useEffect(() => {
    setNfts(initialNfts);
  }, [initialNfts]);

  const handleNFTBought = (boughtNFT: any) => {
    setNfts((prevNfts) =>
      prevNfts.filter(
        (nft) =>
          nft.contract !== boughtNFT.contract ||
          nft.tokenId.toString() !== boughtNFT.tokenId.toString()
      )
    );
  };

  const handleNFTRemove = (removeNFT: any) => {
    setNfts((prevNfts) =>
      prevNfts.filter(
        (nft) =>
          nft.contract === removeNFT.contract ||
          nft.tokenId.toString() === removeNFT.tokenId.toString()
      )
    );
  };

  const formatTimestamp = (timestamp: any) => {
    const timestampNumber = Number(timestamp.toString().replace("n", ""));
    const date = new Date(timestampNumber * 1000);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {nfts?.map((nft: any, index: number) => (
        <div
          key={index}
          className="bg-gray-100 dark:bg-slate-600 rounded-lg p-4 shadow-xl flex flex-col"
        >
          {/* Top: NFT image */}
          <div className="w-full mb-4">
            <img
              src={`${NFT_BASE_URL}${nft.tokenId}.png`}
              alt={`NFT ${nft.tokenId}`}
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Middle: NFT info */}
          <div className="grow mb-4">
            <div className="flex justify-start items-center mb-2">
              <div className="font-bold text-xl text-gray-600 dark:text-gray-100">
                PixelBirds #{nft.tokenId.toString()}
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-gray-600 dark:text-gray-100">
                Seller:
              </span>
              <div className="flex items-center">
                <span
                  className="text-sm text-gray-600 dark:text-gray-100 truncate max-w-[120px]"
                  title={nft.seller}
                >
                  {nft.seller}
                </span>
                <a
                  href={`${BASE_URL}address/${nft.seller}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <FaExternalLinkAlt size={12} />
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-sm text-gray-600 dark:text-gray-100">
                Listed:
              </span>
              <div className="flex items-center">
                <span
                  className="text-sm text-gray-600 dark:text-gray-100 truncate"
                  title={formatTimestamp(nft.listedTime)}
                >
                  {formatTimestamp(nft.listedTime)}
                </span>
              </div>
            </div>
            <div className="flex justify-end items-center mb-2">
              <span className="font-bold text-lg text-gray-600 dark:text-gray-100">
                {nft.price} $OC
              </span>
            </div>
          </div>

          {/* Bottom: Buttons */}
          {isConnected && (
            <div className="flex flex-col w-full gap-2">
              {address &&
                address.toLowerCase() !== nft.seller.toLowerCase() && (
                  <BuyButton
                    nft={nft}
                    onBuySuccess={() => handleNFTBought(nft)}
                  />
                )}
              {address &&
                address.toLowerCase() === nft.seller.toLowerCase() && (
                  <RemoveButton
                    nft={nft}
                    onRemoveSuccess={() => handleNFTRemove(nft)}
                  />
                )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default NFTItem;
