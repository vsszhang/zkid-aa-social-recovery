import {
  Avatar,
  IconButton,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Badge,
  Stack,
  Box,
  AbsoluteCenter,
  WrapItem,
} from "@chakra-ui/react";
import { CopyIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Outlet, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

const Owner = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [account, setAccount] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        console.log(`metamask is available`);
      } else {
        console.log(`please try again`);
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log(`found account with address`, account);
        setAccount(account);
      } else {
        alert(`no authorized account found`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatString = (inputString) => {
    const frontPart = inputString.substring(0, 6);
    const backPart = inputString.substring(inputString.length - 3);

    return `${frontPart}...${backPart}`;
  };

  return (
    <>
      <div className="flex items-center justify-between h-screen bg-black">
        <div className="flex flex-col items-center justify-center gap-3 pl-12 w-2/6 bg-gray-900 h-full">
          <Avatar
            size="lg"
            name="Metamask EOA"
            src="https://bit.ly/tioluwani-kolawole"
          />
          <h2 className="text-white font-bold text-md">Logic</h2>
          <div className=" border border-slate-200 border-solid p-3 rounded-xl flex items-center justify-center gap-2">
            {account ? (
              <p className="text-white text-md">{formatString(account)}</p>
            ) : (
              ""
            )}
            <IconButton
              colorScheme="blue"
              aria-label="Search"
              icon={<CopyIcon />}
            />
          </div>
          <Divider w="100%" m={8} />
          <div className="flex flex-col items-center justify-center gap-4 w-full">
            <NavLink
              to="/owner/overview"
              className={({ isActive }) =>
                `${
                  isActive
                    ? "text-blue-800 font-bold bg-blue-300"
                    : "text-blue-200"
                } hover:text-blue-600 py-4 px-8 w-full text-center transition text-base`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/owner/account-recovery"
              className={({ isActive }) =>
                `${
                  isActive
                    ? "text-blue-800 font-bold bg-blue-300"
                    : "text-blue-200"
                } hover:text-blue-600 py-4 px-8 w-full text-center transition text-base`
              }
            >
              Account Recovery
            </NavLink>
            <NavLink
              to="/owner/message-center"
              className={({ isActive }) =>
                `${
                  isActive
                    ? "text-blue-800 font-bold bg-blue-300"
                    : "text-blue-200"
                } hover:text-blue-600 py-4 px-8 w-full text-center transition text-base`
              }
            >
              Message Center
            </NavLink>
            <button
              className="mt-28 hover:bg-blue-900 font-bold text-blue-100 py-4 px-8 w-full transition text-xl"
              onClick={onOpen}
            >
              Switch Account 👾
            </button>
          </div>
        </div>
        <div className="bg-gray-900 w-full h-full p-12">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl h-full flex items-center justify-center">
            {/* <img src={require("../assets/overview-page.png")} alt="" /> */}
            {/* <h1 className="text-white text-6xl font-bold">This is overview.</h1> */}
            <Outlet />
          </div>
        </div>
      </div>

      <Modal
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        motionPreset="slideInBottom"
        size={"md"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize={24} color="#333" textAlign="center">
            Switch Your Account 🆔
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col items-center justify-between gap-4">
              <div className="flex items-center justify-between gap-2 w-full hover:bg-blue-100 bg-blue-50 py-4 px-6 rounded-xl shadow-md shadow-blue-200/20 cursor-pointer transition">
                <div className="flex items-center justify-center gap-2">
                  <Avatar
                    size="md"
                    name="Metamask EOA"
                    src="https://bit.ly/tioluwani-kolawole"
                  />
                  <div className="flex flex-col items-start justify-center">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-blue-900 font-bold text-md">Logic</h2>
                      <Stack direction="row">
                        <Badge colorScheme="green">Metamask EOA</Badge>
                      </Stack>
                    </div>
                    {account ? (
                      <p className="text-gray-500 text-sm">
                        {formatString(account)}
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ChevronRightIcon boxSize={6} color="gray.500" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 w-full hover:bg-blue-100 bg-blue-50 py-4 px-6 rounded-xl shadow-md shadow-blue-200/20 cursor-pointer transition">
                <div className="flex items-center justify-center gap-2">
                  <Avatar
                    size="md"
                    name="Twilight Logic"
                    src="https://bit.ly/tioluwani-kolawole"
                  />
                  <div className="flex flex-col items-start justify-center">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="text-blue-900 font-bold text-md">
                        Twilight Logic
                      </h2>
                      <Stack direction="row">
                        <Badge colorScheme="orange">owner</Badge>
                      </Stack>
                    </div>
                    <p className="text-gray-500 text-sm">0x12312312</p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ChevronRightIcon boxSize={6} color="gray.500" />
                </div>
              </div>
            </div>

            <Box position="relative" p="10" mt={24}>
              <Divider />
              <AbsoluteCenter bg="white" px="4">
                <div>or you would like to</div>
                <div>add new account?</div>
              </AbsoluteCenter>
            </Box>

            <div className="flex flex-col items-start justify-center gap-3">
              <div className="py-4 px-6 rounded-xl text-xl text-slate-700 shadow flex items-center justify-center gap-3 cursor-pointer w-full hover:bg-slate-200 hover:border-slate-200 transition">
                <WrapItem>
                  <Avatar
                    size="sm"
                    name="Johny John"
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/1200px-MetaMask_Fox.svg.png"
                  />
                </WrapItem>
                <p className="text-md">MetaMask</p>
              </div>
              <div className="py-4 px-6 rounded-xl text-xl text-slate-700 shadow flex items-center justify-center gap-2 cursor-pointer w-full hover:bg-slate-200 hover:border-slate-200 transition">
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
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Owner;
