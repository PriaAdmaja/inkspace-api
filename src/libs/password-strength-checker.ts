type PasswordStrength = {
  score: number; // 0 - 5
  label: "very weak" | "weak" | "medium" | "strong" | "very strong";
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
};

export function passwordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label: PasswordStrength["label"] = "very weak";
  if (score === 2) label = "weak";
  else if (score === 3) label = "medium";
  else if (score === 4) label = "strong";
  else if (score === 5) label = "very strong";

  return { score, label, checks };
}