import { Link, Route, Routes } from "react-router-dom";
import { useTrack } from "@meshlytics/react-router";

function Home() {
  const track = useTrack();

  return (
    <div>
      <h1>Home</h1>
      <button onClick={() => track("cta_clicked", { location: "hero" })}>
        Click me
      </button>
      <nav>
        <Link to="/pricing">Pricing</Link>
      </nav>
    </div>
  );
}

function Pricing() {
  return (
    <div>
      <h1>Pricing</h1>
      <Link to="/">Home</Link>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  );
}
