import { AppNavigation } from "@/components/AppNavigation";
import { AppRouter } from "@/router/AppRouter";

function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <AppNavigation />
      <AppRouter />
    </main>
  );
}

export default App;
