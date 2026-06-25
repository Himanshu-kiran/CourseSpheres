import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course_id');
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId || !courseId) {
      navigate('/dashboard');
      return;
    }

    const verifyPayment = async () => {
      try {
        await api.post('/payment/verify', { sessionId });
        setVerifying(false);
        startCountdown();
      } catch (err) {
        console.error(err);
        setError('Could not verify payment. If you were charged, please contact support.');
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, courseId, navigate]);

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(`/learn/${courseId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (verifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-amber-600 mb-4" />
        <h2 className="text-xl font-medium text-stone-700">Verifying your payment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-10 max-w-md w-full text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h1 className="text-2xl font-serif font-bold text-stone-900 mb-3">Verification Failed</h1>
          <p className="text-stone-500 mb-8">{error}</p>
          <Link to="/dashboard" className="w-full flex justify-center items-center rounded-lg bg-stone-900 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-stone-800 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-10 max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mb-3">
          Payment Successful!
        </h1>
        <p className="text-stone-500 mb-8">
          You've been enrolled successfully. You'll be redirected to the course in <span className="font-bold text-amber-600">{countdown}s</span>.
        </p>
        <div className="space-y-3">
          <Link
            to={`/learn/${courseId}`}
            className="w-full flex justify-center items-center rounded-lg bg-amber-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-amber-700 transition-colors"
          >
            Start Learning Now
          </Link>
          <Link
            to="/my-courses"
            className="w-full flex justify-center items-center rounded-lg border border-stone-300 bg-white py-3 px-4 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50 transition-colors"
          >
            View My Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
