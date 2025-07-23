// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Digital Merkato Technology PLC",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Font Awesome (latest and only once) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
          integrity="sha512-ZtQxJINrRWxGzCn2fLJd0VPb4us5U+6RGGLqfVhAGH8ZRpq2+z7TxzFGfTKNvZlGv2Xpqx4eLb9uxytY30hvTg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* Responsive viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
