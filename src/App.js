import React, { useState } from "react";
import Particles from "react-particles-js";
import Clarifai from "clarifai";
import FaceRecognition from "./Components/FaceRecognition/FaceRecognition";
import Navigation from "./Components/Navigatoin/Navigation";
import Logo from "./Components/Logo/Logo";
import ImageLinkForm from "./Components/ImageLinkForm/ImageLinkForm";
import Rank from "./Components/Rank/Rank";
import SignIn from "./Components/SignIn/SignIn";
import Register from "./Components/Register/Register";
import "./App.css";

const app = new Clarifai.App({
  apiKey: "68c160deafba49a9890bafa15fbe4ce3",
});

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800,
      },
    },
  },
};

function App() {
  const [input, setInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [box, setBox] = useState({});
  const [route, setRoute] = useState("signin");
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    entries: 0,
    joined: "",
  });
  function loadUser(data) {
    setUser({
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      entries: data.entries,
      joined: data.joined,
    });
  }

  function calculateFaceLocation(data) {
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  }

  function displayFaceBox(box) {
    setBox(box);
  }

  function onInputChange(event) {
    setInput(event.target.value);
  }

  function onSubmit() {
    if (input) {
      setImageUrl(input);
      fetch("https://murmuring-savannah-02604.herokuapp.com/imageurl", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: input,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          if (response) {
            fetch("https://murmuring-savannah-02604.herokuapp.com/image", {
              method: "put",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: user.id,
              }),
            })
              .then((response) => response.json())
              .then((entries) => setUser({ ...user, entries }));
          }
          displayFaceBox(calculateFaceLocation(response));
        })
        .catch((err) => console.log("input a valid URL.", err));
    }
  }

  function onRouteChange(route) {
    if (route === "signout") {
      setIsSignedIn(false);
      setImageUrl("");
    } else if (route === "home") {
      setIsSignedIn(true);
    }
    setRoute(route);
  }

  return (
    <div className="App">
      <Particles className="particles" params={particlesOptions} />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {route === "home" ? (
        <div>
          <Logo />
          <Rank name={user.name} entries={user.entries} />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
      ) : route === "signin" ? (
        <SignIn onRouteChange={onRouteChange} loadUser={loadUser} />
      ) : (
        <Register onRouteChange={onRouteChange} loadUser={loadUser} />
      )}
    </div>
  );
}

export default App;
