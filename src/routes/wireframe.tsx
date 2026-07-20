import { createFileRoute } from "@tanstack/react-router";
import { DemoStateProvider, useDemo } from "@/wireframe/DemoState";
import { WireframeNavigator } from "@/wireframe/WireframeNavigator";
import { WireframeShell } from "@/wireframe/WireframeShell";
import { WelcomeScreen, LoginScreen, SignupScreen, RecoverScreen } from "@/wireframe/screens/AuthScreens";
import { OnboardingScreen } from "@/wireframe/screens/OnboardingScreen";
import { DashboardScreen } from "@/wireframe/screens/DashboardScreen";
import { PlantsScreen } from "@/wireframe/screens/PlantsScreen";
import { NewPlantFlow } from "@/wireframe/screens/NewPlantFlow";
import { PlantDetailScreen } from "@/wireframe/screens/PlantDetailScreen";
import { DiagnosisFlow } from "@/wireframe/screens/DiagnosisFlow";
import { ReassessmentFlow } from "@/wireframe/screens/ReassessmentFlow";
import { CalendarScreen } from "@/wireframe/screens/CalendarScreen";
import { JournalScreen } from "@/wireframe/screens/JournalScreen";
import { GardenerChatScreen } from "@/wireframe/screens/GardenerChatScreen";
import { ProductsScreen } from "@/wireframe/screens/ProductsScreen";
import { ProfileScreen } from "@/wireframe/screens/ProfileScreen";

export const Route = createFileRoute("/wireframe")({
  head: () => ({
    meta: [
      { title: "Wireframe — Plantae AI" },
      { name: "description", content: "Wireframe interativo do Plantae AI para validação de fluxos." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WireframePage,
});

function WireframePage() {
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
  const { nav } = useDemo();
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
    }
  })();

  return <WireframeShell>{screen}</WireframeShell>;
}
