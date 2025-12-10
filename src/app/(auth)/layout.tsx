export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at top, rgba(140, 169, 255, 0.2), transparent 55%)",
        }}
      />
      <div 
        className="relative z-10 w-full max-w-4xl rounded-3xl p-8 backdrop-blur border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border-strong)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

