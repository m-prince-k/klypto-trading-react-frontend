import { useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { GrBitcoin } from "react-icons/gr";

export const ListingModal = ({ isOpen, onClose, items, title }) => {
  const [activeTab, setActiveTab] = useState("Indicators");
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const symbolListing = [
    {
      code: "BTCUSD",
      name: "Bitcoin / U.S Dollar",
      category: "index",
      type: "spot crypto",
      icon: "bitcoin",
    },
  ];

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const response = await fetch("http://192.168.1.10:3000/getIndicators");

        if (!response.ok) {
          throw new Error("Failed to fetch indicators");
        }

        const data = await response.json();
        setIndicators(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, []);

  const TABS = ["Indicators", "Strategies", "Profiles", "Patterns"];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full px-5 py-4 max-w-3xl h-9/10 rounded-md bg-white border border-slate-700 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between  ">
          <h2 className="text-xl font-semibold ">{title}</h2>
          <IoCloseSharp
            onClick={onClose}
            className="cursor-pointer text-slate-400"
          />
        </div>
        {title === "Symbol Search" && (
          <div className=" py-3 ">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search symbol..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md "
              />
            </div>

            {/* Listing Grid */}
            {symbolListing.map((item, index) => (
              <div
                key={index}
                className="w-full flex border-b border-slate-200 justify-between py-3"
              >
                {/* LEFT */}
                <div className="flex gap-2 items-center">
                  <span className="text-xl text-yellow-500">
                    <GrBitcoin />
                  </span>

                  <h2 className="uppercase w-30 text-left">{item.code}</h2>
                  <h3>{item.name}</h3>
                </div>

                {/* RIGHT */}
                <div className="flex gap-3 items-center">
                  <h3 className="text-slate-500 text-sm">{item.category}</h3>
                  <h2>{item.type}</h2>

                  <span className="text-md">
                    <GrBitcoin />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {title === "Indicators" && (
          <div className="flex flex-col gap-3 py-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md "
              />
            </div>

            <div className="flex gap-2">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      rounded-full text-sm px-3 py-1 transition
                      ${
                        isActive
                          ? "bg-slate-950 text-slate-100"
                          : "bg-slate-200 text-slate-950"
                      }
                    `}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div>
              <pre>{JSON.stringify(indicators, null, 2)}</pre>{" "}
            </div>
          </div>
        )}

        {title === "Alerts" && (
          <div>
            <h1> Create Alert</h1>
          </div>
        )}
      </div>
    </div>
  );
};
