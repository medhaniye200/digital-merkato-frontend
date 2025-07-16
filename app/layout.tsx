// app/layout.tsx
import { ReactNode } from "react";

export const metadata = {
  title: "Digital Merkato Technology PLC",
};

import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-papbXTr4fVtr7JHBYA14b1QyI5Mq0MS8pHxPFeZDy+3zJqYZvxRc2ZoFF57cDPPGTysXoZ4xmG8iY7K05u6B0w=="
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
