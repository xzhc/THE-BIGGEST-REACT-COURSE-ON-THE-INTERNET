import { ToggleComponent } from "./CustomHooks/components/ToggleComponent";

import { FormComponent } from "./CustomHooks/components/FormComponent";
import { FetchComponent } from "./CustomHooks/components/FetchComponent";
import { UniqueID } from "./UniqueID";

function App() {
  return (
    <>
      <h1>React Custom Hooks Examples</h1>
      <ToggleComponent />
      <FormComponent />
      <FetchComponent />
      <UniqueID />
    </>
  );
}

export default App;
