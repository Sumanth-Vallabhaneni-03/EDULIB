import { Modal, message } from "antd";
import React, { useEffect, useState } from "react";
import Button from "../../../components/Button";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { GetUserById } from "../../../apicalls/users";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { EditIssue, IssueBook } from "../../../apicalls/issues";

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
  const [studentId, setStudentId] = useState(
    type === "edit" ? selectedIssue.user._id : ""
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
      const response = await GetUserById(studentId);
      if (response.success) {
        if (response.data.role !== "student") {
          setValidated(false);
          setErrorMessage("This user is not a student");
          dispatch(HideLoading());
          return;
        } else {
          setStudentData(response.data);
          setValidated(true);
          setErrorMessage("");
        }
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
      let fine = 0;
      const today = moment();
      const issueDate = type === "edit" ? selectedIssue.issueDate : today;
      const daysLate = moment(returnDate).diff(issueDate, "days") - 31;
      if (daysLate > 0) fine = daysLate * 1;

      let response = null;
      if (type !== "edit") {
        response = await IssueBook({
          book: selectedBook._id,
          user: studentData._id,
          issueDate: new Date(),
          returnDate,
          fine,
          issuedBy: user._id,
        });
      } else {
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
        setStudentId("");
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
              background: "var(--bg-surface2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            <i className="ri-book-2-line" style={{ marginRight: 6, color: "var(--primary-hover)" }}></i>
            Issuing: <strong style={{ color: "var(--text)" }}>{selectedBook.title}</strong>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Student ID</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter Student MongoDB ID"
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
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: 8,
              padding: "12px 16px",
              fontSize: 13,
            }}
          >
            <div style={{ color: "var(--primary-hover)", fontWeight: 600, marginBottom: 4 }}>
              <i className="ri-user-check-line" style={{ marginRight: 6 }}></i>
              Student Verified
            </div>
            <div style={{ color: "var(--text)" }}>{studentData.name}</div>
            <div style={{ color: "var(--text-muted)", marginTop: 4 }}>
              Loan duration: <strong style={{ color: "var(--accent)" }}>{dayCount} days</strong>
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
              title="Validate Student"
              disabled={studentId === "" || returnDate === ""}
              onClick={validate}
              icon="ri-shield-check-line"
            />
          )}
          {validated && (
            <Button
              title={type === "edit" ? "Update Issue" : "Issue Book"}
              onClick={onIssue}
              disabled={studentId === "" || returnDate === ""}
              icon="ri-check-line"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default IssueForm;
