import { AppNavigation } from "@/components/AppNavigation";
import { AppRouter } from "@/router/AppRouter";

function App() {
  return (
    <div className="min-h-screen">
      <AppNavigation />
      <AppRouter />
    </div>
  );
}

export default App;
