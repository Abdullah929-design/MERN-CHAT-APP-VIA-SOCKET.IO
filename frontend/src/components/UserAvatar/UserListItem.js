import {
  Avatar,
  AvatarBadge,
  Box,
  Text,
} from "@chakra-ui/react";

import React from "react";

const UserListItem = ({
  user,
  handleFunction,
  isOnline,
}) => {

  return (

    <Box
      className="wa-user-item"
      onClick={handleFunction}
    >

      <Avatar
        size="md"
        name={user.name}
        src={user.pic}
      >

        {isOnline && (

          <AvatarBadge
            boxSize="1em"
            bg="#25d366"
          />

        )}

      </Avatar>

      <Box className="wa-user-info">

        <Text className="wa-user-name">
          {user.name}
        </Text>

        <Text className="wa-user-email">
          {user.email}
        </Text>

      </Box>

    </Box>

  );
};

export default UserListItem;