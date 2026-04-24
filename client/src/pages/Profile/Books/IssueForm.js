import { Modal, message } from "antd";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { FindUser } from "../../../apicalls/users";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { EditIssue, IssueBook } from "../../../apicalls/issues";

// Fine rate: ₹ per day overdue
const FINE_PER_DAY = 5;

function IssueForm({
  open = false,
  setOpen,
  selectedBook,
  setSelectedBook,
  getData,
  selectedIssue,
  type,
}) {
  const { user } = useSelector((state) => state.users);
  const [validated, setValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [searchQuery, setSearchQuery] = useState(
    type === "edit" ? (selectedIssue.user?.rollNumber || selectedIssue.user?.email || "") : ""
  );
  const [returnDate, setReturnDate] = useState(
    type === "edit"
      ? moment(selectedIssue.returnDate).format("YYYY-MM-DD")
      : moment().add(30, "days").format("YYYY-MM-DD")
  );
  const dispatch = useDispatch();

  const validate = async () => {
    try {
      dispatch(ShowLoading());
      const response = await FindUser(searchQuery);
      if (response.success) {
        if (response.data.role !== "student") {
          setValidated(false);
          setErrorMessage("This user is not a student");
          dispatch(HideLoading());
          return;
        }
        if (response.data.status !== "active") {
          setValidated(false);
          setErrorMessage("This student's account is not active (status: " + response.data.status + ")");
          dispatch(HideLoading());
          return;
        }
        setStudentData(response.data);
        setValidated(true);
        setErrorMessage("");
      } else {
        setValidated(false);
        setErrorMessage(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      setValidated(false);
      setErrorMessage(error.message);
    }
  };

  const onIssue = async () => {
    try {
      dispatch(ShowLoading());

      let response = null;

      if (type !== "edit") {
        // Fine is always 0 at issue time; it's assessed on return.
        response = await IssueBook({
          book: selectedBook._id,
          user: studentData._id,
          issueDate: new Date(),
          returnDate,
          fine: 0,
          issuedBy: user._id,
        });
      } else {
        // Recalculate fine: days past the ORIGINAL return date × rate
        const today = moment();
        const originalDueDate = moment(selectedIssue.returnDate);
        const daysOverdue = today.diff(originalDueDate, "days");
        const fine = daysOverdue > 0 ? daysOverdue * FINE_PER_DAY : 0;

        response = await EditIssue({
          book: selectedBook._id,
          user: studentData._id,
          issueDate: selectedIssue.issueDate,
          returnDate,
          fine,
          issuedBy: user._id,
          _id: selectedIssue._id,
        });
      }

      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        getData();
        setSearchQuery("");
        setReturnDate("");
        setValidated(false);
        setErrorMessage("");
        setSelectedBook(null);
        setOpen(false);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  // Print issue slip
  const printSlip = () => {
    const slip = window.open("", "_blank", "width=420,height=550");
    slip.document.write(`
      <html>
      <head><title>Issue Slip - EduLib</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 24px; color: #1f2937; }
        h2 { text-align: center; margin-bottom: 0; color: #0d9488; }
        .sub { text-align: center; color: #888; margin-top: 4px; font-size: 12px; }
        hr { border: none; border-top: 1.5px dashed #ccc; margin: 16px 0; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
        .label { font-weight: 600; color: #555; }
        .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #aaa; }
      </style></head>
      <body>
        <h2>📚 EduLib</h2>
        <div class="sub">Library Issue Slip</div>
        <hr/>
        <div class="row"><span class="label">Student:</span><span>${studentData.name}</span></div>
        <div class="row"><span class="label">Roll No:</span><span>${studentData.rollNumber || "—"}</span></div>
        <div class="row"><span class="label">Email:</span><span>${studentData.email}</span></div>
        <hr/>
        <div class="row"><span class="label">Book:</span><span>${selectedBook.title}</span></div>
        <div class="row"><span class="label">Author:</span><span>${selectedBook.author}</span></div>
        <div class="row"><span class="label">Issue Date:</span><span>${moment().format("DD MMM YYYY")}</span></div>
        <div class="row"><span class="label">Due Date:</span><span>${moment(returnDate).format("DD MMM YYYY")}</span></div>
        <hr/>
        <div class="row"><span class="label">Issued By:</span><span>${user.name}</span></div>
        <div class="footer">Fine: ₹${FINE_PER_DAY}/day after due date &mdash; Generated ${moment().format("DD MMM YYYY, h:mm a")}</div>
      </body></html>
    `);
    slip.document.close();
    slip.print();
  };

  useEffect(() => {
    if (type === "edit") validate();
  }, [open]);

  const dayCount = moment(returnDate).diff(moment(), "days");

  return (
    <Modal
      title={type === "edit" ? "✏️ Edit / Renew Issue" : "📤 Issue Book"}
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      centered
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {selectedBook && (
          <div
            style={{
              background: "var(--bg-muted)",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            <i className="ri-book-2-line" style={{ marginRight: 6, color: "var(--primary-text)" }}></i>
            Issuing: <strong style={{ color: "var(--text)" }}>{selectedBook.title}</strong>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            <i className="ri-search-line" style={{ marginRight: 4 }}></i>
            Student Roll Number or Email
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setValidated(false);
              setStudentData(null);
              setErrorMessage("");
            }}
            placeholder="e.g. 21CS001 or student@college.edu"
            disabled={type === "edit"}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Return Date (Due Date)</label>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            min={moment().format("YYYY-MM-DD")}
            className="form-input"
          />
        </div>

        {errorMessage && <span className="error-message">{errorMessage}</span>}

        {validated && studentData && (
          <div
            style={{
              background: "var(--primary-light)",
              border: "1.5px solid rgba(13,148,136,0.3)",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              fontSize: 13,
            }}
          >
            <div style={{ color: "var(--primary-dark)", fontWeight: 600, marginBottom: 6 }}>
              <i className="ri-user-check-line" style={{ marginRight: 6 }}></i>
              Student Verified
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, color: "var(--text)" }}>
              <div><strong>Name:</strong> {studentData.name}</div>
              {studentData.rollNumber && <div><strong>Roll No:</strong> {studentData.rollNumber}</div>}
              <div><strong>Email:</strong> {studentData.email}</div>
            </div>
            <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
              Loan duration: <strong style={{ color: "var(--primary-dark)" }}>{dayCount} days</strong>
            </div>
          </div>
        )}

        <div className="form-actions" style={{ marginTop: 8, paddingTop: 16 }}>
          <Button
            title="Cancel"
            variant="outlined"
            onClick={() => setOpen(false)}
          />
          {type === "add" && (
            <Button
              title="Find Student"
              disabled={searchQuery === "" || returnDate === ""}
              onClick={validate}
              icon="ri-search-line"
            />
          )}
          {validated && (
            <>
              <Button
                title={type === "edit" ? "Update Issue" : "Issue Book"}
                onClick={onIssue}
                disabled={searchQuery === "" || returnDate === ""}
                icon="ri-check-line"
              />
              {type !== "edit" && (
                <Button
                  title="Print Slip"
                  variant="outlined"
                  onClick={printSlip}
                  icon="ri-printer-line"
                />
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default IssueForm;
