import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, ArrowRight, Crown } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  currentPlan?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  message,
  currentPlan = 'Free'
}) => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Premium',
      price: 149000,
      period: 'month',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500',
      features: [
        '💬 Unlimited AI Chat',
        '👨‍⚕️ Book doctor consultations',
        '🎥 Video call consultations',
        '📊 Mental health tracking',
        '🆘 Priority support'
      ],
      buttonText: 'Upgrade to Premium',
      buttonColor: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    },
    {
      name: 'VIP',
      price: 499000,
      period: 'month',
      badge: '⭐ VIP',
      badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
      features: [
        '✨ All Premium features',
        '🎁 2 FREE consultations/month',
        '💎 20% off additional consultations',
        '👨‍👩‍👧 Family account (+2 members)',
        '🏆 Priority booking',
        '📱 24/7 Support'
      ],
      buttonText: 'Upgrade to VIP',
      buttonColor: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
      isVIP: true
    }
  ];

  const handleUpgrade = (planName: string) => {
    navigate('/plans', { state: { selectedPlan: planName } });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Upgrade to Unlock Feature
          </DialogTitle>
          <DialogDescription className="text-center text-base mt-2">
            {message}
          </DialogDescription>
          {currentPlan && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-sm text-slate-500">Current plan:</span>
              <Badge variant="outline" className="text-slate-600">
                {currentPlan}
              </Badge>
            </div>
          )}
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                plan.isVIP
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50/50 to-pink-50/50'
                  : 'border-blue-500 bg-blue-50/50'
              }`}
            >
              {/* Badge */}
              <div className="flex justify-center mb-4">
                <Badge className={`${plan.badgeColor} text-white px-3 py-1 text-xs font-semibold`}>
                  {plan.badge}
                </Badge>
              </div>

              {/* Plan Name & Icon */}
              <div className="flex items-center justify-center gap-2 mb-2">
                {plan.isVIP && <Crown className="w-5 h-5 text-purple-600" />}
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {plan.price.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-slate-500">₫</span>
                </div>
                <span className="text-sm text-slate-500">/{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full h-12 text-base font-semibold text-white shadow-lg ${plan.buttonColor}`}
              >
                {plan.buttonText}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t text-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            Để sau
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
