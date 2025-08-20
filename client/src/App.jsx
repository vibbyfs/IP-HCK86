import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import LandingPage from "./pages/pages_publics/LandingPage";
import RemindersCMSPage from "./pages/pages_cms/RemindersCMSPage";
import Sidebar from "./components/dashboards/SidebarCMS";
import Topbar from "./components/dashboards/TopbarCMS";
import FriendsCMSPage from "./pages/pages_cms/FriendsCMSPage";
import ProfileCMSPage from "./pages/pages_cms/ProfileCMSPage";
import Navbar from "./components/dashboards/Navbar";
import FooterDashboard from "./components/dashboards/FooterCMS";
import LoginPage from "./pages/pages_cms/LoginPage";
import RegisterPage from "./pages/pages_cms/RegisterPage";
import DashboardCMSPage from "./pages/pages_cms/DashboardCMSPage";
import { NavbarSection } from "./components/publics/NavbarSection";

function MainLayout() {
  return (
    <>
      <NavbarSection />
      <Outlet />
    </>
  );
}

function DashboardLayout() {
  return (
    <>
      <Sidebar />
      <Topbar />
      <Outlet />
      <div className="bg-neutral-50 text-neutral-800">
        <div className="lg:pl-64">
          <FooterDashboard />
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<MainLayout />}>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboards" element={<DashboardCMSPage />} />
            <Route
              path="/dashboards/reminders"
              element={<RemindersCMSPage />}
            />
            <Route path="/dashboards/friends" element={<FriendsCMSPage />} />
            <Route path="/dashboards/profiles" element={<ProfileCMSPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
