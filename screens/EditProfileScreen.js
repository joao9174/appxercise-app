import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function EditProfileScreen({ navigation }) {
  const user = auth.currentUser;

  const [nickname, setNickname] = useState("");
  const [photo, setPhoto] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNickname(data.nickname || "");
          setPhoto(data.photo || "");
          setPhone(data.phone || "");
        }
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar dados do perfil.");
      }
    };

    loadUserData();
  }, []);

  const handleImagePick = async () => {
    Alert.alert("Selecionar imagem", "Escolha a origem da imagem", [
      { text: "Câmera", onPress: pickFromCamera },
      { text: "Galeria", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  const pickFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Permita acesso à câmera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Permita acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
    if (!nickname.trim()) {
      Alert.alert("Atenção", "O nickname não pode estar vazio.");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nickname,
        photo,
        phone,
      });

      const postsQuery = query(
        collection(db, "posts"),
        where("uid", "==", user.uid)
      );
      const snapshot = await getDocs(postsQuery);

      const updates = snapshot.docs.map((docSnap) =>
        updateDoc(docSnap.ref, { userName: nickname, userPhoto: photo })
      );

      await Promise.all(updates);

      Alert.alert("Sucesso", "Perfil e postagens atualizados com sucesso!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro ao salvar", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Editar Perfil</Text>
      </View>
      <TouchableOpacity onPress={handleImagePick}>
        <Image
          source={photo ? { uri: photo } : require("../assets/user.jpg")}
          style={styles.avatar}
        />
      </TouchableOpacity>

      <TextInput
        placeholder="Nome"
        value={nickname}
        onChangeText={setNickname}
        style={styles.input}
      />

      <TextInput
        placeholder="Telefone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.button} onPress={saveProfile}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: "#fff" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
    backgroundColor: "#eee",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#1E3A8A",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
