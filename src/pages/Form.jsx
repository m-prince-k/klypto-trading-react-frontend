import React, { useState } from "react";
import Select from "react-select";

export const Form = () => {
  const [populate, setPopulate] = useState({
    candle: null,
    measure1: null,
    operation: null,
    offset: null,
    measure2: null,
  });

  const [data, setData] = useState([]);

  const handleChange = (selectedOption, actionMeta) => {
    const { name } = actionMeta;

    setPopulate((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedData = [
      { id: 1, candle: populate.candle?.value || "" },
      { id: 2, measure: populate.measure1?.value || "" },
      { id: 3, operation: populate.operation?.value || "" },
      { id: 4, offset: populate.offset?.value || "" },
      { id: 5, measure: populate.measure2?.value || "" },
    ];

    setData(formattedData);
  };

  const candles = [
    { value: "1", label: "Daily" },
    { value: "2", label: "1 Day Ago" },
    { value: "3", label: "2 Day Ago" },
  ];

  const measure = [
    { value: "1", label: "Open" },
    { value: "2", label: "Low" },
    { value: "3", label: "High" },
    { value: "4", label: "Close" },
  ];

  const operations = [
    { value: "1", label: "+" },
    { value: "2", label: "-" },
    { value: "3", label: "×" },
    { value: "4", label: "÷" },
    { value: "5", label: "Greater Than" },
  ];

  const offset = [
    { value: 1, label: "1 Day Ago" },
    { value: 2, label: "2 Days Ago" },
    { value: 3, label: "3 Days Ago" },
    { value: 4, label: "N Days Ago" },
  ];

  // setFirst((prev) => ({...prev,first:32}));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white overflow-hidden shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Trading Form</h1>
        <form onSubmit={handleSubmit}>
          <section className="grid grid-cols-2 gap-4 ">
            <Select
              name="candle"
              options={candles}
              value={populate.candle}
              onChange={handleChange}
              placeholder="Select Candle"
            />

            <Select
              name="measure1"
              options={measure}
              value={populate.measure1}
              onChange={handleChange}
              placeholder="Select Measure"
            />

            <Select
              name="operation"
              options={operations}
              value={populate.operation}
              onChange={handleChange}
              placeholder="Select Operation"
            />

            <Select
              name="offset"
              options={offset}
              value={populate.offset}
              onChange={handleChange}
              placeholder="Select Offset"
            />

            <Select
          name="measure2"
          options={measure}
          value={populate.measure2}
          onChange={handleChange}
          placeholder="Select Measure"
          className=""
        />
          </section>

          <div className="m-8">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Submit
            </button>
          </div>

          {/* Display Data */}
          <div className="mx-8 mt-6">
            <h3 className="font-bold mb-2">Form Data</h3>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </form>
      </div>
    </div>
  );
};
