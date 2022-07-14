import * as React from "react";
import { fireEvent, screen, render, cleanup } from "@testing-library/react";
import { measurePerformance, configure } from "reassure";
import { SlowList } from "./SlowList";

configure({
  render: render,
  cleanup: cleanup,
});

const AsyncComponent = () => {
  const [count, setCount] = React.useState(0);

  const handlePress = () => {
    setTimeout(() => setCount((c) => c + 1), 50);
  };

  return (
    <div>
      <button onClick={handlePress}>Action</button>
      <span>Count: {count}</span>

      <SlowList count={200} />
    </div>
  );
};

jest.setTimeout(60_000);

test("SlowList", async () => {
  await measurePerformance(<AsyncComponent />);
});

test("AsyncComponent", async () => {
  const scenario = async () => {
    const button = screen.getByText("Action");

    fireEvent.click(button);
    await screen.findByText("Count: 1");

    fireEvent.click(button);
    await screen.findByText("Count: 2");

    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    await screen.findByText("Count: 5");
  };

  await measurePerformance(<AsyncComponent />, { scenario });
});
