import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const PasswordInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full flex justify-between items-center relative">
      <Input
        className="relative"
        type={showPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};
