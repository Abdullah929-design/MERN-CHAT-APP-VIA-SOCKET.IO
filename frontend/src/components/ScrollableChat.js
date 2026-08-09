import {
  Avatar,
  Tooltip,
} from "@chakra-ui/react";

import {
  useEffect,
  useRef,
} from "react";

import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";

import { ChatState } from "../context/ChatProvider";

const ScrollableChat = ({
  messages,
}) => {

  const { user } =
    ChatState();

  const messagesEndRef =
    useRef(null);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  return (

    <div className="wa-chat-messages-inner">

      {messages?.map(
        (m, i) => {

          const sent =
            m.sender._id ===
            user._id;

          const showAvatar =
            isSameSender(
              messages,
              m,
              i,
              user._id
            ) ||
            isLastMessage(
              messages,
              i,
              user._id
            );

          return (

            <div
              className={`wa-message-line ${
                sent
                  ? "sent"
                  : "received"
              }`}
              key={m._id}
            >

              {!sent &&
                showAvatar && (

                  <Tooltip
                    label={
                      m.sender.name
                    }
                    placement="bottom-start"
                  >

                    <Avatar
                      className="wa-message-avatar"
                      size="xs"
                      name={
                        m.sender.name
                      }
                      src={
                        m.sender.pic
                      }
                    />

                  </Tooltip>

                )}

              <span
                className={`wa-message-bubble ${
                  sent
                    ? "sent"
                    : ""
                }`}
                style={{
                  marginLeft:
                    isSameSenderMargin(
                      messages,
                      m,
                      i,
                      user._id
                    ),

                  marginTop:
                    isSameUser(
                      messages,
                      m,
                      i,
                      user._id
                    )
                      ? 3
                      : 10,
                }}
              >

                {m.content}

                <span className="wa-message-meta">

                  {sent
                    ? "✓✓"
                    : ""}

                </span>

              </span>

            </div>

          );

        }
      )}

      <div
        ref={messagesEndRef}
      />

    </div>

  );
};

export default ScrollableChat;