import Image from "next/image";
import LoginForm from "./_components/login-form";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#F5F2ED]"
      style={{
        backgroundColor: "#F5F2ED",
        backgroundImage: `radial-gradient(circle, rgba(122,118,112,0.25) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      <div className="w-full max-w-sm border border-[#D8D3C8] rounded-lg p-8 bg-[#F5F2ED]">
        <div className="relative w-[240px] h-[120px] mx-auto">
          <Image
            src="/logo.png"
            alt="Winmart+ logo"
            fill
            className="object-cover"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}