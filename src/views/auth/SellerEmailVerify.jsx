import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { api_url } from "../../utils/utils";

const SellerEmailVerify = () => {
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const token = queryParams.get("token");
  const queryEmail = queryParams.get("email") || "";

  const [status, setStatus] = useState("loading");
  const [sellerEmail, setSellerEmail] = useState(queryEmail);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");
  const [errorReason, setErrorReason] = useState("");

  useEffect(() => {
    setSellerEmail(queryEmail);
  }, [queryEmail]);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("failed");
        setErrorReason("Missing verification token.");
        return;
      }

      try {
        setStatus("loading");
        const { data } = await axios.get(
          `${api_url}/api/seller-verify-email?token=${encodeURIComponent(token)}`,
        );
        if (data?.email) {
          setSellerEmail(data.email);
        }
        setStatus("success");
      } catch (error) {
        setStatus("failed");
        setErrorReason(
          error?.response?.data?.error || error?.response?.data?.message || "",
        );
        const fallbackEmail = error?.response?.data?.email;
        if (fallbackEmail) {
          setSellerEmail(fallbackEmail);
        }
      }
    };

    verifyEmail();
  }, [token]);

  const resendVerificationEmail = async () => {
    if (!sellerEmail.trim()) {
      setErrorReason("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      setErrorReason("");
      await axios.post(`${api_url}/api/seller-resend-verification`, {
        email: sellerEmail.trim(),
      });
      setResendMessage("Verification email sent successfully.");
      setCooldown(30);
    } catch (error) {
      setErrorReason(
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
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">
              Verifying Your Email
            </h1>
            <p className="mt-4 text-sm text-slate-700">
              Please wait while we verify your email verification link.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">
              Email Verified Successfully
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              Your seller account has been verified successfully.
              <br />
              <br />
              You can now login to your seller dashboard.
            </p>
            <Link
              to="/seller/login"
              className="mt-6 h-[44px] w-full rounded-[8px] bg-[#FF7A1A] text-white font-semibold flex items-center justify-center"
            >
              Go To Seller Login
            </Link>
          </>
        )}

        {status === "failed" && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">
              Verification Link Invalid
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              This verification link is invalid or expired.
            </p>

            {!queryEmail && (
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

            {resendMessage && (
              <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
                {resendMessage}
              </p>
            )}

            {errorReason && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorReason}
              </p>
            )}

            <button
              type="button"
              onClick={resendVerificationEmail}
              disabled={loading || cooldown > 0}
              className="mt-6 h-[44px] w-full rounded-[8px] bg-[#FF7A1A] text-white font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {cooldown > 0
                ? `Resend Verification Email (${cooldown}s)`
                : "Resend Verification Email"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SellerEmailVerify;
