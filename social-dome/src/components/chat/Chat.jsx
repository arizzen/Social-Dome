import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });


  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  /**
   * Scrolls the chat window to the bottom when the component mounts, and subscribes to real-time updates of the chat data from Firestore.
   *
   * The `useEffect` hook with an empty dependency array is used to scroll the chat window to the bottom when the component mounts. This ensures that the user sees the latest messages when the chat is loaded.
   *
   * The second `useEffect` hook subscribes to real-time updates of the chat data from Firestore using the `onSnapshot` function from the `firebase/firestore` library. Whenever the chat data changes, the `setChat` function is called to update the component's state with the new data.
   *
   * The cleanup function returned by the second `useEffect` hook is used to unsubscribe from the real-time updates when the component is unmounted, to avoid memory leaks.
   */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  /**
   * Handles the insertion of an emoji into the chat text input.
   * This function is called when the user selects an emoji from the emoji picker. 
   * It updates the `text` state by appending the selected emoji to the current text, 
   * and then closes the emoji picker by setting the `open` state to `false`.
   * e - The event object containing the selected emoji.
   * e.emoji - The selected emoji.
   */
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  /**
   * Handles the selection of an image file for the chat.
   * This function is called when the user selects an image file to upload.
   * It updates the `img` state with the selected file and its URL.
   * e - The change event object containing the selected file.
   */
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  /**
   * Handles the sending of a message in the chat.
   * This function is called when the user clicks the send button or presses enter in the chat input.
   * It uploads the image file (if any) to Firestore, updates the chat document with the new message, and updates the user's chat list with the new message details.
   * If the `text` state is empty, the function returns without doing anything.
   */
  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally{
    setImg({
      file: null,
      url: "",
    });

    setText("");
    }
  };



  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor, sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message?.createAt}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <img src="./camera.png" alt="" id="cam"/>
          <img src="./mic.png" alt="" id="mic"/>
        </div>
        {/**
         * Renders an input field for the user to type a message.
         * The input field is disabled if the current user or the receiver is blocked.
         * The placeholder text changes based on the blocked status.
         * The input value is bound to the `text` state variable, which is updated as the user types.
         */}
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          {/**
           * Renders an EmojiPicker component that allows the user to select an emoji.
           * The EmojiPicker is displayed when the `open` state variable is true, and is hidden when it is false.
           * When an emoji is selected, the `handleEmoji` function is called with the selected emoji.
           */}
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        {/**
         * Renders a send button that is disabled if the current user or the receiver is blocked.
         * When the button is clicked, the `handleSend` function is called to send the message.
         */}
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
