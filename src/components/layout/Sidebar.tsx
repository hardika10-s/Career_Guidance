import React from "react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Compass,
  Search,
  BarChart3,
  MapPin,
  GraduationCap,
  Award,
  Bot,
  Clock,
  Settings,
  X,
  FileText,
  MessageSquare
} from "lucide-react";

interface SidebarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const navSections = [
    {
      title: "Discover & Assess",
      items: [
        { id: "nav-dashboard", label: "Dashboard", route: "/dashboard", icon: LayoutDashboard },
        { id: "nav-assessment", label: "Career Assessment", route: "/assessment", icon: ClipboardCheck },
        { id: "nav-discovery", label: "Career Discovery", route: "/discovery", icon: Compass },
        { id: "nav-explorer", label: "Career Explorer", route: "/explorer", icon: Search },
      ],
    },
    {
      title: "Bridge & Build Skills",
      items: [
        { id: "nav-skills", label: "Skill Gap Analysis", route: "/skills", icon: BarChart3 },
        { id: "nav-roadmap", label: "Personalized Roadmap", route: "/roadmap", icon: MapPin },
        { id: "nav-resume", label: "Resume Analysis", route: "/resume", icon: FileText },
        { id: "nav-learning", label: "Learning & Projects", route: "/learning", icon: GraduationCap },
        { id: "nav-evidence", label: "Proof of Skills", route: "/evidence", icon: Award },
      ],
    },
    {
      title: "Employability & Practice",
      items: [
        { id: "nav-interview", label: "Interview Arena", route: "/interview", icon: Bot },
        { id: "nav-chat", label: "AI Career Advisor", route: "/chat", icon: MessageSquare },
        { id: "nav-timeline", label: "Progress Timeline", route: "/timeline", icon: Clock },
        { id: "nav-profile", label: "Profile & Settings", route: "/profile", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={`fixed top-16 bottom-0 left-0 z-40 w-[min(18rem,calc(100vw-1rem))] bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-950/10 backdrop-blur-md flex flex-col transition-transform duration-300 ease-in-out lg:w-64 lg:shadow-none lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Navigation Link Groups */}
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 space-y-5 custom-sidebar-scroll">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/90 dark:text-slate-500">
                {section.title}
              </h4>
              <div className="mt-1.5 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.route || (item.route === "/explorer" && currentRoute.startsWith("/explorer"));
                  return (
                    <button
                      key={item.id}
                      id={item.id}
                      onClick={() => {
                        onNavigate(item.route);
                        onClose();
                      }}
                      className={`w-full min-h-11 flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all select-none text-left ${
                        isActive
                          ? "bg-blue-50/90 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold border-l-[3px] border-blue-600 shadow-[0_1px_2px_rgba(37,99,235,0.06)]"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Framework Footer Note */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          <p className="font-semibold text-slate-600 dark:text-slate-300">Employability Framework</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Systematic Readiness & Proof</p>
        </div>
      </aside>
    </>
  );
};
