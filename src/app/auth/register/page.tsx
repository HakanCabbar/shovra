"use client";

import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";

// Yup validation schema
const registerSchema = yup
  .object({
    email: yup
      .string()
      .email("Geçerli bir email girin")
      .required("Email gerekli"),
    password: yup
      .string()
      .min(6, "Şifre en az 6 karakter olmalı")
      .required("Şifre gerekli"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Şifreler eşleşmiyor")
      .required("Şifre doğrulama gerekli"),
    name: yup
      .string()
      .min(2, "İsim en az 2 karakter olmalı")
      .required("İsim gerekli"),
  })
  .required();

type RegisterFormInputs = yup.InferType<typeof registerSchema>;

export default function RegisterPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Kayıt başarılı! Lütfen emailinizi onaylayın ve sonra giriş yapın."
      );

      router.push("/auth/login"); // signup sonrası login sayfasına yönlendir
    } catch (err) {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-sm mx-auto mt-20"
    >
      <h1 className="text-2xl font-bold text-center">Register</h1>

      <div>
        <input
          type="text"
          placeholder="Name"
          {...register("name")}
          className="w-full p-2 border rounded"
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div>
        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className="w-full p-2 border rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="w-full p-2 border rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirm Password"
          {...register("confirmPassword")}
          className="w-full p-2 border rounded"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white p-2 rounded"
      >
        {isSubmitting ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
