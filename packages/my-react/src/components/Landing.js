import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  useDisclosure,
  Avatar,
  WrapItem,
  Alert,
  AlertIcon,
  Spinner,
  ModalCloseButton,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

import LoremIpsum from "react-lorem-ipsum";
import { useEffect, useState } from "react";

function Landing() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [account, setAccount] = useState(null);
  const [logged, setLogged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      setTimeout(() => {
        console.log("Redirect");
        navigate("/owner/overview");
      }, 2000);
    }
  }, [account, navigate]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert(`please install zCloak wallet`);
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      });

      if (accounts !== 0) {
        setLogged(true);
        setAccount(accounts[0]);
        return (
          <ModalContent>
            <ModalHeader fontSize={24} color="#333" textAlign="center">
              Welcome! 🎆
            </ModalHeader>
            <ModalBody>
              <Alert status="success" borderRadius={9}>
                <AlertIcon />
                <h2 className="text-slate-700 text-md">
                  You've been connected to your wallet ✨
                </h2>
              </Alert>
            </ModalBody>
            <ModalFooter className="flex items-center justify-center gap-2">
              <div className="text-gray-500">It takes a second...</div>
              <Spinner
                thickness="2px"
                speed=".9s"
                emptyColor="gray.200"
                color="green.500"
                size="md"
              />
            </ModalFooter>
          </ModalContent>
        );
      } else {
        return (
          <Modal
            isCentered
            onClose={onClose}
            isOpen={isOpen}
            motionPreset="slideInBottom"
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Modal Title</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <LoremIpsum count={2} />
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button variant="ghost">Secondary Action</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="w-full min-h-screen flex flex-col justify-center items-center relative bg-[url('/src/assets/landing-page.png')]">
        <div className="text-5xl font-bold text-white text-center drop-shadow leading-normal">
          <h1>Restore Your Account At Ease</h1>
          <h1>Experience the New Age of Social Recovery</h1>
          <h1>Your New Experience Starts Here</h1>
        </div>
        <button
          onClick={onOpen}
          className="mt-12 bg-black p-4 rounded-lg text-xl text-white  bg-indigo-600 hover:bg-indigo-700 transition font-semibold leading-tight w-100 shadow-lg shadow-indigo-600/60"
        >
          Connect Wallet
        </button>
        <div className="flex flex-col items-center justify-between gap-8">
          <h2 className="mt-32 text-gray-200 font-semibold text-2xl">
            Powered By
          </h2>
          <div className="text-gray-400 text-3xl font-bold flex items-center justify-between gap-36">
            <div>John</div>
            <div>Jomosis</div>
            <div>Logic</div>
          </div>
        </div>
      </div>

      <Modal
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        {logged ? (
          <ModalContent>
            <ModalHeader fontSize={24} color="#333" textAlign="center">
              Welcome! 🎆
            </ModalHeader>
            <ModalBody>
              <Alert status="success" borderRadius={9}>
                <AlertIcon />
                <h2 className="text-slate-700 text-md">
                  You've been connected to your wallet ✨
                </h2>
              </Alert>
            </ModalBody>
            <ModalFooter className="flex items-center justify-center gap-2">
              <div className="text-gray-500">It takes a while...</div>
              <Spinner
                thickness="2px"
                speed=".9s"
                emptyColor="gray.200"
                color="green.500"
                size="md"
              />
            </ModalFooter>
          </ModalContent>
        ) : (
          <ModalContent>
            <ModalHeader fontSize={24} color="#333" textAlign="center">
              Select Wallet ✨
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center justify-center gap-3">
                <div
                  onClick={connectWallet}
                  className="py-6 px-28 border border-slate-100 border-solid rounded-md text-xl text-slate-700 shadow-md flex items-center justify-center gap-2 cursor-pointer w-full hover:bg-slate-200 hover:border-slate-200 transition"
                >
                  <WrapItem>
                    <Avatar
                      size="sm"
                      name="Johny John"
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png"
                    />
                  </WrapItem>
                  <p className="text-md">MetaMask</p>
                </div>
                <div className="py-6 px-28 border border-slate-100 border-solid rounded-md text-xl text-slate-700 shadow-md flex items-center justify-center gap-2 cursor-pointer w-full hover:bg-slate-200 hover:border-slate-200 transition">
                  <WrapItem>
                    <Avatar
                      size="sm"
                      src="https://zcloak.network/logo_zcloak.svg"
                    />
                  </WrapItem>
                  <p className="text-md">zkID Wallet</p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={onClose}
                bg="rgb(79 70 229)"
                color="#fff"
                _hover={{
                  background: "white",
                  color: "rgb(79 70 229)",
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </>
  );
}

export default Landing;
