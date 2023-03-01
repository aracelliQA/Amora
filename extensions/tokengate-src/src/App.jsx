import { useEffect, useState, useCallback, useMemo } from "react";
import { Tokengate } from "@shopify/tokengate";
import styled from "@emotion/styled";
import { useEvaluateGate } from "./useEvaluateGate";
import useWebSocket from "react-use-websocket";

const getGate = () => window.myAppGates?.[0] || {};

const _App = () => {
  const { requirements, reaction } = getGate();
  const [connectedWallet, setConnectedWallet] = useState(false);
  const { isLocked, unlockingTokens, evaluateGate } = useEvaluateGate();
  const [socketUrl, setSocketUrl] = useState('wss://echo.websocket.org');
  const Button = styled.button`
    color: #fff;
    border: none;
    background-color: #292929;
    padding: 8px 16px;
    border-radius: 8px;
    margin: 24px auto 0;
    display: block;
    text-transform: uppercase;
    cursor: pointer;
  `;
  useEffect(() => {}, []);

  const { lastMessage } = useWebSocket(socketUrl, {
    onMessage: (message) => console.log(message)
  });

  useMemo(() => {
    if (socketUrl) {
      if (lastMessage) console.log(lastMessage);
    }
  }, [socketUrl]);

  const handleConnection = useCallback(async () => {
    const response = await fetch(
      `https://8549-45-188-121-110.sa.ngrok.io/public/signin`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );

    const json = await response.json();

    setSocketUrl(json.webSocket);
    console.log(json);
  }, []);

  return (
    <Tokengate
      isConnected={false}
      connectButton={
        <Button onClick={handleConnection}>
          {connectedWallet ? "Disconnect wallet" : "Connect Wallet"}
        </Button>
      }
      isLoading={false}
      requirements={requirements}
      reaction={reaction}
      isLocked={isLocked}
      unlockingTokens={unlockingTokens}
    />
  );
};

export const App = () => {
  return <_App />;
};
