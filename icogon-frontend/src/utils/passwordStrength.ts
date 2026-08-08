export interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

export const getPasswordStrength = (
  password: string
): PasswordStrength => {
  let score = 0;

  if (password.length >= 8) score++;

  if (/[A-Z]/.test(password)) score++;

  if (/[a-z]/.test(password)) score++;

  if (/[0-9]/.test(password)) score++;

  if (/[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 0:
    case 1:
      return {
        score,
        label: "Very Weak",
        color: "bg-red-500",
      };

    case 2:
      return {
        score,
        label: "Weak",
        color: "bg-orange-500",
      };

    case 3:
      return {
        score,
        label: "Medium",
        color: "bg-yellow-500",
      };

    case 4:
      return {
        score,
        label: "Strong",
        color: "bg-blue-500",
      };

    case 5:
      return {
        score,
        label: "Very Strong",
        color: "bg-green-500",
      };

    default:
      return {
        score: 0,
        label: "",
        color: "",
      };
  }
};