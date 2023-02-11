import React from "react";
import { useLocation } from "react-router-dom";
import { Frame, Navigation } from "@shopify/polaris";
import Routes from "../Routes";

export function AppFrame() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("../pages/**/!(*.test.[jt]sx)*.([jt]sx)");  
  const location = useLocation();
  
  return (
    <Frame
        navigation={
        <Navigation location={location.pathname}>
            <Navigation.Section
                items={[
                    {
                        url: "/",
                        label: "NFTs",
                        exactMatch: true,
                    },
                    {
                        url: "/campaigns/campaignsList",
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
  );
}