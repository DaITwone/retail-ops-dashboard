"use client";

import { useActionState } from "react";
import { authenticate } from "../action";

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-xs text-[#7A7670] uppercase tracking-wider">
          Tài Khoản
        </label>
        <input
          type="email"
          name="email"
          className="w-full mt-1 px-3 py-2 border border-[#D8D3C8] rounded bg-white text-xs text-[#7A7670] focus:outline-none focus:border-[#C0392B]"
          placeholder="manager@winmart.com"
          required
        />
      </div>

      <div>
        <label className="text-xs text-[#7A7670] uppercase tracking-wider">
          Mật khẩu
        </label>
        <input
          type="password"
          name="password"
          className="w-full mt-1 px-3 py-2 border border-[#D8D3C8] rounded bg-white text-xs text-[#7A7670] focus:outline-none focus:border-[#C0392B]"
          placeholder="••••••••"
          required
        />
      </div>

      {errorMessage && (
        <p className="text-xs text-[#C0392B]">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 py-2 bg-[#FF0004] text-white text-sm rounded hover:bg-[#a93226] disabled:opacity-50 transition-colors"
      >
        {isPending ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}
      </button>
    </form>
  );
}