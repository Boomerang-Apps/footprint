import { CreditCard } from 'lucide-react';

type PaymentMethod = 'applePay' | 'googlePay' | 'creditCard';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  {
    id: 'applePay',
    label: 'Apple Pay',
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C4.24 16.7 4.89 10.55 8.8 10.31c1.28.07 2.15.72 2.92.76.93-.19 1.82-.86 2.82-.78 1.19.1 2.09.58 2.68 1.49-2.44 1.46-1.86 4.67.38 5.57-.46 1.17-.67 1.7-1.55 2.93ZM12.05 10.23c-.15-2.38 1.79-4.38 4.04-4.53.32 2.64-2.38 4.62-4.04 4.53Z" />
      </svg>
    ),
  },
  {
    id: 'googlePay',
    label: 'Google Pay',
    icon: (
      <svg className="w-7 h-7" viewBox="-6 -6 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" fill="black" />
      </svg>
    ),
  },
  {
    id: 'creditCard',
    label: 'כרטיס אשראי',
    icon: <CreditCard className="w-6 h-6 text-zinc-500" />,
  },
];

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-brand-purple" />
        אמצעי תשלום
      </h2>
      <div className="space-y-2.5">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-right transition-all ${
              selected === method.id
                ? 'border-violet-500 bg-violet-500/5'
                : 'border-zinc-200 bg-white hover:border-zinc-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              selected === method.id ? 'border-violet-500' : 'border-zinc-300'
            }`}>
              {selected === method.id && (
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-zinc-900">{method.label}</div>
            </div>
            {method.icon}
          </button>
        ))}
      </div>
    </section>
  );
}
