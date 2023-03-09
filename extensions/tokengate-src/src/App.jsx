import { useEffect, useState, useCallback, useMemo } from "react";
import { Tokengate } from "@shopify/tokengate";
import styled from "@emotion/styled";
import { useEvaluateGate } from "./useEvaluateGate";
import useWebSocket from "react-use-websocket";
import { XummModal } from "./components/XummModal/xummModal";
import Spinner from "./components/Spinner/Spinner";
const getGate = () => window.myAppGates?.[0] || {};

const _App = () => {
  const { requirements, reaction } = getGate();
  const [connectedWallet, setConnectedWallet] = useState(false);
  const { isLocked, unlockingTokens, evaluateGate } = useEvaluateGate();
  const [socketUrl, setSocketUrl] = useState("wss://echo.websocket.org");
  const [isLoading, setIsLoading] = useState(false);
  const [modalImage, setModalImage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const Button = styled.button`
    color: #fff;
    border: none;
    background-color: #292929;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 24px auto 0;
    display: block;
    text-transform: uppercase;
    text-align: center;
    cursor: pointer;
    min-width: 150px;
  `;
  useEffect(async () => {
    const checkWallet = async () => {
      if (
        localStorage.getItem("connectedWallet") &&
        localStorage.getItem("connectedWallet") != "false"
      ) {
        try {
          await evaluateGate(localStorage.getItem("connectedWallet"));
          setConnectedWallet(true)
        } catch (e) {
          throw new Error(e);
        }
      }
    };

    checkWallet();
  }, []);

  useWebSocket(socketUrl, {
    onMessage: async (message) => {
      const data = JSON.parse(message.data);
      if (data.signed) {
        setConnectedWallet(true);
        localStorage.setItem("connectedWallet", data.payload_uuidv4);
        try {
          if (data.payload_uuidv4) {
            await evaluateGate(data.payload_uuidv4);
            closeModal();
          } else {
            throw new Error("Wallet address not found");
          }
        } catch (e) {
          closeModal();
          throw new Error(e);
        }
      }
    },
  });

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleConnection = useCallback(async () => {
    if (
      localStorage.getItem("connectedWallet") &&
      localStorage.getItem("connectedWallet") != "false"
    ) {
      setIsLoading(true);
      try {
        setTimeout(async () => {
          await evaluateGate();
          setIsLoading(false);
          setConnectedWallet(false);
        }, 800);
      } catch (e) {
        throw new Error(e);
      }
      localStorage.clear();
      localStorage.setItem("connectedWallet", "false");
      return;
    }

    if (
      !(socketUrl.indexOf("xumm") > -1) ||
      localStorage.getItem("connectedWallet") == "false"
    ) {
      setIsLoading(true);
      const response = await fetch(
        `https://e62e-2804-548-c00d-ac00-4c03-9bcd-3d19-ffb0.sa.ngrok.io/public/signin`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      setIsLoading(false);
      const json = await response.json();

      setSocketUrl(json.webSocket);
      setModalImage(json.qrCode);
      openModal();
    } else {
      openModal();
    }
  }, [socketUrl]);

  return (
    <>
      <Tokengate
        isConnected={false}
        connectButton={
          <Button onClick={handleConnection}>
            {isLoading ? (
              <Spinner style={{ display: "block" }} />
            ) : connectedWallet ? (
              "Disconnect wallet"
            ) : (
              "Connect Wallet"
            )}
          </Button>
        }
        isLoading={false}
        requirements={requirements}
        reaction={reaction}
        isLocked={isLocked}
        unlockingTokens={unlockingTokens}
      />
      <XummModal
        isModalOpen={modalOpen}
        imageUrl={modalImage}
        closeModal={closeModal}
      />
    </>
  );
};

export const App = () => {
  return <_App />;
};
