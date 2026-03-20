import { PricingPackage } from '@/lib/types';
import { Check } from 'lucide-react';

interface PricingCardProps {
  package: PricingPackage;
}

export default function PricingCard({ package: pkg }: PricingCardProps) {
  return (
    <div className={`rounded-lg overflow-hidden shadow-lg transition ${
      pkg.isPopular
        ? 'bg-black text-white ring-2 ring-[#d4a32b] transform scale-105 md:scale-110'
        : 'bg-black text-gray-100'
    }`}>
      {/* Header */}
      <div className="bg-black px-6 py-8 border-b border-gray-800">
        <h3 className={`text-lg font-bold mb-2 ${pkg.isPopular ? 'text-[#d4a32b]' : 'text-gray-300'}`}>
          {pkg.duration}
        </h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-4xl font-bold ${pkg.isPopular ? 'text-[#d4a32b]' : 'text-white'}`}>
            RS {pkg.price}.00
          </span>
          <span className="text-sm text-gray-400">/{pkg.duration.includes('06') ? 'Day (6 Months)' : 'Day (12 Months)'}</span>
        </div>
        <p className="text-xs text-[#d4a32b]">{pkg.billed}</p>
      </div>

      {/* Benefits */}
      <div className="px-6 py-8">
        {/* Main benefits */}
        <div className="mb-8">
          <h4 className="font-bold text-[#d4a32b] uppercase text-xs mb-4">TOP BENEFITS</h4>
          <ul className="space-y-3">
            {pkg.benefits.map((benefit, idx) => (
              <li key={idx} className="flex gap-3 items-start text-sm">
                <Check size={16} className="text-[#d4a32b] flex-shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Extra benefits */}
        {pkg.extraBenefits && pkg.extraBenefits.length > 0 && (
          <div className="mb-6 border-t border-gray-700 pt-6">
            <h4 className="font-bold text-[#d4a32b] uppercase text-xs mb-4">EXTRA BENEFITS</h4>
            {pkg.extraBenefits.map((benefit, idx) => (
              <div key={idx} className="mb-3">
                <p className="text-sm text-gray-300 mb-2">{benefit.label}</p>
                <div className="flex items-center justify-center bg-gradient-to-r from-gray-800 to-[#d4a32b] rounded py-3 px-4">
                  <span className="font-bold text-lg text-[#d4a32b]">Free</span>
                  <span className="flex-1"></span>
                  <span className="font-bold text-2xl text-[#d4a32b]">{benefit.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <button
          className={`w-full py-3 rounded font-bold text-sm uppercase transition ${
            pkg.isPopular
              ? 'bg-[#d4a32b] text-black hover:bg-[#c49320]'
              : 'bg-gray-800 text-[#d4a32b] hover:bg-gray-700'
          }`}
        >
          Choose Plan
        </button>
      </div>
    </div>
  );
}
