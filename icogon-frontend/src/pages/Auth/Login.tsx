import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormData } from "../../utils/validators/authSchema";
import { useAuth } from "../../hooks/authApi";

export default function Login() {
  const { loginUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await loginUser(
      data.email,
      data.password
    );

    if (!result.success) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="w-full max-w-md rounded-xl bg-white shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          Login
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >

          <div>

            <label>Email</label>

            <input
              type="email"
              {...register("email")}
              className="w-full border rounded-lg p-3 mt-1"
            />

            <p className="text-red-500 text-sm">
              {errors.email?.message}
            </p>

          </div>

          <div>

            <label>Password</label>

            <input
              type="password"
              {...register("password")}
              className="w-full border rounded-lg p-3 mt-1"
            />

            <p className="text-red-500 text-sm">
              {errors.password?.message}
            </p>

          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {isLoading ? "Please Wait..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}