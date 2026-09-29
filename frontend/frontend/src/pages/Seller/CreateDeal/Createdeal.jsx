
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Info,
  Package,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";

import SellerLayout from "../SellerDashboard/SellerLayout.jsx";
import { formatPrice } from "../../../data/mockDeals.js";
import "./Createdeal.css";

const STORAGE_KEY = "bulkbuddy_seller_created_deals_v1";

const categories = [
  "Electronics",
  "Accessories",
  "Fashion",
  "Home & Living",
  "Beauty & Personal Care",
  "Sports & Fitness",
  "Other",
];

const emptyForm = {
  productName: "",
  category: "",
  description: "",
  originalPrice: "",
  groupPrice: "",
  minimumBuyers: "",
  maximumBuyers: "",
  deadline: "",
  accepted: false,
};

function localToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Createdeal() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [preview, setPreview] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!image) {
      setImageUrl("");
      return;
    }

    const url = URL.createObjectURL(image);
    setImageUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  const update = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSuccess(false);
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      setImageError("Upload a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Maximum image size is 5 MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setImageError("");
    setErrors((current) => ({
      ...current,
      image: "",
    }));
    setSuccess(false);
  };

  const validate = () => {
    const next = {};

    const original = Number(form.originalPrice);
    const group = Number(form.groupPrice);
    const minimum = Number(form.minimumBuyers);
    const maximum = Number(form.maximumBuyers);

    if (!form.productName.trim()) {
      next.productName = "Product name is required.";
    }

    if (!form.category) {
      next.category = "Select a category.";
    }

    if (!form.description.trim()) {
      next.description = "Description is required.";
    }

    if (
      !form.originalPrice ||
      !Number.isFinite(original) ||
      original <= 0
    ) {
      next.originalPrice =
        "Enter a valid original price.";
    }

    if (
      !form.groupPrice ||
      !Number.isFinite(group) ||
      group <= 0
    ) {
      next.groupPrice = "Enter a valid group price.";
    } else if (original > 0 && group >= original) {
      next.groupPrice =
        "Group price must be lower than original price.";
    }

    if (
      !form.minimumBuyers ||
      !Number.isInteger(minimum) ||
      minimum < 2
    ) {
      next.minimumBuyers =
        "Minimum buyers must be at least 2.";
    }

    if (
      !form.maximumBuyers ||
      !Number.isInteger(maximum) ||
      maximum < 2
    ) {
      next.maximumBuyers =
        "Enter a valid maximum buyer count.";
    } else if (minimum >= 2 && maximum < minimum) {
      next.maximumBuyers =
        "Maximum buyers must be at least minimum buyers.";
    }

    if (
      !form.deadline ||
      form.deadline <= localToday()
    ) {
      next.deadline = "Choose a future deadline.";
    }

    if (!image) {
      next.image = "Upload a product image.";
    }

    if (!form.accepted) {
      next.accepted =
        "Please confirm the declaration.";
    }

    return next;
  };

  const submit = async (event) => {
    event.preventDefault();

    const next = validate();
    setErrors(next);

    if (Object.keys(next).length > 0) {
      setSuccess(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    try {
      const imageData = await new Promise(
        (resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(image);
        }
      );

      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const deals = Array.isArray(stored)
        ? stored
        : [];

      const originalPrice = Number(
        form.originalPrice
      );

      const groupPrice = Number(
        form.groupPrice
      );

      const deadline = new Date(
        `${form.deadline}T23:59:59`
      );

      const discount = Math.round(
        ((originalPrice - groupPrice) /
          originalPrice) *
          100
      );

      const deal = {
        id: `seller-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        name: form.productName.trim(),
        category: form.category,
        description: form.description.trim(),

        originalPrice,
        groupPrice,

        required: Number(form.minimumBuyers),
        maxQuantity: Number(form.maximumBuyers),

        joined: 0,
        participants: 0,

        endDate: form.deadline,

        daysLeft: Math.max(
          0,
          Math.ceil(
            (deadline - new Date()) / 86400000
          )
        ),

        image: imageData,

        seller: "Demo Seller",
        rating: 0,
        discount,
        status: "active",
      };

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([deal, ...deals])
      );

      window.dispatchEvent(
        new Event("bulkbuddy-deals-updated")
      );

      setSuccess(true);
      setPreview(false);
    } catch (error) {
      console.error(error);

      setErrors({
        image:
          "Could not save locally. Try a smaller image.",
      });

      setSuccess(false);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const reset = () => {
    setForm(emptyForm);
    setErrors({});
    setImage(null);
    setImageError("");
    setPreview(false);
    setSuccess(false);
  };

  const original = Number(form.originalPrice) || 0;
  const group = Number(form.groupPrice) || 0;

  const savings = Math.max(
    0,
    original - group
  );

  const discount =
    original > 0
      ? Math.round((savings / original) * 100)
      : 0;

  const textField = (
    name,
    label,
    placeholder,
    type = "text"
  ) => (
    <label className="cd-field">
      <span>
        {label} <b>*</b>
      </span>

      <input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        min={type === "number" ? "1" : undefined}
        step={
          type === "number" ? "any" : undefined
        }
        onChange={(event) =>
          update(name, event.target.value)
        }
        className={
          errors[name] ? "invalid" : ""
        }
      />

      {errors[name] && (
        <small className="cd-error">
          {errors[name]}
        </small>
      )}
    </label>
  );

  return (
    <SellerLayout title="Create New Deal">
      <section className="cd-intro">
        <div className="cd-icon">
          <Plus size={24} />
        </div>

        <div>
          <h2>Add a New Group Buying Deal</h2>
          <p>
            Enter product details, pricing and
            buyer targets.
          </p>
        </div>

        <Link
          to="/seller/dashboard"
          className="cd-back"
        >
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </section>

      {success && (
        <div
          className="cd-success"
          role="status"
        >
          <CheckCircle2 size={22} />

          <div>
            <strong>
              Deal saved successfully!
            </strong>

            <p>
              Your product is now available in
              Seller Deals and Customer Deals
              in this browser.
            </p>
          </div>
        </div>
      )}

      <form
        className="cd-form"
        onSubmit={submit}
        noValidate
      >
        <div className="cd-grid">
          <div className="cd-column">
            <section className="cd-card">
              <h2>
                <Package size={20} />
                Basic Information
              </h2>

              {textField(
                "productName",
                "Product Name",
                "e.g. Dell Inspiron Laptop"
              )}

              <label className="cd-field">
                <span>
                  Category <b>*</b>
                </span>

                <select
                  value={form.category}
                  onChange={(event) =>
                    update(
                      "category",
                      event.target.value
                    )
                  }
                  className={
                    errors.category
                      ? "invalid"
                      : ""
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                {errors.category && (
                  <small className="cd-error">
                    {errors.category}
                  </small>
                )}
              </label>

              <label className="cd-field">
                <span>
                  Description <b>*</b>
                </span>

                <textarea
                  rows={6}
                  placeholder="Describe the product and its features..."
                  value={form.description}
                  onChange={(event) =>
                    update(
                      "description",
                      event.target.value
                    )
                  }
                  className={
                    errors.description
                      ? "invalid"
                      : ""
                  }
                />

                {errors.description && (
                  <small className="cd-error">
                    {errors.description}
                  </small>
                )}
              </label>
            </section>

            <section className="cd-card">
              <h2>Pricing Details</h2>

              <div className="cd-two">
                {textField(
                  "originalPrice",
                  "Original Price (LKR)",
                  "120000",
                  "number"
                )}

                {textField(
                  "groupPrice",
                  "Group Price (LKR)",
                  "84000",
                  "number"
                )}
              </div>

              {savings > 0 && group > 0 && (
                <div className="cd-savings">
                  <CheckCircle2 size={18} />
                  Customers save{" "}
                  {formatPrice(savings)} (
                  {discount}%)
                </div>
              )}
            </section>
          </div>

          <div className="cd-column">
            <section className="cd-card">
              <h2>
                <ImagePlus size={20} />
                Product Image
              </h2>

              {imageUrl ? (
                <div className="cd-image-preview">
                  <img
                    src={imageUrl}
                    alt="Product preview"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setSuccess(false);
                    }}
                  >
                    <Trash2 size={16} />
                    Remove Image
                  </button>
                </div>
              ) : (
                <label className="cd-upload">
                  <UploadCloud size={32} />

                  <strong>
                    Click to upload image
                  </strong>

                  <span>
                    JPG, PNG or WEBP · Max 5 MB
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImage}
                  />
                </label>
              )}

              {(imageError || errors.image) && (
                <small className="cd-error">
                  {imageError || errors.image}
                </small>
              )}
            </section>

            <section className="cd-card">
              <h2>Group Deal Settings</h2>

              <div className="cd-two">
                {textField(
                  "minimumBuyers",
                  "Minimum Buyers",
                  "20",
                  "number"
                )}

                {textField(
                  "maximumBuyers",
                  "Maximum Buyers",
                  "30",
                  "number"
                )}
              </div>

              <label className="cd-field">
                <span>
                  Deal Deadline <b>*</b>
                </span>

                <input
                  type="date"
                  min={localToday()}
                  value={form.deadline}
                  onChange={(event) =>
                    update(
                      "deadline",
                      event.target.value
                    )
                  }
                  className={
                    errors.deadline
                      ? "invalid"
                      : ""
                  }
                />

                {errors.deadline && (
                  <small className="cd-error">
                    {errors.deadline}
                  </small>
                )}
              </label>

              <div className="cd-info">
                <Info size={18} />
                The group succeeds when its
                minimum buyer target is reached
                before the deadline.
              </div>
            </section>

            <section className="cd-card">
              <h2>Deal Preview</h2>

              <button
                type="button"
                className="cd-preview-button"
                onClick={() =>
                  setPreview(
                    (current) => !current
                  )
                }
              >
                {preview
                  ? "Hide Preview"
                  : "Preview Deal"}
              </button>

              {preview && (
                <div className="cd-preview">
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Deal preview"
                    />
                  )}

                  <h3>
                    {form.productName ||
                      "Product Name"}
                  </h3>

                  <span>
                    {form.category ||
                      "Category"}
                  </span>

                  <strong>
                    {formatPrice(group)}
                  </strong>

                  <del>
                    {formatPrice(original)}
                  </del>

                  <span>
                    Minimum buyers:{" "}
                    {form.minimumBuyers || "—"}
                  </span>

                  <span>
                    Maximum buyers:{" "}
                    {form.maximumBuyers || "—"}
                  </span>

                  <span>
                    Deadline:{" "}
                    {form.deadline || "—"}
                  </span>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="cd-bottom">
          <label className="cd-declaration">
            <input
              type="checkbox"
              checked={form.accepted}
              onChange={(event) =>
                update(
                  "accepted",
                  event.target.checked
                )
              }
            />

            I confirm the product information
            and prices are accurate.
          </label>

          {errors.accepted && (
            <small className="cd-error">
              {errors.accepted}
            </small>
          )}

          <div className="cd-actions">
            <button
              type="button"
              onClick={reset}
            >
              Reset Form
            </button>

            <button
              type="submit"
              className="cd-submit"
            >
              <Plus size={18} />
              Create Deal
            </button>
          </div>
        </div>
      </form>
    </SellerLayout>
  );
}
