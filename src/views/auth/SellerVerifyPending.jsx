import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { api_url } from "../../utils/utils";

const SellerVerifyPending = () => {
  const location = useLocation();
  const defaultEmail = useMemo(
    () => new URLSearchParams(location.search).get("email") || "",
    [location.search],
  );

  const [sellerEmail, setSellerEmail] = useState(defaultEmail);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSellerEmail(defaultEmail);
  }, [defaultEmail]);

  const resendVerificationEmail = async () => {
    if (!sellerEmail.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await axios.post(`${api_url}/api/seller-resend-verification`, {
        email: sellerEmail.trim(),
      });
      setStatusMessage("Verification email sent successfully.");
      setCooldown(30);
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to resend verification email.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] px-4 py-10 flex items-center justify-center">
      <div
        className="w-full max-w-[420px] bg-white rounded-[12px] p-[30px]"
        style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
      >
        <h1 className="text-2xl font-semibold text-slate-900">
          Verify Your Email
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          Your seller account has been created successfully.
          <br />
          We have sent a verification link to your email.
          <br />
          <br />
          Please verify your email to activate your seller account.
        </p>

        {!defaultEmail && (
          <div className="mt-5">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={sellerEmail}
              onChange={(event) => setSellerEmail(event.target.value)}
              placeholder="Enter your email"
              className="h-[44px] w-full rounded-[8px] border border-slate-300 px-3 outline-none focus:border-[#FF7A1A]"
            />
          </div>
        )}

        {statusMessage && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {statusMessage}
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={resendVerificationEmail}
            disabled={loading || cooldown > 0}
            className="h-[44px] w-full rounded-[8px] bg-[#FF7A1A] text-white font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cooldown > 0
              ? `Resend Verification Email (${cooldown}s)`
              : "Resend Verification Email"}
          </button>

          <Link
            to="/seller/login"
            className="h-[44px] w-full rounded-[8px] border border-slate-300 text-slate-700 font-semibold flex items-center justify-center"
          >
            Back To Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerVerifyPending;
