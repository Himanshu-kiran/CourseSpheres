import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { BACKEND_URL } from "../utils/utils";
import { FaArrowLeft, FaCreditCard, FaLock, FaShieldAlt, FaCheckCircle } from "react-icons/fa";

function Buy() {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [course, setCourse] = useState({});
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;  //using optional chaining to avoid crashing incase token is not there!!!

  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState("");

  if (!token) {
    navigate("/login");
  }

  useEffect(() => {
    const fetchBuyCourseData = async () => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/course/buy/${courseId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true, // Include cookies if needed
          }
        );
        console.log(response.data);
        setCourse(response.data.course);
        setClientSecret(response.data.clientSecret);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error?.response?.status === 400) {
          setError("you have already purchased this course");
          navigate("/purchases");
        } else {
          setError(error?.response?.data?.errors);
        }
      }
    };
    fetchBuyCourseData();
  }, [courseId]);

  const handlePurchase = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe or Element not found");
      return;
    }

    setLoading(true);
    const card = elements.getElement(CardElement);

    if (card == null) {
      console.log("Cardelement not found");
      setLoading(false);
      return;
    }

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      console.log("Stripe PaymentMethod Error: ", error);
      setLoading(false);
      setCardError(error.message);
    } else {
      console.log("[PaymentMethod Created]", paymentMethod);
    }
    if (!clientSecret) {
      console.log("No client secret found");
      setLoading(false);
      return;
    }
    const { paymentIntent, error: confirmError } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
          billing_details: {
            name: user?.user?.firstName,
            email: user?.user?.email,
          },
        },
      });
    if (confirmError) {
      setCardError(confirmError.message);
    } else if (paymentIntent.status === "succeeded") {
      console.log("Payment succeeded: ", paymentIntent);
      setCardError("your payment id: ", paymentIntent.id);
      const paymentInfo = {
        email: user?.user?.email,
        userId: user.user._id,
        courseId: courseId,
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        status: paymentIntent.status,
      };
      console.log("Payment info: ", paymentInfo);
      await axios
        .post(`${BACKEND_URL}/order`, paymentInfo, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
          toast.error("Error in making payment");
        });
      toast.success("Payment Successful");
      navigate("/purchases");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          to="/courses"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Courses
        </Link>

      {error ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-red-500 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Course Already Purchased</h2>
              <p className="text-gray-600 mb-6">{error}</p>
            <Link
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              to={"/purchases"}
            >
                View My Purchases
            </Link>
          </div>
        </div>
      ) : (
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Course Details Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Course Details</h1>
              
              {/* Course Image */}
              {course.image && (
                <div className="mb-6">
                  <img
                    src={course.image.url}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-xl shadow-lg"
                  />
                </div>
              )}

              {/* Course Information */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{course.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{course.description}</p>
                </div>

                {/* Price Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 font-medium">Course Price</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-green-600">₹{course.price}</span>
                      {course.price < 5999 && (
                        <span className="text-gray-400 line-through ml-2">₹5999</span>
                      )}
                    </div>
                  </div>
                  {course.price < 5999 && (
                    <div className="flex items-center text-green-600 font-semibold">
                      <FaCheckCircle className="mr-2" />
                      {Math.round(((5999 - course.price) / 5999) * 100)}% discount applied!
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-800">What you'll get:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <FaCheckCircle className="text-green-500 mr-3" />
                      <span>Lifetime access to course content</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCheckCircle className="text-green-500 mr-3" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCheckCircle className="text-green-500 mr-3" />
                      <span>24/7 support</span>
                    </div>
                  </div>
            </div>
            </div>
          </div>

            {/* Payment Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCreditCard className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Secure Payment</h2>
                <p className="text-gray-600">Complete your purchase securely</p>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePurchase} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-3">
                    Credit/Debit Card Details
                </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 focus-within:border-blue-500 transition-colors duration-200">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                            color: "#374151",
                          "::placeholder": {
                              color: "#9CA3AF",
                          },
                        },
                        invalid: {
                            color: "#EF4444",
                        },
                      },
                    }}
                  />
                  </div>
                </div>

                {/* Security Badges */}
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaLock className="mr-1" />
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center">
                    <FaShieldAlt className="mr-1" />
                    <span>PCI Compliant</span>
                  </div>
                </div>

                {/* Payment Button */}
                  <button
                    type="submit"
                  disabled={!stripe || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay ₹${course.price}`
                  )}
                  </button>

                {/* Error Display */}
                {cardError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 font-medium text-sm">{cardError}</p>
                  </div>
                )}

                {/* Alternative Payment */}
                <div className="text-center">
                  <button 
                    type="button"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    <span className="mr-2">🅿️</span> Other Payment Methods
              </button>
                </div>
              </form>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500">
                  <p className="mb-2">🔒 Your payment information is secure</p>
                  <p>💳 We accept all major credit and debit cards</p>
                </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Buy;
