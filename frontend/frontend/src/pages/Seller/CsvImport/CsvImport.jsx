
import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Info,
  RotateCcw,
  UploadCloud,
  X
} from "lucide-react";

import SellerLayout from "../SellerDashboard/SellerLayout.jsx";
import { formatPrice } from "../../../data/mockDeals.js";
import "./CsvImport.css";

const REQUIRED_COLUMNS = [
  "product_name",
  "category",
  "description",
  "original_price",
  "group_price",
  "minimum_buyers",
  "maximum_buyers",
  "deadline"
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_ROWS = 500;

const TEMPLATE_ROWS = [
  REQUIRED_COLUMNS,
  [
    "Dell Inspiron Laptop",
    "Electronics",
    "15-inch laptop with 8GB RAM",
    "120000",
    "84000",
    "20",
    "30",
    "2027-12-31"
  ],
  [
    "Wireless Headphones",
    "Accessories",
    "Bluetooth headphones with noise cancellation",
    "18000",
    "12999",
    "15",
    "25",
    "2027-12-31"
  ]
];

function escapeCsvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function downloadCsv(rows, filename) {
  const content = rows
    .map((row) => row.map(escapeCsvCell).join(","))
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + content],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Handles commas, escaped double quotes and line breaks
// inside quoted CSV fields.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  let justClosedQuote = false;

  const input = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
        justClosedQuote = true;
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"' && field === "" && !justClosedQuote) {
      quoted = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      justClosedQuote = false;
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") {
        i += 1;
      }

      row.push(field);

      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      field = "";
      justClosedQuote = false;
      continue;
    }

    if (justClosedQuote && char !== " " && char !== "\t") {
      throw new Error(
        "Invalid CSV: unexpected text after a closing quote."
      );
    }

    if (!justClosedQuote) {
      field += char;
    }
  }

  if (quoted) {
    throw new Error(
      "Invalid CSV: a quoted value was not closed."
    );
  }

  row.push(field);

  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

function validateDeal(deal, rowNumber) {
  const errors = [];

  const originalPrice = Number(deal.original_price);
  const groupPrice = Number(deal.group_price);
  const minimum = Number(deal.minimum_buyers);
  const maximum = Number(deal.maximum_buyers);

  if (!deal.product_name.trim()) {
    errors.push("Product name is required");
  }

  if (!deal.category.trim()) {
    errors.push("Category is required");
  }

  if (!deal.description.trim()) {
    errors.push("Description is required");
  }

  if (
    !deal.original_price.trim() ||
    !Number.isFinite(originalPrice) ||
    originalPrice <= 0
  ) {
    errors.push("Invalid original price");
  }

  if (
    !deal.group_price.trim() ||
    !Number.isFinite(groupPrice) ||
    groupPrice <= 0
  ) {
    errors.push("Invalid group price");
  } else if (
    Number.isFinite(originalPrice) &&
    originalPrice > 0 &&
    groupPrice >= originalPrice
  ) {
    errors.push("Group price must be lower than original price");
  }

  if (
    !deal.minimum_buyers.trim() ||
    !Number.isInteger(minimum) ||
    minimum < 2
  ) {
    errors.push("Minimum buyers must be at least 2");
  }

  if (
    !deal.maximum_buyers.trim() ||
    !Number.isInteger(maximum) ||
    maximum < 2
  ) {
    errors.push("Invalid maximum buyers");
  } else if (
    Number.isInteger(minimum) &&
    minimum >= 2 &&
    maximum < minimum
  ) {
    errors.push("Maximum buyers cannot be below minimum buyers");
  }

  if (
    !validDate(deal.deadline) ||
    deal.deadline <= getToday()
  ) {
    errors.push("Deadline must be a valid future date");
  }

  return {
    ...deal,
    rowNumber,
    originalPrice,
    groupPrice,
    minimum,
    maximum,
    errors,
    valid: errors.length === 0
  };
}

export default function CsvImport() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [importReady, setImportReady] = useState(false);

  const validRows = rows.filter((row) => row.valid);
  const invalidRows = rows.filter((row) => !row.valid);

  const reset = () => {
    setFile(null);
    setRows([]);
    setFileError("");
    setDragging(false);
    setShowAll(false);
    setImportReady(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFile = async (selectedFile) => {
    reset();

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFileError("Please upload a .csv file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError("Maximum file size is 2 MB.");
      return;
    }

    try {
      const text = await selectedFile.text();
      const parsed = parseCsv(text);

      if (parsed.length < 2) {
        setFileError(
          "CSV must contain a header and at least one deal."
        );
        return;
      }

      const headers = parsed[0].map((header) =>
        header.trim().toLowerCase()
      );

      if (new Set(headers).size !== headers.length) {
        setFileError("CSV contains duplicate column names.");
        return;
      }

      const missing = REQUIRED_COLUMNS.filter(
        (column) => !headers.includes(column)
      );

      if (missing.length > 0) {
        setFileError(
          `Missing columns: ${missing.join(", ")}`
        );
        return;
      }

      const dataRows = parsed.slice(1);

      if (dataRows.length > MAX_ROWS) {
        setFileError(
          `Maximum ${MAX_ROWS} deals are allowed per file.`
        );
        return;
      }

      const processed = dataRows.map((values, index) => {
        const deal = {};

        REQUIRED_COLUMNS.forEach((column) => {
          const position = headers.indexOf(column);
          deal[column] = (values[position] ?? "").trim();
        });

        const result = validateDeal(
          deal,
          index + 2
        );

        if (values.length !== headers.length) {
          result.errors.push(
            `Expected ${headers.length} columns but found ${values.length}`
          );
          result.valid = false;
        }

        return result;
      });

      setFile(selectedFile);
      setRows(processed);
    } catch (error) {
      setFileError(
        error.message || "Unable to read this CSV file."
      );
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const prepareImport = () => {
    if (
      !file ||
      rows.length === 0 ||
      invalidRows.length > 0
    ) {
      return;
    }

    setImportReady(true);
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const displayedRows = showAll
    ? rows
    : rows.slice(0, 10);

  return (
    <SellerLayout title="Import CSV">
      <section className="sci-intro">
        <div>
          <small>BULK DEAL UPLOAD</small>
          <h2>Import Deals from CSV</h2>
          <p>
            Upload multiple group-buying deals
            using a CSV file.
          </p>
        </div>

        <button
          type="button"
          className="sci-template-button"
          onClick={() =>
            downloadCsv(
              TEMPLATE_ROWS,
              "bulkbuddy-deals-template.csv"
            )
          }
        >
          <Download size={18} />
          Download Template
        </button>
      </section>

      {importReady && (
        <div className="sci-success" role="status">
          <CheckCircle2 size={23} />

          <div>
            <strong>
              {validRows.length} deals validated successfully!
            </strong>

            <p>
              These deals are ready for backend import.
              No database changes have been made.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setImportReady(false)}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <section className="sci-card">
        <div className="sci-section-title">
          <div className="sci-title-icon">
            <FileUp size={21} />
          </div>

          <div>
            <h2>Upload CSV File</h2>
            <p>
              Select your file or drag it
              into the upload area.
            </p>
          </div>
        </div>

        <div
          className={`sci-dropzone ${
            dragging ? "dragging" : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragging(false);
          }}
          onDrop={handleDrop}
        >
          <div className="sci-upload-icon">
            <UploadCloud size={33} />
          </div>

          <h3>
            Drag and drop your CSV file here
          </h3>

          <p>
            or click below to browse your files
          </p>

          <button
            type="button"
            className="sci-browse-button"
            onClick={() =>
              inputRef.current?.click()
            }
          >
            <FileSpreadsheet size={17} />
            Browse Files
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(event) =>
              handleFile(
                event.target.files?.[0]
              )
            }
            hidden
          />

          <span>
            CSV format only · Maximum 2 MB ·
            Up to 500 deals
          </span>
        </div>

        {fileError && (
          <div className="sci-error-message" role="alert">
            <AlertCircle size={19} />
            {fileError}
          </div>
        )}

        {file && (
          <div className="sci-selected-file">
            <div className="sci-file-icon">
              <FileSpreadsheet size={22} />
            </div>

            <div>
              <strong>{file.name}</strong>

              <span>
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>

            <button
              type="button"
              onClick={reset}
              aria-label="Remove selected file"
            >
              <X size={19} />
            </button>
          </div>
        )}
      </section>

      <section className="sci-guide">
        <div className="sci-guide-heading">
          <Info size={20} />

          <div>
            <h2>CSV Format Guidelines</h2>
            <p>
              Your CSV file must contain
              these exact column names.
            </p>
          </div>
        </div>

        <div className="sci-columns">
          {REQUIRED_COLUMNS.map((column) => (
            <code key={column}>
              {column}
            </code>
          ))}
        </div>

        <p className="sci-guide-note">
          Prices must be positive numbers.
          Group price must be lower than original
          price. Minimum buyers must be at least
          2, maximum buyers cannot be lower than
          minimum buyers, and deadlines must use
          YYYY-MM-DD format with a future date.
        </p>
      </section>

      {rows.length > 0 && (
        <>
          <section className="sci-stats">
            <article>
              <FileSpreadsheet size={22} />

              <span>Total Rows</span>

              <strong>{rows.length}</strong>
            </article>

            <article className="valid">
              <CheckCircle2 size={22} />

              <span>Valid Deals</span>

              <strong>
                {validRows.length}
              </strong>
            </article>

            <article className="invalid">
              <AlertCircle size={22} />

              <span>Invalid Deals</span>

              <strong>
                {invalidRows.length}
              </strong>
            </article>
          </section>

          <section className="sci-card sci-preview-card">
            <div className="sci-preview-header">
              <div>
                <h2>Import Preview</h2>

                <p>
                  Review your deals before
                  preparing the import.
                </p>
              </div>

              <span>
                {rows.length} rows
              </span>
            </div>

            <div className="sci-table-wrapper">
              <table className="sci-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Original Price</th>
                    <th>Group Price</th>
                    <th>Buyers</th>
                    <th>Deadline</th>
                    <th>Validation</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedRows.map((deal) => (
                    <tr key={deal.rowNumber}>
                      <td>
                        {deal.rowNumber}
                      </td>

                      <td>
                        <strong>
                          {deal.product_name || "—"}
                        </strong>
                      </td>

                      <td>
                        {deal.category || "—"}
                      </td>

                      <td>
                        {Number.isFinite(
                          deal.originalPrice
                        )
                          ? formatPrice(
                              deal.originalPrice
                            )
                          : "—"}
                      </td>

                      <td className="sci-price">
                        {Number.isFinite(
                          deal.groupPrice
                        )
                          ? formatPrice(
                              deal.groupPrice
                            )
                          : "—"}
                      </td>

                      <td>
                        {deal.minimum_buyers}/
                        {deal.maximum_buyers}
                      </td>

                      <td>
                        {deal.deadline || "—"}
                      </td>

                      <td>
                        {deal.valid ? (
                          <span className="sci-badge valid">
                            <CheckCircle2 size={14} />
                            Valid
                          </span>
                        ) : (
                          <div className="sci-row-errors">
                            <span className="sci-badge invalid">
                              <AlertCircle size={14} />
                              Invalid
                            </span>

                            <small>
                              {deal.errors.join("; ")}
                            </small>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length > 10 && (
              <button
                type="button"
                className="sci-show-button"
                onClick={() =>
                  setShowAll(
                    (current) => !current
                  )
                }
              >
                {showAll
                  ? "Show First 10 Rows"
                  : `Show All ${rows.length} Rows`}
              </button>
            )}
          </section>

          <section className="sci-bottom">
            <div>
              <h3>
                Ready to import?
              </h3>

              <p>
                {invalidRows.length > 0
                  ? "Fix invalid rows in your CSV file and upload it again."
                  : "All rows passed frontend validation."}
              </p>
            </div>

            <div className="sci-bottom-actions">
              <button
                type="button"
                className="sci-reset-button"
                onClick={reset}
              >
                <RotateCcw size={17} />
                Reset
              </button>

              <button
                type="button"
                className="sci-import-button"
                disabled={
                  invalidRows.length > 0 ||
                  validRows.length === 0
                }
                onClick={prepareImport}
              >
                <UploadCloud size={18} />
                Prepare {validRows.length} Deals
              </button>
            </div>
          </section>
        </>
      )}
    </SellerLayout>
  );
}
