import {
  Badge,
  Box,
  Button,
  Code,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
//import { ChatState } from "../../Context/ChatProvider";

const qaCredentials = {
  name: "QA Tester",
  email: "qa.tester@chatapp.local",
  password: "Test@1234",
};

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);

  const history = useHistory();
  //const { setUser } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      //setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <Stack spacing={5} align="stretch">
      <Box
        borderRadius="20px"
        p={5}
        bg="linear-gradient(135deg, #008069 0%, #00a884 100%)"
        color="white"
        boxShadow="md"
      >
        <HStack justify="space-between" align="start" spacing={3}>
          <Box>
            <Badge
              colorScheme="green"
              bg="rgba(255,255,255,0.18)"
              color="white"
              borderRadius="full"
              px={2}
              py={1}
              mb={3}
            >
              QA ready
            </Badge>
            <Text fontSize="2xl" fontWeight="700" lineHeight="1.1">
              Sign in to test the chat flow
            </Text>
            <Text mt={2} fontSize="sm" opacity={0.9}>
              Use the seeded accounts to review chats, messages, and online presence.
            </Text>
          </Box>
          <Box fontSize="2xl">💬</Box>
        </HStack>
      </Box>

      <VStack spacing="10px" align="stretch">
        <FormControl id="email" isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input
            value={email}
            type="email"
            placeholder="Enter your email address"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl id="password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup size="md">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              placeholder="Enter password"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={handleClick}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button colorScheme="green" width="100%" onClick={submitHandler} isLoading={loading}>
          Login
        </Button>
        <HStack spacing={3}>
          <Button
            variant="outline"
            colorScheme="green"
            flex={1}
            onClick={() => {
              setEmail("guest@example.com");
              setPassword("123456");
            }}
          >
            Use guest login
          </Button>
          <Button variant="ghost" colorScheme="green" flex={1} onClick={onOpen}>
            QA credentials
          </Button>
        </HStack>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Software QA credentials</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Use this account to review the seeded chats and message history.
            </Text>
            <Stack spacing={3}>
              <Box borderWidth="1px" borderRadius="16px" p={4} bg="gray.50">
                <Text fontWeight="600" mb={2}>
                  {qaCredentials.name}
                </Text>
                <Text fontSize="sm">
                  Email: <Code>{qaCredentials.email}</Code>
                </Text>
                <Text fontSize="sm" mt={1}>
                  Password: <Code>{qaCredentials.password}</Code>
                </Text>
              </Box>
              <Text fontSize="sm" color="gray.600">
                This account is intentionally simple and only meant for local QA.
              </Text>
            </Stack>
          </ModalBody>
          <Divider />
          <ModalFooter gap={3}>
            <Button
              variant="outline"
              onClick={() => {
                setEmail(qaCredentials.email);
                setPassword(qaCredentials.password);
                onClose();
              }}
            >
              Fill form
            </Button>
            <Button colorScheme="green" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default Login;