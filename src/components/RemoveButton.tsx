import { useEffect, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { config } from "../wagmi";
import { NFT_MARKET_ADDRESS } from "../assets/config";
import NFT_MARKET_ABI from "../abi/Market.json";
import Modal from "./MessageModal";

const RemoveButton = ({
  nft,
  onRemoveSuccess,
}: {
  nft: any;
  onRemoveSuccess: (nft: any) => void;
}) => {
  // const { address } = useAccount();
  const {
    writeContractAsync,
    data: hash,
    error,
    isPending,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [transactionHash, setModaltransactionHash] = useState("");

  const showModal = (
    title: string,
    message: string,
    transactionHash: string
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModaltransactionHash(transactionHash);
    setIsModalOpen(true);
  };

  const handleRemove = async () => {
    try {
      showModal("Remove NFT", "Removeing NFT...", "");
      const removeTx = await writeContractAsync({
        address: NFT_MARKET_ADDRESS,
        abi: NFT_MARKET_ABI,
        functionName: "unlistNFT",
        args: [nft.contract, nft.tokenId],
      });

      showModal("Remove NFT", "Removing, it may take few minutes.", removeTx);
      await waitForTransactionReceipt(config, { hash: removeTx });
      showModal("Remove NFT", "NFT remove successful", removeTx);
    } catch (error) {
      setIsModalOpen(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      onRemoveSuccess(nft);
    }
  }, [isSuccess, nft, onRemoveSuccess]);

  let buttonText = "Remove";
  let buttonClass = "bg-red-500 hover:bg-red-600 text-white";
  if (isPending || isConfirming) {
    buttonText = "Loading...";
    buttonClass = "bg-gray-500 text-white cursor-not-allowed";
  } else if (isSuccess) {
    buttonText = "Success!";
    buttonClass = "bg-green-500 text-white";
  } else if (error) {
    buttonText = "Fail";
    buttonClass = "bg-red-500 text-white";
  }

  return (
    <>
      <button
        onClick={handleRemove}
        disabled={isPending || isConfirming}
        className={`w-full bg-red-500 text-white font-medium py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-200 ${buttonClass}`}
      >
        {buttonText}
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        transactionHash={transactionHash}
      />
    </>
  );
};

export default RemoveButton;
