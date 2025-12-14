import { Check, X } from 'lucide-react';
import { validatePassword } from '../../utils/passwordValidator';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  const validation = validatePassword(password);
  const { strength, score, errors } = validation;

  // Requirements checklist
  const requirements = [
    { 
      label: `At least 8 characters`, 
      met: password.length >= 8 
    },
    { 
      label: `One uppercase letter`, 
      met: /[A-Z]/.test(password) 
    },
    { 
      label: `One lowercase letter`, 
      met: /[a-z]/.test(password) 
    },
    { 
      label: `One number`, 
      met: /[0-9]/.test(password) 
    },
    { 
      label: `One special character (!@#$%^&*...)`, 
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password) 
    },
  ];

  // Strength colors
  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-blue-500',
    'very-strong': 'bg-green-500',
  };

  const strengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    'very-strong': 'Very Strong',
  };

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Password Strength</span>
          <span className={`text-xs font-medium ${
            strength === 'weak' ? 'text-red-500' :
            strength === 'medium' ? 'text-yellow-500' :
            strength === 'strong' ? 'text-blue-500' :
            'text-green-500'
          }`}>
            {strengthLabels[strength]}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColors[strength]}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5">
          {requirements.map((req, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 text-xs transition-colors ${
                req.met ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              }`}
            >
              {req.met ? (
                <Check className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

