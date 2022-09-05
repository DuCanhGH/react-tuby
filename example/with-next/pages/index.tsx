import type { NextPage } from "next";
import Head from "next/head";
import { Player } from "../../../src";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Example</title>
      </Head>
      <div>
        <Player
          src={[
            {
              quality: "Full HD",
              url: "https://cdn.glitch.me/cbf2cfb4-aa52-4a1f-a73c-461eef3d38e8/1080.mp4",
            },
            {
              quality: 720,
              url: "https://cdn.glitch.me/cbf2cfb4-aa52-4a1f-a73c-461eef3d38e8/720.mp4",
            },
            {
              quality: 480,
              url: "https://cdn.glitch.me/cbf2cfb4-aa52-4a1f-a73c-461eef3d38e8/480.mp4?v=1647351419495",
            },
          ]}
          subtitles={[
            {
              lang: "en",
              language: "English",
              url: "https://cdn.jsdelivr.net/gh/naptestdev/video-examples@master/en.vtt",
            },
            {
              lang: "fr",
              language: "French",
              url: "https://cdn.jsdelivr.net/gh/naptestdev/video-examples@master/fr.vtt",
            },
          ]}
          poster="https://cdn.jsdelivr.net/gh/naptestdev/video-examples@master/poster.png"
        />
      </div>
    </>
  );
};

export default Home;

