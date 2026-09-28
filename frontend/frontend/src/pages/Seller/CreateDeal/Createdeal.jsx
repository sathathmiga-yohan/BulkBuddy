import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../services/api";
import "./CreateDeal.css";

function CreateDeal() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    normal_price: "",
    group_price: "",
    minimum_buyers: "",
    maximum_quantity: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      Number(formData.group_price) >=
      Number(formData.normal_price)
    ) {
      setError("Group price must be lower than normal price.");
      return;
    }

    if (
      Number(formData.maximum_quantity) <
      Number(formData.minimum_buyers)
    ) {
      setError(
        "Maximum quantity must be greater than or equal to minimum buyers."
      );
      return;
    }

    try {
      setLoading(true);

      const data = {
        product_name: formData.product_name,
        description: formData.description,
        normal_price: Number(formData.normal_price),
        group_price: Number(formData.group_price),
        minimum_buyers: Number(formData.minimum_buyers),
        maximum_quantity: Number(formData.maximum_quantity),
        deadline: new Date(formData.deadline).toISOString(),
      };

      await api.post("/deals", data);

      alert("Deal created successfully");
      navigate("/seller/deals");
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Failed to create deal."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-deal-page">
      <div className="create-deal-container">

        <Link
          to="/seller/dashboard"
          className="create-back-link"
        >
          ← Back to Dashboard
        </Link>

        <div className="create-deal-card">

          <div className="create-deal-heading">
            <span>Seller Center</span>
            <h1>Create New Deal</h1>
            <p>
              Create a group buying offer for your customers.
            </p>
          </div>

          {error && (
            <div className="create-deal-error">
              {error}
            </div>
          )}

          <form
            className="create-deal-form"
            onSubmit={handleSubmit}
          >

            <div className="create-form-group">
              <label>Product Name</label>

              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="Example: Smart Watch"
                required
              />
            </div>

            <div className="create-form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter deal description"
                rows="4"
              />
            </div>

            <div className="create-form-row">

              <div className="create-form-group">
                <label>Normal Price</label>

                <input
                  type="number"
                  name="normal_price"
                  min="0.01"
                  step="0.01"
                  value={formData.normal_price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-form-group">
                <label>Group Price</label>

                <input
                  type="number"
                  name="group_price"
                  min="0.01"
                  step="0.01"
                  value={formData.group_price}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="create-form-row">

              <div className="create-form-group">
                <label>Minimum Buyers</label>

                <input
                  type="number"
                  name="minimum_buyers"
                  min="1"
                  value={formData.minimum_buyers}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="create-form-group">
                <label>Maximum buyers</label>

                <input
                  type="number"
                  name="maximum_quantity"
                  min="1"
                  value={formData.maximum_quantity}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="create-form-group">
              <label>Deadline</label>

              <input
                type="datetime-local"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="create-submit-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Deal"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}

export default CreateDeal;