import React, { useState, useRef } from "react";
import { Modal, Table, message } from "antd";
import { useDispatch } from "react-redux";
import { ShowLoading, HideLoading } from "../../../redux/loadersSlice";
import { BulkImportStudents } from "../../../apicalls/users";

// ── CSV template columns ──────────────────────────────────
const TEMPLATE_HEADERS = ["name", "email", "phone", "rollNumber", "password"];
const TEMPLATE_SAMPLE = [
  ["Alice Johnson", "alice@college.edu", "9000000001", "21CS001", "Welcome@123"],
  ["Bob Smith",    "bob@college.edu",   "9000000002", "21CS002", "Welcome@123"],
];

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS, ...TEMPLATE_SAMPLE];
  const csv  = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "edulib_student_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines = text
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return { error: "CSV must have a header row and at least one data row." };

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const required = ["name", "email", "phone", "password"];
  const missing  = required.filter((r) => !headers.includes(r));
  if (missing.length) return { error: `Missing required columns: ${missing.join(", ")}` };

  const students = lines.slice(1).map((line, i) => {
    const values = line.split(",").map((v) => v.trim());
    const row    = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
    return { _rowIndex: i + 2, ...row };
  });

  return { students };
}

function BulkImportModal({ open, setOpen, onSuccess }) {
  const [step, setStep]         = useState("upload"); // upload | preview | results
  const [students, setStudents] = useState([]);
  const [results, setResults]   = useState(null);
  const [parseError, setParseError] = useState("");
  const fileRef = useRef(null);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParseError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const { students: parsed, error } = parseCSV(ev.target.result);
      if (error) {
        setParseError(error);
        setStudents([]);
      } else {
        setStudents(parsed);
        setStep("preview");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    try {
      dispatch(ShowLoading());
      const response = await BulkImportStudents(
        students.map(({ _rowIndex, ...s }) => s) // strip internal _rowIndex
      );
      dispatch(HideLoading());
      if (response.success) {
        setResults(response.data);
        setStep("results");
        onSuccess();
      } else {
        message.error(response.message);
      }
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  const handleClose = () => {
    setStep("upload");
    setStudents([]);
    setResults(null);
    setParseError("");
    if (fileRef.current) fileRef.current.value = "";
    setOpen(false);
  };

  // ── columns for preview table ─────────────────────────────
  const previewColumns = [
    { title: "#", dataIndex: "_rowIndex", width: 48 },
    { title: "Name",        dataIndex: "name" },
    { title: "Email",       dataIndex: "email" },
    { title: "Phone",       dataIndex: "phone" },
    { title: "Roll No.",    dataIndex: "rollNumber", render: (v) => v || <span style={{ color: "var(--text-subtle)" }}>—</span> },
    { title: "Password",    dataIndex: "password",   render: () => "••••••••" },
  ];

  const importedCols = [
    { title: "Name",     dataIndex: "name" },
    { title: "Email",    dataIndex: "email" },
    { title: "Roll No.", dataIndex: "rollNumber" },
  ];

  const skippedCols = [
    { title: "Name",   dataIndex: "name" },
    { title: "Email",  dataIndex: "email" },
    { title: "Reason", dataIndex: "reason", render: (r) => <span style={{ color: "var(--danger)", fontSize: 12 }}>{r}</span> },
  ];

  return (
    <Modal
      title="📥 Bulk Import Students"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={860}
      centered
    >
      {/* ── Step: Upload ─────────────────────────────────── */}
      {step === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Instruction card */}
          <div
            style={{
              background: "var(--primary-light)",
              border: "1.5px solid rgba(13,148,136,0.25)",
              borderRadius: "var(--radius-sm)",
              padding: "16px 20px",
              display: "flex",
              gap: 14,
            }}
          >
            <i className="ri-information-line" style={{ fontSize: 20, color: "var(--primary-dark)", flexShrink: 0, marginTop: 2 }}></i>
            <div>
              <div style={{ fontWeight: 700, color: "var(--primary-dark)", marginBottom: 6 }}>
                How to import students
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, color: "var(--text-2)", fontSize: 13, lineHeight: 2 }}>
                <li>Download the CSV template below</li>
                <li>Fill in student details in Excel, Google Sheets, or any editor</li>
                <li>Save as <strong>.csv</strong> and upload it here</li>
                <li>Review the preview, then click <strong>Import</strong></li>
              </ol>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
                Required columns: <code style={{ background: "var(--bg-muted)", padding: "1px 6px", borderRadius: 4 }}>name, email, phone, password</code>
                &nbsp;&nbsp;Optional: <code style={{ background: "var(--bg-muted)", padding: "1px 6px", borderRadius: 4 }}>rollNumber</code>
              </div>
            </div>
          </div>

          {/* Download template */}
          <div>
            <button className="btn btn-outlined" onClick={downloadTemplate}>
              <i className="ri-download-line"></i>
              Download CSV Template
            </button>
          </div>

          {/* File upload */}
          <div>
            <label className="form-label">Upload completed CSV file</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="form-input"
              style={{ cursor: "pointer", paddingTop: 9 }}
            />
            {parseError && (
              <div className="error-message" style={{ marginTop: 8 }}>
                <i className="ri-error-warning-line" style={{ marginRight: 6 }}></i>
                {parseError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step: Preview ────────────────────────────────── */}
      {step === "preview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
                Preview — {students.length} student{students.length !== 1 ? "s" : ""} found
              </span>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                Review the data below before importing. Duplicates will be automatically skipped.
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setStep("upload"); setStudents([]); if (fileRef.current) fileRef.current.value = ""; }}
            >
              <i className="ri-upload-2-line"></i>
              Change File
            </button>
          </div>

          <Table
            columns={previewColumns}
            dataSource={students}
            rowKey="_rowIndex"
            size="small"
            pagination={{ pageSize: 8 }}
            scroll={{ x: true }}
          />

          <div className="form-actions">
            <button className="btn btn-ghost" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleImport}>
              <i className="ri-user-add-line"></i>
              Import {students.length} Student{students.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* ── Step: Results ────────────────────────────────── */}
      {step === "results" && results && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Summary banner */}
          <div style={{ display: "flex", gap: 14 }}>
            <div
              style={{
                flex: 1,
                background: "var(--success-light)",
                border: "1.5px solid rgba(5,150,105,0.25)",
                borderRadius: "var(--radius-sm)",
                padding: "16px 20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--success)" }}>
                {results.imported.length}
              </div>
              <div style={{ fontSize: 13, color: "var(--success)", fontWeight: 600 }}>
                Successfully Imported
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: results.skipped.length ? "var(--danger-light)" : "var(--bg-muted)",
                border: `1.5px solid ${results.skipped.length ? "rgba(220,38,38,0.2)" : "var(--border)"}`,
                borderRadius: "var(--radius-sm)",
                padding: "16px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: results.skipped.length ? "var(--danger)" : "var(--text-muted)",
                }}
              >
                {results.skipped.length}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: results.skipped.length ? "var(--danger)" : "var(--text-muted)",
                }}
              >
                Skipped (duplicates / errors)
              </div>
            </div>
          </div>

          {/* Imported list */}
          {results.imported.length > 0 && (
            <div>
              <div className="section-title">
                <i className="ri-check-double-line" style={{ color: "var(--success)" }}></i>
                Imported Students
              </div>
              <Table
                columns={importedCols}
                dataSource={results.imported}
                rowKey="email"
                size="small"
                pagination={false}
              />
            </div>
          )}

          {/* Skipped list */}
          {results.skipped.length > 0 && (
            <div>
              <div className="section-title">
                <i className="ri-error-warning-line" style={{ color: "var(--danger)" }}></i>
                Skipped Rows
              </div>
              <Table
                columns={skippedCols}
                dataSource={results.skipped}
                rowKey="email"
                size="small"
                pagination={false}
              />
            </div>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleClose}>
              <i className="ri-check-line"></i>
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default BulkImportModal;
