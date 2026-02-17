import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "../Pagination";
import Search from "../components/Search";
import {
  admin_get_products,
  approve_product,
  reject_product,
  get_product_full_details,
} from "../../store/Reducers/productReducer";
import ProductDetailsModal from "../components/ProductDetailsModal";

const ProductApproval = () => {
  const dispatch = useDispatch();
  const { products, product, totalProduct } = useSelector(
    (state) => state.product,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [parPage, setParPage] = useState(5);

  useEffect(() => {
    dispatch(
      admin_get_products({
        parPage: parseInt(parPage),
        page: parseInt(currentPage),
        searchValue,
      }),
    );
  }, [searchValue, currentPage, parPage, dispatch]);

  const approveHandler = (id) => {
    if (window.confirm("Approve this product?")) {
      dispatch(approve_product(id));
    }
  };

  const rejectHandler = (id) => {
    if (window.confirm("Reject this product?")) {
      dispatch(reject_product(id));
    }
  };

  const [showModal, setShowModal] = useState(false);

  const viewHandler = (id) => {
    dispatch(get_product_full_details(id));
    setShowModal(true);
  };

  return (
    <div className="px-2 lg:px-7 pt-5">
      <div className="w-full p-4 bg-[#283046] rounded-md">
        <Search
          setParPage={setParPage}
          setSearchValue={setSearchValue}
          searchValue={searchValue}
        />

        <div className="relative overflow-x-auto mt-5">
          <table className="w-full table-auto text-sm text-left text-[#d0d2d6]">
            <thead className="text-sm uppercase border-b border-slate-700 text-center">
              <tr>
                <th className="py-3 px-4 text-left">No</th>
                <th className="py-3 px-4 text-left">Image</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-2">Total</th>
                <th className="py-3 px-2">Pending</th>
                <th className="py-3 px-2">Cancel</th>
                <th className="py-3 px-2">Delivered</th>
                <th className="py-3 px-4 text-left">Seller</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((d, i) => (
                <tr
                  key={d._id}
                  className="border-b border-slate-700 align-middle"
                >
                  <td className="py-2 px-4 text-left">{i + 1}</td>

                  <td className="py-2 px-4 text-left">
                    <img
                      className="w-[45px] h-[45px] object-cover rounded"
                      src={d.images[0]}
                      alt=""
                    />
                  </td>

                  <td className="py-2 px-4 text-left">
                    {d.name.length > 16 ? d.name.slice(0, 16) + "..." : d.name}
                  </td>

                  <td className="py-2 px-2 text-center">
                    {d.sellerProgress.totalOrders}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {d.sellerProgress.pendingOrders}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {d.sellerProgress.cancelledOrders}
                  </td>
                  <td className="py-2 px-2 text-center">
                    {d.sellerProgress.deliveredOrders}
                  </td>

                  <td className="py-2 px-4 text-left">
                    {d.sellerId?.name || "N/A"}
                  </td>

                  <td className="py-2 px-4 text-center">₹{d.price}</td>

                  <td className="py-2 px-4 text-center">
                    {d.discount === 0 ? "no discount" : `${d.discount}%`}
                  </td>

                  <td className="py-2 px-4 text-center">{d.stock}</td>

                  <td className="py-2 px-4 text-center">
                    {d.approval_status === "pending" && (
                      <span className="text-yellow-400">Pending</span>
                    )}
                    {d.approval_status === "approved" && (
                      <span className="text-green-400">Approved</span>
                    )}
                    {d.approval_status === "rejected" && (
                      <span className="text-red-400">Rejected</span>
                    )}
                  </td>

                  <td className="py-2 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      {(d.approval_status === "pending" ||
                        d.approval_status === "rejected") && (
                        <button
                          onClick={() => approveHandler(d._id)}
                          className="p-[6px] bg-green-500 rounded hover:shadow-lg hover:shadow-green-500/50"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                      )}

                      {(d.approval_status === "pending" ||
                        d.approval_status === "approved") && (
                        <button
                          onClick={() => rejectHandler(d._id)}
                          className="p-[6px] bg-red-500 rounded hover:shadow-lg hover:shadow-red-500/50"
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                      )}

                      <button
                        onClick={() => viewHandler(d._id)}
                        className="p-[6px] bg-blue-500 rounded"
                        title="View"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalProduct > parPage && (
          <div className="w-full flex justify-end mt-4">
            <Pagination
              pageNumber={currentPage}
              setPageNumber={setCurrentPage}
              totalItem={totalProduct}
              parPage={parPage}
              showItem={4}
            />
          </div>
        )}

        {showModal && (
          <ProductDetailsModal
            product={product}
            close={() => setShowModal(false)}
            approveHandler={approveHandler}
            rejectHandler={rejectHandler}
          />
        )}
      </div>
    </div>
  );
};

export default ProductApproval;
