import { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { PrimaryButton, SecondaryButton } from "../components/Buttons";
import { EmailInput, PasswordInput } from "../components/CustomInputs";
import ErrorModal from "../components/ErrorModal";

export default function LoginScreen() {
  const navigation = useNavigation();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const login = async () => {
    if (!email || !password) {
      setErrorMessage("Informe o e-mail e senha.");
      return;
    }
    if (!regexEmail.test(email)) {
      setErrorMessage("E-mail inválido");
      return;
    }
    if (!regexPassword.test(password)) {
      setErrorMessage(
        "A senha deve conter no mínimo 8 caracteres, letra maiúscula, minúscula, número e símbolo"
      );
      return;
    }
    setErrorMessage("");
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log(user);
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  useEffect(() => {
    setErrorMessage("");
  }, [email, password]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>Entrar</Text>

        <EmailInput value={email} setValue={setEmail} />
        <PasswordInput value={password} setValue={setPassword} />

        <PrimaryButton
          text="Entrar"
          action={() => {
            login();
          }}
        />

        <TouchableOpacity onPress={() => navigation.push("ForgotPassword")}>
          <Text style={styles.linkText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <ErrorModal
          visible={!!errorMessage}
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />

        <TouchableOpacity onPress={() => navigation.push("Register")}>
          <Text style={styles.registerText}>Cadastre-se</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  errorMessage: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  linkText: {
    textAlign: "center",
    color: "#1E3A8A",
    marginTop: 5,
    fontSize: 16,
  },
  registerText: {
    textAlign: "center",
    color: "#1E3A8A",
    marginTop: 40,
    fontSize: 16,
  },
});
