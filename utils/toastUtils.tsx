import toast from "react-hot-toast";

let audio: HTMLAudioElement | null = null;

export const preloadSound = () => {
  if (!audio) {
    audio = new Audio("/sounds/notify.mp3");
    audio.load();
  }
};

const playSound = () => {
  if (!audio) {
    audio = new Audio("/sounds/notify.mp3");
  }
  audio.volume = 1;
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

export const notifySuccess = (message: string) => {
  playSound();
  toast.success(message);
};

export const notifyError = (message: string) => {
  playSound();
  toast.error(message);
};

export const notifyInfo = (message: string) => {
  playSound();
  toast(message);
};

export const notifyDelete = (message: string) => {
  playSound();
  toast.custom(
    (t) => (
      <div
        className={`bg-white shadow-md rounded-lg px-4 py-3 flex items-center justify-between w-full max-w-sm border ${
          t.visible ? "animate-enter" : "animate-leave"
        }`}
        role="alert"
      >
        <span className="text-sm text-gray-800">{message}</span>
        <button
          aria-label="Dismiss delete notification"
          className="ml-4 px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(t.id);
          }}
        >
          Delete
        </button>
      </div>
    ),
    {
      duration: 5000,
      position: "top-right",
    }
  );
};
