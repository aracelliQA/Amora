import { BrowserRouter } from "react-router-dom";
import { Frame, Navigation } from "@shopify/polaris";
import Routes from "./Routes";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";


export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <Frame
              navigation={
                <Navigation location="/">
                  <Navigation.Section
                    items={[
                      {
                        url: "/",
                        label: "NFTs",
                      },
                      {
                        url: "/campaigns",
                        label: "Campaigns",
                      },
                      {
                        url: "/settings",
                        label: "Settings",
                      },
                    ]}
                  />
                </Navigation>
              }
            >
            <Routes pages={pages} />
            </Frame> 
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
