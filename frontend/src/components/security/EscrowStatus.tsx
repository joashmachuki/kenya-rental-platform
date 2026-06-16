import { Lock, Unlock, AlertCircle, Clock } from "lucide-react";

interface EscrowStatusProps {
  status: "held" | "released" | "refunded" | "disputed";
  amount: number;
  onConfirmViewing?: () => void;
  onDispute?: () => void;
}

export function EscrowStatus({ status, amount, onConfirmViewing, onDispute }: EscrowStatusProps) {
  const configs = {
    held: {
      icon: Lock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      title: "Payment Held Securely",
      desc: `KSh ${amount.toLocaleString()} is held in escrow. Confirm viewing to release to landlord.`,
    },
    released: {
      icon: Unlock,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      title: "Payment Released",
      desc: `KSh ${amount.toLocaleString()} has been released to the landlord.`,
    },
    refunded: {
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
      title: "Payment Refunded",
      desc: `KSh ${amount.toLocaleString()} has been refunded to your M-Pesa.`,
    },
    disputed: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      title: "Payment Disputed",
      desc: `KSh ${amount.toLocaleString()} is under review. Our team will contact you within 24 hours.`,
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${config.color}`}>{config.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{config.desc}</p>

          {status === "held" && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={onConfirmViewing}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                I Have Viewed the Property
              </button>
              <button
                onClick={onDispute}
                className="px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50"
              >
                Report Scam
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
