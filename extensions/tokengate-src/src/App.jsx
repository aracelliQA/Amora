import { useEffect, useState } from "react";
import { Tokengate } from "@shopify/tokengate";
import styled from '@emotion/styled'

const getGate = () => window.myAppGates?.[0] || {};

const _App = () => {
  const { requirements, reaction } = getGate();
  const Button = styled.button`
  color: hotpink;
`
  return (
    <Tokengate
      isConnected={false}
      connectButton={<Button>Connect your wallet</Button>}
      isLoading={false}
      requirements={requirements}
      reaction={reaction}
      isLocked={true}
      unlockingTokens={[]}
    />
  );
};

export const App = () => {
  return (
        <_App />
  );
};



