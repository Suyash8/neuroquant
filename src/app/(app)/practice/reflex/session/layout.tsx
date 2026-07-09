/**
 * Session layout — strips the sidebar/topbar chrome for full-screen immersive practice.
 * This layout overrides the parent's Sidebar+TopBar wrapper so the session
 * can occupy the entire viewport.
 */
export default function SessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0F1115]">
      {children}
    </div>
  );
}
