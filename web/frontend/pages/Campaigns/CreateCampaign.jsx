import { useCallback, useState, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ButtonGroup,
  Card,
  Form,
  Heading,
  Layout,
  Page,
  PageActions,
  Stack,
  TextContainer,
  TextField,
  DatePicker,
  Icon,
  Popover,
  Checkbox,
  Select,
} from "@shopify/polaris";
import { ContextualSaveBar, Toast } from "@shopify/app-bridge-react";
import { useField, useForm } from "@shopify/react-form";
import { useAuthenticatedFetch } from "../../hooks";
import { TokengatesResourcePicker } from "../../components/TokengatesResourcePicker";
import { TokengatesResourcePickerCollection } from "../../components/TokengatesResourcePickerCollection";
import { CalendarMajor } from '@shopify/polaris-icons';

export default function CreateTokengate() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [toastProps, setToastProps] = useState({ content: null });

  const [{month, year}, setStartDate] = useState({month: new Date().getMonth(), year: new Date().getFullYear()});
  const [selectedStartDate, setselectedStartDate] = useState({
    start: new Date(),
    end: new Date(),
  });

  const initialEndDate = new Date();
  const nextWeek = initialEndDate.getDate()+7;
  const nextWeekEndDate = new Date(initialEndDate.setDate(nextWeek));
  const [{month2, year2}, setEndDate] = useState({month2: nextWeekEndDate.getMonth(), year2: nextWeekEndDate.getFullYear()});
  const [selectedEndDate, setSelectedEndDate] = useState({
    start: nextWeekEndDate,
    end: nextWeekEndDate,
  });

  const handleMonthChange = useCallback(
    (month, year) => setStartDate({month, year}),
    [],
  );

  const handleMonthChange2 = useCallback(
    (month2, year2) => setEndDate({month2, year2}),
    [],
  );

  const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    togglePopoverActive();
  }, [selectedStartDate]);

  const firstUpdate2 = useRef(true);
  useLayoutEffect(() => {
    if (firstUpdate2.current) {
      firstUpdate2.current = false;
      return;
    }
    togglePopover2Active();
  }, [selectedEndDate]);

  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const [popover2Active, setPopover2Active] = useState(false);

  const togglePopover2Active = useCallback(
    () => setPopover2Active((popover2Active) => !popover2Active),
    [],
  );

  const [neverEndChecked, setNeverEndChecked] = useState(true);
  const neverEndHandleChange = useCallback((newChecked) => setNeverEndChecked(newChecked), []);

  const [redemptionsChecked, setRedemptionsChecked] = useState(true);
  const redemptionsHandleChange = useCallback((newChecked) => setRedemptionsChecked(newChecked), []);

  const resourceTypeOptions = [
    {label: 'Products', value: 'products'},
    {label: 'Collections', value: 'collections'},
    {label: 'Entire store', value: 'entireStore'},
  ];

  const [resourceTypeSelected, setResourceTypeSelected] = useState('products');

  const handleSelectChange = useCallback((value) => setResourceTypeSelected(value), []);

  const fieldsDefinition = {
    name: useField({
      value: undefined,
      validates: (name) => !name && "Name cannot be empty",
    }),
    startDate: useField(selectedStartDate.start.toJSON().substring(0,10)),
    endDate: useField(neverEndChecked ? "" :selectedEndDate.start.toJSON().substring(0,10)),
    redemptionsLimit: useField(redemptionsChecked ? "" : 1),
    discountType: useField("percentage"),
    discount: useField({
      value: undefined,
      validates: (discount) => !discount && "Discount cannot be empty",
    }),
    segment: useField({
      value: undefined,
      validates: (segment) => !segment && "Segment cannot be empty",
    }),
    products: useField([]),
    collections: useField([]),
  };

  const { fields, submit, submitting, dirty, reset, makeClean } = useForm({
    fields: fieldsDefinition,
    onSubmit: async (formData) => {
      const { startDate, endDate, redemptionsLimit, discountType, discount, name, products, segment } = formData;

      const productGids = products.map((product) => product.id);

      const response = await fetch("/api/gates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          startDate,
          endDate,
          redemptionsLimit,
          discountType,
          discount,
          productGids,
          segment: segment.split(","),
        }),
      });

      if (response.ok) {
        setToastProps({ content: "Tokengate campaign created" });
        makeClean();
        navigate("/campaigns/campaignsList");
      } else {
        setToastProps({
          content: "There was an error creating the tokengate campaign",
          error: true,
        });
      }
    },
  });

  const handleDiscountTypeButtonClick = useCallback(() => {
    if (fields.discountType.value === "percentage") {
      fields.discountType.onChange("amount");
    } else {
      fields.discountType.onChange("percentage");
    }
  }, [fields.discountType]);

  const toastMarkup = toastProps.content && (
    <Toast {...toastProps} onDismiss={() => setToastProps({ content: null })} />
  );

  return (
    <Page
      breadcrumbs={[
        {
          content: "Go back",
          onAction: () => {
            navigate("/campaigns/campaignsList");
          },
        },
      ]}
      title="Create a new Token-gated campaign"
    >
      <Layout>
        <Layout.Section>
          <Form onSubmit={submit}>
            <ContextualSaveBar
              saveAction={{
                onAction: submit,
                disabled: submitting || !dirty,
                loading: submitting,
              }}
              discardAction={{
                onAction: reset,
              }}
              visible={dirty}
            />
            {toastMarkup}
            <Layout>
              <Layout.Section>
                <Card>
                  <Card.Section>
                    <TextContainer>
                      <Heading>Configuration</Heading>
                      <TextField
                        name="name"
                        label="Name"
                        type="text"
                        {...fields.name}
                        autoComplete="off"
                      />
                      <Popover
                        active = {popoverActive}
                        activator={
                          <TextField
                            type="text"
                            label="Start date"
                            placeholder="Select a date ..."
                            prefix={<Icon source={CalendarMajor} color="black"></Icon>}
                            onFocus={togglePopoverActive}
                            {...fields.startDate}
                          />
                        }>
                          <DatePicker
                            month={month}
                            year={year}
                            onChange={setselectedStartDate}
                            onMonthChange={handleMonthChange}
                            selected={selectedStartDate}
                            allowRange={false}
                          />
                      </Popover>
                      <Checkbox
                        label="Never end"
                        checked={neverEndChecked}
                        onChange={neverEndHandleChange}
                      />
                      {!neverEndChecked &&
                         <Popover
                         active = {popover2Active}
                         activator={
                           <TextField
                             type="text"
                             label="End date"
                             placeholder="Select a date ..."
                             prefix={<Icon source={CalendarMajor} color="black"></Icon>}
                             onFocus={togglePopover2Active}
                             {...fields.endDate}
                           />
                         }>
                           <DatePicker
                             month={month2}
                             year={year2}
                             onChange={setSelectedEndDate}
                             onMonthChange={handleMonthChange2}
                             selected={selectedEndDate}
                             allowRange={false}
                           />
                       </Popover>
                      }
                      <div style={{display: "flex"}}>
                        <Checkbox
                          label="Unlimited redemptions"
                          checked={redemptionsChecked}
                          onChange={redemptionsHandleChange}
                        />
                      </div>
                      {!redemptionsChecked &&
                        <TextField
                        name="redemptionsLimit"
                        type="number"
                        {...fields.redemptionsLimit}
                        />
                      }
                    </TextContainer>
                  </Card.Section>
                  <Card.Section title="DISCOUNT PERK">
                    <Stack>
                      <Stack.Item>
                        <ButtonGroup segmented>
                          <Button
                            pressed={fields.discountType.value === "percentage"}
                            onClick={handleDiscountTypeButtonClick}
                          >
                            Percentage
                          </Button>
                          <Button
                            pressed={fields.discountType.value === "amount"}
                            onClick={handleDiscountTypeButtonClick}
                          >
                            Fixed Amount
                          </Button>
                        </ButtonGroup>
                      </Stack.Item>
                      <Stack.Item fill>
                        <TextField
                          name="discount"
                          type="number"
                          {...fields.discount}
                          autoComplete="off"
                          suffix={
                            fields.discountType.value === "percentage"
                              ? "%"
                              : ""
                          }
                          fullWidth
                        />
                      </Stack.Item>
                    </Stack>
                  </Card.Section>
                  <Card.Section title="SEGMENT">
                    <TextField
                      name="segment"
                      helpText="Comma separated list of NFTTokenIDs, one per line"
                      type="text"
                      placeholder="00080000847139315C8C9746B458F49FBF8E390D39DD07220000099B00000000, 
                      00080000847139315C8C9746B458F49FBF8E390D39DD07220000099B00123456, 
                      00080000847139315C8C9746B458F49FBF8E390D39DD07220000099B00654322"
                      {...fields.segment}
                      multiline={4}
                      autoComplete="off"
                    />
                  </Card.Section>
                  <Card.Section title="APPLY TO">
                    <Select
                      label="Select what type of resource will be applied to this campaign"
                      options={resourceTypeOptions}
                      onChange={handleSelectChange}
                      value={resourceTypeSelected}
                    />
                  </Card.Section>
                </Card>
              </Layout.Section>
              <Layout.Section>
              {(() => {
                switch (resourceTypeSelected) {
                  case "products": return <TokengatesResourcePicker products={fields.products} />;
                  case "collections": return <TokengatesResourcePickerCollection products={fields.collections} />;
                  case "entireStore": return <h2>Not implemented yet, select another option please</h2>;
                }
              })()}
              </Layout.Section>
              <Layout.Section>
                <PageActions
                  primaryAction={{
                    content: "Save",
                    disabled: submitting || !dirty,
                    loading: submitting,
                    onAction: submit,
                  }}
                />
              </Layout.Section>
            </Layout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
