import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

const ProductDetailsModal = ({
  product,
  close,
  approveHandler,
  rejectHandler,
}) => {
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    if (product?.images?.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
      <div className="bg-[#1e293b] text-white w-[80vw] h-[70vh] rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Product Details</h2>
          <button onClick={close}>
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* TOP SECTION */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* IMAGE SECTION */}
            <div>
              <div className="bg-[#0f172a] rounded-lg h-[220px] flex items-center justify-center">
                <img
                  src={activeImage}
                  alt=""
                  className="max-h-full object-contain"
                />
              </div>

              <div className="flex gap-2 mt-2 flex-wrap">
                {product.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 object-cover rounded cursor-pointer border ${
                      activeImage === img
                        ? "border-green-500"
                        : "border-gray-600"
                    }`}
                    alt=""
                  />
                ))}
              </div>
            </div>

            {/* PRODUCT DETAILS */}
            <div className="bg-[#0f172a] p-3 rounded-lg text-xs space-y-1">
              <p>
                <b>Name:</b> {product.name}
              </p>
              <p>
                <b>Category:</b> {product.category}
              </p>
              <p>
                <b>Brand:</b> {product.brand}
              </p>
              <p>
                <b>Price:</b> ₹{product.price}
              </p>
              <p>
                <b>Discount:</b> {product.discount}%
              </p>
              <p>
                <b>Stock:</b> {product.stock}
              </p>
              <p>
                <b>Status:</b> {product.approval_status}
              </p>
              <p>
                <b>Created:</b> {new Date(product.createdAt).toLocaleString()}
              </p>

              {product.approvedAt && (
                <p>
                  <b>Approved:</b>{" "}
                  {new Date(product.approvedAt).toLocaleString()}
                </p>
              )}

              <div>
                <b>Description:</b>
                <div
                  className="text-gray-300 text-xs"
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              </div>
            </div>
          </div>

          {/* SELLER SECTION */}
          <div className="mt-4 bg-[#0f172a] p-3 rounded-lg">
            <h3 className="text-sm font-semibold mb-3 text-center">
              Seller Information
            </h3>

            <div className="grid md:grid-cols-3 gap-3 text-xs">
              {/* COL 1: IMAGE */}
              <div className="flex justify-center">
                <img
                  src={product.sellerId?.image}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>

              {/* COL 2 */}
              <div className="space-y-1">
                <p>
                  <b>Name:</b> {product.sellerId?.name}
                </p>
                <p>
                  <b>Email:</b> {product.sellerId?.email}
                </p>
                <p>
                  <b>Status:</b> {product.sellerId?.status}
                </p>
                <p>
                  <b>Payment:</b> {product.sellerId?.payment}
                </p>
                <p>
                  <b>Method:</b> {product.sellerId?.method}
                </p>
              </div>

              {/* COL 3 */}
              <div className="space-y-1">
                <p>
                  <b>Shop:</b> {product.sellerId?.shopInfo?.shopName}
                </p>
                <p>
                  <b>Division:</b> {product.sellerId?.shopInfo?.division}
                </p>
                <p>
                  <b>District:</b> {product.sellerId?.shopInfo?.district}
                </p>
                <p>
                  <b>Sub District:</b>{" "}
                  {product.sellerId?.shopInfo?.sub_district}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-4 py-2 border-t border-gray-700">
          {(product.approval_status === "pending" ||
            product.approval_status === "rejected") && (
            <button
              onClick={() => approveHandler(product._id)}
              className="bg-green-600 px-4 py-1 text-xs rounded"
            >
              Approve
            </button>
          )}

          {(product.approval_status === "pending" ||
            product.approval_status === "approved") && (
            <button
              onClick={() => rejectHandler(product._id)}
              className="bg-red-600 px-4 py-1 text-xs rounded"
            >
              Reject
            </button>
          )}

          <button
            onClick={close}
            className="bg-gray-600 px-4 py-1 text-xs rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
