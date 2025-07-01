import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import PostCard from "../components/PostCard";
import { Ionicons } from "@expo/vector-icons";

export default function UserProfileScreen() {
  const route = useRoute();
  const { uid } = route.params;
  const navigation = useNavigation();

  const [userData, setUserData] = useState({
    nickname: "",
    photo: "",
    email: "",
    phone: "",
  });
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const userQuery = query(collection(db, "users"), where("uid", "==", uid));
    const unsubscribeUser = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setUserData({
          nickname: data.nickname || "Usuário",
          photo: data.photo || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      }
    });

    const postsQuery = query(collection(db, "posts"), where("uid", "==", uid));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
    });

    return () => {
      unsubscribeUser();
      unsubscribePosts();
    };
  }, [uid]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Perfil do Usuário</Text>
      </View>

      <View style={styles.profileBox}>
        <Image
          source={
            userData.photo
              ? { uri: userData.photo }
              : require("../assets/user.jpg")
          }
          style={styles.avatarLarge}
        />
        <View style={styles.userDetails}>
          <Text style={styles.nameLarge}>{userData.nickname}</Text>
          <View style={styles.infoRow}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#555"
              style={styles.icon}
            />
            <Text style={styles.infoText}>{userData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="call-outline"
              size={18}
              color="#555"
              style={styles.icon}
            />
            <Text style={styles.infoText}>{userData.phone}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard {...item} verPerfil={false} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
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
  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  userDetails: {
    flex: 1,
  },
  nameLarge: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#333",
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
