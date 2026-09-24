import { Link } from "react-router-dom";
import "./SellerDeals.css";

function SellerDeals() {
  const deals = [
    {
      id: 1,
      productName: "Smart Watch",
      groupPrice: 6500,
      buyers: 3,
      minimumBuyers: 5,
      status: "ACTIVE",
    },
    {
      id: 2,
      productName: "Wireless Headphones",
      groupPrice: 9000,
      buyers: 6,
      minimumBuyers: 6,
      status: "SUCCESSFUL",
    },
    {
      id: 3,
      productName: "Laptop Bag",
      groupPrice: 4000,
      buyers: 2,
      minimumBuyers: 4,
      status: "ACTIVE",
    },
  ];

  return (
    <main className="seller-deals-page">
      <div className="container">
        <div className="seller-deals-header">
          <div>
            <span>Seller Center</span>
            <h1>My Deals</h1>
            <p>View and manage your group-buying deals.</p>
          </div>

          <Link to="/seller/create-deal" className="seller-new-deal">
            + Create Deal
          </Link>
        </div>

        <div className="seller-deals-table-wrapper">
          <table className="seller-deals-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Group Price</th>
                <th>Participants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id}>
                  <td className="seller-product-name">
                    {deal.productName}
                  </td>

                  <td>
                    Rs. {deal.groupPrice.toLocaleString()}
                  </td>

                  <td>
                    {deal.buyers} / {deal.minimumBuyers}
                  </td>

                  <td>
                    <span
                      className={`seller-deal-status ${deal.status.toLowerCase()}`}
                    >
                      {deal.status}
                    </span>
                  </td>

                  <td>
                    <div className="seller-deal-actions">
                      <Link
                        to={`/seller/deals/${deal.id}/participants`}
                      >
                        Participants
                      </Link>

                      <button type="button">
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default SellerDeals;