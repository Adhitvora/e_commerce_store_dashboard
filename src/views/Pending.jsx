import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
const Pending = () => {
  const { verificationStatus } = useSelector(state => state.auth)
  const waitingForApproval = verificationStatus === 'pending_admin'

  return (
    <div className='px-7 py-4'>
      <div className='bg-[#283046] p-4 rounded-md text-[#D0D2D6]'>
        <p>
          {waitingForApproval
            ? 'Your account is under admin review'
            : 'Please complete your seller verification before accessing the dashboard.'}
        </p>
        {!waitingForApproval && (
          <button className='bg-blue-500 hover:shadow-blue-500/20 hover:shadow-lg text-white rounded-md px-7 py-2 mt-3'>
            <Link to={'/seller/verification'}>Complete Verification</Link>
          </button>
        )}
      </div>
    </div>
  )
}

export default Pending
