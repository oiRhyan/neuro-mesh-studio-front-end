import Aurora from "../Aurora/Aurora";
import "./home/main.css";

export function HomeBackground() {
  return (
    <div className="background-layer">
      <Aurora
        colorStops={["#3a92ed", "#B497CF", "#5227FF"]}
        blend={2}
        amplitude={1}
        speed={0.4}
      />

      <div className="art-overlay" />
    </div>
  );
}