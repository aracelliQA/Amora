import { createHmac } from "crypto";
import { XummSdk } from "xumm-sdk";
import cors from "cors";

import { getContractAddressesFromGate } from "./api/gates.js";

export function configurePublicApi(app) {
  // this should be limited to app domains that have your app installed
  const corsOptions = {
    origin: "*",
  };

  // Configure CORS to allow requests to /public from any origin
  // enables pre-flight requests
  app.options("/public/*", cors(corsOptions));

  app.get("/public/signin", cors(corsOptions), async (_req, res) => {
    const requestPayload = {
      txjson: {
        TransactionType: "SignIn",
      }
    };

    const xummSdk = new XummSdk(
      "bbf0dceb-5c4e-4f42-b4b3-dfc7896f78fe",
      "6b2f451d-2cd3-4791-9bc4-a574d22bf537"
    );
    try {
      const payload = await xummSdk.payload.createAndSubscribe(
        requestPayload,
        (event) => {
          console.log("Payload event", event.data);
          if (Object.keys(event.data).indexOf("signed") > -1) {
            return event.data;
          }
        }
      );

      console.log("url", payload.created.refs.qr_png);
      console.log('payload', {payload})
      console.log("Pushed", payload.created.pushed);

      const resolvedRequest = await payload.resolved;

      console.log({ resolvedRequest });

      if (resolvedRequest.signed == false) {
        console.log("user not signed");
      } else {
        console.log("signed");
        const result = await xummSdk.payload.get(
          resolvedRequest.payload_uuidv4
        );
        console.log("user_token", result);
      }
    } catch (e) {
      console.log(e);
    }
  });

  app.post("/public/gateEvaluation", cors(corsOptions), async (req, res) => {
    // evaluate the gate, message, and signature
    const { shopDomain, productGid, address, gateConfigurationGid } = req.body;

    if (!address.address) {
      res.status(403).send("No wallet found");
      return;
    }

    // not shown: verify the content of the message

    // retrieve relevant contract addresses from gates
    const requiredContractAddresses = await getContractAddressesFromGate({
      shopDomain,
      productGid,
    });

    console.log({ requiredContractAddresses });

    // now lookup nfts
    const unlockingTokens = await retrieveUnlockingTokens(
      address,
      requiredContractAddresses
    );

    if (unlockingTokens.length === 0) {
      res.status(403).send("No unlocking tokens");
      return;
    }

    const payload = {
      id: gateConfigurationGid,
    };

    const response = { gateContext: [getHmac(payload)], unlockingTokens };
    res.status(200).send(response);
  });
}

function getHmac(payload) {
  const hmacMessage = payload.id;
  const hmac = createHmac("sha256", "secret-key");
  hmac.update(hmacMessage);
  const hmacDigest = hmac.digest("hex");
  return {
    id: payload.id,
    hmac: hmacDigest,
  };
}

function retrieveUnlockingTokens(address, contractAddresses) {
  // this could be some lookup against some node or a 3rd party service like Alchemy

  /*async function getTokens() {
    const client = new xrpl.Client("wss://xrplcluster.com/")
    await client.connect()
    const nfts = await client.request({
      method: "account_nfts",
      account: "rDnHqD11jB9HdFx3YmHTbQc8GScDd8BQfM"
    })
    console.log('\nNFTs:\n ' + JSON.stringify(nfts,null,2))
    results += '\nNFTs:\n ' + JSON.stringify(nfts,null,2)
    document.getElementById('standbyResultField').value = results
    client.disconnect()
  } //End of getTokens()*/

  return Promise.resolve([
    {
      name: "CryptoPunk #1719",
      imageUrl:
        "https://storage.cloud.google.com/shopify-blockchain-development/images/punk1719.png",
      collectionName: "CryptoPunks",
      collectionAddress: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
    },
  ]);
}
