import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Notification = () => {
  return (
    <div className=''>
      {/**
       * Renders a toast notification container at the bottom-right of the screen.
       * This component is used to display toast notifications triggered by the application.
       * The toast notifications are managed and displayed using the `react-toastify` library.
       */}
      <ToastContainer position="bottom-right"/>
    </div>
  )
}

export default Notification