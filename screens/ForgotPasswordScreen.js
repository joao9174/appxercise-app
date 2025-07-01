import { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { EmailInput } from "../components/CustomInputs";
import { PrimaryButton } from "../components/Buttons";
import ErrorModal from "../components/ErrorModal";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const [email, setEmail] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const resetPassword = async () => {
    if (!email) {
      setErrorMessage("Informe o e-mail.");
      return;
    }

    if (!regexEmail.test(email)) {
      setErrorMessage("E-mail inválido");
      return;
    }

    setErrorMessage("");

    await sendPasswordResetEmail(auth, email);

    setErrorMessage("e-mail de redenifição enviado!");
  };

  useEffect(() => {
    setErrorMessage("");
  }, [email]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Redefinir Senha</Text>
        <EmailInput value={email} setValue={setEmail} />

        <ErrorModal
          visible={!!errorMessage}
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />

        <PrimaryButton
          text={"Redefinir"}
          action={() => {
            resetPassword();
          }}
        />

        <TouchableOpacity onPress={() => navigation.push("Login")}>
          <Text style={styles.returnLogin}>Voltar para Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 25,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    marginTop: 80,
  },
  input: {
    width: "100%",
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 15,
    padding: 15,
    fontSize: 20,
    color: "black",
    marginVertical: 15,
  },
  button: {
    backgroundColor: "#27428f",
    padding: 15,
    borderRadius: 15,
    marginVertical: 15,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
  },
  errorMessage: {
    fontSize: 18,
    textAlign: "center",
    color: "red",
  },
  returnLogin: {
    textAlign: "center",
    color: "#1E3A8A",
    marginTop: 40,
    fontSize: 16,
  },
});
