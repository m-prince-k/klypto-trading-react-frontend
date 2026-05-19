import { useState, useEffect, useMemo } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { GrBitcoin } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Spinner } from "./Spinner";
import apiService from "../../services/apiServices";
import { useDebounce } from "../../util/common";
import IndicatorAlert from "../indicator/IndicatorAlert";

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
      <div 
        className="w-full px-5 py-4 max-w-3xl h-[90vh] rounded-md shadow-lg border"
        style={{
          backgroundColor: "var(--bg-card, #ffffff)",
          color: "var(--text-main, #131722)",
          borderColor: "var(--border-color, #e2e8f0)"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl" style={{ color: "var(--text-main, #131722)" }}>{title}</h2>
          <IoCloseSharp
            size={20}
            onClick={onClose}
            className="cursor-pointer"
            style={{ color: "var(--text-muted, #94a3b8)" }}
          />
        </div>
        {title === "Symbol Search" && (
          <div className=" py-3 ">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted, #94a3b8)" }} />
              <input
                type="text"
                autoFocus
                placeholder="Search symbol..."
                value={searchCurrency}
                onChange={(e) => {
                  setSearchCurrency(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border"
                style={{
                  backgroundColor: "var(--bg-main, #ffffff)",
                  color: "var(--text-main, #131722)",
                  borderColor: "var(--border-color, #cbd5e1)"
                }}
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
                    key={index}
                    onClick={() => {
                      setSelectedCurrency(curr?.symbol);
                      onClose();
                    }}
                    className="w-full flex border-b justify-between px-1 py-3 text-left transition-colors"
                    style={{
                      borderColor: "var(--border-color, #e2e8f0)",
                      color: "var(--text-main, #131722)",
                      textDecoration: "none"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-card-hover, #f1f5f9)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <div className="flex gap-2 fs-6 items-center">
                      <span className=" text-yellow-500">
                        <GrBitcoin />
                      </span>
                      <h2 className="uppercase fs-6 mb-0" style={{ color: "var(--text-main, #131722)" }}>
                        {curr?.base}/{curr?.quote}
                      </h2>
                    </div>
                    <div>
                      <h3 className=" fs-6 mb-0" style={{ color: "var(--text-muted, #64748b)" }}>{curr?.symbol}</h3>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-md py-6" style={{ color: "var(--text-muted, #64748b)" }}>
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
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted, #94a3b8)" }} />
              <input
                type="text"
                autoFocus
                placeholder="Search indicators"
                value={searchIndicator}
                onChange={(e) => setSearchIndicator(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border"
                style={{
                  backgroundColor: "var(--bg-main, #ffffff)",
                  color: "var(--text-main, #131722)",
                  borderColor: "var(--border-color, #cbd5e1)"
                }}
              />
            </div>
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
                  <ul className="list-unstyled ps-7 fs-6">
                    {filteredIndicators?.map((item, index) => (
                      <li key={index}>
                        <div 
                          className="d-flex align-items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors"
                          style={{
                            color: "var(--text-main, #334155)"
                          }}
                          onClick={() => {
                            toggleIndicator(item.slug);
                            onClose();
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-card-hover, #f1f5f9)"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <span>{item.label} -- {item.slug} </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: "var(--text-muted, #64748b)" }}>No Data found</p>
                )}
              </div>
            )}

            {/* Other tabs */}
            {activeTab !== "Indicators" && !loading && (
              <p className="text-sm text-center" style={{ color: "var(--text-muted, #64748b)" }}>
                {activeTab} content coming soon
              </p>
            )}
          </div>
        )}

        {title === "Alerts" && (
          <div>
            <IndicatorAlert/>
          </div>
        )}
      </div>
    </div>
  );
};
