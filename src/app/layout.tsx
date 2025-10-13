import Header from "./components/Header";
import Footer from "./components/Footer";

import "./styles/globals.css";

export const metadata = {
  title: "Shovra",
  description: "E-commerce platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-slate-900 min-h-screen flex flex-col">
        <Header />
        <main className="bg-white flex-1 px-4 py-8 md:px-8 lg:px-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
