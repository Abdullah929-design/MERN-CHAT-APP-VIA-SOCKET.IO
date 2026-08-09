import { Box } from "@chakra-ui/react";

import "./styles.css";

import SingleChat from "./SingleChat";

import { ChatState } from "../context/ChatProvider";

const Chatbox = ({
  fetchAgain,
  setFetchAgain,
}) => {

  const {
    selectedChat,
  } = ChatState();

  return (

    <Box
      className="wa-chatbox"
      display={{
        base: selectedChat
          ? "flex"
          : "none",

        md: "flex",
      }}
      flexDirection="column"
    >

      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={
          setFetchAgain
        }
      />

    </Box>

  );

};

export default Chatbox;