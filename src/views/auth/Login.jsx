import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineGooglePlus, AiOutlineGithub } from "react-icons/ai";
import { FiFacebook } from "react-icons/fi";
import { CiTwitter } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { overrideStyle } from "../../utils/utils";
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

  const submit = (e) => {
    e.preventDefault();

    const credential = loginType === "email" ? state.email : "+" + state.mobile;

    dispatch(
      seller_login({
        credential,
        password: state.password,
      }),
    );
  };

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
      navigate("/");
    }

    if (errorMessage) {
      toast.error(errorMessage);
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
              <input
                type="password"
                value={state.password}
                onChange={(e) =>
                  setState({ ...state, password: e.target.value })
                }
                required
                placeholder="Enter password"
                className="px-3 py-2 border border-slate-700 bg-transparent rounded-md focus:border-indigo-500"
              />
            </div>

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
