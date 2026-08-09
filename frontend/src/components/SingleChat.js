import {
  FormControl,
  Input,
  Box,
  Text,
  IconButton,
  Spinner,
  useToast,
  Avatar,
} from "@chakra-ui/react";

import {
  ArrowBackIcon,
  AttachmentIcon,
  SmallAddIcon,
} from "@chakra-ui/icons";

import { useEffect, useState } from "react";

import axios from "axios";

import { getSender, getSenderFull } from "../config/ChatLogics";

import ProfileModal from "./miscellaneous/ProfileModal";

import ScrollableChat from "./ScrollableChat";

import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";

import { ChatState } from "../context/ChatProvider";

import "./styles.css";

let selectedChatCompare;

const SingleChat = ({
  fetchAgain,
  setFetchAgain,
}) => {

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [newMessage, setNewMessage] =
    useState("");

  const [socketConnected, setSocketConnected] =
    useState(false);

  const [typing, setTyping] =
    useState(false);

  const [isTyping, setIsTyping] =
    useState(false);

  const toast = useToast();

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    socket,
    onlineUsers,
  } = ChatState();

  /* =====================
     FETCH MESSAGES
  ===================== */

  const fetchMessages = async () => {

    if (!selectedChat) return;

    try {

      const config = {
        headers: {
          Authorization:
            `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      socket.emit(
        "join chat",
        selectedChat._id
      );

      const { data } =
        await axios.get(
          `/api/message/${selectedChat._id}`,
          config
        );

      setMessages(data);

      setLoading(false);

    } catch (error) {

      setLoading(false);

      toast({
        title: "Error",
        description:
          "Failed to load messages",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

    }

  };

  /* =====================
     SEND MESSAGE
  ===================== */

  const sendMessage = async (event) => {

    if (
      event.key === "Enter" &&
      newMessage.trim()
    ) {

      socket.emit(
        "stop typing",
        selectedChat._id
      );

      try {

        const config = {
          headers: {
            "Content-type":
              "application/json",

            Authorization:
              `Bearer ${user.token}`,
          },
        };

        const content =
          newMessage.trim();

        setNewMessage("");

        const { data } =
          await axios.post(
            "/api/message",
            {
              content,
              chatId: selectedChat,
            },
            config
          );

        socket.emit(
          "new message",
          data
        );

        setMessages([
          ...messages,
          data,
        ]);

      } catch (error) {

        toast({
          title: "Error",
          description:
            "Failed to send message",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

      }

    }

  };

  /* =====================
     SOCKET TYPING
  ===================== */

  useEffect(() => {

    if (!socket) return;

    setSocketConnected(true);

    socket.on(
      "typing",
      () => setIsTyping(true)
    );

    socket.on(
      "stop typing",
      () => setIsTyping(false)
    );

    return () => {

      socket.off("typing");

      socket.off(
        "stop typing"
      );

    };

  }, [socket]);

  /* =====================
     CHAT CHANGE
  ===================== */

  useEffect(() => {

    fetchMessages();

    selectedChatCompare =
      selectedChat;

    // eslint-disable-next-line
  }, [selectedChat]);

  /* =====================
     TYPING HANDLER
  ===================== */

  const typingHandler = (e) => {

    setNewMessage(
      e.target.value
    );

    if (
      !socketConnected ||
      !selectedChat
    ) {
      return;
    }

    if (!typing) {

      setTyping(true);

      socket.emit(
        "typing",
        selectedChat._id
      );

    }

    const lastTypingTime =
      new Date().getTime();

    setTimeout(() => {

      const timeDiff =
        new Date().getTime() -
        lastTypingTime;

      if (
        timeDiff >= 3000 &&
        typing
      ) {

        socket.emit(
          "stop typing",
          selectedChat._id
        );

        setTyping(false);

      }

    }, 3000);

  };

  /* =====================
     RECEIVE MESSAGE
  ===================== */

  useEffect(() => {

    if (!socket) return;

    const handleMessageReceived =
      (newMessageReceived) => {

        if (
          !selectedChatCompare ||
          selectedChatCompare._id !==
            newMessageReceived.chat._id
        ) {

          if (
            !notification.find(
              (n) =>
                n._id ===
                newMessageReceived._id
            )
          ) {

            setNotification([
              newMessageReceived,
              ...notification,
            ]);

            setFetchAgain(
              !fetchAgain
            );

          }

        } else {

          setMessages([
            ...messages,
            newMessageReceived,
          ]);

        }

      };

    socket.on(
      "message recieved",
      handleMessageReceived
    );

    return () => {

      socket.off(
        "message recieved",
        handleMessageReceived
      );

    };

  }, [
    messages,
    notification,
    fetchAgain,
    socket,
    setFetchAgain,
    setNotification,
  ]);

  /* =====================
     EMPTY CHAT
  ===================== */

  if (!selectedChat) {

    return (

      <Box className="wa-empty-chat">

        <Box>

          <Text className="wa-empty-chat-title">
            WhatsApp Web
          </Text>

          <Text className="wa-empty-chat-text">
            Send and receive messages
            without keeping your phone online.
          </Text>

        </Box>

      </Box>

    );

  }

  /* =====================
     CHAT INFO
  ===================== */

  const isGroup =
    selectedChat.isGroupChat;

  const chatName =
    isGroup
      ? selectedChat.chatName
      : getSender(
          user,
          selectedChat.users
        );

  const chatUser =
    !isGroup
      ? getSenderFull(
          user,
          selectedChat.users
        )
      : null;

  const isOtherOnline =
    chatUser &&
    onlineUsers?.includes(
      chatUser._id
    );

  /* =====================
     UI
  ===================== */

  return (

    <Box className="wa-chat-shell">

      {/* HEADER */}

      <Box className="wa-chat-header">

        <IconButton
          display={{
            base: "flex",
            md: "none",
          }}
          variant="ghost"
          icon={<ArrowBackIcon />}
          onClick={() =>
            setSelectedChat("")
          }
          mr={2}
          aria-label="Back"
        />

        <Avatar
          size="sm"
          name={chatName}
          src={
            !isGroup
              ? chatUser?.pic
              : undefined
          }
          mr={3}
        />

        <Box
          flex="1"
          minW="0"
        >

          <Text
            className="wa-chat-header-name"
            noOfLines={1}
          >
            {chatName}
          </Text>

          <Text className="wa-chat-header-status">

            {isGroup
              ? `${selectedChat.users?.length || 0} participants`
              : isOtherOnline
              ? "online"
              : "offline"}

          </Text>

        </Box>

        {isGroup ? (

          <UpdateGroupChatModal
            fetchMessages={fetchMessages}
            fetchAgain={fetchAgain}
            setFetchAgain={
              setFetchAgain
            }
          />

        ) : (

          <ProfileModal user={chatUser} />

        )}

      </Box>

      {/* MESSAGES */}

      <Box className="wa-chat-messages">

        {loading ? (

          <Spinner
            size="xl"
            position="absolute"
            left="50%"
            top="50%"
            transform="translate(-50%, -50%)"
            color="#00a884"
          />

        ) : (

          <div className="messages">

            <ScrollableChat
              messages={messages}
            />

          </div>

        )}

      </Box>

      {/* COMPOSER */}

      <Box className="wa-composer">

        <IconButton
          aria-label="Emoji"
          icon={<SmallAddIcon />}
          variant="ghost"
          color="#54656f"
        />

        <IconButton
          aria-label="Attachment"
          icon={<AttachmentIcon />}
          variant="ghost"
          color="#54656f"
          mr={2}
        />

        <FormControl
          onKeyDown={sendMessage}
          isRequired
        >

          {isTyping && (

            <div className="wa-typing">
              typing...
            </div>

          )}

          <Input
            placeholder="Type a message"
            value={newMessage}
            onChange={typingHandler}
            autoComplete="off"
          />

        </FormControl>

        <button
          className="wa-send-button"
          type="button"
          onClick={() => {

            if (
              newMessage.trim()
            ) {

              sendMessage({
                key: "Enter",
              });

            }

          }}
        >
          ➤
        </button>

      </Box>

    </Box>

  );

};

export default SingleChat;