import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);

  const { currentUser } = useUserStore();
/**
 * Handles the search for a user by their username. It takes an event object as a parameter and uses the 
 *  FormData API to extract the username from the form data. It then uses the Firebase 
 *  Firestore API to query the users collection for a user with the specified username. 
 *  If a user is found, the user state is updated with the user's data.
 */
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (err) {
      console.log(err);
    }
  };

  /**
   * Handles the addition of a new user to the chat. It creates a new chat document in the "chats" collection,
   * and updates the "userchats" collection for both the current user and the new user, adding the new chat
   * to their respective chat lists.
   */
  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {/**
       * Renders a user detail component with an "Add User" button.
       * 
       * This component is displayed when a user is found during the search process.
       * It shows the user's avatar and username, and provides a button to add the user
       * to the current user's chat list.
       * 
       * The user object containing the avatar and username.
       * The function to be called when the "Add User" button is clicked.
       */}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
