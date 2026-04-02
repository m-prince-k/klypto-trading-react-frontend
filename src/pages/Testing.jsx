import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Table, Spinner, Container, Badge } from "react-bootstrap";
import { Dropdown } from "react-bootstrap";

const ScannerTable = ({}) => {
  const [dataSource, setDataSource] = useState({});
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(null);
  const [months, setMonths] = useState(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const totalDays = (days || 1) + (months || 0) * 30;

        const response = await axios.post(
          `https://loiteringly-homeliest-breana.ngrok-free.dev/api/scannerDetail?symbol=ETHUSDT&interval=1d&limit=1000&day=${totalDays}`
        );

        console.log(await response,"_________________---067899678908790-");
        
        setDataSource(await response?.data?.data || {});
      } catch (err) {
        console.error(err);
        setDataSource({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [days, months]);

  /* ================= FLATTEN DATA ================= */
  const tableData = useMemo(() => {
    let rows = [];

    Object.entries(dataSource || {}).forEach(([symbol, candles]) => {
      candles.forEach((candle) => {
        rows.push({
          symbol,
          base: symbol.replace("USDT", ""), // ✅ base extraction
          ...candle,
        });
      });
    });

    return rows;
  }, [dataSource]);

  /* ================= UI ================= */
  return (
    <Container fluid className="p-3">
      <h5 className="mb-3 fw-bold">📊 Scanner Results</h5>

      {/* ================= DAYS ================= */}
      <Dropdown onSelect={(val) => setDays(Number(val))}>
        <Dropdown.Toggle size="sm" variant="light">
          {days ? `${days} Day${days > 1 ? "s" : ""}` : "Select Days"}
        </Dropdown.Toggle>

        <Dropdown.Menu
          style={{
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <Dropdown.Item eventKey={0}>Select Days</Dropdown.Item>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <Dropdown.Item key={d} eventKey={d}>
              {d}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown onSelect={(val) => setMonths(Number(val))}>
        <Dropdown.Toggle size="sm" variant="light">
          {months ? `${months} Month${months > 1 ? "s" : ""}` : "Select Months"}
        </Dropdown.Toggle>

        <Dropdown.Menu
          style={{
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          <Dropdown.Item eventKey={0}>Select Months</Dropdown.Item>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <Dropdown.Item key={m} eventKey={m}>
              {m}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <div
          style={{
            maxHeight: "600px",
            overflowY: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
          }}
        >
          <Table
            striped
            bordered
            hover
            responsive
            className="mb-0"
            style={{ fontSize: "13px" }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#f8fafc",
                zIndex: 1,
              }}
            >
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Base</th>
                <th>Date</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Volume</th>
              </tr>
            </thead>

            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    No Data Found
                  </td>
                </tr>
              ) : (
                tableData.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>

                    {/* SYMBOL */}
                    <td>
                      <Badge bg="dark">{row.symbol}</Badge>
                    </td>

                    {/* BASE */}
                    <td>
                      <Badge bg="secondary">{row.base}</Badge>
                    </td>

                    {/* DATE */}
                    <td>{row.datetime}</td>

                    {/* PRICES */}
                    <td>{row.open}</td>
                    <td className="text-success fw-semibold">{row.high}</td>
                    <td className="text-danger fw-semibold">{row.low}</td>
                    <td>{row.close}</td>

                    {/* VOLUME */}
                    <td>{Number(row.volume).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default ScannerTable;
