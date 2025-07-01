import { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { PrimaryButton } from "../components/Buttons";
import {
  CustomTextInput,
  EmailInput,
  PasswordInput,
} from "../components/CustomInputs";
import { setDoc, doc } from "firebase/firestore";
import ErrorModal from "../components/ErrorModal";

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const register = async () => {
    if (!name || !phone || !email || !password) {
      setErrorMessage("Preencha todos os campos.");
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

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Cria documento na coleção 'users'
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        nickname: name,
        phone: phone,
        photo: null,
      });

      console.log("Usuário criado com sucesso:", user.uid);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  useEffect(() => {
    setErrorMessage("");
  }, [email, password, name, phone]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Text style={styles.title}>Registrar-se</Text>

        <CustomTextInput
          placeholder="Nome"
          value={name}
          onChangeText={setName}
        />
        <EmailInput value={email} setValue={setEmail} />
        <PasswordInput value={password} setValue={setPassword} />
        <CustomTextInput
          placeholder="Telefone"
          value={phone}
          onChangeText={setPhone}
        />

        <ErrorModal
          visible={!!errorMessage}
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />

        <PrimaryButton text="Registrar-se" action={register} />

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
  returnLogin: {
    textAlign: "center",
    color: "#1E3A8A",
    marginTop: 40,
    fontSize: 16,
  },
});
