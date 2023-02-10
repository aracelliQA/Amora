import { BrowserRouter} from "react-router-dom";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
  AppFrame,
} from "./components";


export default function App() {
  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <AppFrame />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
