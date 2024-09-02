import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";
import backgroundImage from "../../assets/background-image.jpg";
import axios from "axios";
import useGeoLocation from "./UseGeoLocation";

const EmployeeAttendance = () => {
  const [cnicLast6, setCnicLast6] = useState("");
  const [username, setUsername] = useState(""); // State for username
  const [attendanceRecorded, setAttendanceRecorded] = useState(false);
  const [action, setAction] = useState(null); // State for action: "login" or "logout"
  const [dropdownOpen, setDropdownOpen] = useState(false); // Manage dropdown visibility
  const { city, country, lat, lon } = useGeoLocation();
  const navigate = useNavigate();

  // Handle the form submission
  const handleSubmit = async () => {
    if (attendanceRecorded) {
      toast.info("You have already recorded your attendance for today.");
      return;
    }

    if (action === null) {
      toast.warn("Please select an action.");
      return;
    }

    if (cnicLast6.length === 6 && username) {
      try {
        const fetchIpAddress = async () => {
          try {
            const ipResponse = await axios.get(
              "https://api.ipify.org?format=json"
            );
            return ipResponse.data.ip;
          } catch (error) {
            console.error("Error fetching IP address:", error);
            toast.error("Failed to fetch IP address.");
            return null;
          }
        };

        const fetchLocation = () => {
          if (city && country && lat && lon) {
            return {
              city: city || "Unknown",
              country: country || "Unknown",
              latitude: lat || "Unknown",
              longitude: lon || "Unknown",
            };
          } else {
            console.error("Location data is not available.");
            toast.error("Location data is not available.");
            return null;
          }
        };

        const ipAddress = await fetchIpAddress();
        const location = fetchLocation();

        if (ipAddress && location) {
          try {
            const response = await toast.promise(
              axios.post("http://localhost:3002/api/record", {
                cnic_last6: cnicLast6,
                username: username,
                ipAddress: ipAddress,
                location: location,
                action: action, // Include action in the request
              }),
              {
                pending: "Processing...",
                success: "Attendance recorded successfully!",
                error: {
                  render({ data }) {
                    const errorMessage =
                      data.response?.data?.message ||
                      "Failed to record attendance. Please try again.";
                    return errorMessage;
                  },
                },
              }
            );

            if (response && response.status === 200) {
              toast.success("Attendance recorded successfully!");
              setAttendanceRecorded(true); // Update state after successful recording
              navigate("/attendance");
            }
          } catch (error) {
            if (error.response && error.response.status === 400) {
              toast.error(
                "You have already recorded your attendance for today."
              );
            } else {
              toast.error("Failed to record attendance. Please try again.");
            }
          }
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.");
      }
    } else {
      toast.warn("Please enter a valid 6-digit code and username.");
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute inset-0 bg-customDark opacity-95"></div>

      <div className="flex justify-center mt-6 z-10 mb-8">
        <Link to={"/"}>
          <button className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300">
            Back to Login Page
          </button>
        </Link>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="flex flex-col items-center gap-2 w-2/5 bg-white bg-opacity-10 p-8 rounded-lg shadow-md">
          <div>
            <img src={logo} alt="Logo" className="w-36 h-auto" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-8">
            Employee Attendance
          </h2>
          <div className="bg-customDark w-2/3 p-2 py-8 text-lg rounded-lg px-4 text-white flex flex-col items-center gap-4">
            <input
              type="text"
              placeholder="Username..."
              className="outline-none border border-1 rounded-lg px-4 py-2 text-white bg-transparent w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={attendanceRecorded} // Disable input if attendance is already recorded
            />
            <input
              type="number"
              placeholder="Employee Id..."
              className="outline-none border border-1 rounded-lg px-4 py-2 text-white bg-transparent w-full"
              value={cnicLast6}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,6}$/.test(value)) {
                  setCnicLast6(value);
                }
              }}
              maxLength={6}
              required
              disabled={attendanceRecorded} // Disable input if attendance is already recorded
            />
            <div className="relative w-full">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`bg-blue-500 text-white font-bold hover:bg-blue-400 px-4 py-2 rounded-lg w-full ${
                  action ? "bg-blue-600" : ""
                }`}
                disabled={attendanceRecorded}
              >
                {action
                  ? action.charAt(0).toUpperCase() + action.slice(1)
                  : "Select Login/Logout"}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setAction("login");
                      setDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm font-semibold ${
                      action === "login"
                        ? "bg-gray-200 text-blue-500"
                        : "text-gray-700"
                    } hover:bg-gray-100`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setAction("logout");
                      setDropdownOpen(false);
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm font-semibold ${
                      action === "logout"
                        ? "bg-gray-200 text-red-500"
                        : "text-gray-700"
                    } hover:bg-gray-100`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              className="bg-customYellow text-black font-bold hover:bg-yellow-400 px-4 py-2 w-full rounded-full"
            >
              Submit
            </button>
          </div>
          {attendanceRecorded && (
            <p className="text-yellow-400 mt-4">
              You have already recorded your attendance for today.
            </p>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default EmployeeAttendance;
