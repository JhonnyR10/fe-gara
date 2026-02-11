// import "./App.css";
import "./ui/ui.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import StartPage from "./pages/StartPage";
import IntermediaPage from "./pages/IntermediaPage";
import StopPage from "./pages/StopPage";
import ClassificaPage from "./pages/ClassificaPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/start" element={<StartPage />} />
        <Route path="/intermedia/:ordine" element={<IntermediaPage />} />
        <Route path="/stop" element={<StopPage />} />
        <Route path="/classifica/:garaId" element={<ClassificaPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
