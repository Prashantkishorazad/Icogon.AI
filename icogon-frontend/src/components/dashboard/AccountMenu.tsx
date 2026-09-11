import { useEffect, useRef, useState } from "react";
import {
  User,
  Inbox,
  Settings,
  // CircleHalf,
  ChevronRight,
  CircleHelp,
  BookOpen,
  Users,
  Download,
  House,
  LogOut,
  Sun,
  Moon,
  Check,
  ArrowLeft,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext.tsx";

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut?: () => void;
}

const AccountMenu = ({
  isOpen,
  onClose,
  onSignOut,
}: AccountMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const [showAppearance, setShowAppearance] =
    useState(false);

  const {
    theme,
    setTheme,
  } = useTheme();

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setShowAppearance(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const menuItem =
    "flex w-full items-center gap-4 px-6 py-3.5 text-left text-[18px] font-medium text-slate-800 transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-white/[0.06]";

  const iconClass =
    "shrink-0 text-slate-500 dark:text-slate-300";

  const appearanceItems = [
    {
      name: "Light",
      value: "light" as const,
      icon: Sun,
    },
    {
      name: "Dark",
      value: "dark" as const,
      icon: Moon,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="
        absolute
        bottom-16
        left-3
        z-[999]
        w-[440px]
        max-w-[calc(100vw-24px)]
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-white
        shadow-[0_20px_60px_rgba(15,23,42,0.22)]
        dark:border-white/10
        dark:bg-[#303030]
        dark:shadow-[0_25px_80px_rgba(0,0,0,0.6)]
      "
    >
      {!showAppearance ? (
        <>
          {/* ACCOUNT HEADER */}
          <div className="p-2.5">
            <button
              type="button"
              className="
                flex
                w-full
                items-center
                gap-5
                rounded-2xl
                bg-slate-100
                px-5
                py-4
                text-left
                transition-colors
                hover:bg-slate-200
                dark:bg-white/[0.06]
                dark:hover:bg-white/[0.09]
              "
            >
              {/* Avatar */}
              <div
                className="
                  flex
                  h-16
                  w-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-cyan-400
                  via-blue-500
                  to-indigo-600
                  text-2xl
                  font-bold
                  text-white
                "
              >
                P
              </div>

              <div className="min-w-0">
                <h3
                  className="
                    truncate
                    text-[24px]
                    font-semibold
                    leading-tight
                    text-slate-900
                    dark:text-white
                  "
                >
                  Prashant Kishor
                </h3>

                <p
                  className="
                    mt-1
                    truncate
                    text-[17px]
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Personal account
                </p>
              </div>
            </button>
          </div>

          {/* DIVIDER */}
          <div className="h-px bg-slate-200 dark:bg-white/10" />

          {/* PROFILE */}
          <button
            type="button"
            className={menuItem}
          >
            <User
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Profile</span>
          </button>

          {/* INBOX */}
          <button
            type="button"
            className={menuItem}
          >
            <Inbox
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Inbox</span>

            <span
              className="
                ml-auto
                h-4
                w-4
                rounded-full
                bg-red-500
              "
            />
          </button>

          {/* SETTINGS */}
          <button
            type="button"
            className={menuItem}
          >
            <Settings
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Settings</span>

            <span
              className="
                ml-auto
                text-[16px]
                text-slate-400
              "
            >
              ⌘ .
            </span>
          </button>

          {/* APPEARANCE */}
          <button
            type="button"
            onClick={() =>
              setShowAppearance(true)
            }
            className={menuItem}
          >
            {/*<CircleHalf*/}
            {/*  size={27}*/}
            {/*  strokeWidth={1.8}*/}
            {/*  className={iconClass}*/}
            {/*/>*/}

            <span>Appearance</span>

            <ChevronRight
              size={24}
              strokeWidth={1.8}
              className="
                ml-auto
                text-slate-400
                dark:text-slate-400
              "
            />
          </button>

          {/* DIVIDER */}
          <div className="h-px bg-slate-200 dark:bg-white/10" />

          {/* SUPPORT */}
          <button
            type="button"
            className={menuItem}
          >
            <CircleHelp
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Support</span>

            <ChevronRight
              size={24}
              strokeWidth={1.8}
              className="ml-auto text-slate-400"
            />
          </button>

          {/* DOCUMENTATION */}
          <button
            type="button"
            className={menuItem}
          >
            <BookOpen
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Documentation</span>

            <ChevronRight
              size={24}
              strokeWidth={1.8}
              className="ml-auto text-slate-400"
            />
          </button>

          {/* COMMUNITY */}
          <button
            type="button"
            className={menuItem}
          >
            <Users
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Community</span>
          </button>

          {/* DOWNLOAD APPS */}
          <button
            type="button"
            className={menuItem}
          >
            <Download
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Download apps</span>
          </button>

          {/* HOMEPAGE */}
          <button
            type="button"
            className={menuItem}
          >
            <House
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Homepage</span>
          </button>

          {/* DIVIDER */}
          <div className="h-px bg-slate-200 dark:bg-white/10" />

          {/* SIGN OUT */}
          <button
            type="button"
            onClick={() => {
              onSignOut?.();
              onClose();
            }}
            className="
              flex
              w-full
              items-center
              gap-4
              px-6
              py-5
              text-left
              text-[18px]
              font-medium
              text-slate-800
              transition-colors
              hover:bg-slate-100
              dark:text-white
              dark:hover:bg-white/[0.06]
            "
          >
            <LogOut
              size={27}
              strokeWidth={1.8}
              className={iconClass}
            />

            <span>Sign out</span>
          </button>
        </>
      ) : (
        <>
          {/* APPEARANCE HEADER */}
          <div
            className="
              flex
              items-center
              gap-4
              border-b
              border-slate-200
              px-5
              py-5
              dark:border-white/10
            "
          >
            <button
              type="button"
              onClick={() =>
                setShowAppearance(false)
              }
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-slate-500
                transition-colors
                hover:bg-slate-100
                dark:text-slate-300
                dark:hover:bg-white/10
              "
            >
              <ArrowLeft size={23} />
            </button>

            <h2
              className="
                text-[20px]
                font-semibold
                text-slate-900
                dark:text-white
              "
            >
              Appearance
            </h2>
          </div>

          {/* THEME OPTIONS */}
          <div className="p-3">
            {appearanceItems.map((item) => {
              const Icon = item.icon;

              const active =
                theme === item.value;

              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => {
                    setTheme(item.value);
                  }}
                  className={`
                    flex
                    w-full
                    items-center
                    gap-4
                    rounded-2xl
                    px-5
                    py-4
                    text-left
                    transition-colors
                    ${
                      active
                        ? "bg-slate-100 text-slate-900 dark:bg-white/[0.08] dark:text-white"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.06]"
                    }
                  `}
                >
                  <Icon
                    size={25}
                    strokeWidth={1.8}
                  />

                  <span className="text-[18px] font-medium">
                    {item.name}
                  </span>

                  {active && (
                    <Check
                      size={23}
                      strokeWidth={2}
                      className="
                        ml-auto
                        text-cyan-500
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default AccountMenu;