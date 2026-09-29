
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
  X,
} from "lucide-react";

import SellerLayout from "../SellerDashboard/SellerLayout.jsx";

import { importDealsCsv } from "../../../services/dealservice.js";
import { formatPrice } from "../../../data/mockDeals.js";

import "./CsvImport.css";

// Must match app/routers/csv_import.py
const REQUIRED_COLUMNS = [
  "product_name",
  "description",
  "normal_price",
  "group_price",
  "minimum_buyers",
  "maximum_quantity",
  "deadline",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_ROWS = 500;

function futureDate(days = 30) {
  const date = new Date();
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T23:59:59+05:30`;
}

const TEMPLATE_ROWS = [
  REQUIRED_COLUMNS,
  [
    "Dell Inspiron Laptop",
    "15-inch laptop with 8GB RAM",
    "120000",
    "84000",
    "20",
    "30",
    futureDate(30),
  ],
  [
    "Wireless Headphones",
    "Bluetooth headphones with noise cancellation",
    "18000",
    "12999",
    "15",
    "25",
    futureDate(45),
  ],
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

  URL.revokeObjectURL(url);
}

// Supports commas, escaped quotes and newlines inside quoted fields.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  let closedQuote = false;

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
        closedQuote = true;
      } else {
        field += char;
      }

      continue;
    }

    if (char === '"' && field === "" && !closedQuote) {
      quoted = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      closedQuote = false;
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i += 1;

      row.push(field);

      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      field = "";
      closedQuote = false;
      continue;
    }

    if (closedQuote && char !== " " && char !== "\t") {
      throw new Error(
        "Invalid CSV: unexpected text after a closing quote."
      );
    }

    if (!closedQuote) field += char;
  }

  if (quoted) {
    throw new Error("Invalid CSV: a quoted value was not closed.");
  }

  row.push(field);

  if (row.some((cell) => cell.trim() !== "")) {
    rows.push(row);
  }

  return rows;
}

function validateDeal(deal, rowNumber) {
  const errors = [];

  const normalPrice = Number(deal.normal_price);
  const groupPrice = Number(deal.group_price);
  const minimum = Number(deal.minimum_buyers);
  const maximum = Number(deal.maximum_quantity);

  if (!deal.product_name.trim()) {
    errors.push("Product name is required");
  }

  if (
    !deal.normal_price.trim() ||
    !Number.isFinite(normalPrice) ||
    normalPrice <= 0
  ) {
    errors.push("Invalid normal price");
  }

  if (
    !deal.group_price.trim() ||
    !Number.isFinite(groupPrice) ||
    groupPrice <= 0
  ) {
    errors.push("Invalid group price");
  } else if (
    Number.isFinite(normalPrice) &&
    normalPrice > 0 &&
    groupPrice >= normalPrice
  ) {
    errors.push("Group price must be lower than normal price");
  }

  if (
    !deal.minimum_buyers.trim() ||
    !Number.isInteger(minimum) ||
    minimum < 1
  ) {
    errors.push("Minimum buyers must be at least 1");
  }

  if (
    !deal.maximum_quantity.trim() ||
    !Number.isInteger(maximum) ||
    maximum < 1
  ) {
    errors.push("Invalid maximum quantity");
  } else if (
    Number.isInteger(minimum) &&
    maximum < minimum
  ) {
    errors.push("Maximum quantity cannot be below minimum buyers");
  }

  // Backend rejects naive datetime strings.
  const timezonePattern = /(Z|[+-]\d{2}:\d{2})$/i;
  const parsedDeadline = new Date(deal.deadline);

  if (
    !timezonePattern.test(deal.deadline) ||
    Number.isNaN(parsedDeadline.getTime()) ||
    parsedDeadline.getTime() <= Date.now()
  ) {
    errors.push(
      "Deadline must be a future ISO datetime with timezone"
    );
  }

  return {
    ...deal,
    rowNumber,
    normalPrice,
    groupPrice,
    minimum,
    maximum,
    errors,
    valid: errors.length === 0,
  };
}

function getApiError(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (detail?.message) {
    const missing = detail.missing_columns;

    return Array.isArray(missing)
      ? `${detail.message}: ${missing.join(", ")}`
      : detail.message;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join("; ");
  }

  return "CSV upload failed. Please try again.";
}

export default function CsvImport() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [fileError, setFileError] = useState("");

  const [dragging, setDragging] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const validRows = rows.filter((row) => row.valid);
  const invalidRows = rows.filter((row) => !row.valid);

  const reset = () => {
    if (uploading) return;

    setFile(null);
    setRows([]);
    setFileError("");
    setDragging(false);
    setShowAll(false);
    setResult(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFile = async (selectedFile) => {
    if (uploading) return;

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

      // Preserve exact Backend column names.
      const headers = parsed[0].map((header) => header.trim());

      if (new Set(headers).size !== headers.length) {
        setFileError("CSV contains duplicate column names.");
        return;
      }

      const missing = REQUIRED_COLUMNS.filter(
        (column) => !headers.includes(column)
      );

      if (missing.length > 0) {
        setFileError(`Missing columns: ${missing.join(", ")}`);
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

        const validated = validateDeal(deal, index + 2);

        if (values.length !== headers.length) {
          validated.errors.push(
            `Expected ${headers.length} columns but found ${values.length}`
          );

          validated.valid = false;
        }

        return validated;
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

    if (uploading) return;

    const droppedFile = event.dataTransfer.files[0];

    if (droppedFile) handleFile(droppedFile);
  };

  // ACTUAL BACKEND CSV IMPORT
  const handleImport = async () => {
    if (
      !file ||
      uploading ||
      result ||
      rows.length === 0 ||
      invalidRows.length > 0
    ) {
      return;
    }

    try {
      setUploading(true);
      setFileError("");

      // Send the selected CSV directly to FastAPI.
      const response = await importDealsCsv(file);

      setResult(response);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setFileError(getApiError(error));
    } finally {
      setUploading(false);
    }
  };

  const displayedRows = showAll
    ? rows
    : rows.slice(0, 10);

  return (
    <SellerLayout title="Import CSV">
      {/* INTRO */}
      <section className="sci-intro">
        <div>
          <small>BULK DEAL UPLOAD</small>
          <h2>Import Deals from CSV</h2>

          <p>
            Upload multiple group-buying deals using a CSV file.
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

      {/* BACKEND IMPORT RESULT */}
      {result && (
        <div className="sci-success" role="status">
          <CheckCircle2 size={23} />

          <div>
            <strong>{result.message}</strong>

            <p>
              Successfully created: {result.created_count} deals.
              Failed: {result.failed_count} rows.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setResult(null)}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* BACKEND ROW ERRORS */}
      {result?.errors?.length > 0 && (
        <div className="sci-error-message" role="alert">
          <AlertCircle size={19} />

          <div>
            <strong>Backend validation errors</strong>

            {result.errors.map((item, index) => (
              <p key={`${item.row}-${index}`}>
                Row {item.row}:{" "}
                {(item.errors || [])
                  .map((error) =>
                    error.field
                      ? `${error.field}: ${error.message}`
                      : error.message
                  )
                  .join("; ")}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD CARD */}
      <section className="sci-card">
        <div className="sci-section-title">
          <div className="sci-title-icon">
            <FileUp size={21} />
          </div>

          <div>
            <h2>Upload CSV File</h2>

            <p>
              Select your file or drag it into the upload area.
            </p>
          </div>
        </div>

        <div
          className={`sci-dropzone ${
            dragging ? "dragging" : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            if (!uploading) setDragging(true);
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

          <h3>Drag and drop your CSV file here</h3>

          <p>or click below to browse your files</p>

          <button
            type="button"
            className="sci-browse-button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <FileSpreadsheet size={17} />
            Browse Files
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(event) =>
              handleFile(event.target.files?.[0])
            }
            hidden
          />

          <span>
            CSV format only · Maximum 2 MB · Up to 500 deals
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
              disabled={uploading}
              onClick={reset}
              aria-label="Remove selected file"
            >
              <X size={19} />
            </button>
          </div>
        )}
      </section>

      {/* CSV FORMAT GUIDELINES */}
      <section className="sci-guide">
        <div className="sci-guide-heading">
          <Info size={20} />

          <div>
            <h2>CSV Format Guidelines</h2>

            <p>
              Your CSV file must contain these exact column names.
            </p>
          </div>
        </div>

        <div className="sci-columns">
          {REQUIRED_COLUMNS.map((column) => (
            <code key={column}>{column}</code>
          ))}
        </div>

        <p className="sci-guide-note">
          Prices must be positive. Group price must be lower
          than normal price. Minimum buyers must be at least
          1, and maximum quantity cannot be lower than the
          minimum. Deadline must be a future ISO datetime
          containing timezone information, for example
          2027-12-31T23:59:59+05:30.
        </p>
      </section>

      {/* PREVIEW */}
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
              <strong>{validRows.length}</strong>
            </article>

            <article className="invalid">
              <AlertCircle size={22} />
              <span>Invalid Deals</span>
              <strong>{invalidRows.length}</strong>
            </article>
          </section>

          <section className="sci-card sci-preview-card">
            <div className="sci-preview-header">
              <div>
                <h2>Import Preview</h2>

                <p>
                  Review your deals before importing.
                </p>
              </div>

              <span>{rows.length} rows</span>
            </div>

            <div className="sci-table-wrapper">
              <table className="sci-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Product Name</th>
                    <th>Description</th>
                    <th>Normal Price</th>
                    <th>Group Price</th>
                    <th>Buyers</th>
                    <th>Deadline</th>
                    <th>Validation</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedRows.map((deal) => (
                    <tr key={deal.rowNumber}>
                      <td>{deal.rowNumber}</td>

                      <td>
                        <strong>
                          {deal.product_name || "—"}
                        </strong>
                      </td>

                      <td>{deal.description || "—"}</td>

                      <td>
                        {Number.isFinite(deal.normalPrice)
                          ? formatPrice(deal.normalPrice)
                          : "—"}
                      </td>

                      <td className="sci-price">
                        {Number.isFinite(deal.groupPrice)
                          ? formatPrice(deal.groupPrice)
                          : "—"}
                      </td>

                      <td>
                        {deal.minimum_buyers}/
                        {deal.maximum_quantity}
                      </td>

                      <td>{deal.deadline || "—"}</td>

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
                  setShowAll((current) => !current)
                }
              >
                {showAll
                  ? "Show First 10 Rows"
                  : `Show All ${rows.length} Rows`}
              </button>
            )}
          </section>

          {/* IMPORT ACTIONS */}
          <section className="sci-bottom">
            <div>
              <h3>Ready to import?</h3>

              <p>
                {result
                  ? "The Backend has processed this CSV file."
                  : invalidRows.length > 0
                  ? "Fix invalid rows and upload the CSV again."
                  : "All rows passed frontend validation. Click Import Deals to save them in the database."}
              </p>
            </div>

            <div className="sci-bottom-actions">
              <button
                type="button"
                className="sci-reset-button"
                disabled={uploading}
                onClick={reset}
              >
                <RotateCcw size={17} />
                Reset
              </button>

              <button
                type="button"
                className="sci-import-button"
                disabled={
                  uploading ||
                  Boolean(result) ||
                  invalidRows.length > 0 ||
                  validRows.length === 0
                }
                onClick={handleImport}
              >
                <UploadCloud size={18} />

                {uploading
                  ? "Importing..."
                  : result
                  ? "Import Completed"
                  : `Import ${validRows.length} Deals`}
              </button>
            </div>
          </section>
        </>
      )}
    </SellerLayout>
  );
}
