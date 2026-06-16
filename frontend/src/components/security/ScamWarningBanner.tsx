import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface ScamWarningBannerProps {
  keywords?: string[];
}

export function ScamWarningBanner({ keywords }: ScamWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-700 text-sm">Scam Warning</h4>
          <p className="text-sm text-red-600 mt-1">
            This message contains suspicious keywords. Never send money before viewing a property in person.
          </p>
          {keywords && keywords.length > 0 && (
            <p className="text-xs text-red-500 mt-1">
              Detected: {keywords.join(", ")}
            </p>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-red-400 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
