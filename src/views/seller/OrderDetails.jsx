import React, { useEffect, useMemo, useState } from 'react'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import {
    messageClear,
    get_seller_order,
    seller_order_status_update,
    seller_delivery_status_update
} from '../../store/Reducers/OrderReducer'
import { formatDateTime } from '../../utils/dateFormatter'

const DELIVERY_TRANSITIONS = {
    PENDING: ['PROCESSING'],
    PROCESSING: ['PACKED'],
    PACKED: ['SHIPPED'],
    SHIPPED: ['OUT_FOR_DELIVERY'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'DELIVERY_REJECTED'],
    DELIVERED: [],
    DELIVERY_REJECTED: [],
    CANCELLED: []
}

const LABELS = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    PACKED: 'Packed',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out For Delivery',
    DELIVERED: 'Delivered',
    DELIVERY_REJECTED: 'Delivery Rejected',
    CANCELLED: 'Cancelled',
    ACCEPT: 'Accepted',
    REJECT: 'Rejected'
}

const STATUS_THEME = {
    PENDING: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    PROCESSING: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    PACKED: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    SHIPPED: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    OUT_FOR_DELIVERY: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
    DELIVERED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    DELIVERY_REJECTED: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    CANCELLED: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    ACCEPT: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    REJECT: 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
}

const normalizeStatus = (value = '') => {
    const raw = String(value).trim()
    if (!raw) return ''
    const key = raw.toLowerCase().replace(/[\s-]+/g, '_')
    const map = {
        outfordelivery: 'OUT_FOR_DELIVERY',
        out_for_delivery: 'OUT_FOR_DELIVERY',
        delivery_rejected: 'DELIVERY_REJECTED',
        cancelled: 'CANCELLED',
        canceled: 'CANCELLED'
    }

    if (map[key]) return map[key]
    return raw.toUpperCase()
}

const getTheme = (status = '') => STATUS_THEME[status] || 'bg-slate-700 text-slate-200 border border-slate-600'

const OrderDetails = () => {
    const { orderId } = useParams()
    const dispatch = useDispatch()

    const { order, errorMessage, successMessage } = useSelector(
        (state) => state.order
    )

    const [deliveryStatus, setDeliveryStatus] = useState('')
    const [isOrderUpdating, setIsOrderUpdating] = useState(false)
    const [isDeliveryUpdating, setIsDeliveryUpdating] = useState(false)

    const currentOrderStatus = normalizeStatus(order?.order_status || 'PENDING')
    const currentDeliveryStatus = normalizeStatus(order?.delivery_status || 'PENDING')
    const nextDeliveryOptions = useMemo(() => {
        return DELIVERY_TRANSITIONS[currentDeliveryStatus] || []
    }, [currentDeliveryStatus])
    const shownDeliveryStatus =
        (currentOrderStatus === 'REJECT' || currentDeliveryStatus === 'CANCELLED')
            ? 'CANCELLED'
            : currentDeliveryStatus

    useEffect(() => {
        dispatch(get_seller_order(orderId))
    }, [orderId, dispatch])

    useEffect(() => {
        setDeliveryStatus(currentDeliveryStatus)
    }, [currentDeliveryStatus])

    const handleOrderStatusUpdate = async (nextOrderStatus) => {
        if (isOrderUpdating) return
        setIsOrderUpdating(true)
        try {
            await dispatch(
                seller_order_status_update({
                    orderId,
                    info: { status: nextOrderStatus }
                })
            ).unwrap()
            await dispatch(get_seller_order(orderId))
        } catch (error) {
        } finally {
            setIsOrderUpdating(false)
        }
    }

    const handleDeliveryStatusUpdate = async (e) => {
        const nextStatus = normalizeStatus(e.target.value)
        if (!nextStatus || nextStatus === currentDeliveryStatus || isDeliveryUpdating) return

        const previousStatus = deliveryStatus
        setDeliveryStatus(nextStatus)
        setIsDeliveryUpdating(true)
        try {
            await dispatch(
                seller_delivery_status_update({
                    orderId,
                    info: { status: nextStatus }
                })
            ).unwrap()
            await dispatch(get_seller_order(orderId))
        } catch (error) {
            setDeliveryStatus(previousStatus)
        } finally {
            setIsDeliveryUpdating(false)
        }
    }

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())
        }
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())
        }
    }, [successMessage, errorMessage, dispatch])

    if (!order?._id) {
        return <div className="p-6 text-white">Loading Order...</div>
    }

    return (
        <div className="px-2 lg:px-7 pt-5">
            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#283046] shadow-lg">
                <div className="bg-gradient-to-r from-[#121f3a] via-[#1c3157] to-[#1e5d7a] px-5 py-6 md:px-6">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div>
                            <p className="text-[11px] tracking-[0.2em] uppercase text-slate-300/80">Seller Order View</p>
                            <h2 className="mt-1 text-2xl font-bold text-white">Order Details</h2>
                            <p className="mt-2 text-sm text-slate-300">Order ID: #{order?.orderId || order?._id}</p>
                            <p className="text-sm text-slate-300">{formatDateTime(order?.date)}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getTheme(currentOrderStatus)}`}>
                                    ORDER: {LABELS[currentOrderStatus] || currentOrderStatus}
                                </span>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getTheme(shownDeliveryStatus)}`}>
                                    DELIVERY: {LABELS[shownDeliveryStatus] || shownDeliveryStatus}
                                </span>
                                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                                    PAYMENT: {order?.payment_status?.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="min-w-[220px] rounded-xl border border-slate-600/60 bg-[#1a2942]/70 p-3">
                            <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Actions</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {currentOrderStatus === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleOrderStatusUpdate('ACCEPT')}
                                            disabled={isOrderUpdating}
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                                            title="Accept Order"
                                        >
                                            <FaCheckCircle className="text-base" />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleOrderStatusUpdate('REJECT')}
                                            disabled={isOrderUpdating}
                                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                                            title="Reject Order"
                                        >
                                            <FaTimesCircle className="text-base" />
                                            Reject
                                        </button>
                                    </>
                                )}

                                {currentOrderStatus === 'ACCEPT' && currentDeliveryStatus !== 'CANCELLED' && (
                                    <select
                                        onChange={handleDeliveryStatusUpdate}
                                        value={deliveryStatus}
                                        disabled={nextDeliveryOptions.length === 0 || isDeliveryUpdating}
                                        className="w-full rounded-lg border border-slate-600 bg-[#243554] px-3 py-2 text-sm text-slate-100 disabled:opacity-60"
                                    >
                                        <option value={currentDeliveryStatus}>
                                            {LABELS[currentDeliveryStatus] || currentDeliveryStatus}
                                        </option>
                                        {nextDeliveryOptions.map((status) => (
                                            <option key={status} value={status}>
                                                Move to {LABELS[status] || status}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {(currentOrderStatus === 'REJECT' || currentDeliveryStatus === 'CANCELLED') && (
                                    <span className="inline-flex w-full items-center justify-center rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white">
                                        Cancelled Order
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 p-4 text-[#d0d2d6] xl:grid-cols-12">
                    <div className="space-y-5 xl:col-span-4">
                        <div className="rounded-xl border border-slate-700 bg-[#1f2b42] p-4">
                            <h3 className="mb-3 text-lg font-semibold text-white">Shipping Information</h3>
                            {order?.shippingInfo && (
                                <div className="space-y-2 text-sm text-slate-300">
                                    <p><span className="text-slate-400">Name:</span> {order.shippingInfo.name}</p>
                                    <p><span className="text-slate-400">Address:</span> {order.shippingInfo.address}</p>
                                    <p><span className="text-slate-400">Location:</span> {order.shippingInfo.area}, {order.shippingInfo.city}</p>
                                    <p><span className="text-slate-400">Province:</span> {order.shippingInfo.province} - {order.shippingInfo.post}</p>
                                    <p><span className="text-slate-400">Phone:</span> {order.shippingInfo.phone}</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-xl border border-slate-700 bg-[#1f2b42] p-4">
                            <h3 className="mb-3 text-lg font-semibold text-white">Payment Summary</h3>
                            <div className="space-y-2 text-sm text-slate-300">
                                {order?.subtotal > 0 && (
                                    <p><span className="text-slate-400">Subtotal:</span> ₹{order.subtotal}</p>
                                )}
                                {order?.discount_amount > 0 && (
                                    <p><span className="text-slate-400">Discount:</span> -₹{order.discount_amount}</p>
                                )}
                                <p><span className="text-slate-400">Payment:</span> {order?.payment_status?.toUpperCase()}</p>
                                <p><span className="text-slate-400">Payment Type:</span> {(order?.payment_type || '-').toUpperCase()}</p>
                                <p><span className="text-slate-400">Product Total:</span> ₹{order?.product_total || order?.price}</p>
                                <p><span className="text-slate-400">Shipping Fee:</span> ₹{order?.shipping_fee || 0}</p>
                                <p><span className="text-slate-400">Order Value:</span> ₹{order?.final_total || order?.price}</p>
                                <p><span className="text-slate-400">Commission ({order?.commission_percent || 0}%):</span> <span className="text-yellow-400">₹{order?.commission_amount || 0}</span></p>
                                <div className="border-t border-slate-700 pt-2 mt-2">
                                    <p className="text-green-400 font-semibold">Your Earning: ₹{order?.seller_earning || order?.final_total || order?.price}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="xl:col-span-8">
                        <div className="rounded-xl border border-slate-700 bg-[#1f2b42] p-4">
                            <div className="mb-4 flex items-center justify-between gap-2">
                                <h3 className="text-lg font-semibold text-white">Ordered Products</h3>
                                <span className="rounded-full border border-slate-600 bg-[#283046] px-3 py-1 text-xs text-slate-300">
                                    {order?.products?.length || 0} item(s)
                                </span>
                            </div>

                            {order?.products?.length > 0 ? (
                                <div className="space-y-3">
                                    {order.products.map((p, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-[#162235] p-4 sm:flex-row sm:items-center"
                                        >
                                            <img
                                                className="h-[84px] w-[84px] rounded-lg object-cover border border-slate-700"
                                                src={p?.images?.[0]}
                                                alt={p?.name}
                                            />

                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-base font-semibold text-white">{p?.name}</h4>
                                                <p className="mt-1 text-sm text-slate-300">Brand: {p?.brand}</p>
                                                <p className="text-sm text-slate-300">Quantity: {p?.quantity}</p>
                                                <p className="text-sm text-slate-300">Price: Rs. {p?.price}</p>
                                            </div>

                                            <div className="sm:text-right">
                                                <span className="inline-flex rounded-full border border-slate-600 bg-[#283046] px-3 py-1 text-xs text-slate-300">
                                                    Approval: {p?.approval_status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-slate-600 bg-[#1a2436] p-8 text-center text-slate-400">
                                    No products found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
