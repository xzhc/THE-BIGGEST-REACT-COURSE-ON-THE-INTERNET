import { createPortal } from "react-dom";

export const PopupContent = ({ copied }) => {
  return createPortal(
    <section>
      {copied && (
        <div style={{ position: "absolute", bottom: "3" }}>
          Copied to clipboard
        </div>
      )}
    </section>,
    document.querySelector("#portal-popup")
  );
};
