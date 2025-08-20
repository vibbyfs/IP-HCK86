"use client";
import { Label } from "./ui_cms/LabelEffect";
import { Input } from "./ui_cms/InputEffect";
import { cn } from "../../lib/cn";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import http from "../../lib/http";

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await http.post("/auth/login", formData);

      localStorage.setItem("access_token", res.data.access_token);

      navigate("/dashboards");
    } catch (err) {
      console.log("ERROR SUBMIT LOGIN", err);
    }
  }

  async function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);

    try {
      const res = await http.post("/auth/login-google", {
        id_token: response.credential,
      });

      localStorage.setItem("access_token", res.data.access_token);
      if (res.data.user) {
        localStorage.setItem("UserId", res.data.user.id);
      }

      navigate("/dashboards/profiles");
    } catch (err) {
      console.log("ERROR LOGIN WITH GOOGLE", err);
    }
  }

  useEffect(() => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(document.getElementById("buttonDiv"), {
      theme: "outline",
      size: "large",
    });
    // google.accounts.id.prompt();
  }, []);

  return (
    <div className="shadow-input mx-auto w-full max-w-md rounded-2xl bg-white p-10 md:rounded-2xl md:p-8 dark:bg-black md:mt-10">
      <h2 className="text-3xl font-bold text-neutral-800 dark:text-neutral-200">
        Selamat Datang Kembali! Kawan Remindly
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
        Masuk untuk melanjutkan pengingatmu yang penuh makna.
      </p>
      <form className="my-8" onSubmit={handleLogin}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="mis. emily@example.com"
            type="email"
            name="email"
            value={formData.email}
            autoComplete="username"
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, [e.target.name]: e.target.value })
            }
          />
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] cursor-pointer"
          type="submit"
        >
          Masuk &rarr;
          <BottomGradient />
        </button>

        <p className="pt-8 text-center text-sm text-neutral-600">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-medium text-green-600 hover:text-green-500"
          >
            Daftar
          </Link>
        </p>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <div className="flex flex-col space-y-4">
          <div className="flex justify-center mt-3">
            <div id="buttonDiv"></div>
          </div>

          {/* <button
            className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_#262626]"
            type="submit">
            <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Google
            </span>
            <BottomGradient />
          </button>
           */}
        </div>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
