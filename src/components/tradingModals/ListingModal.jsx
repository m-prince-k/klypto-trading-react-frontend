import { useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { GrBitcoin } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Spinner } from "./Spinner";
import apiService from "../../services/apiServices";
import { useDebounce } from "../../util/common";

export const ListingModal = ({
  isOpen,
  onClose,
  title,
  selectedCurrency,
  setSelectedCurrency,
  selectedIndicator,
  setSelectedIndicator,
  loadIndicator,
}) => {
  const [activeTab, setActiveTab] = useState("Indicators");
  const [indicators, setIndicators] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredCurrencies = currencies?.filter(
  (curr) =>
    curr.symbol.toLowerCase().includes(selectedCurrency.toLowerCase()) ||
    curr.quote.toLowerCase().includes(selectedCurrency.toLowerCase())
);
  // API calling- Indicators
  async function fetchIndicators() {
    setLoading(true);
    setError(null);
    let response;

    try {
      if (selectedIndicator) {
        response = await apiService.post(
          `getIndicators?q=${selectedIndicator}`,
        );
      } else {
        response = await apiService.post(`getIndicators`);
      }
      setIndicators(response?.data);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch indicators");
    } finally {
      setLoading(false);
    }
  }

  //API-Calling Currencies
  async function fetchCurrencies() {
    setLoading(true);
    setError(null);
    let response;
    try {
      if (!selectedCurrency) {
        response = await apiService.post(`getCurrencies?q=${selectedCurrency}`);
      } else {
        response = await apiService.post(`getCurrencies`);
      }
      setCurrencies(await response?.data);

      // const result = await response?.data?.filter((item) =>
      //   item.toLowerCase().includes(selectedCurrency.toLowerCase()),
      // );
      // setCurrencies(result?.data);
      console.log(currencies, "currencies-------------");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (title === "Symbol Search") {
      fetchCurrencies();
    }
  }, [title]);

  useEffect(() => {
    if (title === "Indicators") {
      fetchIndicators();
    }
  }, [title, selectedIndicator]);

  const TABS = ["Indicators", "Strategies", "Profiles", "Patterns"];
  console.log(selectedIndicator, "selecteddddddddddddddddddddddd");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/60">
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
                value={selectedCurrency}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md "
              />
            </div>

            {/* Listing Grid */}
            <div className="overflow-y-auto mt-3 max-h-[70vh]">
              {loading ? (
                <Spinner />
              ) : filteredCurrencies?.length > 0 ? (
                filteredCurrencies.map((curr) => (
                  <Link
                  to="#"
                    key={curr.symbol}
                    onClick={() => {
                      setSelectedCurrency(curr.symbol); // ✅ final selection
                      onClose(); // ✅ close modal
                    }}
                    className="w-full flex border-b border-slate-200 justify-between py-3 text-left hover:bg-slate-100"
                  >
                    <div className="flex gap-2 items-center">
                      <span className="text-xl text-yellow-500">
                        <GrBitcoin />
                      </span>
                      <h2 className="uppercase">{curr.quote}</h2>
                      <h3>{curr.symbol}</h3>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-sm text-slate-400 py-6">
                  No currencies found
                </p>
              )}
            </div>
          </div>
        )}

        {title === "Indicators" && (
          <div className="mt-3 space-y-4 max-h-[55vh]">
            {/* Search */}{" "}
            <div className="relative">
              {" "}
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />{" "}
              <input
                type="text"
                placeholder="Search indicators"
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md"
              />{" "}
            </div>
            {/* Indicators tab */}
            {activeTab === "Indicators" && (
              <div className="overflow-y-auto max-h-[70vh]">
                {/* Spinner ONLY for listing */}
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-4 border-slate-300 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                ) : indicators ? (
                  Object.entries(indicators).map(([category, items]) => {
                    const filteredItems = items?.filter((item) =>
                      item
                        ?.toLowerCase()
                        .includes(selectedIndicator?.toLowerCase()),
                    );

                    if (!filteredItems.length) return null;

                    return (
                      <div key={category} className="text-left pl-3 py-2">
                        <h3 className="font-semibold text-slate-950 mb-2">
                          {category}
                        </h3>

                        <ul className="grid pl-3 grid-cols-1 text-slate-700 gap-2 text-sm">
                          {filteredItems.map((item) => (
                            <Link
                              to="#"
                              key={item}
                              onClick={() => setSelectedIndicator(item)}
                              className="px-2 py-1 rounded cursor-pointer hover:bg-slate-100"
                            >
                              {item}
                            </Link>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500 text-center">
                    No indicators found
                  </p>
                )}
              </div>
            )}
            {/* Other tabs */}
            {activeTab !== "Indicators" && !loading && (
              <p className="text-sm text-slate-500 text-center">
                {activeTab} content coming soon
              </p>
            )}
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
