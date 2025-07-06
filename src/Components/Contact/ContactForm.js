import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ContactForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can replace the following code with your email sending logic

    const data = {
      name: name,
      email: email,
      message: message,
    };

    // Reset the form fields
    setName("");
    setEmail("");
    setMessage("");

    // Show an alert message to confirm that the email has been sent
    window.alert("Thank you for contacting us! We will get back to you soon.");

    // Navigate to the home page
    navigate("/");
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>Send Email</h2>
      <div>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
      </div>
      <button type="submit">Send</button>
    </form>
  );
};

export default ContactForm;
