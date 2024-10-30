import ChatList from "./chatList/ChatList"
import "./list.css"
import Userinfo from "./userInfo/Userinfo"
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";

const List = () => {
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
    useChatStore();
    const { currentUser } = useUserStore();

    /**
     * Toggles the blocked status of the current user with the user specified by `user.id`.
     * If the receiver is currently blocked, they will be unblocked. Otherwise, they will be blocked.
     * This function updates the "blocked" field in the "users" collection in Firestore.
     */
    const handleBlock = async () => {
      if (!user) return;
  
      const userDocRef = doc(db, "users", currentUser.id);
  
      try {
        await updateDoc(userDocRef, {
          blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
        });
        changeBlock();
      } catch (err) {
        console.log(err);
      }
    };

  /**
   * Logs the current user out of the application and resets the chat state.
   * This function is called when the user clicks the "Logout" button.
   */
  const handleLogout = () => {
    auth.signOut();
    resetChat()
  };

  return (
    <div className='list'>
      {/**
       * Renders the user information and chat list components.
       * The user information component displays the current user's details.
       * The chat list component displays the list of chats for the current user.
       */}
      <Userinfo/>
      <ChatList/>
      <button className="blockk" onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
      <button className="logoutt" onClick={handleLogout}>
          Logout
      </button>
    </div>
  )
}

export default List