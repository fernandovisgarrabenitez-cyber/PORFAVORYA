import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import Home from "@/pages/home";
import Triangles from "@/pages/triangles";
import Identities from "@/pages/identities";
import Graphs from "@/pages/graphs";
import Exercises from "@/pages/exercises";
import Achievements from "@/pages/achievements";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/triangulos" component={Triangles} />
      <Route path="/identidades" component={Identities} />
      <Route path="/graficas" component={Graphs} />
      <Route path="/ejercicios" component={Exercises} />
      <Route path="/logros" component={Achievements} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
