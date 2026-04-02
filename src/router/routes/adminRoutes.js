import { lazy } from 'react'
const ProductApproval = lazy(() => import("../../views/admin/ProductApproval"))
const Banners = lazy(() => import("../../views/admin/Banners"))
const SellerDetails = lazy(() => import("../../views/admin/SellerDetails"))
const DeactiveSellers = lazy(() => import("../../views/admin/DeactiveSellers"))
const SellerRequest = lazy(() => import("../../views/admin/SellerRequest"))
const AdminDashboard = lazy(() => import("../../views/admin/AdminDashboard"))
const Orders = lazy(() => import("../../views/admin/Orders"))
const Category = lazy(() => import("../../views/admin/Category"))
const Sellers = lazy(() => import("../../views/admin/Sellers"))
const PaymentRequest = lazy(() => import("../../views/admin/PaymentRequest"))
const Chat = lazy(() => import("../../views/admin/ChatSeller"))
const OrderDetails = lazy(() => import("../../views/admin/OrderDetails"))
const AdminAccount = lazy(() => import("../../views/admin/AdminAccount"))
const CommissionSettings = lazy(() => import("../../views/admin/CommissionSettings"))
const ShippingSettings = lazy(() => import("../../views/admin/ShippingSettings"))
export const adminRoutes = [
    {
        path: 'admin/dashboard',
        element: <AdminDashboard />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/orders',
        element: <Orders />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/category',
        element: <Category />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/sellers',
        element: <Sellers />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/payment-request',
        element: <PaymentRequest />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/deactive-sellers',
        element: <DeactiveSellers />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/sellers-request',
        element: <SellerRequest />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/seller/details/:sellerId',
        element: <SellerDetails />,
        role: 'admin'
    },
    {
        path: 'admin/dashboard/chat',
        element: <Chat />,
        role: 'admin'
    },
    // {
    //     path: 'admin/dashboard/chat-sellers',
    //     element: <Chat />,
    //     role: 'admin'
    // },
    // {
    //     path: 'admin/dashboard/chat-sellers/:sellerId',
    //     element: <Chat />,
    //     role: 'admin'
    // },


    {
        path: 'admin/dashboard/order/details/:orderId',
        element: <OrderDetails />,
        role: 'admin'
    },
    {
        path: "/admin/products-approval",
        element: <ProductApproval />,
        role: 'admin'
    },
    {
        path: '/admin/dashboard/banners',
        element: <Banners />,
        role: 'admin'
    },
    {
        path: '/admin/dashboard/account',
        element: <AdminAccount />,
        role: 'admin'
    },
    {
        path: '/admin/settings/commission',
        element: <CommissionSettings />,
        role: 'admin'
    },
    {
        path: '/admin/settings/shipping',
        element: <ShippingSettings />,
        role: 'admin'
    }
]
