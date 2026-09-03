// import React, { useEffect, useRef, useState } from "react";
// import {
//   User,
//   Settings,
//   Moon,
//   HelpCircle,
//   BookOpen,
//   Users,
//   Home,
//   LogOut,
//   ChevronRight,
//   Grid2X2,
//   Star,
//   Share2,
//   // PanelLeftClose,
//   ChevronDown,
//   Zap,
//   LayoutDashboard,
//   Search,
//   Compass,
//   // X,
// } from "lucide-react";
//
// interface SidebarProps {
//   onNavigate?: (page: string) => void;
// }
//
// const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
//   const [activePage, setActivePage] = useState("dashboard");
//
//   const profileRef = useRef<HTMLDivElement>(null);
//
//   // =========================================================
//   // CLOSE PROFILE MENU ON OUTSIDE CLICK
//   // =========================================================
//   useEffect(() => {
//     const handleOutsideClick = (event: MouseEvent) => {
//       if (
//         profileRef.current &&
//         !profileRef.current.contains(event.target as Node)
//       ) {
//         setProfileMenuOpen(false);
//       }
//     };
//
//     document.addEventListener("mousedown", handleOutsideClick);
//
//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//     };
//   }, []);
//
//   // =========================================================
//   // ESCAPE KEY
//   // =========================================================
//   useEffect(() => {
//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         setProfileMenuOpen(false);
//       }
//     };
//
//     document.addEventListener("keydown", handleEscape);
//
//     return () => {
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, []);
//
//   // =========================================================
//   // NAVIGATION
//   // =========================================================
//   const handleNavigation = (page: string) => {
//     setActivePage(page);
//     setProfileMenuOpen(false);
//
//     if (onNavigate) {
//       onNavigate(page);
//     }
//   };
//
//   // =========================================================
//   // NORMAL NAV ITEM
//   // =========================================================
//   const navItemClass = (page: string) =>
//     `
//       group
//       flex
//       w-full
//       items-center
//       gap-4
//       rounded-xl
//       px-4
//       py-3
//       text-left
//       transition-all
//       duration-150
//       ${
//         activePage === page
//           ? "bg-[#2d2d2d] text-white"
//           : "text-[#b8b8b8] hover:bg-white/[0.07] hover:text-white"
//       }
//     `;
//
//   return (
//     <aside
//       className="
//         relative
//         flex
//         h-screen
//         w-[320px]
//         min-w-[320px]
//         flex-col
//         overflow-hidden
//         border-r
//         border-white/[0.10]
//         bg-black
//         text-white
//       "
//     >
//       {/* =======================================================
//           HEADER
//       ======================================================== */}
//       <header className="shrink-0 px-5 pt-6 pb-4">
//   <div className="flex items-center justify-between">
//     {/* ICOGON BRAND */}
//     <div className="flex items-center gap-3">
//       <img
//         src="/logo.png"
//         alt="ICOGON"
//         className="h-12 w-12 shrink-0 rounded-[15px] object-contain"
//       />
//
//       <span className="text-[24px] font-bold tracking-[-0.5px] text-white">
//         ICOGON
//       </span>
//     </div>
//
//     {/* SIDEBAR BUTTON */}
//     <button
//       type="button"
//       className="
//         flex
//         h-9
//         w-9
//         items-center
//         justify-center
//         rounded-lg
//         text-slate-400
//         transition-colors
//         hover:bg-white/10
//         hover:text-white
//       "
//       aria-label="Sidebar"
//     >
//       <svg
//         width="20"
//         height="20"
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <rect x="4" y="4" width="16" height="16" rx="2" />
//         <path d="M9 4v16" />
//         <path d="m15 9-3 3 3 3" />
//       </svg>
//     </button>
//   </div>
// </header>
//
//       {/* =======================================================
//           WORKSPACE
//       ======================================================== */}
//       <div className="shrink-0 px-4 pb-3">
//         <button
//           type="button"
//           className="
//             flex
//             w-full
//             items-center
//             justify-between
//             rounded-2xl
//             border
//             border-white/[0.18]
//             bg-[#242424]
//             px-4
//             py-3
//             text-left
//             transition
//             hover:border-white/[0.25]
//             hover:bg-[#2a2a2a]
//           "
//         >
//           <div className="flex min-w-0 items-center gap-4">
//             {/* WORKSPACE ICON */}
//             <div
//               className="
//                 flex
//                 h-12
//                 w-12
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-xl
//                 bg-[#f04400]
//                 text-[20px]
//                 font-semibold
//               "
//             >
//               I
//             </div>
//
//             <div className="min-w-0">
//               <div className="truncate text-[18px] font-semibold text-white">
//                 ICOGON Workspace
//               </div>
//
//               <div className="mt-0.5 truncate text-[15px] text-slate-400">
//                 Personal workspace
//               </div>
//             </div>
//           </div>
//
//           <ChevronDown
//             size={21}
//             strokeWidth={1.8}
//             className="ml-3 shrink-0 text-slate-400"
//           />
//         </button>
//       </div>
//
//       {/* =======================================================
//           SCROLLABLE SIDEBAR CONTENT
//       ======================================================== */}
//       <div
//         className="
//           min-h-0
//           flex-1
//           overflow-y-auto
//           overflow-x-hidden
//           px-4
//           pb-5
//
//           scrollbar-thin
//           scrollbar-track-transparent
//           scrollbar-thumb-white/10
//           hover:scrollbar-thumb-white/20
//         "
//       >
//         {/* =====================================================
//             MAIN NAVIGATION
//         ====================================================== */}
//         <nav className="mt-3 space-y-1">
//           {/* DASHBOARD */}
//           <button
//             type="button"
//             onClick={() => handleNavigation("dashboard")}
//             className={navItemClass("dashboard")}
//           >
//             <LayoutDashboard
//               size={25}
//               strokeWidth={1.7}
//               className="shrink-0"
//             />
//
//             <span className="text-[18px]">Dashboard</span>
//           </button>
//
//           {/* SEARCH */}
//           <button
//             type="button"
//             onClick={() => handleNavigation("search")}
//             className={navItemClass("search")}
//           >
//             <Search
//               size={25}
//               strokeWidth={1.7}
//               className="shrink-0"
//             />
//
//             <span className="text-[18px]">Search</span>
//
//             <span
//               className="
//                 ml-auto
//                 rounded-lg
//                 border
//                 border-white/[0.12]
//                 bg-[#292929]
//                 px-2
//                 py-1
//                 text-[12px]
//                 text-slate-400
//               "
//             >
//               ⌘ K
//             </span>
//           </button>
//
//           {/* RESOURCES */}
//           <button
//             type="button"
//             onClick={() => handleNavigation("resources")}
//             className={navItemClass("resources")}
//           >
//             <Compass
//               size={25}
//               strokeWidth={1.7}
//               className="shrink-0"
//             />
//
//             <span className="text-[18px]">Resources</span>
//           </button>
//
//           {/* CONNECTORS */}
//           <button
//             type="button"
//             onClick={() => handleNavigation("connectors")}
//             className={navItemClass("connectors")}
//           >
//             <Share2
//               size={25}
//               strokeWidth={1.7}
//               className="shrink-0"
//             />
//
//             <span className="text-[18px]">Connectors</span>
//           </button>
//         </nav>
//
//         {/* =====================================================
//             PROJECTS
//         ====================================================== */}
//         <section className="mt-9">
//           <div className="mb-3 px-4 text-[17px] font-semibold text-slate-400">
//             Projects
//           </div>
//
//           <div className="space-y-1">
//             {/* ALL PROJECTS */}
//             <button
//               type="button"
//               onClick={() => handleNavigation("projects")}
//               className={navItemClass("projects")}
//             >
//               <Grid2X2
//                 size={25}
//                 strokeWidth={1.7}
//                 className="shrink-0"
//               />
//
//               <span className="text-[18px]">All projects</span>
//             </button>
//
//             {/* STARRED */}
//             <button
//               type="button"
//               onClick={() => handleNavigation("starred")}
//               className={navItemClass("starred")}
//             >
//               <Star
//                 size={25}
//                 strokeWidth={1.7}
//                 className="shrink-0"
//               />
//
//               <span className="text-[18px]">Starred</span>
//             </button>
//
//             {/* OWNED */}
//             <button
//               type="button"
//               onClick={() => handleNavigation("owned")}
//               className={navItemClass("owned")}
//             >
//               <User
//                 size={25}
//                 strokeWidth={1.7}
//                 className="shrink-0"
//               />
//
//               <span className="text-[18px]">Owned by me</span>
//             </button>
//
//             {/* SHARED */}
//             <button
//               type="button"
//               onClick={() => handleNavigation("shared")}
//               className={navItemClass("shared")}
//             >
//               <Users
//                 size={25}
//                 strokeWidth={1.7}
//                 className="shrink-0"
//               />
//
//               <span className="text-[18px]">Shared with me</span>
//             </button>
//           </div>
//         </section>
//
//         {/* =====================================================
//             RECENTS
//         ====================================================== */}
//         <section className="mt-9 pb-3">
//           <div className="mb-3 px-4 text-[17px] font-semibold text-slate-400">
//             Recents
//           </div>
//
//           <div className="px-4 py-2 text-[16px] text-slate-500">
//             No recent projects
//           </div>
//         </section>
//       </div>
//
//       {/* =======================================================
//           BOTTOM FIXED AREA
//       ======================================================== */}
//       <div className="relative shrink-0">
//         {/* TOP BORDER */}
//         <div className="border-t border-white/[0.10]" />
//
//         {/* =====================================================
//             UPGRADE CARD
//         ====================================================== */}
//         <div className="px-4 py-5">
//           <button
//             type="button"
//             onClick={() => handleNavigation("upgrade")}
//             className="
//               flex
//               w-full
//               items-center
//               justify-between
//               rounded-2xl
//               border
//               border-white/[0.18]
//               bg-[#242424]
//               px-4
//               py-4
//               text-left
//               transition
//               hover:border-white/[0.28]
//               hover:bg-[#2b2b2b]
//             "
//           >
//             <div>
//               <div className="text-[18px] font-bold text-white">
//                 Upgrade to Pro
//               </div>
//
//               <div className="mt-1 text-[15px] text-slate-400">
//                 Unlock more features
//               </div>
//             </div>
//
//             <div
//               className="
//                 flex
//                 h-12
//                 w-12
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-full
//                 bg-purple-600
//               "
//             >
//               <Zap
//                 size={25}
//                 fill="currentColor"
//                 strokeWidth={2}
//                 className="text-white"
//               />
//             </div>
//           </button>
//         </div>
//
//         {/* =====================================================
//             PROFILE SECTION
//         ====================================================== */}
//         <div
//           ref={profileRef}
//           className="
//             relative
//             border-t
//             border-white/[0.10]
//             px-4
//             py-4
//           "
//         >
//           {/* ===================================================
//               PROFILE POPUP
//           ==================================================== */}
//           {profileMenuOpen && (
//             <div
//               className="
//                 absolute
//                 bottom-[calc(100%-4px)]
//                 left-3
//                 z-[100]
//                 w-[360px]
//                 max-w-[calc(100vw-24px)]
//                 overflow-hidden
//                 rounded-2xl
//                 border
//                 border-white/[0.18]
//                 bg-[#292929]
//                 shadow-[0_24px_70px_rgba(0,0,0,0.65)]
//                 backdrop-blur-xl
//               "
//             >
//               {/* -----------------------------------------------
//                   PROFILE HEADER
//               ------------------------------------------------ */}
//               <div className="border-b border-white/[0.10] p-2">
//                 <button
//                   type="button"
//                   onClick={() => handleNavigation("profile")}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     gap-4
//                     rounded-xl
//                     bg-[#333333]
//                     px-4
//                     py-3.5
//                     text-left
//                     transition
//                     hover:bg-[#3a3a3a]
//                   "
//                 >
//                   {/* PROFILE IMAGE */}
//                   <div
//                     className="
//                       flex
//                       h-12
//                       w-12
//                       shrink-0
//                       items-center
//                       justify-center
//                       overflow-hidden
//                       rounded-full
//                       bg-gradient-to-br
//                       from-slate-300
//                       via-slate-500
//                       to-slate-700
//                       text-[18px]
//                       font-bold
//                       text-white
//                     "
//                   >
//                     P
//                   </div>
//
//                   <div className="min-w-0">
//                     <div className="truncate text-[18px] font-bold text-white">
//                       Prashant Kishor
//                     </div>
//
//                     <div className="mt-1 truncate text-[14px] text-slate-400">
//                       prashantkishorggv@gmail.com
//                     </div>
//                   </div>
//                 </button>
//               </div>
//
//               {/* -----------------------------------------------
//                   ACCOUNT
//               ------------------------------------------------ */}
//               <div className="border-b border-white/[0.10] p-2">
//                 {/* PROFILE */}
//                 <button
//                   type="button"
//                   onClick={() => handleNavigation("profile")}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     gap-4
//                     rounded-xl
//                     px-4
//                     py-3
//                     text-left
//                     text-white
//                     transition
//                     hover:bg-white/[0.08]
//                   "
//                 >
//                   <User size={23} strokeWidth={1.8} />
//
//                   <span className="text-[17px]">
//                     Profile
//                   </span>
//                 </button>
//
//                 {/* SETTINGS */}
//                 <button
//                   type="button"
//                   onClick={() => handleNavigation("settings")}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     justify-between
//                     rounded-xl
//                     px-4
//                     py-3
//                     text-left
//                     text-white
//                     transition
//                     hover:bg-white/[0.08]
//                   "
//                 >
//                   <div className="flex items-center gap-4">
//                     <Settings size={23} strokeWidth={1.8} />
//
//                     <span className="text-[17px]">
//                       Settings
//                     </span>
//                   </div>
//
//                   <span className="text-[13px] text-slate-400">
//                     ⌘ .
//                   </span>
//                 </button>
//
//                 {/* APPEARANCE */}
//                 <button
//                   type="button"
//                   onClick={() => handleNavigation("appearance")}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     justify-between
//                     rounded-xl
//                     px-4
//                     py-3
//                     text-left
//                     text-white
//                     transition
//                     hover:bg-white/[0.08]
//                   "
//                 >
//                   <div className="flex items-center gap-4">
//                     <Moon size={23} strokeWidth={1.8} />
//
//                     <span className="text-[17px]">
//                       Appearance
//                     </span>
//                   </div>
//
//                   <ChevronRight
//                     size={19}
//                     className="text-slate-400"
//                   />
//                 </button>
//               </div>
//
//               {/* -----------------------------------------------
//                   HELP / OTHER
//               ------------------------------------------------ */}
//               <div className="border-b border-white/[0.10] p-2">
//                 {/* SUPPORT */}
//                 <button
//                   type="button"
//                   onClick={() => handleNavigation("support")}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     justify-between
//                     rounded-xl
//                     px-4
//                     py-3
//                     text-left
//                     text-white
//                     transition
//                     hover:bg-white/[0.08]
//                   "
//                 >
//                   <div className="flex items-center gap-4">
//                     <HelpCircle
//                       size={23}
//                       strokeWidth={1.8}
//                     />
//
//                     <span className="text-[17px]">
//                       Support
//                     </span>
//                   </div>
//
//                   <ChevronRight
//                     size={19}
//                     className="text-slate-400"
//                   />
//                 </button>
//
//                 {/* DOCUMENTATION */}
//                 <button
//                   type="button"
//                   onClick={() =>
//                     handleNavigation("documentation")
//                   }
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     justify-between
//                     rounded-xl
//                     px-4
//                     py-3
//                     text-left
//                     text-white
//                     transition
//                     hover:bg-white/[0.08]
//                   "
//                 >
//                   <div className="flex items-center gap-4">
//                     <BookOpen
//                       size={23}
//                       strokeWidth={1.8}
//                     />
//
//                     <span className="text-[17px]">
//                       Documentation
//                     </span>
//                   </div>
//
//                   <ChevronRight
//                     size={19}
//                     className="text-slate-400"
//                   />
//                 </button>
//
//                 {/* COMMUNITY */}
//                 <button
//                   type="button"
//                   onClick={() => handleNavigation("community")}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     gap-4
//                     rounded-xl
//                     px-4
//                     py-3
//                     text-left
//                     text-white
//                     transition
//                     hover:bg-white/[0.08]
//                   "
//                 >
//                   <Users
//                     size={23}
//                     strokeWidth={1.8}
//                   />
//
//                   <span className="text-[17px]">
//                     Community
//                   </span>
//                 </button>
//
//                 {/* HOMEPAGE */}
//                 <button
//                   type="button"
//                   onClick={() => handleNavigation("homepage")}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     gap-4
//                     rounded-xl
//                     px-4
//                     py-3
//                     text-left
//                     text-white
//                     transition
//                     hover:bg-white/[0.08]
//                   "
//                 >
//                   <Home
//                     size={23}
//                     strokeWidth={1.8}
//                   />
//
//                   <span className="text-[17px]">
//                     Homepage
//                   </span>
//                 </button>
//               </div>
//
//               {/* -----------------------------------------------
//                   SIGN OUT
//               ------------------------------------------------ */}
//               <div className="p-2">
//                 <button
//                   type="button"
//                   onClick={() => handleNavigation("signout")}
//                   className="
//                     flex
//                     w-full
//                     items-center
//                     gap-4
//                     rounded-xl
//                     px-4
//                     py-3
//                     text-left
//                     text-white
//                     transition
//                     hover:bg-red-500/[0.10]
//                     hover:text-red-400
//                   "
//                 >
//                   <LogOut
//                     size={23}
//                     strokeWidth={1.8}
//                   />
//
//                   <span className="text-[17px]">
//                     Sign out
//                   </span>
//                 </button>
//               </div>
//             </div>
//           )}
//
//           {/* ===================================================
//               PROFILE BUTTON
//           ==================================================== */}
//           <button
//             type="button"
//             onClick={() =>
//               setProfileMenuOpen((previous) => !previous)
//             }
//             aria-expanded={profileMenuOpen}
//             className={`
//               group
//               flex
//               w-full
//               items-center
//               gap-4
//               rounded-xl
//               px-3
//               py-2.5
//               text-left
//               transition-all
//               duration-150
//               ${
//                 profileMenuOpen
//                   ? "bg-[#242424]"
//                   : "hover:bg-white/[0.07]"
//               }
//             `}
//           >
//             {/* PROFILE AVATAR */}
//             <div
//               className="
//                 flex
//                 h-12
//                 w-12
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-full
//                 bg-gradient-to-br
//                 from-indigo-400
//                 to-purple-600
//                 text-[19px]
//                 font-semibold
//                 text-white
//                 shadow-[0_0_20px_rgba(99,102,241,0.15)]
//               "
//             >
//               P
//             </div>
//
//             {/* PROFILE TEXT */}
//             <div className="min-w-0 flex-1">
//               <div className="truncate text-[18px] font-semibold text-white">
//                 Prashant
//               </div>
//
//               <div className="truncate text-[15px] text-slate-400">
//                 Personal account
//               </div>
//             </div>
//           </button>
//         </div>
//       </div>
//     </aside>
//   );
// };
//
// export default Sidebar;