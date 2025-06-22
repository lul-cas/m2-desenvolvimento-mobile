import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/Home";
import NewUserInfoScreen from "../screens/user/New";
import ProfileScreen from "../screens/user/Profile";
import EditUserInfoScreen from "../screens/user/EditProfile";

export default function AppNavigator() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="NewUserInfo"
        component={NewUserInfoScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EditUserInfo"
        component={EditUserInfoScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
