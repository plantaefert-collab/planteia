import { DemoStateProvider, useDemo } from "./DemoState";
import { WireframeNavigator } from "./WireframeNavigator";
import { WireframeShell } from "./WireframeShell";
import { WelcomeScreen, LoginScreen, SignupScreen, RecoverScreen } from "./screens/AuthScreens";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { PlantsScreen } from "./screens/PlantsScreen";
import { NewPlantFlow } from "./screens/NewPlantFlow";
import { PlantDetailScreen } from "./screens/PlantDetailScreen";
import { DiagnosisFlow } from "./screens/DiagnosisFlow";
import { ReassessmentFlow } from "./screens/ReassessmentFlow";
import { CalendarScreen } from "./screens/CalendarScreen";
import { JournalScreen } from "./screens/JournalScreen";
import { GardenerChatScreen } from "./screens/GardenerChatScreen";
import { ProductsScreen } from "./screens/ProductsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { Button } from "@/components/ui/button";

export function WireframeApp() {
  return (
    <DemoStateProvider>
      <div className="min-h-dvh bg-background text-foreground">
        <WireframeNavigator />
        <ScreenRouter />
      </div>
    </DemoStateProvider>
  );
}

function ScreenRouter() {
  const { nav, go } = useDemo();

  const screen = (() => {
    switch (nav.screen) {
      case "welcome": return <WelcomeScreen />;
      case "login": return <LoginScreen />;
      case "signup": return <SignupScreen />;
      case "recover": return <RecoverScreen />;
      case "onboarding": return <OnboardingScreen />;
      case "dashboard": return <DashboardScreen />;
      case "plants": return <PlantsScreen />;
      case "newPlant": return <NewPlantFlow />;
      case "plantDetail": return <PlantDetailScreen />;
      case "diagnosis": return <DiagnosisFlow />;
      case "reassessment": return <ReassessmentFlow />;
      case "calendar": return <CalendarScreen />;
      case "journal": return <JournalScreen />;
      case "gardener": return <GardenerChatScreen />;
      case "products": return <ProductsScreen />;
      case "profile": return <ProfileScreen />;
      default:
        return (
          <div className="mx-auto max-w-md space-y-3 rounded-2xl bg-card p-6 text-center">
            <h2 className="font-display text-xl">Tela indisponível</h2>
            <p className="text-sm text-muted-foreground">
              A tela solicitada não existe neste wireframe. Volte ao início para continuar.
            </p>
            <Button onClick={() => go("dashboard")}>Ir para o início</Button>
          </div>
        );
    }
  })();

  return <WireframeShell>{screen}</WireframeShell>;
}
