import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineGooglePlus, AiOutlineGithub } from "react-icons/ai";
import { FiFacebook } from "react-icons/fi";
import { CiTwitter } from "react-icons/ci";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import axios from "axios";

import { api_url, overrideStyle } from "../../utils/utils";
import { messageClear, seller_login } from "../../store/Reducers/authReducer";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loader, errorMessage, successMessage } = useSelector(
    (state) => state.auth,
  );

  const [loginType, setLoginType] = useState("email");

  const [state, setState] = useState({
    email: "",
    mobile: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [verificationAlert, setVerificationAlert] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isUnverifiedError = (message = "") => /verify your email/i.test(message);

  const submit = (e) => {
    e.preventDefault();
    setVerificationAlert("");
    setResendSuccess("");

    const credential = loginType === "email" ? state.email : "+" + state.mobile;

    dispatch(
      seller_login({
        credential,
        password: state.password,
      }),
    );
  };

  const resendVerificationEmail = async () => {
    const email = state.email.trim();
    if (!email) {
      toast.error("Enter your email to resend verification link.");
      return;
    }

    try {
      setResendLoading(true);
      await axios.post(`${api_url}/api/seller-resend-verification`, {
        email,
      });
      setResendSuccess("Verification email sent successfully.");
      toast.success("Verification email sent successfully.");
      setResendCooldown(30);
    } catch (error) {
      const resendError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to resend verification email.";
      toast.error(resendError);
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      navigate("/");
    }

    if (errorMessage) {
      if (isUnverifiedError(errorMessage)) {
        setVerificationAlert("Please verify your email before logging in.");
      } else {
        toast.error(errorMessage);
      }
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  return (
    <div className="min-w-screen min-h-screen bg-[#161d31] flex justify-center items-center">
      <div className="w-[380px] text-[#d0d2d6] p-2">
        <div className="bg-[#283046] p-5 rounded-md">
          <h2 className="text-xl mb-3">Welcome to e-commerce</h2>
          <p className="text-sm mb-4">Please signin using email or mobile</p>

          {/* Toggle */}
          <div className="flex mb-4 gap-2">
            <button
              type="button"
              onClick={() => setLoginType("email")}
              className={`flex-1 py-2 rounded ${
                loginType === "email" ? "bg-blue-500" : "bg-slate-700"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setLoginType("mobile")}
              className={`flex-1 py-2 rounded ${
                loginType === "mobile" ? "bg-blue-500" : "bg-slate-700"
              }`}
            >
              Mobile
            </button>
          </div>

          <form onSubmit={submit}>
            {/* Email */}
            {loginType === "email" && (
              <div className="flex flex-col w-full gap-1 mb-3">
                <label>Email</label>
                <input
                  type="email"
                  value={state.email}
                  onChange={(e) =>
                    setState({ ...state, email: e.target.value })
                  }
                  placeholder="Enter email"
                  required
                  className="px-3 py-2 border border-slate-700 bg-transparent rounded-md focus:border-indigo-500"
                />
              </div>
            )}

            {/* Mobile */}
            {loginType === "mobile" && (
              <div className="flex flex-col w-full gap-1 mb-3">
                <label>Mobile Number</label>

                <PhoneInput
                  country={"in"}
                  value={state.mobile}
                  onChange={(phone) => setState({ ...state, mobile: phone })}
                  enableSearch={true}
                  inputStyle={{
                    width: "100%",
                    background: "transparent",
                    border: "1px solid #334155",
                    color: "#d0d2d6",
                    height: "42px",
                  }}
                  buttonStyle={{
                    background: "#283046",
                    border: "1px solid #334155",
                  }}
                />
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col w-full gap-1 mb-5">
              <label>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={state.password}
                  onChange={(e) =>
                    setState({ ...state, password: e.target.value })
                  }
                  required
                  autoComplete="current-password"
                  placeholder="Enter password"
                  className="w-full px-3 py-2 pr-10 border border-slate-700 bg-transparent rounded-md focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {verificationAlert && (
              <div className="mb-4 rounded-md border border-amber-400 bg-amber-100 p-3 text-sm text-amber-900">
                <p>{verificationAlert}</p>
                <button
                  type="button"
                  onClick={resendVerificationEmail}
                  disabled={resendLoading || resendCooldown > 0}
                  className="mt-2 font-semibold text-amber-900 underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resendCooldown > 0
                    ? `Resend verification email in ${resendCooldown}s`
                    : "Resend verification email."}
                </button>
                {resendSuccess && (
                  <p className="mt-2 text-green-700">{resendSuccess}</p>
                )}
              </div>
            )}

            <button
              disabled={loader}
              className="bg-blue-500 w-full hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 mb-3"
            >
              {loader ? (
                <PropagateLoader color="#fff" cssOverride={overrideStyle} />
              ) : (
                "Login"
              )}
            </button>

            <div className="flex items-center mb-3 gap-3 justify-center">
              <p>
                Don’t have an account ?
                <Link to="/register" className="ml-1 text-blue-400">
                  Signup here
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="w-full flex justify-center items-center mb-3">
              <div className="w-[45%] bg-slate-700 h-[1px]"></div>
              <div className="w-[10%] flex justify-center items-center">
                <span className="pb-1">Or</span>
              </div>
              <div className="w-[45%] bg-slate-700 h-[1px]"></div>
            </div>

            {/* Social Icons  */}
            <div className="flex justify-center items-center gap-3">
              <div className="w-[35px] h-[35px] flex rounded-md bg-orange-700 shadow-lg hover:shadow-orange-700/50 justify-center cursor-pointer items-center">
                <AiOutlineGooglePlus />
              </div>
              <div className="w-[35px] h-[35px] flex rounded-md bg-indigo-700 shadow-lg hover:shadow-indigo-700/50 justify-center cursor-pointer items-center">
                <FiFacebook />
              </div>
              <div className="w-[35px] h-[35px] flex rounded-md bg-cyan-700 shadow-lg hover:shadow-cyan-700/50 justify-center cursor-pointer items-center">
                <CiTwitter />
              </div>
              <div className="w-[35px] h-[35px] flex rounded-md bg-purple-700 shadow-lg hover:shadow-purple-700/50 justify-center cursor-pointer items-center">
                <AiOutlineGithub />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
