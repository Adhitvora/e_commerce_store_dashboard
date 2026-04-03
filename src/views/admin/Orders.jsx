import React, { useMemo, useState, useEffect } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FiEye, FiSearch, FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";
import { useSelector, useDispatch } from "react-redux";
import { get_admin_orders } from "../../store/Reducers/OrderReducer";
import { formatDateTime } from "../../utils/dateFormatter";

const statusClass = () => {
  return "bg-[#1f2d44] text-[#d0d2d6] border border-slate-600";
};

const Orders = () => {
  const dispatch = useDispatch();
  const { totalOrder, myOrders } = useSelector((state) => state.order);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [parPage, setParPage] = useState(5);
  const [show, setShow] = useState("");

  useEffect(() => {
    dispatch(
      get_admin_orders({
        parPage: parseInt(parPage),
        page: parseInt(currentPage),
        searchValue,
      }),
    );
  }, [parPage, currentPage, searchValue, dispatch]);

  const filteredOrders = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return myOrders;

    return myOrders.filter((order) => {
      const haystack = [
        order?._id,
        order?.payment_status,
        order?.delivery_status,
        order?.order_status,
        order?.date,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [myOrders, searchValue]);

  const toggleExpand = (id) => {
    setShow((prev) => (prev === id ? "" : id));
  };

  return (
    <div className="px-2 lg:px-7 pt-5">
      <div className="w-full rounded-2xl border border-slate-700 bg-[#283046] p-4 shadow-lg">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-[#d0d2d6]">
            <div className="rounded-lg bg-[#1f2d44] p-2 text-[#d0d2d6] border border-slate-600">
              <FiShoppingBag />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Orders</h2>
              <p className="text-xs text-slate-400">
                Manage and review all customer orders
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
            <select
              value={parPage}
              onChange={(e) => setParPage(parseInt(e.target.value))}
              className="rounded-lg border border-slate-600 bg-[#1f2d44] px-4 py-2 text-[#d0d2d6] outline-none focus:border-slate-500"
            >
              <option value="5">5</option>
              <option value="15">15</option>
              <option value="25">25</option>
            </select>

            <div className="relative min-w-[230px]">
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-[#1f2d44] py-2 pl-10 pr-4 text-[#d0d2d6] outline-none focus:border-slate-500"
                type="text"
                placeholder="Search by order id, status, date"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="relative overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-sm text-[#d0d2d6]">
            <thead className="uppercase text-xs bg-[#1f2d44] text-slate-300 border-b border-slate-700">
              <tr>
                <th className="py-3 px-4">Order Id</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Delivery</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">View</th>
                <th className="py-3 px-4 text-center">More</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <React.Fragment key={o._id}>
                  <tr className="border-b border-slate-700/70 bg-[#283046] hover:bg-[#2b3650]">
                    <td className="py-4 px-4 font-medium whitespace-nowrap">
                      #{o._id}
                    </td>
                    <td className="py-4 px-4">₹{o.price}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(o.payment_status)}`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(o.delivery_status)}`}
                      >
                        {o.delivery_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">{formatDateTime(o.date)}</td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-around items-center gap-4">
                        <Link
                          to={`/admin/dashboard/order/details/${o._id}`}
                          className="p-[6px] bg-green-500 rounded hover:shadow-lg hover:shadow-green-500/50"
                        >
                          <FiEye />
                        </Link>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleExpand(o._id)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-600 bg-[#1f2d44] p-2 text-[#d0d2d6] hover:bg-[#2b3b56]"
                        title="Toggle sub orders"
                      >
                        <MdKeyboardArrowDown
                          className={`${show === o._id ? "rotate-180" : ""} transition-transform`}
                        />
                      </button>
                    </td>
                  </tr>

                  {show === o._id && (
                    <tr className="bg-[#1f2d44]">
                      <td colSpan="7" className="p-4">
                        <div className="rounded-lg border border-slate-700 overflow-hidden">
                          <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-[#233454] uppercase">
                              <tr>
                                <th className="py-2 px-3">Order Id</th>
                                <th className="py-2 px-3">Seller Sub Order</th>
                                <th className="py-2 px-3">Amount</th>
                                <th className="py-2 px-3">Payment</th>
                                <th className="py-2 px-3">Delivery</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.suborder?.map((so) => (
                                <tr
                                  key={so._id}
                                  className="border-t border-slate-700/70"
                                >
                                  <td className="py-2 px-3">{o._id}</td>
                                  <td className="py-2 px-3">{so._id}</td>
                                  <td className="py-2 px-3">₹{so.price}</td>
                                  <td className="py-2 px-3">
                                    {so.payment_status}
                                  </td>
                                  <td className="py-2 px-3">
                                    {so.delivery_status}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              No orders found for this search.
            </div>
          )}
        </div>

        {!searchValue && totalOrder > parPage && (
          <div className="mt-4 flex justify-end">
            <Pagination
              pageNumber={currentPage}
              setPageNumber={setCurrentPage}
              totalItem={totalOrder}
              parPage={parPage}
              showItem={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
