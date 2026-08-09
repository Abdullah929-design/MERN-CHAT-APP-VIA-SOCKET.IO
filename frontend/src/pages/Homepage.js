import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";

import { useEffect } from "react";
import { useHistory } from "react-router";

import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useHistory();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      history.push("/chats");
    }
  }, [history]);

  return (
    <Box className="wa-auth-page">
      <Container className="wa-auth-card" maxW="460px">

        <Box className="wa-auth-logo">
          ☎
        </Box>

        <Text className="wa-auth-title">
          WhatsApp Chat
        </Text>

        <Text className="wa-auth-subtitle">
          Simple. Private. Real-time messaging.
        </Text>

        <Tabs
          isFitted
          variant="soft-rounded"
          colorScheme="green"
        >

          <TabList mb="1em">
            <Tab>
              Log in
            </Tab>

            <Tab>
              Sign up
            </Tab>
          </TabList>

          <TabPanels>

            <TabPanel px={0}>
              <Login />
            </TabPanel>

            <TabPanel px={0}>
              <Signup />
            </TabPanel>

          </TabPanels>

        </Tabs>

      </Container>
    </Box>
  );
}

export default Homepage;