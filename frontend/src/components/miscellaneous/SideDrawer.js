import {
  Button,
  useDisclosure,
  Input,
  Box,
  Text,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Tooltip,
  Avatar,
  useToast,
  Spinner,
  Badge,
} from "@chakra-ui/react";

import {
  BellIcon,
  ChevronDownIcon,
  SearchIcon,
} from "@chakra-ui/icons";

import {
  useHistory,
} from "react-router-dom";

import {
  useState,
} from "react";

import axios from "axios";

import ChatLoading from "../ChatLoading";

import ProfileModal from "./ProfileModal";

import {
  getSender,
} from "../../config/ChatLogics";

import UserListItem from "../UserAvatar/UserListItem";

import {
  ChatState,
} from "../../context/ChatProvider";

function SideDrawer() {

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

  const [
    loadingChat,
    setLoadingChat,
  ] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
    onlineUsers,
  } = ChatState();

  const toast = useToast();

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  const history =
    useHistory();

  const logoutHandler =
    () => {

      localStorage.removeItem(
        "userInfo"
      );

      history.push("/");

    };

  const handleSearch =
    async () => {

      if (!search) {

        toast({
          title:
            "Enter a name or email",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });

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
            `/api/user?search=${search}`,
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

  const accessChat =
    async (userId) => {

      try {

        setLoadingChat(true);

        const config = {
          headers: {
            "Content-type":
              "application/json",

            Authorization:
              `Bearer ${user.token}`,
          },
        };

        const { data } =
          await axios.post(
            `/api/chat`,
            {
              userId,
            },
            config
          );

        if (
          !chats.find(
            (c) =>
              c._id === data._id
          )
        ) {

          setChats([
            data,
            ...chats,
          ]);

        }

        setSelectedChat(data);

        setLoadingChat(false);

        onClose();

      } catch (error) {

        setLoadingChat(false);

        toast({
          title:
            "Error fetching chat",
          status: "error",
          duration: 3000,
          isClosable: true,
        });

      }

    };

  return (

    <>

      <Box className="wa-topbar">

        <Box
          height="100%"
          px={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >

          <Avatar
            size="sm"
            name={user.name}
            src={user.pic}
          />

          <Box
            display="flex"
            alignItems="center"
            gap={1}
          >

            <Tooltip
              label="Search users"
            >

              <Button
                variant="ghost"
                minW="40px"
                onClick={onOpen}
              >
                <SearchIcon />
              </Button>

            </Tooltip>

            <Menu>

              <MenuButton
                as={Button}
                variant="ghost"
                minW="40px"
                position="relative"
              >

                {notification.length >
                  0 && (

                  <Badge
                    position="absolute"
                    top="3px"
                    right="3px"
                    colorScheme="green"
                    borderRadius="full"
                    fontSize="9px"
                  >
                    {notification.length}
                  </Badge>

                )}

                <BellIcon
                  fontSize="20px"
                />

              </MenuButton>

              <MenuList>

                {notification.length ===
                  0 && (

                  <MenuItem isDisabled>
                    No new messages
                  </MenuItem>

                )}

                {notification.map(
                  (notif) => (

                    <MenuItem
                      key={notif._id}
                      onClick={() => {

                        setSelectedChat(
                          notif.chat
                        );

                        setNotification(
                          notification.filter(
                            (n) =>
                              n !== notif
                          )
                        );

                      }}
                    >

                      {notif.chat
                        .isGroupChat
                        ? `New message in ${notif.chat.chatName}`
                        : `New message from ${getSender(
                            user,
                            notif.chat.users
                          )}`}

                    </MenuItem>

                  )
                )}

              </MenuList>

            </Menu>

            <Menu>

              <MenuButton
                as={Button}
                variant="ghost"
                minW="40px"
              >
                <ChevronDownIcon />
              </MenuButton>

              <MenuList>

                <ProfileModal user={user}>
                  <MenuItem>
                    My Profile
                  </MenuItem>
                </ProfileModal>

                <MenuDivider />

                <MenuItem
                  onClick={
                    logoutHandler
                  }
                >
                  Log out
                </MenuItem>

              </MenuList>

            </Menu>

          </Box>

        </Box>

      </Box>

      <Drawer
        placement="left"
        onClose={onClose}
        isOpen={isOpen}
        size="sm"
      >

        <DrawerOverlay />

        <DrawerContent>

          <DrawerHeader className="wa-drawer-header">
            Search users
          </DrawerHeader>

          <DrawerBody p={3}>

            <Box
              display="flex"
              gap={2}
              mb={4}
            >

              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

              <Button
                bg="#00a884"
                color="white"
                onClick={
                  handleSearch
                }
              >
                Search
              </Button>

            </Box>

            {loading ? (

              <ChatLoading />

            ) : (

              searchResult?.map(
                (u) => (

                  <UserListItem
                    key={u._id}
                    user={u}
                    isOnline={onlineUsers?.includes(
                      u._id
                    )}
                    handleFunction={() =>
                      accessChat(
                        u._id
                      )
                    }
                  />

                )
              )

            )}

            {loadingChat && (

              <Spinner
                display="block"
                mx="auto"
                mt={5}
                color="#00a884"
              />

            )}

          </DrawerBody>

        </DrawerContent>

      </Drawer>

    </>

  );
}

export default SideDrawer;