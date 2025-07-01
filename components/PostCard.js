import { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons, EvilIcons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import {
  doc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import moment from "moment";
import { useNavigation } from "@react-navigation/native";

export default function PostCard({
  id,
  userName,
  userPhoto,
  location,
  image,
  description,
  likes = 0,
  comments = 0,
  createdAt,
  uid,
  verPerfil = true,
  isOwner = false, // <- adicionado
  onDelete = () => {}, // <- adicionado
}) {
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState([]);

  const user = auth.currentUser;
  const navigation = useNavigation();

  const handleLike = async () => {
    await updateDoc(doc(db, "posts", id), {
      likes: increment(1),
    });
  };

  const handleOpenComments = () => {
    setCommentModalVisible(true);
    const q = query(
      collection(db, "posts", id, "comments"),
      orderBy("createdAt", "desc")
    );
    onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCommentList(items);
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    await addDoc(collection(db, "posts", id, "comments"), {
      text: newComment,
      createdAt: new Date(),
      author: user?.email || "Anônimo",
    });

    await updateDoc(doc(db, "posts", id), {
      comments: increment(1),
    });

    setNewComment("");
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={
            userPhoto ? { uri: userPhoto } : require("../assets/user.jpg")
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{userName || "Usuário"}</Text>
          <View style={styles.locationRow}>
            <EvilIcons name="location" size={18} color="#888" />
            <Text style={styles.location}>{location}</Text>
          </View>
        </View>
        {verPerfil && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.push("UserProfile", { uid })}
          >
            <Text style={styles.profileButtonText}>Ver Perfil</Text>
          </TouchableOpacity>
        )}
        {isOwner && (
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>

      {image && <Image source={{ uri: image }} style={styles.postImage} />}

      <View style={styles.reactions}>
        <TouchableOpacity onPress={handleLike} style={styles.reactionBtn}>
          <Ionicons
            name="heart"
            size={18}
            color={likes > 0 ? "#e63946" : "#333"}
          />
          <Text style={styles.reactionText}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOpenComments}
          style={styles.reactionBtn}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#333" />
          <Text style={styles.reactionText}>{comments}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{description}</Text>
      {createdAt && (
        <Text style={styles.timestamp}>
          {moment(createdAt?.seconds * 1000).format("HH:mm DD/MM/YYYY")}
        </Text>
      )}

      <Modal visible={commentModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={commentList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{item.author}</Text>
                  <Text>{item.text}</Text>
                </View>
              )}
            />

            <View style={styles.commentInputContainer}>
              <TextInput
                placeholder="Escreva um comentário..."
                value={newComment}
                onChangeText={setNewComment}
                style={styles.commentInput}
              />
              <TouchableOpacity onPress={handleAddComment}>
                <Ionicons name="send" size={24} color="#1E3A8A" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setCommentModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontWeight: "bold",
  },
  location: {
    color: "#888",
    fontSize: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 10,
    color: "#aaa",
    marginBottom: 6,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  description: {
    fontWeight: "500",
    marginBottom: 4,
  },
  reactions: {
    flexDirection: "row",
    marginBottom: 5,
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  reactionText: {
    marginLeft: 3,
    color: "#333",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 10,
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 8,
  },
  commentAuthor: {
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    height: Dimensions.get("window").height * 0.5,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  profileButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#1B69E5",
    borderRadius: 6,
  },
  profileButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "red",
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
