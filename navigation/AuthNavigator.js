import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/Login";
import RegisterScreen from "../screens/auth/Register";
import ForgotPasswordScreen from "../screens/auth/ForgotPassword";

export default function AuthNavigator() {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
