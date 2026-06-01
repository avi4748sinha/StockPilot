import { Boxes, LayoutDashboard, LogOut, ReceiptText, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import logo from "../assets/StockPilot-logo.svg";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/orders", label: "Orders", icon: ReceiptText }
];

export default function Layout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("StockPilot_token");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white px-5 py-6 lg:block">
        <img src={logo} alt="StockPilot" className="h-11 w-auto" />
        <nav className="mt-8 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-blue-50 text-primary" : "text-secondary hover:bg-gray-50"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={logout} className="absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-secondary transition hover:bg-gray-50">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <img src={logo} alt="StockPilot" className="h-10 w-auto" />
          <nav className="mt-3 grid grid-cols-4 gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-md px-2 py-2 text-xs font-medium ${
                    isActive ? "bg-blue-50 text-primary" : "text-secondary"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <button type="button" onClick={logout} className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-secondary">
            <LogOut size={15} />
            Logout
          </button>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
