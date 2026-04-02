import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
    get_shipping_settings,
    update_shipping_settings,
    messageClear
} from '../../store/Reducers/shippingSettingsReducer'

const ShippingSettings = () => {
    const dispatch = useDispatch()
    const { settings, loader, successMessage, errorMessage } = useSelector(
        (state) => state.shippingSettings
    )

    const [shippingFee, setShippingFee] = useState('')

    useEffect(() => {
        dispatch(get_shipping_settings())
    }, [dispatch])

    useEffect(() => {
        if (settings) {
            setShippingFee(settings.shipping_fee?.toString() || '0')
        }
    }, [settings])

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

    const handleSubmit = (e) => {
        e.preventDefault()

        const parsedShippingFee = Number(shippingFee)

        if (!Number.isFinite(parsedShippingFee) || parsedShippingFee < 0) {
            toast.error('Shipping fee must be 0 or greater')
            return
        }

        dispatch(update_shipping_settings({
            shipping_fee: parsedShippingFee
        }))
    }

    return (
        <div className="px-2 lg:px-7 pt-5">
            <div className="w-full p-4 bg-[#283046] rounded-md">
                <h1 className="text-[#d0d2d6] text-xl font-semibold mb-3">
                    Shipping Fee Settings
                </h1>
                <p className="text-slate-400 text-sm mb-6">
                    Set the global shipping fee used across new carts and checkout sessions.
                    If left at 0, shipping will be free until updated.
                </p>

                <form onSubmit={handleSubmit} className="max-w-md">
                    <div className="mb-5">
                        <label
                            htmlFor="shipping_fee"
                            className="block text-[#d0d2d6] text-sm font-medium mb-2"
                        >
                            Shipping Fee
                        </label>
                        <input
                            type="number"
                            id="shipping_fee"
                            name="shipping_fee"
                            min="0"
                            step="0.01"
                            value={shippingFee}
                            onChange={(e) => setShippingFee(e.target.value)}
                            className="w-full px-4 py-3 bg-[#1f2638] border border-slate-600 rounded-md text-[#d0d2d6] text-sm outline-none focus:border-indigo-500 transition-colors"
                            placeholder="e.g. 85"
                        />
                        <p className="text-slate-500 text-xs mt-1.5">
                            This value is applied through the existing shipping_fee flow.
                        </p>
                    </div>

                    <div className="mb-5 p-3 bg-[#1f2638] border border-slate-700 rounded-md">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Current Shipping Fee:</span>
                            <span className="text-[#d0d2d6] font-semibold text-lg">
                                ₹{settings.shipping_fee ?? 0}
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                            New cart totals and direct checkout flows will pick up this amount automatically.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loader}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
                    >
                        {loader ? 'Saving...' : 'Save Shipping Fee'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ShippingSettings
