import React, { useEffect } from "react";
import { message } from "antd";
import { GetReports } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";
import { useDispatch } from "react-redux";

function Reports() {
  const [reports, setReports] = React.useState(null);
  const dispatch = useDispatch();

  const getReports = async () => {
    try {
      dispatch(ShowLoading());
      const response = await GetReports();
      dispatch(HideLoading());
      if (response.success) {
        setReports(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    getReports();
  }, []);

  return (
    <div className="fade-in">
      <div className="stats-grid">
        {/* Books */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Books</span>
            <div className="stat-icon stat-icon-books">
              <i className="ri-book-2-line"></i>
            </div>
          </div>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-item-label">Total Titles</span>
              <span className="stat-item-value">{reports?.books?.booksCount ?? "—"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Total Copies</span>
              <span className="stat-item-value">{reports?.books?.totalBooksCopiesCount ?? "—"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Available</span>
              <span className="stat-item-value" style={{ color: "var(--success)" }}>
                {reports?.books?.availableBooksCopiesCount ?? "—"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Issued Out</span>
              <span className="stat-item-value" style={{ color: "var(--accent)" }}>
                {reports?.books?.issuesBooksCopiesCount ?? "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Users */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Users</span>
            <div className="stat-icon stat-icon-users">
              <i className="ri-team-line"></i>
            </div>
          </div>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-item-label">Total Users</span>
              <span className="stat-item-value">{reports?.users?.usersCount ?? "—"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Students</span>
              <span className="stat-item-value">{reports?.users?.studentsCount ?? "—"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Librarians</span>
              <span className="stat-item-value">{reports?.users?.librariansCount ?? "—"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Admins</span>
              <span className="stat-item-value">{reports?.users?.adminsCount ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Issues */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Issues</span>
            <div className="stat-icon stat-icon-issues">
              <i className="ri-file-list-3-line"></i>
            </div>
          </div>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-item-label">Total Issues</span>
              <span className="stat-item-value">{reports?.issues?.issuesCount ?? "—"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Returned</span>
              <span className="stat-item-value" style={{ color: "var(--success)" }}>
                {reports?.issues?.returnedIssuesCount ?? "—"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Pending</span>
              <span className="stat-item-value" style={{ color: "var(--accent)" }}>
                {reports?.issues?.pendingIssuesCount ?? "—"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Overdue</span>
              <span className="stat-item-value" style={{ color: "var(--danger)" }}>
                {reports?.issues?.overdueIssuesCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Revenue</span>
            <div className="stat-icon stat-icon-revenue">
              <i className="ri-money-rupee-circle-line"></i>
            </div>
          </div>
          <div className="stat-items">
            <div className="stat-item">
              <span className="stat-item-label">Total Collected</span>
              <span className="stat-item-value" style={{ color: "var(--success)" }}>
                ₹{reports?.revenue?.totalCollected ?? "0"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">Penalty / Fines</span>
              <span className="stat-item-value" style={{ color: "var(--danger)" }}>
                ₹{reports?.revenue?.fineCollected ?? "0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
