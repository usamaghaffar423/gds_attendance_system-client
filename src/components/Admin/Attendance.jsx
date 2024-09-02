import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../../assets/logo.png";
import { NavLink } from "react-router-dom";
import { format } from "date-fns";

const formatDate = (isoString) => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) throw new Error("Invalid Date");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const formatTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) throw new Error("Invalid Time");
    return format(date, "hh:mm:ss a"); // Format: 06:01:00 PM
  } catch (error) {
    console.error("Error formatting time:", error);
    return "N/A";
  }
};

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3002/api/all")
      .then((response) => {
        console.log("API Response:", response.data);
        setAttendanceData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Axios Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function getDate() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const date = today.getDate();
    return `${month}/${date}/${year}`;
  }

  console.log(getDate());

  const groupedAttendanceData = attendanceData.reduce((acc, record) => {
    const formattedDate = formatDate(record.date);
    console.log(formattedDate);
    const key = `${record.username}-${formattedDate}`;

    if (!acc[key]) {
      acc[key] = {
        username: record.username,
        cnic_last6: record.cnic_last6,
        date: record.date,
        loginTime: null,
        logoutTime: null,
      };
    }

    if (record.action === "login") {
      acc[key].loginTime = record.loginTime;
      acc[key].logoutTime = record.logoutTime ? record.logoutTime : "N/A";
    } else if (record.action === "logout") {
      acc[key].loginTime = record.loginTime ? record.loginTime : "N/A";
      acc[key].logoutTime = record.logoutTime;
    }
    return acc;
  }, {});

  const sortedGroupedData = Object.values(groupedAttendanceData).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="flex h-screen bg-customBlueDarkHigh">
      {/* Sidebar */}
      <aside className="w-1/5 bg-customBlueDark text-white p-4 shadow-lg">
        <img src={logo} alt="Logo" className="w-3/6 mx-auto mb-4" />
        <ul className="space-y-4 mt-8 flex flex-col">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `p-2 rounded-lg cursor-pointer my-2 ${
                isActive ? "bg-slate-950" : "bg-gray-700 hover:bg-slate-800"
              }`
            }
          >
            All Employees
          </NavLink>
          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `p-2 rounded-lg cursor-pointer my-2 ${
                isActive ? "bg-slate-950" : "bg-gray-700 hover:bg-slate-800"
              }`
            }
          >
            Attendance
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `p-2 rounded-lg cursor-pointer my-2 ${
                isActive ? "bg-slate-950" : "bg-gray-700 hover:bg-slate-800"
              }`
            }
          >
            Register New Employee
          </NavLink>
        </ul>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 bg-customBlueDarkHigh">
        <h1 className="text-3xl font-bold mb-4 text-white text-left">
          Attendance Records
        </h1>
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : error ? (
          <div className="p-4 text-red-500">Error: {error}</div>
        ) : sortedGroupedData.length > 0 ? (
          <div className="min-w-full rounded-lg shadow-md bg-customBlueDark p-4 text-white">
            {/* Header Row */}
            <div className="flex text-gray-200 bg-slate-950 my-2 rounded-lg">
              <div className="py-3 px-4 flex-1">
                <h3 className="text-green-500 font-semibold">Username</h3>
              </div>
              <div className="py-3 px-4 flex-1">
                <h3 className="text-green-500 font-semibold">
                  CNIC Last 6 Digits
                </h3>
              </div>
              <div className="py-3 px-4 flex-1 font-semibold">
                <h3 className="text-green-500 font-semibold">Date</h3>
              </div>
              <div className="py-3 px-4 flex-1 font-semibold">
                <h3 className="text-green-500 font-semibold">Login Time</h3>
              </div>
              <div className="py-3 px-4 flex-1 font-semibold">
                <h3 className="text-green-500 font-semibold">Logout Time</h3>
              </div>
            </div>

            {/* Scrollable Body Rows */}
            <div className="scrollable-content max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-custom">
              {sortedGroupedData.map((record, idx) => (
                <div
                  key={idx}
                  className="flex min-w-full bg-customBlueDarkHigh rounded-lg hover:bg-slate-950 text-white my-2"
                >
                  <div className="py-3 px-4 flex-1">
                    <p className="text-gray-400">{record.username}</p>
                  </div>
                  <div className="py-3 px-4 flex-1">
                    <p className="text-gray-400">{record.cnic_last6}</p>
                  </div>
                  <div className="py-3 px-4 flex-1">
                    <p className="text-gray-400">{getDate(record.date)}</p>
                  </div>
                  <div className="py-3 px-4 flex-1">
                    <p className="text-gray-400">
                      {record.loginTime ? formatTime(record.loginTime) : "N/A"}
                    </p>
                  </div>
                  <div className="py-3 px-4 flex-1">
                    <p className="text-gray-400">
                      {record.logoutTime
                        ? formatTime(record.logoutTime)
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-gray-700">No attendance records found.</div>
        )}
      </main>
    </div>
  );
};

export default Attendance;
