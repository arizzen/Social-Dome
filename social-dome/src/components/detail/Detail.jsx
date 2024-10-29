import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
    useChatStore();
  const { currentUser } = useUserStore();

  /**
   * Toggles the blocked status of the current user with the user associated with the current chat.
   * If the current user is not blocked by the other user, adds the other user's ID to the current user's blocked list.
   * If the current user is already blocked by the other user, removes the other user's ID from the current user's blocked list.
   * Updates the blocked status in the Firestore database and updates the chat store's blocked status.
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
   */
  const handleLogout = () => {
    auth.signOut();
    resetChat()
  };

  return (
    <div className="detail">
      {/**
       * Renders a user profile section with the user's avatar, username, and a brief description.
       * This component is likely used within the larger `Detail` component to display information about the current chat user.
       */}
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img
                  src="https://images.pexels.com/photos/7381200/pexels-photo-7381200.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                  alt=""
                />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img
                  src="https://images.pexels.com/photos/7381200/pexels-photo-7381200.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                  alt=""
                />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
            <div className="photoItem">
              <div className="photoDetail">
                <img
                  src="https://images.pexels.com/photos/7381200/pexels-photo-7381200.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load"
                  alt=""
                />
                <span>photo_2024_2.png</span>
              </div>
              <img src="./download.png" alt="" className="icon" />
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        {/**
         * Renders a button that allows the user to block or unblock another user.
         * The button text changes based on the current block status of the user.
         *  handleBlock - A function that is called when the button is clicked to handle the blocking/unblocking logic.
         * isCurrentUserBlocked - A flag indicating whether the current user is blocked by the other user.
         * isReceiverBlocked - A flag indicating whether the other user is blocked by the current user.
         */}
        <button onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are Blocked!"
            : isReceiverBlocked
            ? "User blocked"
            : "Block User"}
        </button>
        {/**
         * Handles the logout functionality when the user clicks the "Logout" button.
         */}
        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
