import {
  AddIcon,
  SearchIcon,
} from "@chakra-ui/icons";

import {
  Box,
  Stack,
  Text,
  useToast,
  Button,
  Avatar,
} from "@chakra-ui/react";

import axios from "axios";

import { useEffect, useState } from "react";

import { getSender } from "../config/ChatLogics";

import ChatLoading from "./ChatLoading";

import GroupChatModal from "./miscellaneous/GroupChatModal";

import { ChatState } from "../context/ChatProvider";

const MyChats = ({ fetchAgain }) => {

  const [loggedUser, setLoggedUser] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    onlineUsers,
  } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {

    try {

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        "/api/chat",
        config
      );

      setChats(data);

    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to load chats",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

    }

  };

  useEffect(() => {

    setLoggedUser(
      JSON.parse(
        localStorage.getItem("userInfo")
      )
    );

    fetchChats();

    // eslint-disable-next-line
  }, [fetchAgain]);

  return (

    <Box
      className="wa-sidebar"
      display={{
        base: selectedChat ? "none" : "flex",
        md: "flex",
      }}
      flexDirection="column"
    >

      {/* SIDEBAR HEADER */}

      <Box className="wa-side-header">

        <Text
          fontSize="20px"
          fontWeight="600"
        >
          Chats
        </Text>

        <GroupChatModal>

          <Button
            aria-label="New group"
            title="New group"
            size="sm"
            variant="ghost"
            minW="40px"
          >
            <AddIcon />
          </Button>

        </GroupChatModal>

      </Box>

      {/* SEARCH */}

      <Box className="wa-search-container">

        <Box className="wa-search-box">

          <SearchIcon />

          <Text
            fontSize="13px"
            ml={2}
            color="#667781"
          >
            Search or start new chat
          </Text>

        </Box>

      </Box>

      {/* CHAT LIST */}

      <Box className="wa-chat-list">

        {chats ? (

          <Stack spacing={0}>

            {chats.map((chat) => {

              const otherUser =
                !chat.isGroupChat &&
                loggedUser
                  ? chat.users.find(
                      (u) =>
                        u._id !==
                        loggedUser._id
                    )
                  : null;

              const isOnline =
                otherUser &&
                onlineUsers?.includes(
                  otherUser._id
                );

              const name =
                !chat.isGroupChat
                  ? getSender(
                      loggedUser,
                      chat.users
                    )
                  : chat.chatName;

              const preview =
                chat.latestMessage
                  ? `${chat.latestMessage.sender.name}: ${chat.latestMessage.content}`
                  : "No messages yet";

              return (

                <Box
                  key={chat._id}
                  className={`wa-chat-item ${
                    selectedChat?._id === chat._id
                      ? "wa-chat-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedChat(chat)
                  }
                >

                  <Box className="wa-chat-row">

                    <Avatar
                      size="md"
                      name={name}
                      src={
                        !chat.isGroupChat
                          ? otherUser?.pic
                          : undefined
                      }
                    />

                    <Box className="wa-chat-main">

                      <Box className="wa-chat-name-row">

                        <Text className="wa-chat-name">

                          {name}

                          {!chat.isGroupChat &&
                            isOnline && (
                              <span className="wa-online-dot" />
                            )}

                        </Text>

                        <Text className="wa-chat-time">
                          {chat.latestMessage
                            ? "now"
                            : ""}
                        </Text>

                      </Box>

                      <Text className="wa-chat-preview">

                        {preview}

                      </Text>

                    </Box>

                  </Box>

                </Box>

              );

            })}

          </Stack>

        ) : (

          <ChatLoading />

        )}

      </Box>

    </Box>

  );
};

export default MyChats;