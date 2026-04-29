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
}) => {
  const [activeTab, setActiveTab] = useState("Indicators");
  const [indicators, setIndicators] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchIndicator, setSearchIndicator] = useState("");
  const [searchCurrency, setSearchCurrency] = useState("");
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
          `/api/getIndicators?q=${debouncedIndicator}`,
        );
      } else {
        response = await apiService.post(`/api/getIndicators`);
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
          `api/getCurrencies?symbol=${debouncedCurrency}`,
        );
      } else {
        response = await apiService.post(`api/getCurrencies`);
      }
      setCurrencies(await response?.data);
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
    if (title === "Symbol Search") {
      fetchCurrencies();
    }
  }, [title]);

  const filteredIndicators = (indicators ?? []).filter((item) => {
    if (!searchIndicator) return true;

    const getInitials = (text) =>
    text
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toLowerCase();
    const search = searchIndicator.toLowerCase().trim();

    const label = item.label.toLowerCase();
    const initials = getInitials(item.label);

    return (
      label.includes(search) || // normal search
      initials.includes(search) || // SMA type search
      item.slug?.toLowerCase().includes(search)
    );
  });

  const filteredCurrencies = currencies?.filter((curr) => {
    if (!searchCurrency) return true;
    const search = searchCurrency.toLowerCase();

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
          <h2 className="text-xl">{title}</h2>
          <IoCloseSharp
            size={20}
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
            <div className="overflow-y-auto mt-3 max-h-[65vh]">
              {loading ? (
                <Spinner />
              ) : filteredCurrencies?.length > 0 ? (
                filteredCurrencies?.map((curr, index) => (
                  <Link
                    to="#"
                    // key={curr.id}
                    onClick={() => {
                      setSelectedCurrency(curr?.symbol);
                      onClose();
                    }}
                    className="w-full flex border-b border-slate-200 justify-between px-1 py-3 text-left hover:bg-slate-100"
                  >
                    <div className="flex gap-2 fs-6 items-center">
                      <span className=" text-yellow-500">
                        <GrBitcoin />
                      </span>
                      <h2 className="uppercase fs-6">
                        {curr?.base}/{curr?.quote}
                      </h2>
                    </div>
                    <div>
                      <h3 className=" fs-6">{curr?.symbol}</h3>
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
          <div className="mt-3 space-y-4 z-999 max-h-[45vh]">
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
              <div
                className="flex-grow overflow-auto"
                style={{ maxHeight: "63vh" }}
              >
                {loading ? (
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ height: "10rem" }}
                  >
                    <div
                      className="spinner-border text-secondary"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredIndicators.length > 0 ? (
                  <ul className="list-unstyled ps-7 text-secondary fs-6">
                    {filteredIndicators?.map((item, index) => (
                      <li key={index}>
                        <label className="d-flex align-items-center gap-2 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedIndicator.includes(item.slug)}
                            onChange={() => toggleIndicator(item.slug)}
                            className="form-check-input cursor-pointer"
                          />
                          <span>{item.label} -- {item.slug} </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No Data found</p>
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
