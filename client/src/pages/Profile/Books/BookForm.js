import { Col, Form, message, Modal, Row } from "antd";
import React from "react";
import Button from "../../../components/Button";
import { useDispatch, useSelector } from "react-redux";
import { AddBook, UpdateBook } from "../../../apicalls/books";
import { HideLoading, ShowLoading } from "../../../redux/loadersSlice";

function BookForm({
  open,
  setOpen,
  reloadBooks,
  formType,
  selectedBook,
  setSelectedBook,
}) {
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoading());
      values.createdBy = user._id;
      let response = null;
      if (formType === "add") {
        values.availableCopies = values.totalCopies;
        response = await AddBook(values);
      } else {
        values._id = selectedBook._id;
        response = await UpdateBook(values);
      }
      if (response.success) {
        message.success(response.message);
        reloadBooks();
        setOpen(false);
      } else {
        message.error(response.message);
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <Modal
      title={formType === "add" ? "➕ Add New Book" : "✏️ Update Book"}
      open={open}
      onCancel={() => setOpen(false)}
      centered
      width={760}
      footer={null}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        initialValues={{
          ...selectedBook,
          publishedDate: selectedBook?.publishedDate
            ? new Date(selectedBook.publishedDate).toISOString().split("T")[0]
            : null,
        }}
      >
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item
              label={<span className="form-label">Book Title</span>}
              name="title"
              rules={[{ required: true, message: "Please input book title" }]}
            >
              <input type="text" className="form-input" placeholder="e.g. The Great Gatsby" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<span className="form-label">Book ID</span>}
              name="book_id"
              rules={[{ required: true, message: "Please input book ID" }]}
            >
              <input type="text" className="form-input" placeholder="e.g. LIB-2024-001" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<span className="form-label">Cover Image URL</span>}
              name="image"
              rules={[{ required: true, message: "Please input image URL" }]}
            >
              <input type="text" className="form-input" placeholder="https://..." />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label={<span className="form-label">Author</span>}
              name="author"
              rules={[{ required: true, message: "Please input author name" }]}
            >
              <input type="text" className="form-input" placeholder="Author name" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label={<span className="form-label">Publisher</span>}
              name="publisher"
              rules={[{ required: true, message: "Please input publisher" }]}
            >
              <input type="text" className="form-input" placeholder="Publisher name" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label={<span className="form-label">Published Date</span>}
              name="publishedDate"
              rules={[{ required: true, message: "Please input published date" }]}
            >
              <input type="date" className="form-input" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span className="form-label">Category</span>}
              name="category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <select className="form-input">
                <option value="">Select Category</option>
                <option value="subject">Subject</option>
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="biography">Biography</option>
                <option value="poetry">Poetry</option>
                <option value="drama">Drama</option>
                <option value="history">History</option>
                <option value="science">Science</option>
                <option value="technology">Technology</option>
                <option value="mythology">Mythology</option>
              </select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span className="form-label">Total Copies</span>}
              name="totalCopies"
              rules={[{ required: true, message: "Please input total copies" }]}
            >
              <input type="number" className="form-input" placeholder="e.g. 5" min={1} />
            </Form.Item>
          </Col>
        </Row>

        <div className="form-actions">
          <Button
            type="button"
            variant="outlined"
            title="Cancel"
            onClick={() => setOpen(false)}
          />
          <Button title={formType === "add" ? "Add Book" : "Update Book"} type="submit" />
        </div>
      </Form>
    </Modal>
  );
}

export default BookForm;
