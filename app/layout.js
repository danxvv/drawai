import "./globals.css";

export const metadata = {
  title: "CoDrawing",
  description: "A modern, feature-rich digital drawing and painting application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
