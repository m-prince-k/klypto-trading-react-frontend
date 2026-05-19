import React from "react";
import { FiList, FiBriefcase, FiAlignLeft, FiLayers, FiMoreVertical } from "react-icons/fi";
import { BsLink45Deg } from "react-icons/bs";

const RightSidebar = ({ 
  isWatchlistOpen, 
  toggleWatchlist, 
  isDetailsOpen, 
  toggleDetails, 
  isAlertsOpen, 
  toggleAlerts 
}) => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      height: "calc(100vh - 60px)",
      backgroundColor: "#ffffff",
      borderLeft: "1px solid #9b9b9bff",
      color: "#131722",
      paddingTop: "16px",
      gap: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    iconItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px",
      cursor: "pointer",
      fontSize: "0.65rem",
      transition: "color 0.2s",
    },
    iconItemActive: {
      color: "#2962ff",
    }
  };

  const menuItems = [
    { id: 'details', icon: <FiBriefcase size={20} />, label: "Details", active: isDetailsOpen },
    { id: 'watchlist', icon: <FiList size={20} />, label: "Watchlist", active: isWatchlistOpen },
    { id: 'alerts', icon: <FiAlignLeft size={20} />, label: "Alerts" },
    { id: 'depth', icon: <FiLayers size={20} />, label: "Market Depth" },
    { id: 'options', icon: <BsLink45Deg size={20} />, label: "Option Chain" },
    { id: 'more', icon: <FiMoreVertical size={20} />, label: "More" },
  ];

  return (
    <div style={styles.container}>
      {menuItems.map((item, idx) => (
        <div 
          key={idx} 
          style={{
            ...styles.iconItem,
            ...(item.active ? styles.iconItemActive : {})
          }}
          title={item.label}
          onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.color = "#666768ff"; }}
          onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.color = "#000000ff"; }}
          onClick={() => {
            if (item.id === 'watchlist' && toggleWatchlist) {
              toggleWatchlist();
            } else if (item.id === 'details' && toggleDetails) {
              toggleDetails();
            } else if (item.id === 'alerts' && toggleAlerts) {
              toggleAlerts();
            }
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};

export default RightSidebar;
