import { Route, Routes } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { CrisisFooter } from "./components/CrisisFooter";
import { VaultGate } from "./components/VaultGate";
import { useVault } from "./context/VaultContext";
import { Capture } from "./pages/Capture";
import { Memories } from "./pages/Memories";
import { MemoryDetail } from "./pages/MemoryDetail";
import { Settings } from "./pages/Settings";
import { Today } from "./pages/Today";

export default function App() {
  const { status } = useVault();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sage-500">
        <span className="animate-pulse">Opening your space…</span>
      </div>
    );
  }

  if (status !== "unlocked") {
    return <VaultGate />;
  }

  return (
    <div className="app-shell min-h-screen">
      <main className="flex-1 px-5 pb-6 pt-8">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/memories/:id" element={<MemoryDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <CrisisFooter />
      <BottomNav />
    </div>
  );
}
