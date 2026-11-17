import React from "react";

interface Props {
  userName?: string;
  title?: string;
  onOpenMobileMenu?: () => void;
}

/**
 * DashboardHeader is intentionally hidden.
 * The dashboard no longer renders the top header strip or the "My Projects" action.
 *
 * Keep this component and its props in place so existing imports/usages remain
 * compatible without requiring changes to parent layout files.
 */
const DashboardHeader: React.FC<Props> = () => {
  return null;
};

export default DashboardHeader;
