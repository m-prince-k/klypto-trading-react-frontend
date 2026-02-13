import { useState, useEffect, useMemo } from "react";
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
  toggleIndicator,
  loadIndicator,
}) => {
  const [activeTab, setActiveTab] = useState("Indicators");
  const [indicators, setIndicators] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchIndicator, setSearchIndicator] = useState("");
  const [searchCurrency, setSearchCurrency] = useState("");
  // const TABS = ["Indicators", "Strategies", "Profiles", "Patterns"];
  const debouncedCurrency = useDebounce(selectedCurrency, 500);
  const debouncedIndicator = useDebounce(selectedIndicator, 500);



  // API calling- Indicators
  async function fetchIndicators() {
    setLoading(true);
    setError(null);
    let response;
    try {
      if (debouncedIndicator) {
        response = await apiService.post(
          `getIndicators?q=${debouncedIndicator}`,
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
      if (!debouncedCurrency) {
        response = await apiService.post(
          `getCurrencies?symbol=${debouncedCurrency}`,
        );
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
    if (title === "Indicators") {
      // setSearchIndicator("");
      fetchIndicators();
    }
    if (title === "Symbol Search") {
      fetchCurrencies();
    }
  }, [title]);

  const filteredIndicators = Object.entries(indicators || {})
    .map(([category, items]) => {
      if (!searchIndicator) {
        return { category, items }; // ✅ full list when empty
      }

      const search = searchIndicator.toLowerCase();
      console.log(search, "searchIndicator");

      const filteredItems = items?.filter((item) =>
        item?.toLowerCase().includes(search),
      );
      // console.log(filteredItems, "filteredIndicators");

      return { category, items: filteredItems };
    })
    .filter((section) => section.items?.length > 0);

  // console.log(searchIndicator, "searchIndicator");
  // console.log(selectedIndicator, "indicators");

  const filteredCurrencies = currencies?.filter((curr) => {
    if (!searchCurrency) return true;
    const search = searchCurrency.toLowerCase();
    console.log(search, "searchCurrency");

    return (
      curr?.raw?.toLowerCase().includes(search) ||
      curr?.base?.toLowerCase().includes(search)
    );
  });

  if (activeTab !== "Indicators") return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/60">
      <div className="w-full px-5 py-4 max-w-3xl h-[90vh] rounded-md bg-white border border-slate-700 shadow-lg">
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
                autoFocus
                placeholder="Search symbol..."
                value={searchCurrency}
                onChange={(e) => {
                  setSearchCurrency(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md "
              />
            </div>

            {/* Listing Grid */}
            <div className="overflow-y-auto mt-3 max-h-[70vh]">
              {loading ? (
                <Spinner />
              ) : filteredCurrencies?.length > 0 ? (
                filteredCurrencies?.map((curr, index) => (
                  <Link
                    to="#"
                    key={index}
                    onClick={() => {
                      setSelectedCurrency(curr?.symbol);
                      onClose();
                    }}
                    className="w-full flex border-b border-slate-200 justify-between px-1 py-3 text-left hover:bg-slate-100"
                  >
                    <div className="flex gap-2 items-center">
                      <span className="text-xl text-yellow-500">
                        <GrBitcoin />
                      </span>
                      <h2 className="uppercase">
                        {curr?.base}/{curr?.quote}
                      </h2>
                    </div>
                    <div>
                      <h3>{curr?.symbol}</h3>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-md text-slate-900 py-6">
                  No Data found
                </p>
              )}
            </div>
          </div>
        )}

        {title === "Indicators" && (
          <div className="mt-3 space-y-4 max-h-[55vh]">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search indicators"
                value={searchIndicator}
                onChange={(e) => setSearchIndicator(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md"
              />
            </div>
            {/* {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  activeTab === tab
                    ? "bg-slate-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))} */}
            {/* Indicators tab */}
            {activeTab === "Indicators" && (
              <div className="overflow-y-auto flex-1 max-h-[68vh]">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-8 h-8 border-4 border-slate-300 border-t-purple-600 rounded-full animate-spin"></div>
                  </div>
                ) : filteredIndicators?.length > 0 ? (
                  filteredIndicators?.map(({ category, items }) => (
                    <div key={category} className="text-left pl-3 py-2">
                      <h3 className="font-semibold text-slate-950 mb-2">
                        {category}
                      </h3>

                      <ul className="grid pl-3 grid-cols-1 text-slate-700 gap-2 text-sm">
                        {items.map((item) => (
                          <label
                            key={item}
                            className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-slate-100"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIndicator.includes(item)}
                              onChange={() => toggleIndicator(item)}
                              className="accent-slate-900 cursor-pointer"
                            />

                            <span>{item}</span>
                          </label>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-900 text-center py-6">
                    No Data found
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
