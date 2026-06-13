import { NavLink } from "react-router-dom";
import { BookIcon, CameraIcon, GearIcon, SunIcon } from "./icons";

const items = [
  { to: "/", label: "Today", Icon: SunIcon, end: true },
  { to: "/capture", label: "Capture", Icon: CameraIcon, end: false },
  { to: "/memories", label: "Memories", Icon: BookIcon, end: false },
  { to: "/settings", label: "Settings", Icon: GearIcon, end: false },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-30 border-t border-sand-200 bg-sand-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                isActive ? "text-sage-600" : "text-sage-500/60"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
                    isActive ? "bg-sage-100" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
