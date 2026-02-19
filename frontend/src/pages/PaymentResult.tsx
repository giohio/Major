import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiClient } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface PaymentResult {
  success: boolean;
  message: string;
  payment_type?: 'appointment' | 'subscription';
  appointment_id?: number;
  payment_id?: number;
  subscription?: {
    plan_name: string;
    status: string;
  };
}

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get all VNPay callback parameters
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Check response code
        const responseCode = params.vnp_ResponseCode;

        if (!responseCode) {
          setResult({
            success: false,
            message: 'Missing transaction information'
          });
          setLoading(false);
          return;
        }

        // Call backend to verify and process payment
        const response = await apiClient.post<{ 
          success: boolean; 
          message?: string; 
          payment_id?: number;
          payment_type?: 'appointment' | 'subscription';
          subscription?: {
            plan_name: string;
            status: string;
          };
        }>('/webhook/vnpay/verify', {
          params: params
        });

        if (response.success && responseCode === '00') {
          // Payment successful - refresh user data if subscription
          if (response.payment_type === 'subscription') {
            await refreshUser();
          }

          // Set appropriate success message
          let successMessage = 'Payment successful!';
          if (response.payment_type === 'subscription' && response.subscription) {
            successMessage = `${response.subscription.plan_name} plan activated successfully!`;
          } else if (response.payment_type === 'appointment') {
            successMessage = 'Payment successful! Your appointment has been confirmed.';
          }
          
          setResult({
            success: true,
            message: response.message || successMessage,
            payment_id: parseInt(params.vnp_TxnRef),
            payment_type: response.payment_type,
            subscription: response.subscription
          });
        } else {
          // Payment failed
          const errorMessages: Record<string, string> = {
            '07': 'Transaction declined by bank',
            '09': 'Card not registered for Internet Banking',
            '10': 'Card verification failed',
            '11': 'Card expired or locked',
            '12': 'Card is locked',
            '13': 'Incorrect transaction password',
            '24': 'Transaction cancelled',
            '51': 'Insufficient account balance',
            '65': 'Transaction limit exceeded',
            '75': 'Bank under maintenance',
            '79': 'Too many incorrect password attempts'
          };

          setResult({
            success: false,
            message: errorMessages[responseCode] || 'Payment failed. Please try again.'
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'An error occurred during payment verification';
        
        setResult({
          success: false,
          message: errorMessage
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleReturnToAppointments = () => {
    navigate('/user/appointments');
  };

  const handleViewProfile = () => {
    navigate('/user/profile', { state: { reloadSubscription: true } });
  };

  const handleBookAgain = () => {
    navigate('/doctors');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {result?.success ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-6">
                {result.message}
              </p>
              <div className="space-y-3">
                {result.payment_type === 'subscription' ? (
                  <>
                    <Button 
                      onClick={handleViewProfile}
                      className="w-full"
                    >
                      View My Plan Details
                    </Button>
                    <Button 
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="w-full"
                    >
                      Back to Home
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handleReturnToAppointments}
                      className="w-full"
                    >
                      View My Appointments
                    </Button>
                    <Button 
                      onClick={handleBookAgain}
                      variant="outline"
                      className="w-full"
                    >
                      Book Another Appointment
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600 mb-6">
                {result?.message}
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleBookAgain}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={handleReturnToAppointments}
                  variant="outline"
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Payment Details */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Transaction Details
          </h3>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Transaction ID:</dt>
              <dd className="font-medium text-gray-900">
                {searchParams.get('vnp_TxnRef') || 'N/A'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Time:</dt>
              <dd className="font-medium text-gray-900">
                {searchParams.get('vnp_PayDate') 
                  ? new Date(
                      searchParams.get('vnp_PayDate')!.replace(
                        /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
                        '$1-$2-$3T$4:$5:$6'
                      )
                    ).toLocaleString('en-US')
                  : 'N/A'}
              </dd>
            </div>
            {searchParams.get('vnp_Amount') && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Amount:</dt>
                <dd className="font-medium text-gray-900">
                  {(parseInt(searchParams.get('vnp_Amount')!) / 100).toLocaleString('en-US')} VND
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
