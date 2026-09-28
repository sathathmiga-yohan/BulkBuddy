import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./CsvImport.css";

function CsvImport() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [rowErrors, setRowErrors] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setRowErrors([]);
      setResult(null);

      const response = await api.post(
        "/deals/import-csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);

    } catch (error) {
      console.error(
        "CSV import error:",
        error
      );

      const detail =
        error.response?.data?.detail;

      // Backend validation error:
      // {
      //   message: "...",
      //   errors: [...]
      // }
      if (
        detail &&
        typeof detail === "object"
      ) {
        setError(
          detail.message ||
            "CSV import failed."
        );

        if (Array.isArray(detail.errors)) {
          setRowErrors(detail.errors);
        }

        if (
          Array.isArray(
            detail.missing_columns
          )
        ) {
          setError(
            `${
              detail.message ||
              "Required CSV columns are missing"
            }: ${detail.missing_columns.join(
              ", "
            )}`
          );
        }
      } else {
        setError(
          detail ||
            "CSV import failed."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="csv-page">
      <div className="csv-container">

        <Link
          to="/seller/dashboard"
          className="csv-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="csv-card">

          <div className="csv-heading">
            <span>
              Seller Center
            </span>

            <h1>
              Import Deals
            </h1>

            <p>
              Upload a CSV file to create
              multiple deals at once.
            </p>
          </div>

          {/* REQUIRED FORMAT */}
          <div className="csv-format">

            <h3>
              Required CSV columns
            </h3>

            <p>
              product_name, description,
              normal_price, group_price,
              minimum_buyers,
              maximum_quantity, deadline
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            <label className="csv-upload-box">

              <span className="csv-icon">
                📄
              </span>

              <strong>
                {file
                  ? file.name
                  : "Choose CSV File"}
              </strong>

              <span>
                Click here to select a .csv file
              </span>

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => {
                  setFile(
                    event.target.files?.[0] ||
                      null
                  );

                  setError("");
                  setRowErrors([]);
                  setResult(null);
                }}
              />

            </label>

            {/* ERROR */}
            {error && (
              <div className="csv-error">
                {error}
              </div>
            )}

            {/* ROW ERRORS */}
            {rowErrors.length > 0 && (
              <div className="csv-row-errors">

                <strong>
                  Validation Errors
                </strong>

                {rowErrors.map(
                  (item, index) => (
                    <p key={index}>
                      Row {item.row}:{" "}
                      {item.error}
                    </p>
                  )
                )}

              </div>
            )}

            <button
              type="submit"
              className="csv-import-button"
              disabled={loading}
            >
              {loading
                ? "Importing..."
                : "Import Deals"}
            </button>

          </form>

          {/* SUCCESS */}
          {result && (
            <div className="csv-result">

              <h3>
                Import Result
              </h3>

              <p>
                {result.message}
              </p>

              <p>
                Deals created:{" "}
                <strong>
                  {result.imported_count ?? 0}
                </strong>
              </p>

            </div>
          )}

        </div>
      </div>
    </main>
  );
}

export default CsvImport;