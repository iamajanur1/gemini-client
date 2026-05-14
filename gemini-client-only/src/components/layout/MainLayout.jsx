import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}