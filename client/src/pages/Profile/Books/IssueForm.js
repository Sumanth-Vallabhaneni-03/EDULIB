import { Modal, Form, message } from "antd";
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
  const [validated, setValidated] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [studentData, setstudentData] = useState(null);
  const [studentId, setstudentId] = React.useState(
    type === "edit" ? selectedIssue.user._id : ""
  );
  const [returnDate, setReturnDate] = React.useState(
    type === "edit"
      ? moment(selectedIssue.returnDate).format("YYYY-MM-DD")
      : moment().add(30, "days").format("YYYY-MM-DD") // Default to 30 days from today
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
          setstudentData(response.data);
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

      // Calculate fine if return date exceeds 31 days from the issue date
      const today = moment();
      const issueDate = type === "edit" ? selectedIssue.issueDate : today;
      const daysLate = moment(returnDate).diff(issueDate, "days") - 31;

      if (daysLate > 0) {
        fine = daysLate * 1; // 1 rupee fine per day late
      }

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
        setstudentId("");
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
    if (type === "edit") {
      validate();
    }
  }, [open]);

  return (
    <Modal
      title=""
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
      centered
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-secondary font-bold text-xl uppercase text-center">
          {type === "edit" ? "Edit / Renew Issue" : "Issue Book"}
        </h1>
        <div>
          <span>Student Id </span>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setstudentId(e.target.value)}
            placeholder="Student Id"
            disabled={type === "edit"}
          />
        </div>
        <div>
          <span>Return Date </span>
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            placeholder="Return Date"
            min={moment().format("YYYY-MM-DD")}
          />
        </div>

        {errorMessage && <span className="error-message">{errorMessage}</span>}

        {validated && (
          <div className="bg-secondary p-1 text-white">
            <h1 className="text-sm">Student: {studentData.name}</h1>
            <h1>
              Number Of Days: {moment(returnDate).diff(moment(), "days")}
            </h1>
          </div>
        )}

        <div className="flex justify-end gap-2 w-100">
          <Button
            title="Cancel"
            variant="outlined"
            onClick={() => setOpen(false)}
          />
          {type === "add" && (
            <Button
              title="Validate"
              disabled={studentId === "" || returnDate === ""}
              onClick={validate}
            />
          )}
          {validated && (
            <Button
              title={type === "edit" ? "Edit" : "Issue"}
              onClick={onIssue}
              disabled={studentId === "" || returnDate === ""}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

export default IssueForm;
