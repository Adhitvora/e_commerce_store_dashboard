import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { get_admin_order, admin_order_status_update, messageClear } from '../../store/Reducers/OrderReducer'

const ORDER_STATUS_OPTIONS = ['PENDING', 'ACCEPT', 'REJECT']

const DELIVERY_STATUS_OPTIONS = [
    'PENDING',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'DELIVERY_REJECTED',
    'cancelled'
]

const normalizeOrderStatus = (value = '') => String(value).trim().toUpperCase()

const normalizeDeliveryStatus = (value = '') => {
    const raw = String(value).trim()
    if (!raw) return ''

    const key = raw.toLowerCase().replace(/[\s-]+/g, '_')
    const map = {
        outfordelivery: 'OUT_FOR_DELIVERY',
        out_for_delivery: 'OUT_FOR_DELIVERY',
        delivery_rejected: 'DELIVERY_REJECTED',
        cancelled: 'cancelled',
        canceled: 'cancelled'
    }

    if (map[key]) return map[key]
    return raw.toUpperCase()
}

const label = (value = '') => {
    const normalized = normalizeDeliveryStatus(value)
    if (normalized === 'OUT_FOR_DELIVERY') return 'Out For Delivery'
    if (normalized === 'DELIVERY_REJECTED') return 'Delivery Rejected'
    if (normalized === 'cancelled') return 'Cancelled'
    return normalized.charAt(0) + normalized.slice(1).toLowerCase()
}

const OrderDetails = () => {

    const { orderId } = useParams()
    const dispatch = useDispatch()

    const { order, errorMessage, successMessage } = useSelector(state => state.order)

    useEffect(() => {
        dispatch(get_admin_order(orderId))
    }, [orderId, dispatch])

    const [orderStatus, setOrderStatus] = useState('PENDING')
    const [deliveryStatus, setDeliveryStatus] = useState('PENDING')

    useEffect(() => {
        setOrderStatus(normalizeOrderStatus(order?.order_status || 'PENDING'))
        setDeliveryStatus(normalizeDeliveryStatus(order?.delivery_status || 'PENDING'))
    }, [order])

    const updateStatus = async (info, previousOrderStatus, previousDeliveryStatus) => {
        try {
            await dispatch(admin_order_status_update({ orderId, info })).unwrap()
            dispatch(get_admin_order(orderId))
        } catch (error) {
            setOrderStatus(previousOrderStatus)
            setDeliveryStatus(previousDeliveryStatus)
        }
    }

    const orderStatusUpdate = (e) => {
        const nextOrderStatus = normalizeOrderStatus(e.target.value)
        const previousOrderStatus = orderStatus
        const previousDeliveryStatus = deliveryStatus

        setOrderStatus(nextOrderStatus)
        updateStatus(
            { order_status: nextOrderStatus },
            previousOrderStatus,
            previousDeliveryStatus
        )
    }

    const deliveryStatusUpdate = (e) => {
        const nextDeliveryStatus = normalizeDeliveryStatus(e.target.value)
        const previousOrderStatus = orderStatus
        const previousDeliveryStatus = deliveryStatus

        setDeliveryStatus(nextDeliveryStatus)
        updateStatus(
            { delivery_status: nextDeliveryStatus },
            previousOrderStatus,
            previousDeliveryStatus
        )
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

    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full p-4 bg-[#283046] rounded-md'>
                <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border-b border-slate-700'>
                    <div>
                        <h2 className='text-xl text-[#d0d2d6] font-semibold'>Order Details</h2>
                        <p className='text-sm text-slate-400 mt-1'>#{order._id} | {order.date}</p>
                    </div>
                    <div className='flex flex-col sm:flex-row flex-wrap gap-3'>
                        <select
                            onChange={orderStatusUpdate}
                            value={orderStatus}
                            className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-600 rounded-md text-[#d0d2d6] min-w-[180px]'
                        >
                            {ORDER_STATUS_OPTIONS.map((item) => (
                                <option key={item} value={item}>
                                    {label(item)}
                                </option>
                            ))}
                        </select>
                        <select
                            onChange={deliveryStatusUpdate}
                            value={deliveryStatus}
                            className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-600 rounded-md text-[#d0d2d6] min-w-[220px]'
                        >
                            {DELIVERY_STATUS_OPTIONS.map((item) => (
                                <option key={item} value={item}>
                                    {label(item)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='p-4 grid grid-cols-1 xl:grid-cols-12 gap-5 text-[#d0d2d6]'>
                    <div className='xl:col-span-4 space-y-5'>
                        <div className='bg-[#1f2638] rounded-md border border-slate-700 p-4'>
                            <h3 className='text-lg font-semibold mb-3'>Shipping Information</h3>
                            <div className='text-sm leading-6 text-slate-300'>
                                <p><span className='text-slate-400'>Name:</span> {order.shippingInfo?.name || '-'}</p>
                                <p>
                                    <span className='text-slate-400'>Address:</span>{' '}
                                    {order.shippingInfo?.address || '-'} {order.shippingInfo?.province || ''} {order.shippingInfo?.city || ''} {order.shippingInfo?.area || ''}
                                </p>
                            </div>
                        </div>

                        <div className='bg-[#1f2638] rounded-md border border-slate-700 p-4'>
                            <h3 className='text-lg font-semibold mb-3'>Payment Summary</h3>
                            <div className='text-sm space-y-2'>
                                <p><span className='text-slate-400'>Payment Status:</span> {order.payment_status || '-'}</p>
                                <p><span className='text-slate-400'>Total Price:</span> ₹{order.price}</p>
                            </div>
                        </div>

                        <div className='bg-[#1f2638] rounded-md border border-slate-700 p-4'>
                            <h3 className='text-lg font-semibold mb-3'>Order Products</h3>
                            <div className='space-y-3'>
                                {order.products && order.products.map((p, i) => (
                                    <div key={i} className='flex gap-3 items-center'>
                                        <img className='w-[55px] h-[55px] rounded object-cover border border-slate-700' src={p.images[0]} alt="" />
                                        <div className='text-sm'>
                                            <h4 className='font-medium text-[#d0d2d6]'>{p.name}</h4>
                                            <p className='text-slate-400'>Brand: {p.brand} | Qty: {p.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='xl:col-span-8'>
                        <div className='bg-[#1f2638] rounded-md border border-slate-700 p-4'>
                            <h3 className='text-lg font-semibold mb-4'>Seller Sub Orders</h3>
                            <div className='space-y-6'>
                                {order?.suborder?.map((o, i) => (
                                    <div key={i + 20} className='border border-slate-700 rounded-md p-4'>
                                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3'>
                                            <h4 className='font-medium'>Seller {i + 1}</h4>
                                            <span className='text-sm px-3 py-1 rounded bg-[#283046] border border-slate-600 w-fit'>
                                                {label(o.delivery_status)}
                                            </span>
                                        </div>
                                        <div className='space-y-2'>
                                            {o.products?.map((p, idx) => (
                                                <div key={idx} className='flex gap-3 items-center'>
                                                    <img className='w-[50px] h-[50px] rounded object-cover border border-slate-700' src={p.images[0]} alt="" />
                                                    <div className='text-sm'>
                                                        <h5 className='font-medium text-[#d0d2d6]'>{p.name}</h5>
                                                        <p className='text-slate-400'>Brand: {p.brand} | Qty: {p.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
