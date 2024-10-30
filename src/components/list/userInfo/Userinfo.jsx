import "./userInfo.css"
import { useUserStore } from "../../../lib/userStore";

const Userinfo = () => {

  const { currentUser } = useUserStore();

  return (
    <div className='userInfo'>
      {/**
       * Renders a user information component that displays the current user's avatar and username.
       * This component is used within the list view to show information about the currently logged in user.
       */}
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
    </div>
  )
}

export default Userinfo