import React from 'react'

const SellerRestrictionNotice = ({ remark = '' }) => {
    return (
        <div className='px-2 lg:px-7 pt-5'>
            <div className='w-full rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-[#f8d7da]'>
                <p className='text-sm font-semibold'>Your account is deactivated</p>
                <p className='mt-1 text-sm'>Check your email for details.</p>
                {remark && (
                    <p className='mt-2 text-sm text-red-200'>
                        Remark: {remark}
                    </p>
                )}
            </div>
        </div>
    )
}

export default SellerRestrictionNotice
