import {
  ViewIcon,
} from "@chakra-ui/icons";

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
  IconButton,
  Text,
  Image,
  Box,
} from "@chakra-ui/react";

const ProfileModal = ({
  user,
  children,
}) => {

  const {
    isOpen,
    onOpen,
    onClose,
  } = useDisclosure();

  return (

    <>

      {children ? (

        <span onClick={onOpen}>
          {children}
        </span>

      ) : (

        <IconButton
          variant="ghost"
          icon={<ViewIcon />}
          onClick={onOpen}
          aria-label="Profile"
          color="#54656f"
        />

      )}

      <Modal
        size="sm"
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >

        <ModalOverlay />

        <ModalContent>

          <ModalHeader
            bg="#008069"
            color="white"
            textAlign="center"
          >
            Contact info
          </ModalHeader>

          <ModalCloseButton
            color="white"
          />

          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            py={8}
          >

            <Image
              borderRadius="full"
              boxSize="130px"
              src={user.pic}
              alt={user.name}
              mb={5}
            />

            <Text
              fontSize="24px"
              fontWeight="500"
            >
              {user.name}
            </Text>

            <Text
              mt={2}
              color="#667781"
            >
              {user.email}
            </Text>

            <Box
              width="100%"
              mt={7}
              borderTop="1px solid #e9edef"
              pt={5}
            >

              <Text
                fontSize="13px"
                color="#667781"
              >
                About
              </Text>

              <Text mt={2}>
                Available
              </Text>

            </Box>

          </ModalBody>

          <ModalFooter>

            <Button
              onClick={onClose}
              bg="#00a884"
              color="white"
              _hover={{
                bg: "#008f72",
              }}
            >
              Close
            </Button>

          </ModalFooter>

        </ModalContent>

      </Modal>

    </>

  );
};

export default ProfileModal;