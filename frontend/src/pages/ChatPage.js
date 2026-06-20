import { Box } from "@chakra-ui/react";
import { useState } from "react";
import Chatbox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../context/ChatProvider";
import { useEffect } from "react";
import axios from "axios";


const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, onlineUsers, setOnlineUsers,socket } = ChatState();

// New state to track online users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      if (!user) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get("/api/user/online", config);
        setOnlineUsers(data);
      } catch (error) {
        console.error("Failed to fetch online users:", error);
      }
    };
    
    fetchOnlineUsers();
  }, [user, setOnlineUsers]);



 // Listen to WebSocket events to update the state realtime
  useEffect(() => {
    if (!socket) return;
    socket.on("user_online", (userId) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });
    socket.on("user_offline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });
    return () => {
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [socket, setOnlineUsers]);

  return (
    <Box display="flex" flexDirection="column" w="100%" h="100vh" bg="gray.50">
      {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" flex="1" p={{ base: "5px", md: "15px" }} h="calc(100vh - 70px)" overflow="hidden">
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </Box>
  );
};

export default Chatpage;