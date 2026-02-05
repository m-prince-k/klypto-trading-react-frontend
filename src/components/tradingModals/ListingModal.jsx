import { useState, useEffect, use } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { GrBitcoin } from "react-icons/gr";
import { Link } from "react-router-dom";

export const ListingModal = ({ isOpen, onClose, items, title }) => {
  const [activeTab, setActiveTab] = useState("Indicators");
  const [indicators, setIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const symbolListing = [
    {
      code: "BTCUSD",
      name: "Bitcoin / U.S Dollar",
      category: "index",
      type: "spot crypto",
      icon: "bitcoin",
    },
  ];

  // API calling- Indicators
  async function fetchIndicators() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://192.168.1.4:3000/getIndicators", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch indicators");
      }

      const result = await response.json();

      // IMPORTANT: API structure = { data: {...} }
      setIndicators(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (title === "Indicators") {
      fetchIndicators();
    }
  }, [title]);

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
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search indicators"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {TABS.map((tab,index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full text-sm px-3 py-1 transition
            ${
              activeTab === tab
                ? "bg-slate-950 text-slate-100"
                : "bg-slate-200 text-slate-950"
            }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="mt-3 space-y-4 max-h-[55vh] overflow-y-auto">
              {loading && <p className="text-sm">Loading indicators...</p>}
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {!loading &&
                !error &&
                activeTab === "Indicators" &&
                
                indicators ? (
                    Object.entries(indicators)?.map(([category, items]) => {
                  const filteredItems = items?.filter((item) =>
                    item?.toLowerCase().includes(search?.toLowerCase()),
                  );

                  return (
                    <div key={category} className="text-left pl-3">
                      <h3 className="font-semibold text-slate-950 mb-2">
                        {category}
                      </h3>

                      <ul className="grid pl-3 grid-cols-1 text-slate-700 gap-2 text-sm">
                        {filteredItems?.map((item) => (
                          <Link to='#'
                            key={item}
                            className="px-2 py-1  rounded cursor-pointer hover:bg-slate-100"
                          >
                            {item}
                          </Link>
                        ))}
                      </ul>
                    </div>
                  );
                } ))
 :  
  
(                  
  <p className="text-sm text-slate-500">No indicators found</p>
)  
                

                }

              {activeTab !== "Indicators" && (
                <p className="text-sm text-slate-500">
                  {activeTab} content coming soon
                </p>
              )}
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
