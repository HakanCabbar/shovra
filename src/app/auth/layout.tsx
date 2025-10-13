import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Shovra Auth",
  description: "Authentication pages for Shovra",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        {children}
        <Toaster position="top-right" />
      </div>
    </div>
  );
}
