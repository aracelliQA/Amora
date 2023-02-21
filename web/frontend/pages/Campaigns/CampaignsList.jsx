import { useNavigate } from "react-router-dom";
import { Page, Layout } from "@shopify/polaris";

import { TokengatesList } from "../../components/TokengatesList";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Page
      title="Token-Gated Campaigns"
      primaryAction={{
        content: "Create tokengate",
        onAction: () => {
          navigate("/campaigns/createcampaign");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <TokengatesList />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
