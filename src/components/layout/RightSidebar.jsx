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
      backgroundColor: "var(--bg-card, #ffffff)",
      borderLeft: "1px solid var(--border-color, #e2e8f0)",
      color: "var(--text-main, #131722)",
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
      color: "var(--text-muted, #787b86)",
      fontSize: "0.65rem",
      transition: "color 0.2s",
    },
    iconItemActive: {
      color: "#2962ff",
    }
  };

  const menuItems = [
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
          onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.color = "var(--text-main, #131722)"; }}
          onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.color = "var(--text-muted, #787b86)"; }}
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
