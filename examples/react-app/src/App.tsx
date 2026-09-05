import { useTrack } from "@meshlytics/react";

export function App() {
  const track = useTrack();

  return (
    <button onClick={() => track("cta_clicked", { location: "hero" })}>
      Click me
    </button>
  );
}
