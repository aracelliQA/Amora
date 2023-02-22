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
} from "@shopify/polaris";
import { ContextualSaveBar, Toast } from "@shopify/app-bridge-react";
import { useField, useForm } from "@shopify/react-form";
import { useAuthenticatedFetch } from "../../hooks";
import { TokengatesResourcePicker } from "../../components/TokengatesResourcePicker";
import { CalendarMajor } from '@shopify/polaris-icons';

export default function CreateTokengate() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [toastProps, setToastProps] = useState({ content: null });

  const fieldsDefinition = {
    name: useField({
      value: undefined,
      validates: (name) => !name && "Name cannot be empty",
    }),
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
  };

  const { fields, submit, submitting, dirty, reset, makeClean } = useForm({
    fields: fieldsDefinition,
    onSubmit: async (formData) => {
      const { discountType, discount, name, products, segment } = formData;

      const productGids = products.map((product) => product.id);

      const response = await fetch("/api/gates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discountType,
          discount,
          name,
          productGids,
          segment: segment.split(","),
        }),
      });

      if (response.ok) {
        setToastProps({ content: "Tokengate created" });
        makeClean();
        navigate("/");
      } else {
        setToastProps({
          content: "There was an error creating a tokengate",
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

  const [{month, year}, setInitialDate] = useState({month: new Date().getMonth(), year: new Date().getFullYear()});
  const [selectedInitialDate, setSelectedInitialDate] = useState({
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
    (month, year) => setInitialDate({month, year}),
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
  }, [selectedInitialDate]);

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

  const [checked, setChecked] = useState(true);
  const handleChange = useCallback((newChecked) => setChecked(newChecked), []);

  return (
    <Page
      narrowWidth
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
                            value={selectedInitialDate.start.toJSON().substring(0,10)}
                            onFocus={togglePopoverActive}
                          />
                        }>
                          <DatePicker
                            month={month}
                            year={year}
                            onChange={setSelectedInitialDate}
                            onMonthChange={handleMonthChange}
                            selected={selectedInitialDate}
                            allowRange={false}
                          />
                      </Popover>
                      <Checkbox
                        label="Never end"
                        checked={checked}
                        onChange={handleChange}
                      />
                      {!checked &&
                         <Popover
                         active = {popover2Active}
                         activator={
                           <TextField
                             type="text"
                             label="End date"
                             placeholder="Select a date ..."
                             prefix={<Icon source={CalendarMajor} color="black"></Icon>}
                             value={selectedEndDate.start.toJSON().substring(0,10)}
                             onFocus={togglePopover2Active}
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
                      helpText="Comma separated list of contract addresses"
                      type="text"
                      placeholder="0x123, 0x456, 0x789"
                      {...fields.segment}
                      autoComplete="off"
                    />
                  </Card.Section>
                </Card>
              </Layout.Section>
              <Layout.Section>
                <TokengatesResourcePicker products={fields.products} />
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
