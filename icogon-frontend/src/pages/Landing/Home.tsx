import { useEffect } from "react";
import { healthCheck } from "../../api/testApi";

const Home = () => {
  useEffect(() => {
    healthCheck()
      .then((res) => {
        console.log("✅ Backend Connected");
        console.log(res.data);
      })
      .catch((err) => {
        console.error("❌ Connection Failed");
        console.error(err);
      });
  }, []);

  return <h1>Home Page</h1>;
};

export default Home;