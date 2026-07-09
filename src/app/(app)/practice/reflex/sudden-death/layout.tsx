export default function SuddenDeathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="absolute inset-0 z-50 bg-background flex flex-col h-[100dvh] overflow-hidden">
      {children}
    </div>
  );
}
