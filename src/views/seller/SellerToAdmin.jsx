import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { get_messages, send_message, updateMessage, messageClear } from '../../store/Reducers/chatReducer'
import { socket } from '../../utils/utils'
import adminImage from '../../assets/admin.jpg'
import sellerImage from '../../assets/seller.png'

const SellerToAdmin = () => {

    const dispatch = useDispatch()
    const scrollRef = useRef()

    const { userInfo } = useSelector(state => state.auth)
    const { messages, successMessage } = useSelector(state => state.chat)

    const [text, setText] = useState('')
    const sellerId = userInfo?._id
    const ADMIN_ID = "6980480486aa781558164fb0" 

    // Register seller
    useEffect(() => {
        if (!sellerId) return

        socket.emit('register', {
            userId: sellerId,
            role: 'seller'
        })

    }, [sellerId])

    // Load messages
    useEffect(() => {
        if (!sellerId) return

        dispatch(get_messages({
            userId: sellerId,
            role: 'seller'
        }))
    }, [sellerId, dispatch])

    const send = (e) => {
        e.preventDefault()
        if (!text.trim()) return

        dispatch(send_message({
            senderId: sellerId,
            senderRole: 'seller',
            receiverId: ADMIN_ID,
            receiverRole: 'admin',
            message: text
        }))

        setText('')
    }

    // Emit socket after DB save
    useEffect(() => {
        if (successMessage) {
            const lastMessage = messages[messages.length - 1]
            socket.emit('send_message', lastMessage)
            dispatch(messageClear())
        }
    }, [successMessage, messages, dispatch])

    // Receive message
    useEffect(() => {
        socket.on('receive_message', (msg) => {
            dispatch(updateMessage(msg))
        })

        return () => socket.off('receive_message')
    }, [dispatch])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className='px-2 lg:px-7 py-5'>
            <div className='w-full bg-[#283046] px-4 py-4 rounded-md h-[calc(100vh-140px)] flex flex-col'>

                <div className='flex items-center gap-3 mb-4'>
                    <img
                        className='w-[42px] h-[42px] border-2 border-green-500 rounded-full'
                        src={adminImage}
                        alt=""
                    />
                    <h2 className='text-white font-semibold'>Support (Admin)</h2>
                </div>

                <div className='flex-1 bg-slate-800 rounded-md p-3 overflow-y-auto'>
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            ref={scrollRef}
                            className={`flex mb-2 ${m.senderRole === 'seller' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className='flex gap-2 items-end max-w-[80%]'>

                                {m.senderRole !== 'seller' && (
                                    <img
                                        className='w-[35px] h-[35px] rounded-full'
                                        src={adminImage}
                                        alt=""
                                    />
                                )}

                                <div className={`p-2 rounded text-white ${m.senderRole === 'seller' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                    {m.message}
                                </div>

                                {m.senderRole === 'seller' && (
                                    <img
                                        className='w-[35px] h-[35px] rounded-full'
                                        src={userInfo.image || sellerImage}
                                        alt=""
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={send} className='flex gap-3 mt-4'>
                    <input
                        required
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className='w-full px-3 py-2 rounded-md outline-none'
                        type='text'
                        placeholder='Type your message...'
                    />
                    <button className='bg-cyan-500 px-4 rounded-md text-white'>
                        Send
                    </button>
                </form>

            </div>
        </div>
    )
}

export default SellerToAdmin
