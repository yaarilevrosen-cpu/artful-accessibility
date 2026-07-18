import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axios";
import { useNavigate } from "react-router-dom";
import LandingIntro from "./LandingIntro";
import ErrorText from "../../components/Typography/ErrorText";
import InputText from "../../components/Input/InputText";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

function Login() {
  const INITIAL_LOGIN_OBJ = {
    password: "",
    username: "",
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);
  const navigate = useNavigate();

  // Theme State and Logic
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(currentTheme === "light" ? "dark" : "light");
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (loginObj.username.trim() === "") {
      return setErrorMessage("Username is required!");
    }
    if (loginObj.password.trim() === "") {
      return setErrorMessage("Password is required!");
    }

    setLoading(true);

    try {
      console.log("Sending POST request to backend /auth/login...");

      const response = await axiosInstance.post("/auth/login", {
        username: loginObj.username,
        password: loginObj.password,
      });

      console.log("Backend response:", response.data);
      
      if (response && response.data) {
        
        const user = response.data.data;
        // Store user and token in localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", user.accessToken || "");

        // Check role and navigate accordingly
        if (user.role === "admin") {
          console.log("Role is admin. Navigating to /admin/welcome...");
          navigate("/admin/welcome");
        } else {
          console.log("Role is worker. Navigating to /worker-dashboard...");
          navigate("/worker/welcomeW");
        }
      }
    } catch (error) {
      console.error("Error response from backend:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage("");
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  return (
    <div className="min-h-screen bg-base-200 dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative flex items-center">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <label className="swap swap-rotate">
          <input
            type="checkbox"
            onChange={toggleTheme}
            checked={currentTheme === "dark"}
          />
          <SunIcon
            className={
              "swap-off fill-current w-8 h-8 text-yellow-500 " +
              (currentTheme === "light" ? "block" : "hidden")
            }
          />
          <MoonIcon
            className={
              "swap-on fill-current w-8 h-8 text-gray-400 " +
              (currentTheme === "dark" ? "block" : "hidden")
            }
          />
        </label>
      </div>

      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 dark:bg-gray-800 rounded-xl">
          <div>
            <LandingIntro />
          </div>
          <div className="py-24 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">Login</h2>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                <InputText
                  type="text"
                  defaultValue={loginObj.username}
                  updateType="username"
                  containerStyle="mt-4"
                  labelTitle="Username"
                  updateFormValue={updateFormValue}
                />

                <InputText
                  defaultValue={loginObj.password}
                  type="password"
                  updateType="password"
                  containerStyle="mt-4"
                  labelTitle="Password"
                  updateFormValue={updateFormValue}
                />
              </div>

              <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
              <button
                type="submit"
                className={
                  "btn mt-2 w-full text-black bg-yellow-600 hover:bg-yellow-700 border-none " +
                  (loading ? "loading" : "")
                }
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
