import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../shopify.js";
import { myAppMetafieldNamespace, myAppId } from "./constants.js";
import { createAutomaticDiscount } from "./create-discount.js";

const CREATE_GATE_CONFIGURATION_MUTATION = `
  mutation createGateConfiguration($name: String!, $startDate: String!, $endDate: String, $redemptionsLimit: String!, $requirements: String!, $reaction: String!) {
    gateConfigurationCreate(input: {
        name: $name,
        metafields: [{
          namespace: "${myAppMetafieldNamespace}",
          key: "requirements",
          type: "json",
          value: $requirements
        },
        {
          namespace: "${myAppMetafieldNamespace}",
          key: "startDate",
          type: "single_line_text_field",
          value: $startDate
        },
        {
          namespace: "${myAppMetafieldNamespace}",
          key: "endDate",
          type: "single_line_text_field",
          value: $endDate
        },
        {
          namespace: "${myAppMetafieldNamespace}",
          key: "redemptionsLimit",
          type: "single_line_text_field",
          value: $redemptionsLimit
        },
        {
          namespace: "${myAppMetafieldNamespace}",
          key: "reaction",
          type: "json",
          value: $reaction
        }],
        appId: "${myAppId}"
      }) {
      gateConfiguration {
        id
        name
        createdAt
        updatedAt
        metafields(namespace: "${myAppMetafieldNamespace}", first: 10) {
          nodes {
            key
            value
            namespace
            type
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CREATE_GATE_SUBJECT_MUTATION = `
  mutation createGateSubject ($gateConfigurationId: ID!, $subject: ID!){
    gateSubjectCreate(input: {
      gateConfigurationId: $gateConfigurationId,
      active: true,
      subject: $subject
    }) {
      gateSubject {
        id
        configuration {
          id
          name
          requirements: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "requirements") {
              value
          }
          reaction: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "reaction") {
              value
          }
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_GATE_SUBJECT_MUTATION = `
  mutation updateGateSubject ($gateConfigurationId: ID!, $id: ID!){
    gateSubjectUpdate(input: {
      gateConfigurationId: $gateConfigurationId,
      id: $id
    }) {
      gateSubject {
        id
        configuration {
          id
          name
          requirements: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "requirements") {
              value
          }
          reaction: metafield(namespace: "${myAppMetafieldNamespace}",
            key: "reaction") {
              value
          }
          createdAt
          updatedAt
        }
        createdAt
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCTS_QUERY = `
query retrieveProducts ($queryString: String!, $first: Int!){
  products(query: $queryString, first: $first) {
    nodes {
      id
      gates {
        id
        active
      }
    }
  }
}
`;

const PRODUCTS_QUERY_BY_COLLECTION = `
query nodes($ids: [ID!]!) {
  nodes(ids: $ids) {
    ...on Collection {
      id
      products(first: 50) {
        edges {
          node {
            id
            gates {
              id
              active
            }
          }
        }
      }
    }
  }
}
`;

export default async function createGate({
  session,
  name,
  startDate,
  endDate,
  redemptionsLimit,
  discountType,
  discount,
  segment,
  productGids,
  collectionGids,
  type,
}) {
  const client = new shopify.api.clients.Graphql({ session });

  const segmentConditions = segment.map((address) => {
    return {
      name: `Gate for ${address.slice(0, 5)}`, // Replace with your gate name
      conditionsDescription: "Any token", // Replace with your condition description
      contractAddress: address,
      imageUrl: "https://placekitten.com/g/200/200", // Replace with NFT collection image URL
    };
  });

  const gateConfigurationRequirements = {
    logic: "ANY",
    conditions: segmentConditions,
  };

  const gateConfigurationReaction = {
    name: name,
    type: "discount",
    discount: {
      type: discountType,
      value: discount,
    },
  };

  try {
    const createGateResponse = await client.query({
      data: {
        query: CREATE_GATE_CONFIGURATION_MUTATION,
        variables: {
          name,
          startDate,
          endDate,
          redemptionsLimit,
          requirements: JSON.stringify(gateConfigurationRequirements),
          reaction: JSON.stringify(gateConfigurationReaction),
        },
      },
    });
    const gateConfiguration =
      createGateResponse.body.data.gateConfigurationCreate.gateConfiguration;
    
    const gateConfigurationId = gateConfiguration.id;

    createAutomaticDiscount(client, gateConfiguration);

    if (productGids.length === 0 && collectionGids === 0) {
      return;
    }

    let products = [];

    if(type === "products"){
      const retrieveProductsResponse = await client.query({
        data: {
          query: PRODUCTS_QUERY,
          variables: {
            queryString: generateProductsQueryString(productGids),
            first: 100,
          },
        },
      });
      products = retrieveProductsResponse.body.data.products.nodes;
    }else if(type === "collections"){
      const retrieveProductsByCollectionResponse = await client.query({
        data: {
          query: PRODUCTS_QUERY_BY_COLLECTION,
          variables: {
            ids: collectionGids,
          },
        },
      });
      console.log("Query response", retrieveProductsByCollectionResponse.body.data.nodes[0].products.edges);
      products = retrieveProductsByCollectionResponse.body.data.nodes[0].products.edges;
    }else {
      return;
    }
    
    for (let product of products) {
      if (type === "collections")
        product = product.node;
      if (product.gates.length > 0) {
        const activeGateSubjectId = product.gates[0].id;
        await client.query({
          data: {
            query: UPDATE_GATE_SUBJECT_MUTATION,
            variables: {
              gateConfigurationId,
              id: activeGateSubjectId,
            },
          },
        });
      } else {
        await client.query({
          data: {
            query: CREATE_GATE_SUBJECT_MUTATION,
            variables: {
              gateConfigurationId,
              subject: product.id,
            },
          },
        });
      }
    }
    return createGateResponse;
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(
        `${error.message}\n${JSON.stringify(error.response, null, 2)}`
      );
    } else {
      throw error;
    }
  }
}

const generateProductsQueryString = (productGids) => {
  return productGids
    .map((productGid) => {
      const id = productGid.split("/").pop();
      return `(id:${id})`;
    })
    .join(" OR ");
};
