import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  get_messages,
  send_message,
  updateMessage,
  selectUser,
  messageClear,
  get_admin_conversations
} from "../../store/Reducers/chatReducer";
import { socket } from "../../utils/utils";
import { AiFillCopy } from "react-icons/ai";

const Chat = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef();

  const { userInfo } = useSelector((state) => state.auth);
  const { messages, users, selectedUser, successMessage } = useSelector(
    (state) => state.chat
  );

  const [text, setText] = useState("");
  const adminId = userInfo?._id;

  /* ---------------- SOCKET REGISTER ---------------- */
  useEffect(() => {
    if (!adminId) return;

    socket.emit("register", {
      userId: adminId,
      role: "admin",
    });

  }, [adminId]);

  /* ---------------- LOAD CONVERSATIONS ---------------- */
  useEffect(() => {
    if (!adminId) return;

    dispatch(get_admin_conversations());

  }, [adminId, dispatch]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!adminId) return;

    dispatch(
      get_messages({
        userId: adminId,
        role: "admin",
      })
    );

  }, [adminId, dispatch]);

  /* ---------------- FILTER MESSAGES ---------------- */
  const filteredMessages = selectedUser
    ? messages.filter(
        (m) =>
          m.senderId === selectedUser.id ||
          m.receiverId === selectedUser.id
      )
    : [];

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    dispatch(
      send_message({
        senderId: adminId,
        senderRole: "admin",
        receiverId: selectedUser.id,
        receiverRole: selectedUser.role,
        message: text,
      })
    );

    setText("");
  };

  /* ---------------- EMIT SOCKET ---------------- */
  useEffect(() => {
    if (successMessage) {
      const lastMessage = messages[messages.length - 1];
      socket.emit("send_message", lastMessage);
      dispatch(messageClear());
    }
  }, [successMessage, messages, dispatch]);

  /* ---------------- RECEIVE SOCKET ---------------- */
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      dispatch(updateMessage(msg));
    });

    return () => socket.off("receive_message");
  }, [dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredMessages]);

  return (
    <div className="p-5 flex h-[calc(100vh-100px)]">

      {/* ---------------- SIDEBAR ---------------- */}
      <div className="w-[340px] bg-[#1e293b] text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex flex-col">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
            {users?.length || 0}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">

          {users?.map((u, i) => {

            const isActive = selectedUser?.id === u.id;

            return (
              <div
                key={i}
                onClick={() => dispatch(selectUser(u))}
                className={`cursor-pointer mb-3 p-3 rounded-xl border transition
                  ${
                    isActive
                      ? "bg-slate-700 border-slate-600"
                      : "bg-slate-800 border-slate-800 hover:bg-slate-700"
                  }
                `}
              >
                <div className="flex items-center gap-3">

                  {/* IMAGE */}
                  <div className="relative">
               <div className="relative w-12 h-12 flex-shrink-0">
  {u.image ? (
    <img
      src={u.image}
      alt="profile"
      onError={(e) => {
        e.target.onerror = null
        e.target.src = ""
      }}
      className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
    />
  ) : (
    <div className="w-12 h-12 rounded-full flex items-center justify-center 
                    border-2 border-slate-600 
                    bg-gradient-to-br from-indigo-500 to-purple-600 
                    text-white font-bold text-lg uppercase shadow-md">
      {u?.name ? u.name.charAt(0) : "U"}
    </div>
  )}
</div>
                    
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1e293b]" />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">

                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold truncate">
                        {u.name}
                      </h3>

                      <span className="text-[10px] uppercase bg-blue-600 px-2 py-[2px] rounded-full">
                        {u.role}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-slate-400 truncate max-w-[150px]">
                        {u.id}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(u.id);
                        }}
                        className="text-slate-300 hover:text-white"
                      >
                        <AiFillCopy size={14} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* ---------------- CHAT WINDOW ---------------- */}
      <div className="flex-1 flex flex-col ml-4 bg-slate-900 p-4 rounded-md">

        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((m, i) => (
            <div
              key={i}
              ref={scrollRef}
              className={`flex mb-2 ${
                m.senderRole === "admin"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`p-2 rounded text-white ${
                  m.senderRole === "admin"
                    ? "bg-blue-500"
                    : "bg-orange-500"
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex mt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 p-2 rounded-l outline-none"
            placeholder="Type message..."
          />
          <button className="bg-blue-600 px-4 text-white rounded-r">
            Send
          </button>
        </form>

      </div>
    </div>
  );
};

export default Chat;
