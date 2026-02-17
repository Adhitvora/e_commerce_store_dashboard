import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  messageClear,
  get_seller_order,
  seller_order_status_update,
} from "../../store/Reducers/OrderReducer";

const OrderDetails = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();

  const { order, errorMessage, successMessage } = useSelector(
    (state) => state.order,
  );

  const [status, setStatus] = useState("");

  // Fetch order
  useEffect(() => {
    dispatch(get_seller_order(orderId));
  }, [orderId, dispatch]);

  // Sync status
  useEffect(() => {
    if (order?.delivery_status) {
      setStatus(order.delivery_status);
    }
  }, [order]);

  // Update status
  const status_update = (e) => {
    const value = e.target.value;
    setStatus(value);
    dispatch(
      seller_order_status_update({
        orderId,
        info: { status: value },
      }),
    );
  };

  // Toast handling
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(messageClear());
    }
    if (errorMessage) {
      toast.error(errorMessage);
      dispatch(messageClear());
    }
  }, [successMessage, errorMessage, dispatch]);

  if (!order) {
    return <div className="p-6 text-white">Loading Order...</div>;
  }

  return (
    <div className="px-2 lg:px-7 pt-5">
      <div className="w-full p-4 bg-[#283046] rounded-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl text-[#d0d2d6]">Order Details</h2>

          <select
            onChange={status_update}
            value={status}
            className="px-4 py-2 bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="warehouse">Warehouse</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Order Basic Info */}
        <div className="px-4 text-[#d0d2d6]">
          <div className="flex gap-4 text-lg mb-4">
            <span>Order ID: #{order?._id}</span>
            <span>{order?.date}</span>
          </div>

          <div className="flex flex-wrap gap-6">
            {/* Shipping Section */}
            <div className="w-full md:w-[30%]">
              <h3 className="font-semibold text-lg mb-3">
                Shipping Information
              </h3>

              {order?.shippingInfo && (
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {order.shippingInfo.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {order.shippingInfo.address}
                  </p>
                  <p>
                    <strong>Location:</strong> {order.shippingInfo.area},{" "}
                    {order.shippingInfo.city}
                  </p>
                  <p>
                    <strong>Province:</strong> {order.shippingInfo.province} -{" "}
                    {order.shippingInfo.post}
                  </p>
                  <p>
                    <strong>Phone:</strong> {order.shippingInfo.phone}
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <p>
                  <strong>Payment:</strong>{" "}
                  {order?.payment_status?.toUpperCase()}
                </p>
                <p>
                  <strong>Total Price:</strong> ₹{order?.price}
                </p>
              </div>
            </div>

            {/* Products Section */}
            <div className="w-full md:w-[65%]">
              <h3 className="font-semibold text-lg mb-3">Products</h3>

              {order?.products?.length > 0 ? (
                order.products.map((p, i) => (
                  <div
                    key={i}
                    className="flex gap-4 mb-4 bg-[#1f2638] p-3 rounded-md"
                  >
                    <img
                      className="w-[70px] h-[70px] object-cover rounded"
                      src={p?.images?.[0]}
                      alt={p?.name}
                    />

                    <div className="flex flex-col justify-between">
                      <h4 className="font-semibold">{p?.name}</h4>

                      <p className="text-sm">
                        <span>Brand: {p?.brand}</span>
                      </p>

                      <p className="text-sm">Quantity: {p?.quantity}</p>

                      <p className="text-sm">Price: ₹{p?.price}</p>

                      <p className="text-sm">Approval: {p?.approval_status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No products found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
