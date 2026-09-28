"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = Omit<
  ComponentProps<typeof Input>,
  "onChange" | "value" | "type"
> & {
  value: string;
  onChange: (value: string) => void;
};

export const PasswordInput = ({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full flex justify-between items-center relative">
      <Input
        {...props}
        className={cn("relative pr-11", className)}
        disabled={disabled}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        disabled={disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
        aria-pressed={showPassword}
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};
