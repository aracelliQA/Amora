# Amora - Shopify app for token-gated campaigns using XRPL 

Amora is a Shopify App that allows merchants to create token-gated campaings using XLS-20 NFT to reward customers and increase loyalty. Merchants will set up their token-gated campaigns from the Shopify dashboard selecting an NFT or a group of NFTs minted in the XRPL using whatever marketplace that supports XLS-20, for example: Sologenic and XRP.CAFE. After selecting the NFTs, merchants will select the products that they want to associate to the campaign and finally, they will select the discount percetange or value for customers that have the selected NFT on their wallets.

## [1.0.0]

### Added

- [x] Create token-gated campaigns using XLS-20 NFTTokenIds.
  - Choose the tokens that are part of the campaign.
  - Choose the products are going to be part of the campaign.
  - Setup a discount code for the unlocked wallets.
  - Create the campaign.
  - Widget in product page that shows the campaign to the customer.
  - Connect and disconnect wallet widget in the Storefront (XUMM wallet integration).
  - Automatic discount in the cart/checkout to the unlocked wallets.

### Coming soon!

- [ ] Token-gate campaign improvements
  - Choose a date to end the campaign (optional).
  - Choose a limit of redemptions (optional).

- [ ] Mint XLS-20 NFT.
  - Connect wallet in the APP dashboard to bring current NFT Tokens.
  - Mint/delete NFT Token directly in the APP dashboard.

## Tech Stack

This app combines a number of third party open-source tools:

- [Express](https://expressjs.com/) builds the backend.
- [Vite](https://vitejs.dev/) builds the [React](https://reactjs.org/) frontend.
- [React Router](https://reactrouter.com/) is used for routing. We wrap this with file-based routing.
- [React Query](https://react-query.tanstack.com/) queries the Admin API.
- [Xumm SDK](https://www.npmjs.com/package/xumm-sdk/) connects customer wallet to the storefront.

The following Shopify tools complement these third-party tools to ease app development:

- [Shopify API library](https://github.com/Shopify/shopify-node-api) adds OAuth to the Express backend. This lets users install the app and grant scope permissions.
- [App Bridge React](https://shopify.dev/apps/tools/app-bridge/getting-started/using-react) adds authentication to API requests in the frontend and renders components outside of the App’s iFrame.
- [Polaris React](https://polaris.shopify.com/) is a powerful design system and component library that helps developers build high quality, consistent experiences for Shopify merchants.
- [Custom hooks](https://github.com/Shopify/shopify-frontend-template-react/tree/main/hooks) make authenticated requests to the Admin API.
- [File-based routing](https://github.com/Shopify/shopify-frontend-template-react/blob/main/Routes.jsx) makes creating new pages easier.
- [Gates API](https://shopify.dev/docs/apps/blockchain/tokengating/build-a-tokengating-app/create-gates-admin) Create Gates using native Shopify objects.
- [Shopify Functions](https://shopify.dev/docs/api/functions) Apply dynamic discounts in Shopify storefront.


## Installing the app

### Coming soon!
- [ ] URL to install the APP in test stores
