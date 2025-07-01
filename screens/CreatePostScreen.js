import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function CreatePostScreen() {
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const navigation = useNavigation();

  const pickImage = async () => {
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
      setImage(result.assets[0].uri);
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
      setImage(result.assets[0].uri);
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão negada",
        "Não foi possível acessar sua localização."
      );
      return;
    }

    const locationData = await Location.getCurrentPositionAsync({});
    const coords = locationData.coords;

    const geocode = await Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    if (geocode.length > 0) {
      const city = geocode[0].city || geocode[0].subregion || "";
      setLocation(city);
    }
  };

  const handlePublish = async () => {
    if (!image || !description || !location) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    try {
      const uid = auth.currentUser.uid;

      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        Alert.alert("Erro", "Informações do usuário não encontradas.");
        return;
      }

      const userData = userSnap.data();

      await addDoc(collection(db, "posts"), {
        description,
        location,
        image,
        createdAt: serverTimestamp(),
        uid,
        email: auth.currentUser.email,
        userName: userData.nickname || "Usuário",
        userPhoto: userData.photo || null,
      });

      Alert.alert("Sucesso", "Postagem criada com sucesso!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", "Falha ao publicar: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Create Post</Text>
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Ionicons name="camera-outline" size={48} color="#aaa" />
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <View style={styles.locationRow}>
        <TextInput
          placeholder="Localização"
          value={location}
          onChangeText={setLocation}
          style={[styles.input, { flex: 1, marginRight: 10 }]}
        />
        <TouchableOpacity
          style={styles.locationRow}
          onPress={getCurrentLocation}
        >
          <Ionicons name="location-outline" size={28} color="#1B69E5" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePublish}>
        <Text style={styles.buttonText}>Publicar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 10,
    paddingHorizontal: 20,
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
  imagePicker: {
    height: 180,
    backgroundColor: "#eee",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1B69E5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
