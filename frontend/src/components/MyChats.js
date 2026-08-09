import {
  AddIcon,
  SearchIcon,
} from "@chakra-ui/icons";

import {
  Box,
  Divider,
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
  const [contacts, setContacts] = useState();

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    onlineUsers,
  } = ChatState();

  const toast = useToast();

  const fetchOverview = async () => {

    try {

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        "/api/user/overview",
        config
      );

      setChats(data.chats);
      setContacts(data.contacts);

    } catch (error) {

      toast({
        title: "Error",
        description: "Failed to load contacts and chats",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

    }

  };

  const accessChat = async (userId) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/chat",
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open chat",
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

    if (user) {
      fetchOverview();
    }

    // eslint-disable-next-line
  }, [fetchAgain, user]);

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

        <Divider my={3} />

        <Box px={4} pb={2}>
          <Text
            fontSize="12px"
            fontWeight="600"
            color="#667781"
            letterSpacing="0.04em"
            textTransform="uppercase"
          >
            Contacts
          </Text>
        </Box>

        {contacts ? (
          <Stack spacing={0}>
            {contacts.map((contact) => {
              const isOnline = onlineUsers?.includes(contact._id);

              return (
                <Box
                  key={contact._id}
                  className="wa-chat-item"
                  onClick={() => accessChat(contact._id)}
                >
                  <Box className="wa-chat-row">
                    <Avatar size="md" name={contact.name} src={contact.pic} />

                    <Box className="wa-chat-main">
                      <Box className="wa-chat-name-row">
                        <Text className="wa-chat-name">
                          {contact.name}
                          {isOnline && <span className="wa-online-dot" />}
                        </Text>
                      </Box>

                      <Text className="wa-chat-preview">
                        {contact.email}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        ) : null}

      </Box>

    </Box>

  );
};

export default MyChats;