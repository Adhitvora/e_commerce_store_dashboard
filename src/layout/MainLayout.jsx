import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { socket } from '../utils/utils'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import SellerRestrictionNotice from '../views/components/SellerRestrictionNotice'

const MainLayout = () => {

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { userInfo, role, accountStatus, adminRemark, restricted } = useSelector(state => state.auth)
  const [showSidebar, setShowSidebar] = useState(false)
  const previousInactiveRef = useRef(null)

  const sellerInactive =
    role === 'seller' && (
      accountStatus === 'inactive' ||
      restricted ||
      userInfo?.status === 'deactive' ||
      userInfo?.verificationStatus === 'rejected'
    )

  const allowVerificationEdit = pathname === '/seller/verification'

  // Register user (admin or seller)
  useEffect(() => {
    if (!userInfo) return

    socket.emit('register', {
      userId: userInfo._id,
      role: userInfo.role   // "admin" or "seller"
    })

  }, [userInfo])

  useEffect(() => {
    if (!sellerInactive || allowVerificationEdit) {
      return
    }

    navigate('/seller/verification', { replace: true })
  }, [sellerInactive, allowVerificationEdit, navigate])

  useEffect(() => {
    if (!userInfo) {
      return
    }

    if (previousInactiveRef.current === null) {
      previousInactiveRef.current = sellerInactive
      return
    }

    if (previousInactiveRef.current === false && sellerInactive === true) {
      toast.error(
        adminRemark
          ? `Your account has been deactivated by admin: ${adminRemark}`
          : 'Your account has been deactivated by admin'
      )
    }

    previousInactiveRef.current = sellerInactive
  }, [sellerInactive, adminRemark, userInfo])

  return (
    <div className='bg-[#161d31] w-full min-h-screen'>
      <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      <div className='ml-0 lg:ml-[260px] pt-[95px] transition-all'>
        {sellerInactive && <SellerRestrictionNotice remark={adminRemark} />}
        <div className='relative'>
          {!allowVerificationEdit && sellerInactive && (
            <div className='absolute inset-0 z-20 flex items-center justify-center rounded-md bg-[#161d31]/70 px-4'>
              <div className='rounded-md border border-red-500/30 bg-[#283046] px-6 py-5 text-center text-[#d0d2d6] shadow-lg'>
                <h2 className='text-xl font-semibold'>Account Restricted</h2>
                <p className='mt-2 text-sm text-slate-300'>Your account is deactivated</p>
                {adminRemark && <p className='mt-2 text-sm text-red-300'>Remark: {adminRemark}</p>}
              </div>
            </div>
          )}
          <div className={!allowVerificationEdit && sellerInactive ? 'pointer-events-none select-none blur-[2px]' : ''}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
