export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout shell sudah di DashboardLayout (client component).
  // Ini hanya pass-through agar route group bekerja.
  return <>{children}</>;
}
