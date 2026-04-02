import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
    get_commission_settings,
    update_commission_settings,
    messageClear
} from '../../store/Reducers/commissionReducer'

const CommissionSettings = () => {
    const dispatch = useDispatch()
    const { settings, loader, successMessage, errorMessage } = useSelector(
        (state) => state.commission
    )

    const [commissionPercent, setCommissionPercent] = useState('')

    useEffect(() => {
        dispatch(get_commission_settings())
    }, [dispatch])

    useEffect(() => {
        if (settings) {
            setCommissionPercent(settings.commission_percent?.toString() || '0')
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

        const percent = Number(commissionPercent)

        if (isNaN(percent) || percent < 0 || percent > 100) {
            toast.error('Commission must be between 0 and 100')
            return
        }

        dispatch(update_commission_settings({
            commission_percent: percent
        }))
    }

    return (
        <div className="px-2 lg:px-7 pt-5">
            <div className="w-full p-4 bg-[#283046] rounded-md">
                <h1 className="text-[#d0d2d6] text-xl font-semibold mb-3">
                    Commission Settings
                </h1>
                <p className="text-slate-400 text-sm mb-6">
                    Set the platform commission percentage. This will be applied to all new orders.
                    Setting commission to 0% means no platform commission.
                </p>

                <form onSubmit={handleSubmit} className="max-w-md">
                    <div className="mb-5">
                        <label
                            htmlFor="commission_percent"
                            className="block text-[#d0d2d6] text-sm font-medium mb-2"
                        >
                            Commission Percentage (%)
                        </label>
                        <input
                            type="number"
                            id="commission_percent"
                            name="commission_percent"
                            min="0"
                            max="100"
                            step="0.1"
                            value={commissionPercent}
                            onChange={(e) => setCommissionPercent(e.target.value)}
                            className="w-full px-4 py-3 bg-[#1f2638] border border-slate-600 rounded-md text-[#d0d2d6] text-sm outline-none focus:border-indigo-500 transition-colors"
                            placeholder="e.g. 10"
                        />
                        <p className="text-slate-500 text-xs mt-1.5">
                            Enter 0 to disable commission. Max 100%.
                        </p>
                    </div>

                    {/* Current Value Display */}
                    <div className="mb-5 p-3 bg-[#1f2638] border border-slate-700 rounded-md">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Current Commission:</span>
                            <span className="text-[#d0d2d6] font-semibold text-lg">
                                {settings.commission_percent ?? 0}%
                            </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                            {settings.commission_percent > 0
                                ? `Platform takes ${settings.commission_percent}% from each seller's order value`
                                : 'No commission — sellers receive full order value'}
                        </p>
                    </div>

                    {/* Example Calculation */}
                    {Number(commissionPercent) > 0 && (
                        <div className="mb-5 p-3 bg-[#1a2235] border border-slate-700 rounded-md">
                            <p className="text-slate-400 text-xs font-medium mb-2">EXAMPLE CALCULATION</p>
                            <div className="text-sm text-slate-300 space-y-1">
                                <p>Order Value: ₹1,000</p>
                                <p>Commission ({commissionPercent}%): ₹{Math.round(1000 * Number(commissionPercent) / 100)}</p>
                                <p className="text-green-400 font-medium">
                                    Seller Receives: ₹{1000 - Math.round(1000 * Number(commissionPercent) / 100)}
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loader}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
                    >
                        {loader ? 'Saving...' : 'Save Commission Settings'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CommissionSettings
