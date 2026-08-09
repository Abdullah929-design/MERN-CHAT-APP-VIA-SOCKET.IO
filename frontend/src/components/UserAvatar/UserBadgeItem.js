import {
  CloseIcon,
} from "@chakra-ui/icons";

import {
  Badge,
} from "@chakra-ui/react";

import React from "react";

const UserBadgeItem = ({
  user,
  handleFunction,
  admin,
}) => {

  return (

    <Badge
      px={2}
      py={1}

      borderRadius="full"

      m={1}

      bg="#d9fdd3"

      color="#111b21"

      cursor="pointer"

      display="inline-flex"

      alignItems="center"

      fontSize="12px"

      onClick={handleFunction}
    >

      {user.name}

      {admin === user._id &&
        " (Admin)"}

      <CloseIcon
        ml={2}
        boxSize="8px"
      />

    </Badge>

  );
};

export default UserBadgeItem;