import WorkspacePage from "./pages/WorkspacePage";
import TicketDetailPage from "./pages/TicketDetailPage";

export const proyectosRoutes = [
  { index: true, element: <WorkspacePage /> },
  { path: "tickets/:id", element: <TicketDetailPage /> },
];