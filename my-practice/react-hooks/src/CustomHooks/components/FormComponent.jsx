import { useInput } from "../hooks/useInput";

export const FormComponent = () => {
  const name = useInput("");
  const email = useInput("");

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(`Name: ${name.value}, Email: ${email.value}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Name:
          <input type="text" placeholder="Enter your name" {...name} />
        </label>
      </div>

      <div>
        <label>
          Email:
          <input type="email" placeholder="Enter your email" {...email} />
        </label>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};
