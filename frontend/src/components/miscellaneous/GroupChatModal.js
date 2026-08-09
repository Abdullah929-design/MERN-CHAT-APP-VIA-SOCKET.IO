import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  Text,
} from "@chakra-ui/react";

import axios from "axios";

import { useState } from "react";

import {
  ChatState,
} from "../../context/ChatProvider";

import UserBadgeItem from "../UserAvatar/UserBadgeItem";

import UserListItem from "../UserAvatar/UserListItem";

const GroupChatModal = ({
  children,
}) => {

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const [
    groupChatName,
    setGroupChatName,
  ] = useState("");

  const [
    selectedUsers,
    setSelectedUsers,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    searchResult,
    setSearchResult,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const toast = useToast();

  const {
    user,
    chats,
    setChats,
  } = ChatState();

  const handleGroup = (
    userToAdd
  ) => {

    if (
      selectedUsers.includes(
        userToAdd
      )
    ) {

      toast({
        title:
          "User already added",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }

    setSelectedUsers([
      ...selectedUsers,
      userToAdd,
    ]);

  };

  const handleSearch =
    async (query) => {

      setSearch(query);

      if (!query) {
        setSearchResult([]);
        return;
      }

      try {

        setLoading(true);

        const config = {
          headers: {
            Authorization:
              `Bearer ${user.token}`,
          },
        };

        const { data } =
          await axios.get(
            `/api/user?search=${query}`,
            config
          );

        setSearchResult(data);

        setLoading(false);

      } catch (error) {

        setLoading(false);

        toast({
          title: "Error",
          description:
            "Failed to search users",
          status: "error",
          duration: 3000,
          isClosable: true,
        });

      }

    };

  const handleDelete =
    (delUser) => {

      setSelectedUsers(
        selectedUsers.filter(
          (sel) =>
            sel._id !==
            delUser._id
        )
      );

    };

  const handleSubmit =
    async () => {

      if (
        !groupChatName ||
        selectedUsers.length === 0
      ) {

        toast({
          title:
            "Enter group name and add users",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

        return;
      }

      try {

        const config = {
          headers: {
            Authorization:
              `Bearer ${user.token}`,
          },
        };

        const { data } =
          await axios.post(
            `/api/chat/group`,
            {
              name: groupChatName,
              users: JSON.stringify(
                selectedUsers.map(
                  (u) => u._id
                )
              ),
            },
            config
          );

        setChats([
          data,
          ...chats,
        ]);

        setSelectedUsers([]);

        setGroupChatName("");

        setSearch("");

        onClose();

        toast({
          title:
            "Group created",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

      } catch (error) {

        toast({
          title:
            "Failed to create group",
          status: "error",
          duration: 3000,
          isClosable: true,
        });

      }

    };

  return (

    <>

      <span onClick={onOpen}>
        {children}
      </span>

      <Modal
        onClose={onClose}
        isOpen={isOpen}
        isCentered
        size="md"
      >

        <ModalOverlay />

        <ModalContent>

          <ModalHeader
            bg="#008069"
            color="white"
          >
            Create New Group
          </ModalHeader>

          <ModalCloseButton
            color="white"
          />

          <ModalBody>

            <Text
              fontSize="13px"
              color="#667781"
              mb={2}
            >
              Group name
            </Text>

            <FormControl>

              <Input
                placeholder="Enter group name"
                value={groupChatName}
                onChange={(e) =>
                  setGroupChatName(
                    e.target.value
                  )
                }
              />

            </FormControl>

            <Text
              fontSize="13px"
              color="#667781"
              mt={5}
              mb={2}
            >
              Add members
            </Text>

            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) =>
                handleSearch(
                  e.target.value
                )
              }
            />

            <Box
              display="flex"
              flexWrap="wrap"
              mt={3}
            >

              {selectedUsers.map(
                (u) => (

                  <UserBadgeItem
                    key={u._id}
                    user={u}
                    handleFunction={() =>
                      handleDelete(u)
                    }
                  />

                )
              )}

            </Box>

            <Box mt={3}>

              {!loading &&
                searchResult
                  ?.slice(0, 5)
                  .map((u) => (

                    <UserListItem
                      key={u._id}
                      user={u}
                      handleFunction={() =>
                        handleGroup(u)
                      }
                    />

                  ))}

            </Box>

          </ModalBody>

          <ModalFooter>

            <Button
              variant="ghost"
              mr={2}
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              bg="#00a884"
              color="white"
              _hover={{
                bg: "#008f72",
              }}
              onClick={
                handleSubmit
              }
            >
              Create Group
            </Button>

          </ModalFooter>

        </ModalContent>

      </Modal>

    </>

  );
};

export default GroupChatModal;